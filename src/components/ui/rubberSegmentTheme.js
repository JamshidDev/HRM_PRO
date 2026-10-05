/**
 * RubberSegment'ning loyiha bo'ylab yagona ranglari — barcha tab'lar shu yerdan oladi.
 * CSS o'zgaruvchilar orqali, shuning uchun light/dark mavzuda o'zi almashadi.
 */
export const RUBBER_THEME = {
  trackColor: 'var(--fig-bg-tertiary)',
  thumbColor: 'var(--fig-bg-brand-fill)',
  textColor: 'var(--fig-text-primary)',
  activeTextColor: '#ffffff',
  radius: 10,
  inset: 3,
  // Har bo'lim o'z matni kengligida — uzun va qisqa matnga bir xil joy berilmaydi
  equalSlots: false,
  stretch: 100,
  squash: 3,
  speed: 1,
  glide: 75
}

// naive-ui o'lchamlari → RubberSegment o'lchamlari
export const RUBBER_SIZE = { small: 'sm', medium: 'md', large: 'lg', sm: 'sm', md: 'md', lg: 'lg' }
