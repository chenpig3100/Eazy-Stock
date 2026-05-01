import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/colors'
import { TabParamList, StocksStackParamList } from '../types/navigation'

import HomeScreen from '../screens/Home/HomeScreen'
import StocksScreen from '../screens/stocks/StocksScreen'
import StockDetailScreen from '../screens/stocks/StockDetailScreen'
import NewsWebViewScreen from '../screens/stocks/NewsWebViewScreen'
import PortfolioScreen from '../screens/Portfolio/PortfolioScreen'
import AlertsScreen from '../screens/alerts/AlertsScreen'
import SettingsScreen from '../screens/Settings/SettingsScreen'

const Tab = createBottomTabNavigator<TabParamList>()
const StocksStack = createNativeStackNavigator<StocksStackParamList>()

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
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
      <Tab.Screen name="Home"      component={HomeScreen}        options={{ tabBarLabel: '首頁' }} />
      <Tab.Screen name="Stocks"    component={StocksNavigator}   options={{ tabBarLabel: '股票' }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen}   options={{ tabBarLabel: '倉位' }} />
      <Tab.Screen name="Alerts"    component={AlertsScreen}      options={{ tabBarLabel: '警示' }} />
      <Tab.Screen name="Settings"  component={SettingsScreen}    options={{ tabBarLabel: '設定' }} />
    </Tab.Navigator>
  )
}
