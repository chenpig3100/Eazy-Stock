import { useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { Colors } from '../../constants/colors'
import { Stock, NewsArticle } from '../../types/stock'
import { StocksStackParamList } from '../../types/navigation'
import { getStock, getStockNews } from '../../services/stockService'
import { getFavorites, toggleFavorite } from '../../services/favoritesService'
import styles from './StockDetailScreen.styles'

const SOURCE_COLORS = ['#FF9500', '#5856D6', '#007AFF', '#AF52DE', '#FF6B35', '#32ADE6']

function sourceColor(source: string): string {
  let h = 0
  for (const c of source) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return SOURCE_COLORS[h % SOURCE_COLORS.length]
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

type Props = {
  navigation: NativeStackNavigationProp<StocksStackParamList, 'StockDetail'>
  route: RouteProp<StocksStackParamList, 'StockDetail'>
}

export default function StockDetailScreen({ navigation, route }: Props) {
  const { symbol, name } = route.params
  const [stock, setStock] = useState<Stock | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    Promise.all([getStock(symbol), getStockNews(symbol, name)])
      .then(([stockData, newsData]) => {
        setStock(stockData)
        setNews(newsData.articles)
      })
      .catch(() => setError('載入失敗，請稍後再試'))
      .finally(() => setLoading(false))
    getFavorites().then(favs => setIsFavorite(favs.some(f => f.symbol === symbol)))
  }, [symbol, name])

  const handleToggleFavorite = async () => {
    const isNow = await toggleFavorite({ symbol, name })
    setIsFavorite(isNow)
  }

  const changeColor = (change: number) =>
    change > 0 ? Colors.positive : change < 0 ? Colors.negative : Colors.neutral

  const renderNews = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      style={styles.newsItem}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('NewsWebView', { url: item.url, title: item.title })}
    >
      <View style={styles.newsTop}>
        {item.source ? (
          <View style={[styles.sourceTag, { backgroundColor: sourceColor(item.source) }]}>
            <Text style={styles.sourceText} numberOfLines={1}>{item.source}</Text>
          </View>
        ) : null}
        <Text style={styles.newsTime}>{formatTime(item.publishedAt)}</Text>
      </View>
      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.headerSymbol}>{symbol}</Text>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#FF3B30' : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true)
              setError(null)
              Promise.all([getStock(symbol), getStockNews(symbol, name)])
                .then(([s, n]) => { setStock(s); setNews(n.articles) })
                .catch(() => setError('載入失敗，請稍後再試'))
                .finally(() => setLoading(false))
            }}
          >
            <Text style={styles.retryText}>重試</Text>
          </TouchableOpacity>
        </View>
      ) : stock ? (
        <FlatList
          data={news}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderNews}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Price card */}
              <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  {stock.isClosed && (
                    <View style={styles.closedBadge}>
                      <Text style={styles.closedText}>收盤價</Text>
                    </View>
                  )}
                </View>
                <View style={styles.changeRow}>
                  <Ionicons
                    name={stock.change >= 0 ? 'caret-up' : 'caret-down'}
                    size={14}
                    color={changeColor(stock.change)}
                  />
                  <Text style={[styles.changeText, { color: changeColor(stock.change) }]}>
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}
                    {'  '}({stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>

              {/* Fundamentals card */}
              <View style={styles.fundamentalsCard}>
                <Text style={styles.fundamentalsTitle}>基本資料</Text>
                <View style={styles.fundamentalsGrid}>
                  <View style={styles.fundamentalItem}>
                    <Text style={styles.fundamentalLabel}>每股盈餘 EPS</Text>
                    <Text style={styles.fundamentalValue}>
                      {stock.eps != null ? stock.eps.toFixed(2) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.fundamentalDivider} />
                  <View style={styles.fundamentalItem}>
                    <Text style={styles.fundamentalLabel}>殖利率</Text>
                    <Text style={styles.fundamentalValue}>
                      {stock.dividendYield != null ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.fundamentalDivider} />
                  <View style={styles.fundamentalItem}>
                    <Text style={styles.fundamentalLabel}>本益比 P/E</Text>
                    <Text style={styles.fundamentalValue}>
                      {stock.peRatio != null ? stock.peRatio.toFixed(1) : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>相關新聞</Text>
            </>
          }
          ListEmptyComponent={
            <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 16 }}>
              目前無相關新聞
            </Text>
          }
        />
      ) : null}
    </SafeAreaView>
  )
}
