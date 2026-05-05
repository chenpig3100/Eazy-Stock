const SOURCE_COLORS = ['#FF9500', '#5856D6', '#007AFF', '#AF52DE', '#FF6B35', '#32ADE6']

export function sourceColor(source: string): string {
  let h = 0
  for (const c of source) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return SOURCE_COLORS[h % SOURCE_COLORS.length]
}

export function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}
