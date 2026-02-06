import os
import time
import random
import requests
from .utils import console

# Configuration from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
FIRECRAWL_API_URL = "https://api.firecrawl.dev/v0/scrape"


class GroqClient:
    """Groq LLM API Client"""

    @staticmethod
    def call(system_prompt: str, user_prompt: str, temperature=0.3) -> str:
        """Call Groq API with prompts"""
        if not GROQ_API_KEY:
            console.print("[yellow]⚠️  GROQ_API_KEY not set! Skipping LLM call.[/yellow]")
            raise RuntimeError("GROQ_API_KEY not configured")

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": 2000,
        }

        max_attempts = 5
        base_delay = 1.0

        for attempt in range(1, max_attempts + 1):
            try:
                response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)

                # If rate limited or server error, handle retry
                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    wait = float(retry_after) if retry_after and retry_after.isdigit() else base_delay * (2 ** (attempt - 1))
                    # add small jitter
                    wait = wait + random.uniform(0, 0.5)
                    console.print(f"[yellow]⚠️  Groq rate limited (429). Retry {attempt}/{max_attempts} after {wait:.1f}s[/yellow]")
                    time.sleep(wait)
                    continue

                if 500 <= response.status_code < 600:
                    # server error, retry
                    wait = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
                    console.print(f"[yellow]⚠️  Groq server error {response.status_code}. Retry {attempt}/{max_attempts} after {wait:.1f}s[/yellow]")
                    time.sleep(wait)
                    continue

                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"]
            except requests.exceptions.RequestException as e:
                # network or other request-level errors: retry a few times
                if attempt == max_attempts:
                    console.print(f"[red]❌ Groq API Error: {str(e)}[/red]")
                    raise
                wait = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
                console.print(f"[yellow]⚠️  Groq request failed: {str(e)}. Retry {attempt}/{max_attempts} after {wait:.1f}s[/yellow]")
                time.sleep(wait)
                continue

        # If we exit the retry loop without returning, raise a clear error
        raise RuntimeError("Groq API unavailable or rate limited after multiple attempts")


class FirecrawlClient:
    """Firecrawl Web Scraping Client"""

    @staticmethod
    def scrape(url: str) -> str:
        """Scrape webpage content"""
        if not FIRECRAWL_API_KEY:
            console.print("[yellow]⚠️  FIRECRAWL_API_KEY not set![/yellow]")
            return ""

        headers = {
            "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {"url": url, "formats": ["markdown"]}

        try:
            response = requests.post(FIRECRAWL_API_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result.get("data", {}).get("markdown", "")
        except Exception as e:
            console.print(f"[yellow]⚠️  Firecrawl Warning: {str(e)}[/yellow]")
            return ""
