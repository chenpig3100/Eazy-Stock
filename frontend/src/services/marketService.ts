import api from './api'
import { MarketOverview, NewsArticle } from '../types/stock'

export const getMarketOverview = async (): Promise<MarketOverview> => {
  const { data } = await api.get<MarketOverview>('/market/overview')
  return data
}

export const getMarketNews = async (): Promise<NewsArticle[]> => {
  const { data } = await api.get<{ symbol: string; articles: NewsArticle[] }>(`/news/${encodeURIComponent('台股')}`)
  return data.articles
}
