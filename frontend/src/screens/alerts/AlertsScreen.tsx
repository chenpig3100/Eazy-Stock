import { useState, useCallback, useRef } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { Swipeable } from 'react-native-gesture-handler'
import { Colors } from '../../constants/colors'
import { StockAlert } from '../../types/stock'
import { getAlerts, deleteAlert } from '../../services/alertsService'
import SwipeDeleteAction from '../../components/SwipeDeleteAction'
import EmptyState from '../../components/EmptyState'
import AddAlertModal from './AddAlertModal'
import styles from './AlertsScreen.styles'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<StockAlert[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const swipeRefs = useRef<Map<string, Swipeable>>(new Map())

  const loadAlerts = useCallback(async () => {
    try {
      const data = await getAlerts()
      setAlerts(data)
    } catch {}
  }, [])

  useFocusEffect(
    useCallback(() => { loadAlerts() }, [loadAlerts])
  )

  const handleDelete = async (id: string) => {
    swipeRefs.current.get(id)?.close()
    await deleteAlert(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }


  const renderItem = ({ item }: { item: StockAlert }) => {
    const isAbove = item.direction === 'above'
    const badgeColor = isAbove ? Colors.positive : Colors.negative
    return (
      <View style={styles.cardWrapper}>
        <Swipeable
          ref={ref => {
            if (ref) swipeRefs.current.set(item.id, ref)
            else swipeRefs.current.delete(item.id)
          }}
          renderRightActions={() => <SwipeDeleteAction onDelete={() => handleDelete(item.id)} borderRadius={14} />}
          rightThreshold={40}
          overshootRight={false}
        >
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.cardTop}>
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                </View>
                <Text style={styles.stockName}>{item.name}</Text>
              </View>
              <View style={styles.cardBottom}>
                <View style={[styles.directionBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.directionText}>{isAbove ? '上漲警示' : '下跌警示'}</Text>
                </View>
                <Text style={styles.targetLabel}>目標</Text>
                <Text style={styles.targetPrice}>
                  NT${item.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </Swipeable>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>警示</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {alerts.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          iconSize={56}
          title="尚無價格警示"
          subtitle="點右上角「+」新增警示，達到目標價時通知你"
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddAlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdded={() => { setModalVisible(false); loadAlerts() }}
      />
    </SafeAreaView>
  )
}
