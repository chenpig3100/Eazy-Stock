import asyncio
from fastapi import APIRouter, HTTPException
from app.services import fugle, yfinance_service, cache

router = APIRouter(prefix="/stocks", tags=["stocks"])


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
