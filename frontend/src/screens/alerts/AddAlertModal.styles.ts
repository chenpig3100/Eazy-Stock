import { StyleSheet } from 'react-native'
import { Colors } from '../../constants/colors'
import { sheetStyles } from '../../styles/sheetStyles'

const localStyles = StyleSheet.create({
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  directionBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  directionBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  directionHint: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
})

export default { ...sheetStyles, ...localStyles }
