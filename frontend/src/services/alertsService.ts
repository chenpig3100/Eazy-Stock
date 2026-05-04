import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { StockAlert } from '../types/stock'

const ALERTS_KEY = 'stock_alerts'

export const getAlerts = async (): Promise<StockAlert[]> => {
  const json = await AsyncStorage.getItem(ALERTS_KEY)
  return json ? JSON.parse(json) : []
}

export const saveAlerts = async (alerts: StockAlert[]): Promise<void> => {
  await AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
}

export const addAlert = async (alert: StockAlert): Promise<void> => {
  const existing = await getAlerts()
  await saveAlerts([...existing, alert])
}

export const deleteAlert = async (id: string): Promise<void> => {
  const existing = await getAlerts()
  await saveAlerts(existing.filter(a => a.id !== id))
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}
