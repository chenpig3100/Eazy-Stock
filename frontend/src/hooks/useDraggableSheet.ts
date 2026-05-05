import { useRef } from 'react'
import { Animated, PanResponder, Dimensions } from 'react-native'

type Options = {
  sheetHeight?: number
  springBounciness?: number
}

const DISMISS_THRESHOLD = 80

export function useDraggableSheet(options: Options = {}) {
  const screenHeight = useRef(Dimensions.get('window').height).current
  const sheetHeight = options.sheetHeight ?? screenHeight
  const springBounciness = options.springBounciness ?? 4

  const slideAnim = useRef(new Animated.Value(sheetHeight)).current
  const backdropAnim = useRef(new Animated.Value(0)).current
  const dragY = useRef(new Animated.Value(0)).current

  const clampedDragY = useRef(
    dragY.interpolate({ inputRange: [-1, 0, sheetHeight], outputRange: [0, 0, sheetHeight], extrapolate: 'clamp' })
  ).current

  const backdropOpacity = useRef(
    Animated.multiply(
      backdropAnim,
      dragY.interpolate({ inputRange: [0, 200], outputRange: [1, 0], extrapolate: 'clamp' })
    )
  ).current

  const closeRef = useRef<() => void>(() => {})

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5 && Math.abs(gs.dy) > Math.abs(gs.dx),
    onPanResponderMove: Animated.event([null, { dy: dragY }], { useNativeDriver: true }),
    onPanResponderRelease: (_, gs) => {
      if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.8) {
        closeRef.current()
      } else {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start()
      }
    },
  })).current

  const animateOpen = () => {
    dragY.setValue(0)
    slideAnim.setValue(sheetHeight)
    backdropAnim.setValue(0)
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: springBounciness }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start()
  }

  const animateClose = (onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: sheetHeight, duration: 240, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onComplete?.())
  }

  return {
    slideAnim,
    backdropAnim,
    clampedDragY,
    backdropOpacity,
    panHandlers: panResponder.panHandlers,
    animateOpen,
    animateClose,
    closeRef,
  }
}
