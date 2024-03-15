import re
from curses.ascii import isupper


def is_english_uppercase_chracters_only(value):
    """
    Only English characters (A-Z and spaces and numbers).
    """

    return all(isupper(chr) or chr.isspace() or ("0" <= chr <= "9") for chr in value)


def no_consecutive_spaces(value):
    """
    Checks for consecutive spaces.
    This means there can only be 1 space between characters, but there can be multiple
    spaces within a name ("A B C" is valid but "A  B" is invalid).
    """

    return not bool(re.search(r"[ ]{2,}", value))


def has_whitespace_trimmed(value):
    """
    CHecks to be sure the name has been trimmed of whitespace.
    """
    return not value.startswith(" ") and not value.endswith(" ")
