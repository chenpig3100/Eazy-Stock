import { StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    marginHorizontal: 8,
  },
  list: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolBadge: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  symbolText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  stockName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  stockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchErrorText: {
    fontSize: 13,
    color: '#FF3B30',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
})
