import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  onDelete: () => void
  borderRadius?: number
}

export default function SwipeDeleteAction({ onDelete, borderRadius = 12 }: Props) {
  return (
    <TouchableOpacity style={[styles.container, { borderRadius }]} onPress={onDelete}>
      <Ionicons name="trash-outline" size={20} color="#fff" />
      <Text style={styles.text}>刪除</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
    gap: 4,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
})
