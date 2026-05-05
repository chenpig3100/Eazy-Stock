import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/colors'
import styles from './EmptyState.styles'

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  iconSize?: number
  title: string
  subtitle?: string
  action?: { label: string; onPress: () => void }
}

export default function EmptyState({ icon, iconSize = 56, title, subtitle, action }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={iconSize} color={Colors.border} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? (
        <TouchableOpacity style={styles.button} onPress={action.onPress}>
          <Text style={styles.buttonText}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}
