import os
import anthropic

DISCLAIMER = "以上內容僅供投資參考，不構成任何買賣建議。投資有風險，請自行評估。"

SYSTEM_PROMPT = """你是 Eazy Stock 的 AI 股票助理，專門幫助台股新手用白話理解股票資訊。

規則：
1. 用繁體中文回答
2. 所有說明要白話，避免專業術語；如需使用請附上簡短解釋
3. 你的角色是提供「投資參考」，不是「投資建議」，不可給出明確的買/賣指令
4. 回答要提到數據來源（例如：根據 Fugle 即時資料、yfinance 財報資料）
5. 回答長度控制在 200 字以內，條列式呈現"""


def _build_user_message(data: dict, question: str) -> str:
    if not data.get("symbol"):
        return question

    lines = [
        "股票資訊：",
        f"- 股票：{data.get('name', '')}（{data.get('symbol', '')}）",
        f"- 現價：{data.get('price')} 元",
        f"- 今日漲跌：{data.get('change')} 元（{data.get('changePercent')}%）",
    ]
    if data.get("eps") is not None:
        lines.append(f"- EPS（每股盈餘）：{data.get('eps')} 元")
    if data.get("dividendYield") is not None:
        lines.append(f"- 殖利率：{data.get('dividendYield')}%")
    if data.get("peRatio") is not None:
        lines.append(f"- 本益比：{data.get('peRatio')}")

    lines.append(f"\n用戶問題：{question}")
    return "\n".join(lines)


async def analyze(data: dict, question: str = "") -> str:
    if not question:
        question = "請幫我白話解釋這支股票目前的狀況" if data.get("symbol") else "你好，有什麼可以幫你？"

    client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    response = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {"role": "user", "content": _build_user_message(data, question)}
        ],
    )

    return response.content[0].text
