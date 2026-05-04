import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { StockAlert } from '../../types/stock'
import { FavoriteStock, getFavorites } from '../../services/favoritesService'
import { getStock } from '../../services/stockService'
import { addAlert, getAlerts, requestNotificationPermission } from '../../services/alertsService'
import styles from './AddAlertModal.styles'

const LOCAL_STOCKS: { symbol: string; name: string }[] = [
  { symbol: '2330', name: '台積電' }, { symbol: '2317', name: '鴻海' },
  { symbol: '2454', name: '聯發科' }, { symbol: '0050', name: '元大台灣50' },
  { symbol: '0056', name: '元大高股息' }, { symbol: '2412', name: '中華電' },
  { symbol: '2308', name: '台達電' }, { symbol: '2882', name: '國泰金' },
  { symbol: '2303', name: '聯電' }, { symbol: '2002', name: '中鋼' },
  { symbol: '2886', name: '兆豐金' }, { symbol: '2891', name: '中信金' },
  { symbol: '3008', name: '大立光' }, { symbol: '2881', name: '富邦金' },
  { symbol: '2884', name: '玉山金' }, { symbol: '2892', name: '第一金' },
  { symbol: '2880', name: '華南金' }, { symbol: '1301', name: '台塑' },
  { symbol: '1303', name: '南亞' }, { symbol: '2357', name: '華碩' },
  { symbol: '2382', name: '廣達' }, { symbol: '3711', name: '日月光投控' },
  { symbol: '2379', name: '瑞昱' }, { symbol: '6505', name: '台塑化' },
  { symbol: '2395', name: '研華' },
]

function normalize(s: string) {
  return s.toLowerCase().replace(/\s/g, '')
}

type Props = {
  visible: boolean
  onClose: () => void
  onAdded: () => void
}

export default function AddAlertModal({ visible, onClose, onAdded }: Props) {
  const [symbol, setSymbol] = useState('')
  const [stockName, setStockName] = useState('')
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [targetPrice, setTargetPrice] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [favorites, setFavorites] = useState<FavoriteStock[]>([])

  useEffect(() => {
    if (visible) getFavorites().then(setFavorites)
  }, [visible])

  const reset = () => {
    setSymbol(''); setStockName(''); setCurrentPrice(null)
    setTargetPrice(''); setSubmitError('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSymbolChange = (t: string) => {
    setSymbol(t)
    setCurrentPrice(null)
    setSubmitError('')
    const match = LOCAL_STOCKS.find(s => normalize(s.symbol) === normalize(t))
    if (match) setStockName(match.name)
    else setStockName('')
  }

  const handleLookup = async () => {
    const sym = symbol.trim().toUpperCase()
    if (!sym) return

    const local = LOCAL_STOCKS.find(s => s.symbol === sym)
    if (local) { setSymbol(local.symbol); setStockName(local.name); setSubmitError(''); return }

    setLookupLoading(true)
    setSubmitError('')
    try {
      const stock = await getStock(sym)
      setSymbol(stock.symbol)
      setStockName(stock.name)
      setCurrentPrice(stock.price)
    } catch {
      setSubmitError('找不到此股票，請確認代號是否正確')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleFavTap = (fav: FavoriteStock) => {
    setSymbol(fav.symbol)
    setStockName(fav.name)
    setCurrentPrice(null)
    setSubmitError('')
  }

  const targetNum = parseFloat(targetPrice)
  const direction: 'above' | 'below' | null =
    currentPrice != null && !isNaN(targetNum) && targetNum > 0
      ? targetNum > currentPrice ? 'above' : targetNum < currentPrice ? 'below' : null
      : null

  const canSubmit = !!symbol && !!stockName && !!targetPrice && direction != null && !submitting

  const handleSubmit = async () => {
    if (!symbol || !stockName || isNaN(targetNum) || targetNum <= 0 || direction == null) {
      setSubmitError('請先查詢股票並輸入目標價格')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const existingAlerts = await getAlerts()
      const isFirstAlert = existingAlerts.length === 0
      const alert: StockAlert = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        symbol: symbol.trim().toUpperCase(),
        name: stockName,
        targetPrice: targetNum,
        direction,
        createdAt: new Date().toISOString(),
      }
      await addAlert(alert)
      if (isFirstAlert) await requestNotificationPermission()
      reset()
      onAdded()
    } catch {
      setSubmitError('新增失敗，請再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>新增警示</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* 代號 + 名稱 + 查詢 同一行 */}
              <View>
                <View style={styles.topRow}>
                  <View style={{ flex: 0.85 }}>
                    <Text style={styles.fieldLabel}>代號</Text>
                    <TextInput
                      style={styles.symbolInput}
                      placeholder="2330"
                      placeholderTextColor={Colors.textSecondary}
                      value={symbol}
                      onChangeText={handleSymbolChange}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                  <View style={{ flex: 1.3 }}>
                    <Text style={styles.fieldLabel}>名稱</Text>
                    <TextInput
                      style={styles.nameInput}
                      placeholder="台積電"
                      placeholderTextColor={Colors.textSecondary}
                      value={stockName}
                      onChangeText={setStockName}
                      autoCorrect={false}
                      editable={false}
                    />
                  </View>
                  <View style={{ justifyContent: 'flex-end' }}>
                    <Text style={[styles.fieldLabel, { opacity: 0 }]}>查</Text>
                    <TouchableOpacity style={styles.lookupButton} onPress={handleLookup} disabled={lookupLoading}>
                      {lookupLoading
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.lookupButtonText}>查詢</Text>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
                {submitError ? <Text style={[styles.errorText, { marginTop: 6 }]}>{submitError}</Text> : null}
              </View>

              {/* 我的最愛 */}
              <View style={styles.favSection}>
                <Text style={styles.fieldLabel}>我的最愛</Text>
                {favorites.length === 0 ? (
                  <Text style={styles.favEmpty}>尚無最愛股票，可在股票頁點愛心新增</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favScroll}>
                    {favorites.map(fav => (
                      <TouchableOpacity
                        key={fav.symbol}
                        style={styles.favChip}
                        onPress={() => handleFavTap(fav)}
                      >
                        <Text style={styles.favChipText}>{fav.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* 目標價格 */}
              <View>
                <Text style={styles.fieldLabel}>
                  目標價格（NT$）
                  {currentPrice != null
                    ? `　現價 ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '　（請先查詢股票取得現價）'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="例：660.00"
                  placeholderTextColor={Colors.textSecondary}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  keyboardType="decimal-pad"
                />
                {direction != null && (
                  <View style={styles.directionRow}>
                    <View style={[styles.directionBadge, { backgroundColor: direction === 'above' ? Colors.positive : Colors.negative }]}>
                      <Text style={styles.directionBadgeText}>
                        {direction === 'above' ? '上漲警示' : '下跌警示'}
                      </Text>
                    </View>
                    <Text style={styles.directionHint}>
                      {direction === 'above'
                        ? `股價漲超過 NT$${targetNum.toLocaleString('en-US', { minimumFractionDigits: 2 })} 時通知`
                        : `股價跌破 NT$${targetNum.toLocaleString('en-US', { minimumFractionDigits: 2 })} 時通知`}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitButtonText}>新增警示</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}
