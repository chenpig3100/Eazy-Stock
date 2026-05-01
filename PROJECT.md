# Eazy Stock — Project Tracker

## Core Concept & Positioning

**Platform:** iOS & Android (App Store + Google Play)
**Market:** Taiwan Stock Exchange (台股)
**Target User:** Beginner investors (新手股民)
**Problem:** Existing stock apps have high learning curve, information overload, and complex interfaces
**Core Value:** Minimal UI + AI plain-language analysis — easy enough for beginners
**App Name:** Eazy Stock

## Key Decisions Made

- **AI Strategy:** Claude API is the core MVP feature; MCP is a future add-on (not in MVP)
- **Tech Stack (已定案):**
  - Frontend: React Native + Expo (TypeScript)
  - IDE: VSCode
  - Backend: FastAPI (Python)
  - AI: Claude API (claude-sonnet-4-6)
  - 即時股價: Fugle API
  - 財報資料 (EPS/殖利率/本益比): yfinance（MVP 用，之後可換付費方案）
  - 部署: AWS（EC2 or Lambda）
  - 資料庫: 無（MVP 無帳號系統，本地 AsyncStorage 儲存）
  - 上架: EAS Build + EAS Submit（iOS $99 USD/yr Apple Developer 帳號）
- **Legal Note:** AI output must be positioned as "investment reference" not "investment advice" — required by Taiwan FSC regulations

---

## MVP 功能範圍

**必做（核心功能）**
- 搜尋個股 → 顯示基本資料（股價、EPS、殖利率、本益比）
- AI 白話摘要（Claude API — 核心差異化）
- 財經新聞（個股相關）
- 股價警示通知

**延後至 v2**
- K 線圖
- ETF 篩選
- 模擬帳戶（紙上交易）
- 社群討論整合（PTT/Dcard）
- 新聞文章解析（用 `newspaper4k` 抓文章內文，取代 WebView，提供乾淨閱讀體驗，無廣告/Cookie 彈窗）

**v2 AI 擴充（`AnalyzeRequest` 新增欄位）**
- K 線圖分析 → 新增 `kline: list[{ date, open, high, low, close }]`
- ETF 篩選分析 → 新增 `etf_holdings: list[str]`（前十大持股）、`etf_expense_ratio: float`（費用率）
- 新聞文章解析 → 新增 `article_content: str`（newspaper4k 抓到的文章內文）

**不做（明確排除）**
- 技術指標（RSI、MACD 等）
- 五檔委買委賣
- 三大法人買賣超
- 下單交易功能（需金管會執照）

---

## 6-Phase Development Plan

### Phase 1 — Requirements & Planning ✅ 完成
競品分析、MVP scope、tech stack、商業模式、Persona x4、法規確認

### Phase 2 — UI/UX Design ✅ 完成（2026-04-28）
14 個畫面全部完成於 Figma。所有 Phase 1 設計原則達成。

### Phase 3 — Development 🔄 進行中

#### Backend
- [x] FastAPI 專案初始化
- [x] `GET /stocks/{symbol}` — Fugle 即時股價 + yfinance EPS/殖利率/本益比
- [x] `GET /news/{symbol}` — Google News RSS 個股新聞
- [x] `GET /market/overview` — 大盤概況（加權指數）
- [x] `POST /ai/analyze` — Claude API AI 白話分析
- [x] 全站 Cache（in-memory，盤中 30s TTL，收盤後 8 小時）

#### Frontend
- [x] Setup（Navigation、Theme、套件安裝）
- [x] Onboarding（3 頁、左右滑動、AsyncStorage 記錄）
- [x] API 串接層（`services/api.ts`）
- [ ] Tab 1 首頁（大盤概況 + 新聞）
- [ ] Tab 2 股票（搜尋、熱門股票、個股頁）
- [ ] Tab 3 倉位（持倉總覽、新增持倉、損益計算）
- [ ] Tab 4 警示（警示列表、推播通知）
- [ ] Tab 5 設定（字體大小、語言、隱私政策）
- [ ] 全域 AI FAB + Chat Room Bottom Sheet
- [ ] Onboarding（首次啟動 3 頁）

### Phase 4 — Testing
Unit tests, integration tests, TestFlight beta, device compatibility

### Phase 5 — App Store Submission
Apple Developer account ($99 USD/yr), store assets, Apple review process

### Phase 6 — Post-launch Maintenance
Crash monitoring, user feedback, iterative updates, API maintenance

---

## App Screen Tree（畫面樹狀圖）

```
App
├── Onboarding（首次啟動）
│   ├── Page 1：台股資訊，一看就懂
│   ├── Page 2：記錄持倉，追蹤損益
│   └── Page 3：AI 助理隨時待命 → [開始使用]
│
├── Tab 1 首頁
│   ├── 大盤概況（加權指數）
│   └── 近期股市新聞列表
│
├── Tab 2 股票
│   ├── 搜尋欄 + 熱門股票
│   ├── 搜尋結果（有結果）→ 個股頁
│   ├── 搜尋結果（無結果）
│   └── 個股頁
│       ├── 即時股價 + 基本資料（EPS/殖利率/本益比）
│       └── 相關新聞 → App 內 WebView（不跳出 App）
│
├── Tab 3 倉位
│   ├── 持倉總覽（有持倉）← 左滑持倉卡片可刪除
│   ├── Empty State（無持倉）
│   └── 新增持倉 Modal（股票代號/買入價/數量/日期）
│
├── Tab 4 警示
│   ├── 警示列表 ← 左滑警示卡片可刪除
│   ├── 新增警示（自動偵測上漲/下跌）
│   └── 推播通知權限請求（首次設定警示時觸發）
│
├── Tab 5 設定
│   ├── 帳號區塊（尚未登入）→ 登入畫面
│   │   └── 登入畫面（Sign in with Apple）
│   ├── 顯示設定（字體大小/外觀）
│   ├── 語言設定（中文/English）
│   └── 關於（隱私政策/使用條款/版本）
│
└── 全域 AI FAB（所有畫面右下角）
    └── AI Chat Room（半螢幕 Bottom Sheet）
        ├── 免責聲明 banner
        ├── 對話記錄（含資料來源 pills）
        └── 輸入框
```

---

## 商業模式

**定價：**
- 免費版：基本股價查詢、財經新聞、股價警示通知
- 付費版：$4.9 USD/月，AI 白話摘要功能，需登入帳號

**每用戶損益：**
| 項目 | 金額 |
|------|------|
| 用戶付 | $4.90 USD |
| 平台抽成 15% | -$0.74 |
| 實收 | $4.17 |
| Claude API 成本 | -$1.50 |
| **每用戶淨利** | **$2.67 USD** |

損益平衡：只需 4 個付費用戶
