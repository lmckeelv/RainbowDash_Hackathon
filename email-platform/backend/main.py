from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import resend
import os
import base64
from pathlib import Path
from dotenv import load_dotenv

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
    """
    Load every .html file in the templates folder.
    Images in templates/images/ are embedded as base64 data URIs.
    Key = filename stem with spaces replaced by hyphens, lowercased
          e.g. "New Message.html" -> "new-message"
               "email.html"       -> "email"
    """
    templates = {}
    images_dir = TEMPLATE_DIR / "images"

    for html_file in TEMPLATE_DIR.glob("*.html"):
        html = html_file.read_text(encoding="utf-8")

        if images_dir.exists():
            for img_file in images_dir.iterdir():
                if img_file.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif"):
                    b64 = base64.b64encode(img_file.read_bytes()).decode("utf-8")
                    mime = "image/png" if img_file.suffix.lower() == ".png" else "image/jpeg"
                    data_uri = f"data:{mime};base64,{b64}"
                    html = html.replace(f"images/{img_file.name}", data_uri)

        # Normalise key: lowercase, spaces -> hyphens
        key = html_file.stem.lower().replace(" ", "-")
        templates[key] = html

    return templates


TEMPLATES = load_all_templates()


def render_template(template: str, fields: dict) -> str:
    """Replace all {{placeholders}} in the template with field values."""
    result = template
    for key, value in fields.items():
        result = result.replace(f"{{{{{key}}}}}", value or "")
    return result


# ---------- Models ----------

class Recipient(BaseModel):
    email: str
    name: str = ""

class SendRequest(BaseModel):
    recipients: list[Recipient]
    template_name: str = ""   # optional — falls back to first available template
    subject: str
    header: str = ""
    body: str
    business_name: str = ""
    website: str = ""
    reply_to: str = ""


# ---------- Routes ----------

@app.get("/templates")
def list_templates():
    """Return all available template names for the frontend picker."""
    return {"templates": list(TEMPLATES.keys())}


@app.get("/preview/{template_name}", response_class=HTMLResponse)
async def preview_template(
    template_name: str,
    name: str = "Laura",
    subject: str = "Big news from Acme!",
    header: str = "We have exciting news for you!",
    body: str = "We're launching something new and we think you'll love it.\nStay tuned for more details coming soon.",
    business_name: str = "Acme Co.",
    website: str = "https://acme.com",
):
    """Render a template with sample/live data and return HTML — used for preview iframes."""
    if template_name not in TEMPLATES:
        raise HTTPException(status_code=404, detail=f"Template '{template_name}' not found. Available: {list(TEMPLATES.keys())}")
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
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = clean_and_validate(raw_contacts)

    return {
        "recipients": result["valid"],
        "valid_count": result["valid_count"],
        "invalid_count": result["invalid_count"],
        "duplicate_count": result["duplicate_count"],
        "invalid_emails": result["invalid"],
        "duplicate_emails": result["duplicates"],
    }


@app.post("/send")
async def send_emails(req: SendRequest):
    if not req.recipients:
        raise HTTPException(status_code=400, detail="No recipients provided.")
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured.")
    if not TEMPLATES:
        raise HTTPException(status_code=500, detail="No templates found in backend/templates/")

    # Resolve which template to use
    template_key = req.template_name if req.template_name in TEMPLATES else next(iter(TEMPLATES))
    template = TEMPLATES[template_key]

    errors = []
    sent = []

    for recipient in req.recipients:
        try:
            display_name = recipient.name if recipient.name else "there"

            html = render_template(template, {
                "name": display_name,
                "body": req.body,
                "subject": req.subject,
                "header": req.header,
                "business_name": req.business_name,
                "website": req.website,
            })

            email_payload = {
                "from": SENDER_EMAIL,
                "to": recipient.email,
                "subject": req.subject,
                "html": html,
            }
            if req.reply_to:
                email_payload["reply_to"] = req.reply_to

            resend.Emails.send(email_payload)
            sent.append(recipient.email)
        except Exception as e:
            errors.append({"email": recipient.email, "error": str(e)})

    return {
        "sent_count": len(sent),
        "error_count": len(errors),
        "sent": sent,
        "errors": errors,
    }


@app.get("/health")
def health():
    return {"status": "ok", "templates_loaded": list(TEMPLATES.keys())}