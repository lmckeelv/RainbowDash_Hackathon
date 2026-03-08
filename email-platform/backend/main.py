from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

def load_template() -> str:
    """Load email.html and embed images as base64 data URIs."""
    html = (TEMPLATE_DIR / "email.html").read_text(encoding="utf-8")

    # Replace all image src paths with base64 data URIs
    images_dir = TEMPLATE_DIR / "images"
    for img_file in images_dir.iterdir():
        if img_file.suffix.lower() in (".png", ".jpg", ".jpeg", ".gif"):
            b64 = base64.b64encode(img_file.read_bytes()).decode("utf-8")
            mime = "image/png" if img_file.suffix.lower() == ".png" else "image/jpeg"
            data_uri = f"data:{mime};base64,{b64}"
            # Replace both the relative path variants Canva uses
            html = html.replace(f"images/{img_file.name}", data_uri)

    return html

# Load once at startup
EMAIL_TEMPLATE = load_template()


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
    subject: str
    header: str = ""
    body: str
    business_name: str = ""
    website: str = ""
    reply_to: str = ""


# ---------- Routes ----------

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

    errors = []
    sent = []

    for recipient in req.recipients:
        try:
            display_name = recipient.name if recipient.name else "there"

            html = render_template(EMAIL_TEMPLATE, {
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
    return {"status": "ok"}