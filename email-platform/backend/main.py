from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import resend
import os
from dotenv import load_dotenv

from services.parse_contacts import parse_contacts
from services.validate_email import clean_and_validate

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")  # use resend's test address until you have a domain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this down before going to prod
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Models ----------

class SendRequest(BaseModel):
    recipients: list[str]
    subject: str
    body: str  # plain HTML or text


# ---------- Routes ----------

@app.post("/upload-contacts")
async def upload_contacts(file: UploadFile = File(...)):
    """
    Accepts a .csv or .txt file upload.
    Returns cleaned recipient list + validation summary.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only .csv and .txt files are supported.")

    content = (await file.read()).decode("utf-8", errors="ignore")

    try:
        raw_emails = parse_contacts(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = clean_and_validate(raw_emails)

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
    """
    Sends a test email to all recipients.
    Expects recipients list from /upload-contacts.
    """
    if not req.recipients:
        raise HTTPException(status_code=400, detail="No recipients provided.")

    if not resend.api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured.")

    errors = []
    sent = []

    for email in req.recipients:
        try:
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": email,
                "subject": req.subject,
                "html": req.body,
            })
            sent.append(email)
        except Exception as e:
            errors.append({"email": email, "error": str(e)})

    return {
        "sent_count": len(sent),
        "error_count": len(errors),
        "sent": sent,
        "errors": errors,
    }


@app.get("/health")
def health():
    return {"status": "ok"}