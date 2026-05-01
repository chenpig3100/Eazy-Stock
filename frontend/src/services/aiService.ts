import api from './api'
import { AIAnalyzeRequest, AIAnalyzeResponse } from '../types/stock'

export const analyzeStock = async (request: AIAnalyzeRequest): Promise<AIAnalyzeResponse> => {
  const { data } = await api.post<AIAnalyzeResponse>('/ai/analyze', request)
  return data
}
