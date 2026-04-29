from urllib.parse import quote
import feedparser
import httpx

GOOGLE_NEWS_RSS = "https://news.google.com/rss/search"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


async def get_stock_news(symbol: str, name: str = "") -> list[dict]:
    query = quote(f"{symbol} {name}".strip() if name else symbol)
    url = f"{GOOGLE_NEWS_RSS}?q={query}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"

    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers=HEADERS, timeout=10)
        r.raise_for_status()

    feed = feedparser.parse(r.text)

    articles = []
    for entry in feed.entries[:10]:
        source = entry.get("source", {})
        articles.append({
            "title": entry.get("title"),
            "url": entry.get("link"),
            "source": source.get("title") if isinstance(source, dict) else None,
            "publishedAt": entry.get("published"),
        })
    return articles
