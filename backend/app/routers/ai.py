from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import claude

router = APIRouter(prefix="/ai", tags=["ai"])

DISCLAIMER = "以上內容僅供投資參考，不構成任何買賣建議。投資有風險，請自行評估。"


class AnalyzeRequest(BaseModel):
    symbol: str | None = None
    name: str | None = None
    price: float | None = None
    change: float | None = None
    changePercent: float | None = None
    eps: float | None = None
    dividendYield: float | None = None
    peRatio: float | None = None
    question: str = ""


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    try:
        analysis = await claude.analyze(req.model_dump(), req.question)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")

    return {
        "analysis": analysis,
        "disclaimer": DISCLAIMER,
    }
