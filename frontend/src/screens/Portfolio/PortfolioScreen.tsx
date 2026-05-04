import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { Colors } from '../../constants/colors'
import { Holding } from '../../types/stock'
import { getHoldings, deleteHolding } from '../../services/portfolioService'
import { getStock } from '../../services/stockService'
import AddHoldingModal from './AddHoldingModal'
import styles from './PortfolioScreen.styles'

type HoldingWithPnL = Holding & {
  currentPrice: number | null
  pnl: number | null
  pnlPercent: number | null
}

export default function PortfolioScreen() {
  const [holdings, setHoldings] = useState<HoldingWithPnL[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const loadHoldings = useCallback(async () => {
    setLoading(true)
    try {
      const raw = await getHoldings()
      const initial: HoldingWithPnL[] = raw.map(h => ({
        ...h, currentPrice: null, pnl: null, pnlPercent: null,
      }))
      setHoldings(initial)

      if (raw.length > 0) {
        const results = await Promise.allSettled(raw.map(h => getStock(h.symbol)))
        setHoldings(raw.map((h, i) => {
          const r = results[i]
          if (r.status === 'fulfilled') {
            const p = r.value.price
            return {
              ...h,
              currentPrice: p,
              pnl: (p - h.buyPrice) * h.quantity,
              pnlPercent: ((p - h.buyPrice) / h.buyPrice) * 100,
            }
          }
          return { ...h, currentPrice: null, pnl: null, pnlPercent: null }
        }))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { loadHoldings() }, [loadHoldings]))

  const handleDelete = async (id: string) => {
    await deleteHolding(id)
    setHoldings(prev => prev.filter(h => h.id !== id))
  }

  const pnlColor = (val: number | null) => {
    if (val === null) return Colors.neutral
    return val > 0 ? Colors.positive : val < 0 ? Colors.negative : Colors.neutral
  }

  const totalMarketValue = holdings.reduce(
    (sum, h) => h.currentPrice != null ? sum + h.currentPrice * h.quantity : sum, 0
  )
  const totalCost = holdings.reduce((sum, h) => sum + h.buyPrice * h.quantity, 0)
  const totalPnL = totalMarketValue - totalCost
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0
  const hasPrices = holdings.some(h => h.currentPrice != null)

  const renderRightActions = (id: string) => () => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(id)}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.deleteActionText}>刪除</Text>
    </TouchableOpacity>
  )

  const renderHolding = ({ item }: { item: HoldingWithPnL }) => (
    <Swipeable renderRightActions={renderRightActions(item.id)} overshootRight={false}>
      <View style={styles.holdingCard}>
        <View style={styles.holdingContent}>
          <View style={styles.holdingLeft}>
            <View style={styles.holdingNameRow}>
              <Text style={styles.holdingName}>{item.name}</Text>
              <View style={styles.symbolBadge}>
                <Text style={styles.symbolText}>{item.symbol}</Text>
              </View>
            </View>
            <Text style={styles.holdingMeta}>
              {item.quantity}股｜買入 NT${item.buyPrice.toFixed(2)}
            </Text>
            <Text style={styles.holdingMeta}>{item.buyDate}</Text>
          </View>

          <View style={styles.holdingRight}>
            {item.currentPrice != null ? (
              <>
                <Text style={styles.holdingPrice}>
                  NT${item.currentPrice.toFixed(2)}
                </Text>
                <Text style={[styles.pnlText, { color: pnlColor(item.pnl) }]}>
                  {item.pnl! >= 0 ? '+' : ''}{item.pnl!.toFixed(0)}
                </Text>
                <Text style={[styles.pnlText, { color: pnlColor(item.pnlPercent) }]}>
                  {item.pnlPercent! >= 0 ? '+' : ''}{item.pnlPercent!.toFixed(2)}%
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color={Colors.textSecondary} />
            )}
          </View>
        </View>
      </View>
    </Swipeable>
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>倉位</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Ionicons name="add-circle-outline" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : holdings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>尚無持倉記錄</Text>
          <Text style={styles.emptySubText}>點擊右上角 + 新增第一筆持倉</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowModal(true)}>
            <Text style={styles.emptyButtonText}>新增持倉</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={holdings}
          keyExtractor={item => item.id}
          renderItem={renderHolding}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            hasPrices ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>持倉總覽</Text>
                <Text style={styles.summaryValue}>
                  NT${totalMarketValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Text>
                <View style={styles.summaryPnlRow}>
                  <Ionicons
                    name={totalPnL >= 0 ? 'caret-up' : 'caret-down'}
                    size={14}
                    color={pnlColor(totalPnL)}
                  />
                  <Text style={[styles.summaryPnlText, { color: pnlColor(totalPnL) }]}>
                    {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(0)}
                    {'  '}({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            ) : null
          }
        />
      )}

      <AddHoldingModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdded={() => { setShowModal(false); loadHoldings() }}
      />
    </SafeAreaView>
  )
}
