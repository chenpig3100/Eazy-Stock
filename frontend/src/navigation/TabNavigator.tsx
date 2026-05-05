import { useRef } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/colors'
import { TabParamList, HomeStackParamList, StocksStackParamList } from '../types/navigation'

import HomeScreen from '../screens/Home/HomeScreen'
import StocksScreen from '../screens/stocks/StocksScreen'
import StockDetailScreen from '../screens/stocks/StockDetailScreen'
import NewsWebViewScreen from '../screens/stocks/NewsWebViewScreen'
import PortfolioScreen from '../screens/Portfolio/PortfolioScreen'
import AlertsScreen from '../screens/alerts/AlertsScreen'
import SettingsScreen from '../screens/Settings/SettingsScreen'
import AIChatSheet, { AIChatSheetRef } from '../screens/AI/AIChatSheet'

const Tab = createBottomTabNavigator<TabParamList>()
const HomeStack = createNativeStackNavigator<HomeStackParamList>()
const StocksStack = createNativeStackNavigator<StocksStackParamList>()

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="NewsWebView" component={NewsWebViewScreen} />
    </HomeStack.Navigator>
  )
}

function StocksNavigator() {
  return (
    <StocksStack.Navigator screenOptions={{ headerShown: false }}>
      <StocksStack.Screen name="StocksList" component={StocksScreen} />
      <StocksStack.Screen name="StockDetail" component={StockDetailScreen} />
      <StocksStack.Screen name="NewsWebView" component={NewsWebViewScreen} />
    </StocksStack.Navigator>
  )
}

export default function TabNavigator() {
  const chatRef = useRef<AIChatSheetRef>(null)
  const insets = useSafeAreaInsets()

  // FAB sits above the tab bar (56px) + safe area bottom
  const fabBottom = 56 + insets.bottom + 16

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: getFocusedRouteNameFromRoute(route) === 'NewsWebView'
            ? { display: 'none' }
            : { backgroundColor: Colors.surface, borderTopColor: Colors.border },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, [string, string]> = {
              Home:      ['home', 'home-outline'],
              Stocks:    ['bar-chart', 'bar-chart-outline'],
              Portfolio: ['briefcase', 'briefcase-outline'],
              Alerts:    ['notifications', 'notifications-outline'],
              Settings:  ['settings', 'settings-outline'],
            }
            const [active, inactive] = icons[route.name] ?? ['home', 'home-outline']
            return <Ionicons name={(focused ? active : inactive) as any} size={size} color={color} />
          },
        })}
      >
        <Tab.Screen name="Home"      component={HomeNavigator}     options={{ tabBarLabel: '首頁' }} />
        <Tab.Screen name="Stocks"    component={StocksNavigator}   options={{ tabBarLabel: '股票' }} />
        <Tab.Screen name="Portfolio" component={PortfolioScreen}   options={{ tabBarLabel: '倉位' }} />
        <Tab.Screen name="Alerts"    component={AlertsScreen}      options={{ tabBarLabel: '警示' }} />
        <Tab.Screen name="Settings"  component={SettingsScreen}    options={{ tabBarLabel: '設定' }} />
      </Tab.Navigator>

      {/* Global AI FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => chatRef.current?.present()}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
      </TouchableOpacity>

      <AIChatSheet ref={chatRef} />
    </View>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
})
