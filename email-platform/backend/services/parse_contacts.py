import csv
import io


def parse_contacts(content: str, filename: str) -> list[dict]:
    """
    Accepts raw file content as a string and the original filename.
    Returns a list of dicts: {"email": str, "name": str}
    Handles:
      - Plain .txt files (one email per line, no names)
      - .csv files with an email column and optional name column
    """
    if filename.endswith(".txt"):
        return _parse_txt(content)
    elif filename.endswith(".csv"):
        return _parse_csv(content)
    else:
        raise ValueError(f"Unsupported file type: {filename}. Use .csv or .txt")


def _parse_txt(content: str) -> list[dict]:
    lines = content.splitlines()
    return [{"email": line.strip(), "name": ""} for line in lines if line.strip()]


def _parse_csv(content: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(content))
    contacts = []

    if reader.fieldnames:
        email_col = _find_column(reader.fieldnames, ["email", "e-mail"])
        name_col  = _find_column(reader.fieldnames, ["name", "first name", "firstname", "full name", "fullname"])

        if email_col:
            for row in reader:
                email = row.get(email_col, "").strip()
                name  = row.get(name_col, "").strip() if name_col else ""
                if email:
                    contacts.append({"email": email, "name": name})
            return contacts

    # No recognised header — treat first column as email, no names
    reader = csv.reader(io.StringIO(content))
    for row in reader:
        if row:
            email = row[0].strip()
            if email:
                contacts.append({"email": email, "name": ""})

    return contacts


def _find_column(fieldnames: list[str], keywords: list[str]) -> str | None:
    """Find a column whose header contains any of the given keywords."""
    for field in fieldnames:
        for keyword in keywords:
            if keyword in field.lower():
                return field
    return None