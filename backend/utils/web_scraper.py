import requests
from bs4 import BeautifulSoup
from config.settings import SERPAPI_KEY

def quick_company_overview(company_name: str) -> str:
    """
    Try SerpAPI if available, otherwise fallback to searching company homepage and meta description.
    Keep short and simple.
    """
    if SERPAPI_KEY:
        params = {
            "q": company_name,
            "api_key": SERPAPI_KEY,
            "engine": "google",
        }
        resp = requests.get("https://serpapi.com/search", params=params, timeout=20).json()
        # try to pick a snippet
        snippet = None
        if "organic_results" in resp and len(resp["organic_results"]) > 0:
            snippet = resp["organic_results"][0].get("snippet")
        if snippet:
            return snippet
    # fallback: try basic google-like search via DuckDuckGo (no api key)
    try:
        r = requests.get(f"https://duckduckgo.com/html/?q={company_name}", timeout=10)
        soup = BeautifulSoup(r.text, "html.parser")
        # try description meta from likely site (first link)
        link = soup.find("a", {"class": "result__a"})
        if link and link.get("href"):
            href = link.get("href")
            # fetch site meta description
            rr = requests.get(href, timeout=10)
            s2 = BeautifulSoup(rr.text, "html.parser")
            meta = s2.find("meta", attrs={"name": "description"})
            if meta and meta.get("content"):
                return meta.get("content")
    except Exception:
        pass
    return f"No quick overview found for {company_name}."
