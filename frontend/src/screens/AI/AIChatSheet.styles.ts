import { StyleSheet, Dimensions } from 'react-native'
import { Colors } from '../../constants/colors'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
export const SHEET_HEIGHT = SCREEN_HEIGHT * 0.72

export default StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  // Outer shell: position + size driven by keyboard animations (non-native driver)
  sheetOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  // Inner shell: slide in/out driven by native-driver translateY
  sheetInner: {
    flex: 1,
  },
  handleArea: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginHorizontal: 16,
    marginBottom: 6,
  },
  contextText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF9E6',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#8A6D00',
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 21,
  },
  aiBubbleWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    gap: 4,
  },
  aiBubble: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  aiText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  refPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  refPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
})
