from fastapi import APIRouter, HTTPException
from app.services import market, cache

router = APIRouter(prefix="/market", tags=["market"])

CACHE_KEY = "market:overview"


@router.get("/overview")
async def get_overview():
    if cached := cache.get(CACHE_KEY):
        return cached

    try:
        result = await market.get_market_overview()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Market data error: {e}")

    cache.set(CACHE_KEY, result)
    return result
