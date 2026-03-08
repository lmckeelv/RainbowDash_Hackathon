import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email.strip()))


def clean_and_validate(raw_contacts: list[dict]) -> dict:
    valid = []
    invalid = []
    seen = set()
    duplicates = []

    for contact in raw_contacts:
        email = contact.get("email", "").strip().lower()
        name  = contact.get("name", "").strip()

        if not email:
            continue

        if not validate_email(email):
            invalid.append(email)
        elif email in seen:
            duplicates.append(email)
        else:
            seen.add(email)
            valid.append({"email": email, "name": name})

    return {
        "valid": valid,
        "invalid": invalid,
        "duplicates": duplicates,
        "valid_count": len(valid),
        "invalid_count": len(invalid),
        "duplicate_count": len(duplicates),
    }