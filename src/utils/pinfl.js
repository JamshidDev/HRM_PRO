// JSHSHIR: 14 raqam + nazorat raqami (7-3-1 og'irliklar, mod 10) — backend `isValidPinfl` bilan bir xil.
export const isValidPinfl = (v) => {
  const s = String(v ?? '')
  if (!/^\d{14}$/.test(s)) return false
  const w = [7, 3, 1]
  let sum = 0
  for (let i = 0; i < 13; i++) sum += Number(s[i]) * w[i % 3]
  return sum % 10 === Number(s[13])
}

// STIR (yuridik shaxs): aynan 9 raqam.
export const isValidStir = (v) => /^\d{9}$/.test(String(v ?? ''))

export const onlyDigits = (v) => !v || /^\d+$/.test(v)
