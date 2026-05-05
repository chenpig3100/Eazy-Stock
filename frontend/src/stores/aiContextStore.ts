import { create } from 'zustand'
import { AIAnalyzeRequest } from '../types/stock'

type AIContextStore = {
  context: AIAnalyzeRequest | null
  setContext: (ctx: AIAnalyzeRequest | null) => void
}

export const useAIContext = create<AIContextStore>(set => ({
  context: null,
  setContext: ctx => set({ context: ctx }),
}))
