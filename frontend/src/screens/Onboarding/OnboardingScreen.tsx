import { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ListRenderItem, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'

const { width } = Dimensions.get('window')
const ONBOARDING_KEY = 'onboarding_completed'

interface Page {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
}

const PAGES: Page[] = [
  {
    icon: 'bar-chart-outline',
    title: '台股資訊，一看就懂',
    description: '看不懂那些財務數字嗎？\n我們用 AI 幫你用中文解釋每一個數字。',
  },
  {
    icon: 'briefcase-outline',
    title: '記錄持倉，追蹤損益',
    description: '輸入你買進的股票和購入價格，\nApp 幫你即時計算了多少、虧了多少。',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI 助理隨時待命',
    description: '看不懂還有支援？\n點右下角，用中文直接問 AI。',
  },
]

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const goNext = () => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
      setCurrentIndex(currentIndex + 1)
    }
  }

  const finish = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }))
  }

  const renderPage: ListRenderItem<Page> = ({ item }) => (
    <View style={styles.page}>
      <Ionicons name={item.icon} size={100} color={Colors.primary} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  )

  const isLast = currentIndex === PAGES.length - 1

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={styles.skipText}>跳過</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
      />

      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={isLast ? finish : goNext}>
        <Text style={styles.buttonText}>{isLast ? '開始使用' : '下一頁'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingBottom: 48,
  },
  skip: {
    alignSelf: 'flex-end',
    padding: 20,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  page: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: width - 48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
})
