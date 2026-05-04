import AsyncStorage from '@react-native-async-storage/async-storage'
import { Holding } from '../types/stock'

const PORTFOLIO_KEY = 'portfolio_holdings'

export const getHoldings = async (): Promise<Holding[]> => {
  const json = await AsyncStorage.getItem(PORTFOLIO_KEY)
  return json ? JSON.parse(json) : []
}

export const saveHoldings = async (holdings: Holding[]): Promise<void> => {
  await AsyncStorage.setItem(PORTFOLIO_KEY, JSON.stringify(holdings))
}

export const addHolding = async (holding: Holding): Promise<void> => {
  const existing = await getHoldings()
  await saveHoldings([...existing, holding])
}

export const deleteHolding = async (id: string): Promise<void> => {
  const existing = await getHoldings()
  await saveHoldings(existing.filter(h => h.id !== id))
}
