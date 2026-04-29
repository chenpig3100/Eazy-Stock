import asyncio
from functools import partial
import yfinance as yf


def _fetch_fundamentals(symbol: str) -> dict:
    # Try TWSE first, then TPEx (OTC)
    for suffix in (".TW", ".TWO"):
        ticker = yf.Ticker(f"{symbol}{suffix}")
        info = ticker.info
        if info.get("regularMarketPrice") or info.get("trailingEps"):
            dividend_yield = info.get("dividendYield")
            return {
                "eps": info.get("trailingEps"),
                "dividendYield": round(dividend_yield, 2) if dividend_yield else None,
                "peRatio": info.get("trailingPE"),
            }
    return {"eps": None, "dividendYield": None, "peRatio": None}


async def get_fundamentals(symbol: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(_fetch_fundamentals, symbol))
