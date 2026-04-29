import asyncio
from functools import partial
import yfinance as yf


def _fetch_taiex() -> dict:
    info = yf.Ticker("^TWII").info
    price = info.get("regularMarketPrice")
    prev_close = info.get("regularMarketPreviousClose")
    change = info.get("regularMarketChange")
    change_pct = info.get("regularMarketChangePercent")

    return {
        "name": "台灣加權指數",
        "price": price,
        "previousClose": prev_close,
        "change": round(change, 2) if change else None,
        "changePercent": round(change_pct, 2) if change_pct else None,
        "volume": info.get("regularMarketVolume"),
    }


async def get_market_overview() -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch_taiex)
