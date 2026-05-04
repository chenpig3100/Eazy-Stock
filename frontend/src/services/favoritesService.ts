import AsyncStorage from '@react-native-async-storage/async-storage'

const FAVORITES_KEY = 'favorite_stocks'

export interface FavoriteStock {
  symbol: string
  name: string
}

export const getFavorites = async (): Promise<FavoriteStock[]> => {
  const json = await AsyncStorage.getItem(FAVORITES_KEY)
  return json ? JSON.parse(json) : []
}

// returns true if now favorited, false if removed
export const toggleFavorite = async (stock: FavoriteStock): Promise<boolean> => {
  const existing = await getFavorites()
  const idx = existing.findIndex(s => s.symbol === stock.symbol)
  if (idx >= 0) {
    existing.splice(idx, 1)
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(existing))
    return false
  } else {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...existing, stock]))
    return true
  }
}
