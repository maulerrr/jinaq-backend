import re
from typing import List

def extract_hashtags(text: str) -> List[str]:
    """
    Extracts hashtags from a given text.

    Args:
        text: The input string.

    Returns:
        A list of unique hashtags found in the text (without the '#').
    """
    # Regex to find words starting with #
    hashtags = re.findall(r"#(\w+)", text)
    # Convert to set to get unique hashtags, then back to list
    return list(set(hashtags))

def extract_mentions(text: str) -> List[str]:
    """
    Extracts mentions (words starting with @) from a given text.

    Args:
        text: The input string.

    Returns:
        A list of unique mentions found in the text (without the '@').
    """
    # Regex to find words starting with @
    mentions = re.findall(r"@(\w+)", text)
    # Convert to set to get unique mentions, then back to list
    return list(set(mentions))
