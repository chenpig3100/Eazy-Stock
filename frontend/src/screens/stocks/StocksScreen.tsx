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
import { LOCAL_STOCKS } from '../../constants/stocks'
import { StocksStackParamList } from '../../types/navigation'
import { getStock, searchStocks } from '../../services/stockService'
import { getFavorites, toggleFavorite } from '../../services/favoritesService'
import { normalize } from '../../utils/string'
import EmptyState from '../../components/EmptyState'
import LoadingCenter from '../../components/LoadingCenter'
import styles from './StocksScreen.styles'

const POPULAR = LOCAL_STOCKS.slice(0, 8)

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
    return LOCAL_STOCKS.filter(s =>
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

    const hasLocal = LOCAL_STOCKS.some(s =>
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
          <LoadingCenter />
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
            <EmptyState
              icon="search-outline"
              iconSize={52}
              title="查無符合結果"
              subtitle="請確認股票代號或名稱是否正確"
            />
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
