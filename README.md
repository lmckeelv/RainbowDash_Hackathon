# RainbowDash_Hackathon

---

# MailDash – Easy Email Marketing for Small Businesses

MailDash is a lightweight email marketing platform designed for **small businesses and nonprofits** that need a fast and simple way to send professional marketing emails to their customers.

Instead of complex tools like Mailchimp with heavy onboarding, MailDash focuses on doing **one thing extremely well**:

- Upload contacts
- Choose a template
- Customize your message
- Send a mass email campaign

The platform allows users to upload customer lists, select visually appealing email templates, preview the final message, and send emails directly from the application.

---

# Quick Set up

Visit www.maildash.gay to send quick emails, or follow the steps below to run this locally on your computer. 

If run locally, add this info to the .env file:

RESEND_API_KEY=(your Resend API key - it's free)
SENDER_EMAIL=(the domain you want to send emails from, set up in Resend)

If you want to make changes to the available templates, there are drag and drop html editors available online. Just add to or modify the templates in \email-platform\backend\templates. Add your brand colors or logo!

---

# The Problem

Small businesses often struggle with email marketing tools because they are:

* Expensive
* Overly complex
* Designed for large marketing teams
* Time consuming to set up

Many businesses simply want to **send a professional email campaign quickly** without learning a full marketing platform.

MailDash solves this by providing a **simple, focused workflow for sending email campaigns.**

---

# Our Solution

MailDash provides a simple pipeline:

1. Upload a **CSV file of contacts**
2. Select an **email template**
3. Customize the **subject, header, and body**
4. Preview the message
5. Send the campaign to all contacts

The backend processes the contacts, validates emails, injects the message content into the template, and sends the campaign.

---

# Key Features

### Contact Upload

Users upload a CSV file containing recipient email addresses.

The system:

* Parses the CSV
* Validates emails
* Prepares the contact list for sending

---

### Email Templates

Multiple responsive HTML templates are included so users can quickly create professional emails.

Examples include:

* Minimal
* Newsletter
* Gradient
* Neon
* Earthy
* Retro

Templates automatically receive the user’s message content.

---

### Email Customization

Users can provide:

* Email subject
* Header
* Body content

These values are dynamically inserted into the selected template.

---

### Email Sending

MailDash integrates with an email delivery service to send the campaign to all uploaded contacts.

---

### Extensible Design

The platform was built so future features can be added easily, such as:

* AI email generation
* Campaign analytics
* Contact management
* Email previews
* Scheduling campaigns

---

# Tech Stack

### Frontend

* React
* Vite
* TailwindCSS

### Backend

* Python
* FastAPI

### Email Delivery

* Resend API

### Other Tools

* CSV parsing
* Email validation utilities

---

# Project Structure

```
email-platform
│
├── backend
│   ├── main.py                # FastAPI entry point
│   ├── routers
│   │   ├── contacts.py        # CSV contact upload endpoints (TODO)
│   │   └── send.py            # Email sending endpoints (TODO)
│   │
│   ├── services
│   │   ├── parse_contacts.py  # CSV parsing logic
│   │   ├── resend_client.py   # Email delivery integration
│   │   └── validate_email.py  # Email validation
│   │
│   ├── models
│   │   └── schemas.py         # API request/response models (TODO)
│   │
│   └── templates              # HTML email templates
│
└── frontend
    ├── src
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── components
    │
    └── index.html
```

---

# How to Run the Project Locally

## 1. Clone the Repository

```bash
git clone https://github.com/your-repo/rainbowdash.git
cd RainbowDash_Hackathon
```

---

## 2. Run the Backend

Navigate to the backend folder:

```bash
cd email-platform/backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

Mac/Linux

```bash
source venv/bin/activate
```

Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn main:app --reload
```

The backend will run at:

```
http://localhost:8000
```

---

## 3. Run the Frontend

Navigate to the frontend folder:

```bash
cd email-platform/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

# Future Improvements

Possible features to extend the platform:

* AI generated email content
* Email campaign analytics
* Open / click tracking
* Contact list management
* Email preview before sending
* Campaign scheduling
* Personalization tags

---

# Hackathon Project

MailDash was built during a hackathon focused on **bettering businesses** by creating tools that improve marketing and customer communication.

The goal was to build a **simple but powerful email campaign tool** that small organizations could use without needing technical expertise.

---
