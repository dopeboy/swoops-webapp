import re
import sys

from game.converters import SignedIntConverter


def found_a_match(converter, text):
    return re.fullmatch(converter.regex, str(text)) is not None


def test_signed_int_converter_positive_ints():
    assert found_a_match(SignedIntConverter(), 5)
    assert found_a_match(SignedIntConverter(), 81381737138)
    assert found_a_match(SignedIntConverter(), sys.maxsize + 1000)
    assert found_a_match(SignedIntConverter(), "0001")


def test_signed_int_converter_decimals():
    assert found_a_match(SignedIntConverter(), 5.5) is False
    assert found_a_match(SignedIntConverter(), 5.0) is False
    assert found_a_match(SignedIntConverter(), "5.") is False
    assert found_a_match(SignedIntConverter(), -5.0) is False
    assert found_a_match(SignedIntConverter(), "5-0") is False


def test_signed_int_converter_negative_number():
    assert found_a_match(SignedIntConverter(), -5)
    assert found_a_match(SignedIntConverter(), -81381737138)
    assert found_a_match(SignedIntConverter(), -sys.maxsize - 1000)
    assert found_a_match(SignedIntConverter(), "-0001")
