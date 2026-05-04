import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { Holding } from '../../types/stock'
import { FavoriteStock, getFavorites } from '../../services/favoritesService'
import { getStock } from '../../services/stockService'
import { addHolding } from '../../services/portfolioService'
import styles from './AddHoldingModal.styles'

// 本地對照表，供名稱→代號自動填入
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

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function AddHoldingModal({ visible, onClose, onAdded }: Props) {
  const [symbol, setSymbol] = useState('')
  const [stockName, setStockName] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [buyDate, setBuyDate] = useState(todayString)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [favorites, setFavorites] = useState<FavoriteStock[]>([])

  useEffect(() => {
    if (visible) getFavorites().then(setFavorites)
  }, [visible])

  const reset = () => {
    setSymbol(''); setStockName(''); setBuyPrice('')
    setQuantity(''); setBuyDate(todayString()); setSubmitError('')
  }

  const handleClose = () => { reset(); onClose() }

  // 代號輸入 → 本地自動填名稱，同時清除錯誤
  const handleSymbolChange = (t: string) => {
    setSymbol(t)
    setSubmitError('')
    const match = LOCAL_STOCKS.find(s => normalize(s.symbol) === normalize(t))
    if (match) setStockName(match.name)
    else setStockName('')
  }

  // 查詢按鈕：只用代號查詢
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
    } catch {
      setSubmitError('找不到此股票，請確認代號是否正確')
    } finally {
      setLookupLoading(false)
    }
  }

  // 點選我的最愛 chip
  const handleFavTap = (fav: FavoriteStock) => {
    setSymbol(fav.symbol)
    setStockName(fav.name)
    setSubmitError('')
  }

  const canSubmit = !!symbol && !!stockName && !!buyPrice && !!quantity && !submitting

  const handleSubmit = async () => {
    const price = parseFloat(buyPrice)
    const qty = parseInt(quantity, 10)
    if (!symbol || !stockName || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
      setSubmitError('請先查詢股票，並填寫買入價與數量')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const holding: Holding = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        symbol: symbol.trim().toUpperCase(),
        name: stockName,
        buyPrice: price,
        quantity: qty,
        buyDate: buyDate || todayString(),
      }
      await addHolding(holding)
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
              <Text style={styles.sheetTitle}>新增持倉</Text>
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

              {/* 買入價 + 數量 */}
              <View style={styles.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>買入價（NT$）</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="660.00"
                    placeholderTextColor={Colors.textSecondary}
                    value={buyPrice}
                    onChangeText={setBuyPrice}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>數量（股）</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1000"
                    placeholderTextColor={Colors.textSecondary}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* 買入日期 */}
              <View>
                <Text style={styles.fieldLabel}>買入日期</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY/MM/DD"
                  placeholderTextColor={Colors.textSecondary}
                  value={buyDate}
                  onChangeText={setBuyDate}
                  returnKeyType="done"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitButtonText}>新增持倉</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}
