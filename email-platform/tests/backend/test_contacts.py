import pytest
from parse_contacts import parse_contacts
from validate_email import clean_and_validate


# ---------- Parser tests ----------

def test_parse_txt_simple():
    content = "alice@example.com\nbob@example.com\n"
    result = parse_contacts(content, "contacts.txt")
    assert result == ["alice@example.com", "bob@example.com"]


def test_parse_txt_ignores_blank_lines():
    content = "alice@example.com\n\n  \nbob@example.com"
    result = parse_contacts(content, "contacts.txt")
    assert result == ["alice@example.com", "bob@example.com"]


def test_parse_csv_no_header():
    content = "alice@example.com\nbob@example.com\n"
    result = parse_contacts(content, "contacts.csv")
    assert "alice@example.com" in result
    assert "bob@example.com" in result


def test_parse_csv_with_email_header():
    content = "name,email\nAlice,alice@example.com\nBob,bob@example.com\n"
    result = parse_contacts(content, "contacts.csv")
    assert result == ["alice@example.com", "bob@example.com"]


def test_parse_csv_email_header_case_insensitive():
    content = "Name,Email Address\nAlice,alice@example.com\n"
    result = parse_contacts(content, "contacts.csv")
    assert "alice@example.com" in result


def test_parse_unsupported_extension():
    with pytest.raises(ValueError):
        parse_contacts("anything", "contacts.xls")


# ---------- Validator tests ----------

def test_valid_emails_pass():
    result = clean_and_validate(["alice@example.com", "bob@test.org"])
    assert result["valid"] == ["alice@example.com", "bob@test.org"]
    assert result["valid_count"] == 2
    assert result["invalid_count"] == 0


def test_invalid_emails_caught():
    result = clean_and_validate(["notanemail", "bad@", "@nodomain.com"])
    assert result["invalid_count"] == 3
    assert result["valid_count"] == 0


def test_duplicates_removed():
    result = clean_and_validate(["alice@example.com", "alice@example.com", "bob@example.com"])
    assert result["valid"] == ["alice@example.com", "bob@example.com"]
    assert result["duplicate_count"] == 1


def test_case_normalisation():
    result = clean_and_validate(["Alice@Example.COM", "alice@example.com"])
    assert result["valid_count"] == 1
    assert result["duplicate_count"] == 1


def test_empty_lines_ignored():
    result = clean_and_validate(["", "  ", "alice@example.com"])
    assert result["valid_count"] == 1