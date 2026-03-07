import csv
import io


def parse_contacts(content: str, filename: str) -> list[str]:
    """
    Accepts raw file content as a string and the original filename.
    Returns a flat list of raw email strings (not yet validated).
    Handles:
      - Plain .txt files (one email per line)
      - .csv files with a single email column OR a named 'email' column
    """
    if filename.endswith(".txt"):
        return _parse_txt(content)
    elif filename.endswith(".csv"):
        return _parse_csv(content)
    else:
        raise ValueError(f"Unsupported file type: {filename}. Use .csv or .txt")


def _parse_txt(content: str) -> list[str]:
    lines = content.splitlines()
    return [line.strip() for line in lines if line.strip()]


def _parse_csv(content: str) -> list[str]:
    reader = csv.DictReader(io.StringIO(content))
    emails = []

    # Check if there's a recognisable email column header
    if reader.fieldnames:
        email_col = _find_email_column(reader.fieldnames)
        if email_col:
            for row in reader:
                val = row.get(email_col, "").strip()
                if val:
                    emails.append(val)
            return emails

    # No header or no recognised column — treat first column as emails
    reader = csv.reader(io.StringIO(content))
    for row in reader:
        if row:
            val = row[0].strip()
            if val:
                emails.append(val)

    return emails


def _find_email_column(fieldnames: list[str]) -> str | None:
    """Find a column that looks like it contains emails."""
    for name in fieldnames:
        if "email" in name.lower() or "e-mail" in name.lower():
            return name
    return None