import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated,
  TouchableWithoutFeedback, StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { Holding } from '../../types/stock'
import { FavoriteStock, getFavorites } from '../../services/favoritesService'
import { getStock } from '../../services/stockService'
import { addHolding } from '../../services/portfolioService'
import { LOCAL_STOCKS } from '../../constants/stocks'
import { normalize } from '../../utils/string'
import { useDraggableSheet } from '../../hooks/useDraggableSheet'
import styles from './AddHoldingModal.styles'

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

  const {
    slideAnim, clampedDragY, backdropOpacity,
    panHandlers, animateOpen, animateClose, closeRef,
  } = useDraggableSheet({ springBounciness: 2 })

  useEffect(() => {
    if (!visible) return
    animateOpen()
  }, [visible])

  useEffect(() => {
    if (visible) getFavorites().then(setFavorites)
  }, [visible])

  const reset = () => {
    setSymbol(''); setStockName(''); setBuyPrice('')
    setQuantity(''); setBuyDate(todayString()); setSubmitError('')
  }

  const handleClose = () => animateClose(() => { reset(); onClose() })
  closeRef.current = handleClose

  const handleSymbolChange = (t: string) => {
    setSymbol(t)
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
    } catch {
      setSubmitError('找不到此股票，請確認代號是否正確')
    } finally {
      setLookupLoading(false)
    }
  }

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
      animateClose(() => { reset(); onAdded() })
    } catch {
      setSubmitError('新增失敗，請再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={handleClose}>
      {/* Backdrop — fades on drag */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet — pushed up by keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
      >
        <Animated.View style={{ transform: [{ translateY: Animated.add(slideAnim, clampedDragY) }] }}>
          <View style={styles.sheet}>
            {/* Handle drag target */}
            <View {...panHandlers} style={styles.handleArea}>
              <View style={styles.handle} />
            </View>

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

              <View style={styles.favSection}>
                <Text style={styles.fieldLabel}>關注中股票</Text>
                {favorites.length === 0 ? (
                  <Text style={styles.favEmpty}>尚無關注股票，可在股票頁點愛心新增</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favScroll}>
                    {favorites.map(fav => (
                      <TouchableOpacity key={fav.symbol} style={styles.favChip} onPress={() => handleFavTap(fav)}>
                        <Text style={styles.favChipText}>{fav.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

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
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
