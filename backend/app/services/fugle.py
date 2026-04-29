import os
import httpx

FUGLE_BASE_URL = "https://api.fugle.tw/marketdata/v1.0/stock/intraday"


def _headers() -> dict:
    return {"X-API-KEY": os.getenv("FUGLE_API_KEY", "")}


async def get_quote(symbol: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{FUGLE_BASE_URL}/quote/{symbol}",
            headers=_headers(),
            timeout=10,
        )
        r.raise_for_status()
        return r.json()
