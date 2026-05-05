import { StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'

export default StyleSheet.create({
  newsItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  newsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 120,
  },
  sourceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  newsTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newsTitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
})
