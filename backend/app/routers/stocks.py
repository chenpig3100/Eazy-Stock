import asyncio
import time
import httpx
from fastapi import APIRouter, HTTPException, Query
from app.services import fugle, yfinance_service, cache

router = APIRouter(prefix="/stocks", tags=["stocks"])

# Module-level cache for the full TWSE stock list (24h TTL)
_stock_list: list[dict] = []
_stock_list_fetched_at: float = 0
_STOCK_LIST_TTL = 86400  # 24 hours


async def _load_stock_list() -> list[dict]:
    global _stock_list, _stock_list_fetched_at
    if _stock_list and time.time() - _stock_list_fetched_at < _STOCK_LIST_TTL:
        return _stock_list

    results = []
    async with httpx.AsyncClient() as client:
        # TWSE (上市)
        try:
            r = await client.get(
                "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL",
                headers={"Accept": "application/json"},
                timeout=15,
            )
            for item in r.json():
                code = item.get("Code", "")
                name = item.get("Name", "")
                if code and name:
                    results.append({"symbol": code, "name": name})
        except Exception:
            pass

        # TPEx (上櫃)
        try:
            r = await client.get(
                "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes",
                headers={"Accept": "application/json"},
                timeout=15,
            )
            for item in r.json():
                code = item.get("SecuritiesCompanyCode", "")
                name = item.get("CompanyName", "")
                if code and name:
                    results.append({"symbol": code, "name": name})
        except Exception:
            pass

    if results:
        _stock_list = results
        _stock_list_fetched_at = time.time()

    return _stock_list


# /search must be declared before /{symbol} to avoid being swallowed by the wildcard
@router.get("/search")
async def search_stocks(q: str = Query(default="")):
    q = q.strip()
    if not q:
        return []

    cache_key = f"search:{q.lower()}"
    if cached := cache.get(cache_key):
        return cached

    stock_list = await _load_stock_list()
    q_lower = q.lower()
    matches = [
        s for s in stock_list
        if q_lower in s["name"].lower() or q_lower in s["symbol"].lower()
    ][:8]

    cache.set(cache_key, matches, ttl=300)  # 5 min
    return matches


@router.get("/{symbol}")
async def get_stock(symbol: str):
    cache_key = f"stock:{symbol}"
    if cached := cache.get(cache_key):
        return cached

    try:
        quote, fundamentals = await asyncio.gather(
            fugle.get_quote(symbol),
            yfinance_service.get_fundamentals(symbol),
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"API error: {e}")

    total = quote.get("total", {})

    result = {
        "symbol": symbol,
        "name": quote.get("name"),
        "price": quote.get("closePrice") or quote.get("lastPrice"),
        "previousClose": quote.get("previousClose"),
        "change": quote.get("change"),
        "changePercent": quote.get("changePercent"),
        "open": quote.get("openPrice"),
        "high": quote.get("highPrice"),
        "low": quote.get("lowPrice"),
        "volume": total.get("tradeVolume"),
        "isClosed": quote.get("isClose", False),
        "date": quote.get("date"),
        "eps": fundamentals.get("eps"),
        "dividendYield": fundamentals.get("dividendYield"),
        "peRatio": fundamentals.get("peRatio"),
    }
    cache.set(cache_key, result)
    return result
