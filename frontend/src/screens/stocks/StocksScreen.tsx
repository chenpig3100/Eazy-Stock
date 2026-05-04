import { useState, useRef, useMemo, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '../../constants/colors'
import { StocksStackParamList } from '../../types/navigation'
import { getStock, searchStocks } from '../../services/stockService'
import { getFavorites, toggleFavorite } from '../../services/favoritesService'
import styles from './StocksScreen.styles'

const ALL_STOCKS = [
  { symbol: '2330', name: '台積電' },
  { symbol: '2317', name: '鴻海' },
  { symbol: '2454', name: '聯發科' },
  { symbol: '0050', name: '元大台灣50' },
  { symbol: '0056', name: '元大高股息' },
  { symbol: '2412', name: '中華電' },
  { symbol: '2308', name: '台達電' },
  { symbol: '2882', name: '國泰金' },
  { symbol: '2303', name: '聯電' },
  { symbol: '2002', name: '中鋼' },
  { symbol: '2886', name: '兆豐金' },
  { symbol: '2891', name: '中信金' },
  { symbol: '3008', name: '大立光' },
  { symbol: '2881', name: '富邦金' },
  { symbol: '2884', name: '玉山金' },
  { symbol: '2892', name: '第一金' },
  { symbol: '2880', name: '華南金' },
  { symbol: '1301', name: '台塑' },
  { symbol: '1303', name: '南亞' },
  { symbol: '2357', name: '華碩' },
  { symbol: '2382', name: '廣達' },
  { symbol: '3711', name: '日月光投控' },
  { symbol: '2379', name: '瑞昱' },
  { symbol: '6505', name: '台塑化' },
  { symbol: '2395', name: '研華' },
]

const POPULAR = ALL_STOCKS.slice(0, 8)

function normalize(s: string) {
  return s.toLowerCase().replace(/\s/g, '')
}

function isChinese(s: string) {
  return /[一-鿿]/.test(s)
}

type StockItem = { symbol: string; name: string }

type Props = {
  navigation: NativeStackNavigationProp<StocksStackParamList, 'StocksList'>
}

export default function StocksScreen({ navigation }: Props) {
  const [query, setQuery] = useState('')
  const [backendSearching, setBackendSearching] = useState(false)
  const [backendResults, setBackendResults] = useState<StockItem[]>([])
  const [searchError, setSearchError] = useState('')
  const [favoriteSymbols, setFavoriteSymbols] = useState<Set<string>>(new Set())
  const inputRef = useRef<TextInput>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useFocusEffect(
    useCallback(() => {
      getFavorites().then(favs => setFavoriteSymbols(new Set(favs.map(f => f.symbol))))
    }, [])
  )

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return POPULAR
    return ALL_STOCKS.filter(s =>
      normalize(s.symbol).startsWith(q) || normalize(s.name).includes(q)
    )
  }, [query])

  const isSearching = query.trim().length > 0
  const noLocalResult = isSearching && filtered.length === 0

  const runBackendSearch = async (raw: string) => {
    setBackendSearching(true)
    setSearchError('')
    setBackendResults([])
    try {
      if (isChinese(raw)) {
        const results = await searchStocks(raw)
        if (results.length > 0) {
          setBackendResults(results)
        } else {
          setSearchError(`查無「${raw}」，請確認名稱是否正確`)
        }
      } else {
        const stock = await getStock(raw.toUpperCase())
        setBackendResults([{ symbol: stock.symbol, name: stock.name }])
      }
    } catch {
      setSearchError(`查無「${raw}」，請確認股票代號或名稱是否正確`)
    } finally {
      setBackendSearching(false)
    }
  }

  const handleQueryChange = (t: string) => {
    setQuery(t)
    setSearchError('')
    setBackendResults([])

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = normalize(t.trim())
    if (!q) { setBackendSearching(false); return }

    const hasLocal = ALL_STOCKS.some(s =>
      normalize(s.symbol).startsWith(q) || normalize(s.name).includes(q)
    )
    if (hasLocal) { setBackendSearching(false); return }

    // 非中文代號至少 4 碼才查（台股代號最少 4 碼）
    const raw = t.trim()
    if (!isChinese(raw) && raw.length < 4) { setBackendSearching(false); return }

    setBackendSearching(true)
    debounceRef.current = setTimeout(() => {
      runBackendSearch(raw)
    }, 600)
  }

  const handleSearchPress = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    runBackendSearch(trimmed)
  }

  const handleClear = () => {
    setQuery('')
    setSearchError('')
    setBackendResults([])
    setBackendSearching(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    inputRef.current?.focus()
  }

  const handleToggleFavorite = async (item: StockItem) => {
    const isNowFav = await toggleFavorite(item)
    setFavoriteSymbols(prev => {
      const next = new Set(prev)
      isNowFav ? next.add(item.symbol) : next.delete(item.symbol)
      return next
    })
  }

  const goToDetail = (symbol: string, name: string) => {
    navigation.navigate('StockDetail', { symbol, name })
  }

  const renderRow = ({ item }: { item: StockItem }) => {
    const isFav = favoriteSymbols.has(item.symbol)
    return (
      <TouchableOpacity
        style={styles.stockRow}
        activeOpacity={0.7}
        onPress={() => goToDetail(item.symbol, item.name)}
      >
        <View style={styles.stockLeft}>
          <View style={styles.symbolBadge}>
            <Text style={styles.symbolText}>{item.symbol}</Text>
          </View>
          <Text style={styles.stockName}>{item.name}</Text>
        </View>
        <View style={styles.stockRight}>
          <TouchableOpacity
            onPress={() => handleToggleFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={20}
              color={isFav ? '#FF3B30' : Colors.textSecondary}
            />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={16} color={Colors.border} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>股票</Text>
      </View>

      <View style={styles.searchBar}>
        <TouchableOpacity onPress={handleSearchPress}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="股票代號或名稱（如 2330、台積電）"
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={handleSearchPress}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {backendSearching
          ? <ActivityIndicator size="small" color={Colors.textSecondary} />
          : query
            ? <TouchableOpacity onPress={handleClear}>
                <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            : null
        }
      </View>

      {searchError ? (
        <Text style={styles.searchErrorText}>{searchError}</Text>
      ) : null}

      {noLocalResult ? (
        backendSearching ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : backendResults.length > 0 ? (
          <FlatList
            data={backendResults}
            keyExtractor={item => item.symbol}
            renderItem={renderRow}
            ListHeaderComponent={<Text style={styles.sectionTitle}>搜尋結果</Text>}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          !searchError && (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={52} color={Colors.border} />
              <Text style={styles.emptyTitle}>查無符合結果</Text>
              <Text style={styles.emptySubText}>請確認股票代號或名稱是否正確</Text>
            </View>
          )
        )
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.symbol}
          renderItem={renderRow}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {isSearching ? '搜尋結果' : '熱門股票'}
            </Text>
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  )
}
