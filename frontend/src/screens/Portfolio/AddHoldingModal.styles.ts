import { StyleSheet } from 'react-native'
import { sheetStyles } from '../../styles/sheetStyles'

const localStyles = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
})

export default { ...sheetStyles, ...localStyles }
