import api from './api'
import { MarketOverview } from '../types/stock'

export const getMarketOverview = async (): Promise<MarketOverview> => {
  const { data } = await api.get<MarketOverview>('/market/overview')
  return data
}
