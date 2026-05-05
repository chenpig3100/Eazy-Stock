import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Colors } from '../../constants/colors'
import { MarketOverview, NewsArticle } from '../../types/stock'
import { HomeStackParamList } from '../../types/navigation'
import { getMarketOverview, getMarketNews } from '../../services/marketService'
import NewsCard from '../../components/NewsCard'
import LoadingCenter from '../../components/LoadingCenter'
import styles from './HomeScreen.styles'

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>
}

export default function HomeScreen({ navigation }: Props) {
  const [market, setMarket] = useState<MarketOverview | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const [marketData, newsData] = await Promise.all([
        getMarketOverview(),
        getMarketNews(),
      ])
      setMarket(marketData)
      setNews(newsData)
    } catch {
      setError('載入失敗，請稍後再試')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const isPositive = (market?.change ?? 0) >= 0
  const changeColor = market
    ? market.change > 0 ? Colors.positive : market.change < 0 ? Colors.negative : Colors.neutral
    : Colors.neutral

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>台股新手</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingCenter />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>重試</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <NewsCard
              item={item}
              onPress={() => navigation.navigate('NewsWebView', { url: item.url, title: item.title })}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListHeaderComponent={
            <>
              {market && (
                <View style={styles.marketCard}>
                  <Text style={styles.marketLabel}>大盤概況</Text>
                  <View style={styles.marketRow}>
                    <Text style={styles.marketName}>加權指數</Text>
                    <Text style={styles.marketTag}>TAIEX</Text>
                  </View>
                  <Text style={styles.marketPrice}>
                    {market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <View style={styles.changeRow}>
                    <Ionicons
                      name={isPositive ? 'caret-up' : 'caret-down'}
                      size={14}
                      color={changeColor}
                    />
                    <Text style={[styles.changeText, { color: changeColor }]}>
                      {market.change > 0 ? '+' : ''}{market.change.toFixed(2)}
                    </Text>
                    <Text style={[styles.changeText, { color: changeColor }]}>
                      {'  '}({market.changePercent > 0 ? '+' : ''}{market.changePercent.toFixed(2)}%)
                    </Text>
                  </View>
                </View>
              )}
              <Text style={styles.sectionTitle}>近期股市新聞</Text>
            </>
          }
        />
      )}
    </SafeAreaView>
  )
}
