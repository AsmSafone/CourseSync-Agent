import json
import re
from typing import Dict
from rich.console import Console

# Shared console for nice output
console = Console()


def extract_json(text: str) -> Dict:
    """Extract JSON from LLM response robustly.

    Tries several common patterns (```json blocks, fenced blocks, or plain JSON).
    Returns an empty dict on parse failure and prints a helpful message to console.
    """
    try:
        # Try to find JSON block
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            json_str = text.split("```")[1].split("```")[0].strip()
        else:
            # Try to find JSON object pattern
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                json_str = match.group()
            else:
                json_str = text.strip()

        return json.loads(json_str)
    except Exception as e:
        console.print(f"[red]Failed to parse JSON: {str(e)}[/red]")
        console.print(f"[dim]Raw response:\n{text}[/dim]")
        return {}
