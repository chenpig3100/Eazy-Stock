import { StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  // alert card (inside swipeable)
  cardWrapper: {
    marginBottom: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolBadge: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directionBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  directionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  targetLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  targetPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
})
