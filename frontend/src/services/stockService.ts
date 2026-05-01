import api from './api'
import { Stock, NewsResponse } from '../types/stock'

export const getStock = async (symbol: string): Promise<Stock> => {
  const { data } = await api.get<Stock>(`/stocks/${symbol}`)
  return data
}

export const getStockNews = async (symbol: string, name: string = ''): Promise<NewsResponse> => {
  const { data } = await api.get<NewsResponse>(`/news/${symbol}`, {
    params: name ? { name } : undefined,
  })
  return data
}
