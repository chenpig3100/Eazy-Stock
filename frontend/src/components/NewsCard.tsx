import { View, Text, TouchableOpacity } from 'react-native'
import { NewsArticle } from '../types/stock'
import { sourceColor, formatTime } from '../utils/formatting'
import styles from './NewsCard.styles'

type Props = {
  item: NewsArticle
  onPress: () => void
}

export default function NewsCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.newsItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.newsTop}>
        {item.source ? (
          <View style={[styles.sourceTag, { backgroundColor: sourceColor(item.source) }]}>
            <Text style={styles.sourceText} numberOfLines={1}>{item.source}</Text>
          </View>
        ) : null}
        <Text style={styles.newsTime}>{formatTime(item.publishedAt)}</Text>
      </View>
      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  )
}
