import time
from datetime import datetime
from zoneinfo import ZoneInfo

_store: dict[str, dict] = {}

MARKET_OPEN_HOUR = 9
MARKET_CLOSE_HOUR = 13
MARKET_CLOSE_MINUTE = 30

TTL_MARKET_OPEN = 30
TTL_MARKET_CLOSED = 60 * 60 * 8  # 8 hours
TTL_NEWS = 60 * 10  # 10 minutes


def is_market_open() -> bool:
    now = datetime.now(tz=ZoneInfo("Asia/Taipei"))
    if now.weekday() >= 5:
        return False
    open_time = now.replace(hour=MARKET_OPEN_HOUR, minute=0, second=0, microsecond=0)
    close_time = now.replace(hour=MARKET_CLOSE_HOUR, minute=MARKET_CLOSE_MINUTE, second=0, microsecond=0)
    return open_time <= now <= close_time


def price_ttl() -> int:
    return TTL_MARKET_OPEN if is_market_open() else TTL_MARKET_CLOSED


def get(key: str):
    entry = _store.get(key)
    if entry and time.time() < entry["expires_at"]:
        return entry["data"]
    return None


def set(key: str, data, ttl: int | None = None) -> None:
    _store[key] = {
        "data": data,
        "expires_at": time.time() + (ttl if ttl is not None else price_ttl()),
    }
