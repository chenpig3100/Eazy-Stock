import {
  View, Text, ScrollView, TouchableOpacity, Alert, Linking,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/colors'
import styles from './SettingsScreen.styles'

const APP_VERSION = '1.0.0'
const PRIVACY_URL = 'https://eazystock.app/privacy'
const TERMS_URL = 'https://eazystock.app/terms'

function ComingSoon() {
  Alert.alert('即將推出', '此功能將在後續版本開放，敬請期待！')
}

function RowDivider() {
  return <View style={styles.rowDivider} />
}

type RowProps = {
  icon: string
  iconColor?: string
  label: string
  value?: string
  onPress?: () => void
  hideChevron?: boolean
}

function Row({ icon, iconColor = Colors.primary, label, value, onPress, hideChevron }: RowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Ionicons name={icon as any} size={20} color={iconColor} style={{ marginRight: 12 }} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
      {!hideChevron && onPress && (
        <Ionicons name="chevron-forward" size={16} color={Colors.border} />
      )}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const openURL = (url: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('無法開啟連結', '請稍後再試')
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 帳號 */}
        <View>
          <Text style={styles.sectionLabel}>帳號</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountTop}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountTitle}>尚未登入</Text>
                <Text style={styles.accountSubtitle}>登入後可使用 AI 分析等進階功能</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={ComingSoon}>
              <Text style={styles.loginButtonText}>登入 / 升級 Pro</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 偏好設定 */}
        <View>
          <Text style={styles.sectionLabel}>偏好設定</Text>
          <View style={styles.card}>
            <Row
              icon="text-outline"
              label="字體大小"
              value="中"
              onPress={ComingSoon}
            />
            <RowDivider />
            <Row
              icon="language-outline"
              label="語言"
              value="繁體中文"
              onPress={ComingSoon}
            />
            <RowDivider />
            <Row
              icon="notifications-outline"
              label="通知設定"
              onPress={() => Linking.openSettings()}
            />
          </View>
        </View>

        {/* 關於 */}
        <View>
          <Text style={styles.sectionLabel}>關於</Text>
          <View style={styles.card}>
            <Row
              icon="shield-checkmark-outline"
              label="隱私政策"
              onPress={() => openURL(PRIVACY_URL)}
            />
            <RowDivider />
            <Row
              icon="document-text-outline"
              label="使用條款"
              onPress={() => openURL(TERMS_URL)}
            />
            <RowDivider />
            <Row
              icon="information-circle-outline"
              iconColor={Colors.textSecondary}
              label="版本"
              value={APP_VERSION}
              hideChevron
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
