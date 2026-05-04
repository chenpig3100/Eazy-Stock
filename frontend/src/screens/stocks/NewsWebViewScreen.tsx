import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { Colors } from '../../constants/colors'
import { StocksStackParamList } from '../../types/navigation'
import styles from './NewsWebViewScreen.styles'

type Props = {
  navigation: NativeStackNavigationProp<StocksStackParamList, 'NewsWebView'>
  route: RouteProp<StocksStackParamList, 'NewsWebView'>
}

export default function NewsWebViewScreen({ navigation, route }: Props) {
  const { url, title } = route.params
  const [loading, setLoading] = useState(true)

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>

      <WebView
        style={styles.webview}
        source={{ uri: url }}
        originWhitelist={['*']}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </SafeAreaView>
  )
}
