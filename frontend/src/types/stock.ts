export interface Stock {
  symbol: string
  name: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  isClosed: boolean
  date: string
  eps: number | null
  dividendYield: number | null
  peRatio: number | null
}

export interface NewsArticle {
  title: string
  url: string
  source: string | null
  publishedAt: string
}

export interface NewsResponse {
  symbol: string
  articles: NewsArticle[]
}

export interface MarketOverview {
  name: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
}

export interface Holding {
  id: string
  symbol: string
  name: string
  buyPrice: number
  quantity: number
  buyDate: string
}

export interface StockAlert {
  id: string
  symbol: string
  name: string
  targetPrice: number
  direction: 'above' | 'below'
  createdAt: string
}

export interface AIAnalyzeRequest {
  symbol?: string
  name?: string
  price?: number
  change?: number
  changePercent?: number
  eps?: number | null
  dividendYield?: number | null
  peRatio?: number | null
  question?: string
}

export interface AIAnalyzeResponse {
  analysis: string
  disclaimer: string
}
