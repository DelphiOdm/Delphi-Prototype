# backend/apis/Onboarding/enrichment.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_conn
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import httpx
import json
import re
import asyncio
import concurrent.futures

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


# ─────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────

class EnrichRequest(BaseModel):
    website_url: str
    user_id: int


class SaveProfileRequest(BaseModel):
    user_id: int
    company_name: str
    company_size: str
    headquarters: str
    type: str
    founded: str
    revenue_size: str
    specialties: str
    website: str
    brands: str


# ─────────────────────────────────────────
# URL Normalizer
# ─────────────────────────────────────────

def normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    return url.rstrip("/")


# ─────────────────────────────────────────
# Brand validator
# ─────────────────────────────────────────

def _is_valid_brand(text: str) -> bool:
    text = text.strip()
    if not text or len(text) < 2 or len(text) > 60:
        return False
    if "\n" in text or text.count(" ") > 6:
        return False
    skip = {
        "home", "about", "contact", "login", "register", "search",
        "menu", "back", "next", "prev", "more", "read more",
        "click here", "learn more", "view all", "see all",
        "privacy policy", "terms", "sitemap", "careers",
        "cookie", "copyright", "all rights reserved", "follow us",
        "facebook", "twitter", "instagram", "linkedin", "youtube",
        "newsletter", "subscribe", "language", "country",
    }
    return text.lower() not in skip


# ─────────────────────────────────────────
# Brand extractor from BeautifulSoup
# ─────────────────────────────────────────

def extract_brands_from_soup(soup: BeautifulSoup) -> list:
    found = []
    section_keywords = [
        "model", "models", "brand", "brands",
        "product", "products", "portfolio",
        "series", "range", "lineup", "vehicles",
        "collection", "catalogue", "catalog",
        "subsidiaries", "divisions",
    ]

    # 1. Footer first — BMW-style sites keep models here
    footer = soup.find("footer")
    if footer:
        print("[Scraper] Scanning footer...")
        for tag in footer.find_all(["section", "div", "ul", "nav"]):
            tag_id    = (tag.get("id")    or "").lower()
            tag_class = " ".join(tag.get("class") or []).lower()
            if any(kw in tag_id or kw in tag_class for kw in section_keywords):
                for item in tag.find_all(["li", "a"])[:30]:
                    text = item.get_text(strip=True)
                    if _is_valid_brand(text):
                        found.append(text)
                if found:
                    break

        # Fallback: all footer links containing model keywords
        if not found:
            for a in footer.find_all("a"):
                text = a.get_text(strip=True)
                if _is_valid_brand(text) and any(
                    kw in text.lower() for kw in section_keywords
                ):
                    found.append(text)

    # 2. Body sections
    if not found:
        for tag in soup.find_all(["section", "div", "ul", "nav"]):
            tag_id    = (tag.get("id")    or "").lower()
            tag_class = " ".join(tag.get("class") or []).lower()
            tag_text  = tag.get_text(separator=" ").lower()[:200]
            if any(
                kw in tag_id or kw in tag_class or kw in tag_text
                for kw in section_keywords
            ):
                for item in tag.find_all(["li", "h2", "h3", "h4", "a"])[:30]:
                    text = item.get_text(strip=True)
                    if _is_valid_brand(text):
                        found.append(text)
                if len(found) >= 3:
                    break

    # 3. JSON-LD
    if not found:
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string or "")
                if not isinstance(data, dict):
                    continue
                for key in ["brand", "subOrganization", "makesOffer",
                            "hasOfferCatalog", "model"]:
                    val = data.get(key)
                    if not val:
                        continue
                    if isinstance(val, list):
                        for b in val:
                            if isinstance(b, dict) and b.get("name"):
                                found.append(b["name"])
                            elif isinstance(b, str):
                                found.append(b)
                    elif isinstance(val, dict) and val.get("name"):
                        found.append(val["name"])
                if found:
                    break
            except Exception:
                pass

    # Deduplicate
    seen, unique = set(), []
    for item in found:
        item = item.strip()
        if item and item.lower() not in seen:
            seen.add(item.lower())
            unique.append(item)

    print(f"[Scraper] Brands/Models found: {unique[:15]}")
    return unique[:20]


# ─────────────────────────────────────────
# Method 1: httpx (fast, for simple sites)
# ─────────────────────────────────────────

async def fetch_with_httpx(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language":           "en-US,en;q=0.9",
        "Accept-Encoding":           "gzip, deflate, br",
        "Connection":                "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=15.0,
            headers=headers,
            verify=False
        ) as client:
            res = await client.get(url)
            if res.status_code == 200 and len(res.text) > 500:
                return res.text
    except Exception as e:
        print(f"[httpx] Failed for {url}: {e}")
    return ""


# ─────────────────────────────────────────
# Method 2: Playwright (for JS-heavy sites)
# runs in its own thread to fix Windows issue
# ─────────────────────────────────────────

def _playwright_thread(url: str) -> str:
    """Runs Playwright in a fresh event loop inside a worker thread."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(_playwright_fetch(url))
    finally:
        loop.close()


async def _playwright_fetch(url: str) -> str:
    """
    Uses Playwright to fully render a JS-heavy page.
    Returns HTML string or empty string on failure.
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("[Playwright] Not installed.")
        return ""

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ]
            )

            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 800},
                locale="en-US",
            )

            page = await context.new_page()

            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins',   { get: () => [1, 2, 3] });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
                window.chrome = { runtime: {} };
            """)

            print(f"[Playwright] Loading: {url}")
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)

            # Wait for footer to load
            try:
                await page.wait_for_selector("footer", timeout=8000)
            except Exception:
                pass

            await page.wait_for_timeout(3000)

            html = await page.content()
            await browser.close()

            print(f"[Playwright] Got {len(html)} bytes")
            return html

    except Exception as e:
        print(f"[Playwright] Exception: {e}")
        return ""


# ─────────────────────────────────────────
# Main scraper — tries httpx first,
# falls back to Playwright if needed
# ─────────────────────────────────────────

async def scrape_website(url: str) -> dict:
    url = normalize_url(url)
    parsed   = urlparse(url)
    root_url = f"{parsed.scheme}://{parsed.netloc}"

    print(f"[Scraper] Starting for: {url}")

    html = ""

    # ── Try httpx first (fast) ────────────────────────────
    print("[Scraper] Trying httpx...")
    html = await fetch_with_httpx(url)

    # Try root domain with httpx
    if not html and root_url.rstrip("/") != url:
        print(f"[Scraper] Trying root with httpx: {root_url}")
        html = await fetch_with_httpx(root_url)

    # ── Fallback to Playwright (JS rendering) ─────────────
    if not html:
        print("[Scraper] httpx failed — switching to Playwright...")
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            html = await loop.run_in_executor(
                pool, _playwright_thread, url
            )

    # Try root with Playwright
    if not html and root_url.rstrip("/") != url:
        print(f"[Scraper] Trying root with Playwright: {root_url}")
        loop = asyncio.get_event_loop()
        with concurrent.futures.ThreadPoolExecutor() as pool:
            html = await loop.run_in_executor(
                pool, _playwright_thread, root_url
            )

    if not html or len(html) < 200:
        return {
            "scraped": False,
            "reason":  (
                "Could not load website content. "
                "Please add your brands/products manually below."
            ),
        }

    try:
        soup   = BeautifulSoup(html, "html.parser")
        brands = extract_brands_from_soup(soup)

        return {
            "scraped": True,
            "website": url,
            "brands":  ", ".join(brands) if brands else "",
        }

    except Exception as e:
        print(f"[Scraper] Parse error: {e}")
        return {
            "scraped": False,
            "reason":  f"Could not parse website: {str(e)}",
        }


# ─────────────────────────────────────────
# Routes
# ─────────────────────────────────────────

@router.post("/enrich")
async def enrich_company(payload: EnrichRequest):
    """
    Detects brands/models/products from company website.
    Tries httpx first, falls back to Playwright for JS sites.
    Always returns HTTP 200.
    """
    if not payload.website_url.strip():
        raise HTTPException(status_code=400, detail="Website URL is required")

    result = await scrape_website(payload.website_url)

    return {
        "success": True,
        "scraped": result.get("scraped", False),
        "message": result.get("reason",  ""),
        "data": {
            "website": result.get("website", ""),
            "brands":  result.get("brands",  ""),
        }
    }


@router.post("/save-profile")
def save_company_profile(payload: SaveProfileRequest):
    """
    Upserts company profile into delphi_company_profiles.
    """
    if not payload.user_id or payload.user_id <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id. Please log in again."
        )

    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute(
            "SELECT user_id FROM Mst_tbldelphiusers WHERE user_id = %s AND is_active = 1",
            (payload.user_id,)
        )
        if not cur.fetchone():
            raise HTTPException(
                status_code=404,
                detail="User not found. Please log in again."
            )

        cur.execute(
            "SELECT id FROM delphi_company_profiles WHERE user_id = %s",
            (payload.user_id,)
        )
        existing = cur.fetchone()

        if existing:
            cur.execute("""
                UPDATE delphi_company_profiles
                SET company_name  = %s,
                    company_size  = %s,
                    headquarters  = %s,
                    type          = %s,
                    founded       = %s,
                    revenue_size  = %s,
                    specialties   = %s,
                    website       = %s,
                    brands        = %s
                WHERE user_id = %s
            """, (
                payload.company_name,
                payload.company_size,
                payload.headquarters,
                payload.type,
                payload.founded,
                payload.revenue_size,
                payload.specialties,
                payload.website,
                payload.brands,
                payload.user_id,
            ))
        else:
            cur.execute("""
                INSERT INTO delphi_company_profiles
                    (user_id, company_name, company_size, headquarters,
                     type, founded, revenue_size, specialties, website, brands)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                payload.user_id,
                payload.company_name,
                payload.company_size,
                payload.headquarters,
                payload.type,
                payload.founded,
                payload.revenue_size,
                payload.specialties,
                payload.website,
                payload.brands,
            ))

        conn.commit()
        return {"success": True, "message": "Company profile saved successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@router.get("/profile/{user_id}")
def get_company_profile(user_id: int):
    """Fetch saved company profile for a user."""
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM delphi_company_profiles WHERE user_id = %s",
            (user_id,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Profile not found")
        return {"success": True, "data": row}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()