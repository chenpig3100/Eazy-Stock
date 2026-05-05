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
    padding: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  summaryPnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryPnlText: {
    fontSize: 15,
    fontWeight: '500',
  },
  holdingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    overflow: 'hidden',
  },
  holdingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  holdingLeft: {
    flex: 1,
    gap: 4,
  },
  holdingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holdingName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  symbolBadge: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  holdingMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  holdingRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  holdingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pnlText: {
    fontSize: 13,
    fontWeight: '500',
  },
})
