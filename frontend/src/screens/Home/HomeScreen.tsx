import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>首頁</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: Colors.textPrimary },
})
