import { useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
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
import { useAIContext } from '../../stores/aiContextStore'
import NewsCard from '../../components/NewsCard'
import LoadingCenter from '../../components/LoadingCenter'
import styles from './StockDetailScreen.styles'

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
  const setAIContext = useAIContext(s => s.setContext)

  useEffect(() => {
    Promise.all([getStock(symbol), getStockNews(symbol, name)])
      .then(([stockData, newsData]) => {
        setStock(stockData)
        setNews(newsData.articles)
        setAIContext({
          symbol: stockData.symbol,
          name: stockData.name,
          price: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent,
          eps: stockData.eps,
          dividendYield: stockData.dividendYield,
          peRatio: stockData.peRatio,
        })
      })
      .catch(() => setError('載入失敗，請稍後再試'))
      .finally(() => setLoading(false))
    getFavorites().then(favs => setIsFavorite(favs.some(f => f.symbol === symbol)))
    return () => setAIContext(null)
  }, [symbol, name])

  const handleToggleFavorite = async () => {
    const isNow = await toggleFavorite({ symbol, name })
    setIsFavorite(isNow)
  }

  const changeColor = (change: number) =>
    change > 0 ? Colors.positive : change < 0 ? Colors.negative : Colors.neutral

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
        <LoadingCenter />
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
          renderItem={({ item }) => (
            <NewsCard
              item={item}
              onPress={() => navigation.navigate('NewsWebView', { url: item.url, title: item.title })}
            />
          )}
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
