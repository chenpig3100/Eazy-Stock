import {
  forwardRef, useImperativeHandle, useState, useRef, useCallback, useEffect,
} from 'react'
import {
  Modal, View, Text, FlatList, TextInput, TouchableOpacity,
  TouchableWithoutFeedback, ActivityIndicator,
  Animated, Keyboard, Platform, Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import { analyzeStock } from '../../services/aiService'
import { useAIContext } from '../../stores/aiContextStore'
import { useDraggableSheet } from '../../hooks/useDraggableSheet'
import styles, { SHEET_HEIGHT } from './AIChatSheet.styles'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SAFE_TOP = 60

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
}

const GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content: '你好！我是 Eazy Stock AI 助理，可以問我任何台股相關問題。\n\n例如：\n・「這支股票目前怎麼樣？」\n・「殖利率高代表什麼意思？」',
}

export type AIChatSheetRef = { present: () => void }

const AIChatSheet = forwardRef<AIChatSheetRef>((_, ref) => {
  const [visible, setVisible] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const context = useAIContext(s => s.context)
  const listRef = useRef<FlatList>(null)

  // Outer view (non-native driver): keyboard-aware position & height
  const bottomAnim = useRef(new Animated.Value(0)).current
  const heightAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current

  const {
    slideAnim, clampedDragY, backdropOpacity,
    panHandlers, animateOpen, animateClose, closeRef,
  } = useDraggableSheet({ sheetHeight: SHEET_HEIGHT })

  // Keyboard adjustment
  useEffect(() => {
    if (!visible) {
      bottomAnim.setValue(0)
      heightAnim.setValue(SHEET_HEIGHT)
      return
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent  = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const show = Keyboard.addListener(showEvent, e => {
      const kh = e.endCoordinates.height
      const newHeight = Math.min(SHEET_HEIGHT, SCREEN_HEIGHT - kh - SAFE_TOP)
      const dur = e.duration ?? 250
      Animated.parallel([
        Animated.timing(bottomAnim, { toValue: kh, duration: dur, useNativeDriver: false }),
        Animated.timing(heightAnim, { toValue: newHeight, duration: dur, useNativeDriver: false }),
      ]).start()
    })

    const hide = Keyboard.addListener(hideEvent, (e: any) => {
      const dur = e.duration ?? 250
      Animated.parallel([
        Animated.timing(bottomAnim, { toValue: 0, duration: dur, useNativeDriver: false }),
        Animated.timing(heightAnim, { toValue: SHEET_HEIGHT, duration: dur, useNativeDriver: false }),
      ]).start()
    })

    return () => { show.remove(); hide.remove() }
  }, [visible])

  const open = useCallback(() => {
    setVisible(true)
    animateOpen()
  }, [])

  const close = useCallback(() => {
    Keyboard.dismiss()
    animateClose(() => setVisible(false))
  }, [])

  closeRef.current = close

  useImperativeHandle(ref, () => ({ present: open }))

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80)
  }

  const handleSend = async () => {
    const q = input.trim()
    if (!q || sending) return
    setInput('')

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: q }
    const loadingId = `ai-${Date.now()}`
    const loadingMsg: ChatMessage = { id: loadingId, role: 'assistant', content: '', isLoading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setSending(true)
    scrollToBottom()

    try {
      const res = await analyzeStock({ ...(context ?? {}), question: q })
      setMessages(prev =>
        prev.map(m => m.id === loadingId ? { ...m, content: res.analysis, isLoading: false } : m)
      )
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === loadingId
          ? { ...m, content: '抱歉，目前無法回覆，請稍後再試。', isLoading: false }
          : m
        )
      )
    } finally {
      setSending(false)
      scrollToBottom()
    }
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'user') {
      return (
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{item.content}</Text>
        </View>
      )
    }
    return (
      <View style={styles.aiBubbleWrapper}>
        <View style={styles.aiBubble}>
          {item.isLoading
            ? <ActivityIndicator size="small" color={Colors.textSecondary} />
            : <Text style={styles.aiText}>{item.content}</Text>
          }
        </View>
        {!item.isLoading && (
          <View style={styles.refPill}>
            <Text style={styles.refPillText}>AI 參考資訊</Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      {/* Backdrop — fades on drag */}
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Outer: keyboard-aware positioning (non-native driver) */}
      <Animated.View style={[styles.sheetOuter, { bottom: bottomAnim, height: heightAnim }]}>
        {/* Inner: slide + drag animation (native driver) */}
        <Animated.View style={[styles.sheetInner, { transform: [{ translateY: Animated.add(slideAnim, clampedDragY) }] }]}>
          {/* Handle drag target */}
          <View {...panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>AI 股票助理</Text>
            <TouchableOpacity onPress={() => setMessages([GREETING])}>
              <Text style={styles.clearText}>清除對話</Text>
            </TouchableOpacity>
          </View>

          {context?.name && (
            <View style={styles.contextPill}>
              <Ionicons name="bar-chart-outline" size={12} color={Colors.primary} />
              <Text style={styles.contextText}>正在查看：{context.name}（{context.symbol}）</Text>
            </View>
          )}

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={13} color="#8A6D00" />
            <Text style={styles.disclaimerText}>
              AI 回覆僅供投資參考，不構成買賣建議。投資有風險，請自行評估。
            </Text>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToBottom}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="問 AI 任何台股問題..."
              placeholderTextColor={Colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={300}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
})

export default AIChatSheet
