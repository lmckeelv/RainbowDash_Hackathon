import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email.strip()))


def clean_and_validate(raw_emails: list[str]) -> dict:
    valid = []
    invalid = []
    seen = set()
    duplicates = []

    for entry in raw_emails:
        email = entry.strip().lower()
        if not email:
            continue

        if not validate_email(email):
            invalid.append(email)
        elif email in seen:
            duplicates.append(email)
        else:
            seen.add(email)
            valid.append(email)

    return {
        "valid": valid,
        "invalid": invalid,
        "duplicates": duplicates,
        "valid_count": len(valid),
        "invalid_count": len(invalid),
        "duplicate_count": len(duplicates),
    }