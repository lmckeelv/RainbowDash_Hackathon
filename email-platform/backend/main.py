from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
import resend
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from uuid import uuid4

from services.parse_contacts import parse_contacts
from services.validate_email import clean_and_validate

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Template loading ----------

TEMPLATE_DIR = Path(__file__).parent / "templates"


def load_all_templates() -> dict[str, str]:
    templates = {}
    for html_file in TEMPLATE_DIR.glob("*.html"):
        key = html_file.stem.lower().replace(" ", "-")
        templates[key] = html_file.read_text(encoding="utf-8")
    return templates


TEMPLATES = load_all_templates()

# Cache of validated contacts uploaded from CSV files.
# Key: upload_id, Value: list of recipient dicts {email, name}
UPLOADED_CONTACTS: dict[str, list[dict[str, str]]] = {}


def render_template(template: str, fields: dict[str, str]) -> str:
    result = template
    for key, value in fields.items():
        result = result.replace(f"{{{{{key}}}}}", value or "")
    return result


def _is_retryable_send_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    retry_markers = [
        "429",
        "rate limit",
        "too many requests",
        "timeout",
        "timed out",
        "connection",
        "temporarily unavailable",
        "service unavailable",
    ]
    return any(marker in msg for marker in retry_markers)


def _send_with_retry(email_payload: dict, max_attempts: int = 4):
    last_error = None

    for attempt in range(max_attempts):
        try:
            response = resend.Emails.send(email_payload)

            # Normalize SDK response shapes that embed errors in response body.
            if isinstance(response, dict) and response.get("error"):
                err = response.get("error")
                if isinstance(err, dict):
                    raise RuntimeError(err.get("message") or str(err))
                raise RuntimeError(str(err))

            return response
        except Exception as exc:
            last_error = exc
            should_retry = attempt < max_attempts - 1 and _is_retryable_send_error(exc)
            if should_retry:
                time.sleep(0.6 * (2 ** attempt))
                continue
            raise

    raise RuntimeError(str(last_error) if last_error else "Unknown send failure")


# ---------- Models ----------

class Recipient(BaseModel):
    email: str
    name: str = ""


class SendRequest(BaseModel):
    recipients: list[Recipient] = Field(default_factory=list)
    upload_id: str = ""          # preferred: id returned from /upload-contacts
    template_name: str = ""      # falls back to first available template if omitted
    subject: str
    header: str = ""
    body: str
    business_name: str = ""
    website: str = ""
    reply_to: str = ""


# ---------- Routes ----------

@app.get("/templates")
def list_templates():
    return {"templates": list(TEMPLATES.keys())}


@app.get("/preview/{template_name}", response_class=HTMLResponse)
async def preview_template(
    template_name: str,
    name: str = "[Name]",
    subject: str = "Big news from MailDash!",
    header: str = "We have exciting news for you!",
    body: str = "We're launching something new and we think you'll love it.\nStay tuned for more details coming soon.",
    business_name: str = "MailDash Co.",
    website: str = "https://maildash.gay",
):
    if template_name not in TEMPLATES:
        raise HTTPException(
            status_code=404,
            detail=f"Template '{template_name}' not found. Available: {list(TEMPLATES.keys())}"
        )

    html = render_template(TEMPLATES[template_name], {
        "name": name,
        "subject": subject,
        "header": header,
        "body": body,
        "business_name": business_name,
        "website": website,
    })
    return HTMLResponse(content=html)


@app.post("/upload-contacts")
async def upload_contacts(file: UploadFile = File(...)):
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only .csv and .txt files are supported.")

    content = (await file.read()).decode("utf-8", errors="ignore")

    try:
        raw_contacts = parse_contacts(content, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    result = clean_and_validate(raw_contacts)
    valid_recipients = result["valid"]

    upload_id = uuid4().hex
    UPLOADED_CONTACTS[upload_id] = valid_recipients

    return {
        "upload_id": upload_id,
        "recipients": valid_recipients,
        "valid_count": result["valid_count"],
        "invalid_count": result["invalid_count"],
        "duplicate_count": result["duplicate_count"],
        "invalid_emails": result["invalid"],
        "duplicate_emails": result["duplicates"],
    }


@app.post("/send")
async def send_emails(req: SendRequest):
    # 1) Resolve recipients.
    recipients: list[Recipient] = list(req.recipients)
    used_cached_upload = False
    cache_missing = False

    if req.upload_id:
        stored = UPLOADED_CONTACTS.get(req.upload_id)
        if stored is not None:
            recipients = [Recipient(**r) for r in stored]
            used_cached_upload = True
        else:
            # Fallback to recipients from request body if cache was lost
            # (e.g. backend restart) instead of hard failing.
            cache_missing = True

    if not recipients:
        raise HTTPException(status_code=400, detail="No recipients provided. Upload contacts first.")

    # 2) Sanity-check config.
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY is not configured on the server.")
    if not TEMPLATES:
        raise HTTPException(status_code=500, detail="No email templates found in backend/templates/")

    # 3) Resolve template.
    template_key = req.template_name if req.template_name in TEMPLATES else next(iter(TEMPLATES))
    template = TEMPLATES[template_key]

    # 4) Send loop.
    errors: list[dict] = []
    sent: list[str] = []
    sent_details: list[dict] = []

    for recipient in recipients:
        try:
            display_name = recipient.name.strip() if recipient.name else "there"
            html = render_template(template, {
                "name": display_name,
                "body": req.body,
                "subject": req.subject,
                "header": req.header or req.subject,
                "business_name": req.business_name,
                "website": req.website,
            })

            email_payload: dict = {
                "from": SENDER_EMAIL,
                "to": [recipient.email],
                "subject": req.subject,
                "html": html,
            }
            if req.reply_to:
                email_payload["reply_to"] = req.reply_to

            response = _send_with_retry(email_payload)
            provider_id = response.get("id") if isinstance(response, dict) else None

            sent.append(recipient.email)
            sent_details.append({"email": recipient.email, "provider_id": provider_id})
        except Exception as exc:
            errors.append({"email": recipient.email, "error": str(exc)})

    # 5) Return summary.
    return {
        "sent_count": len(sent),
        "error_count": len(errors),
        "attempted_count": len(recipients),
        "sent": sent,
        "sent_details": sent_details,
        "errors": errors,
        "template_used": template_key,
        "upload_id_used": req.upload_id or "",
        "used_cached_upload": used_cached_upload,
        "upload_cache_missing": cache_missing,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "templates_loaded": list(TEMPLATES.keys()),
        "cached_uploads": len(UPLOADED_CONTACTS),
        "sender_email": SENDER_EMAIL,
        "resend_configured": bool(resend.api_key),
    }
