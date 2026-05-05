import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'

export default function LoadingCenter() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
