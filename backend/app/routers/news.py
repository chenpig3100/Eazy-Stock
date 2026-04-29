from fastapi import APIRouter
from app.services import news, cache

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/{symbol}")
async def get_news(symbol: str, name: str = ""):
    cache_key = f"news:{symbol}"
    if cached := cache.get(cache_key):
        return cached

    articles = await news.get_stock_news(symbol, name)
    result = {"symbol": symbol, "articles": articles}
    cache.set(cache_key, result, ttl=cache.TTL_NEWS)
    return result
