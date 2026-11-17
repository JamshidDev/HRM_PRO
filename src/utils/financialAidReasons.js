// Moddiy yordam sabablari: 73-buyruq va 9-ariza formalarida bir xil ro'yxat.
const KEYS = [
  [1, 'reason_one'],
  [2, 'reason_two'],
  [3, 'reason_three'],
  [4, 'reason_four'],
  [5, 'reason_five'],
  [6, 'reason_six'],
  [7, 'reason_seven'],
  [9, 'reason_eight']
]

// name — interfeys tilida (ro'yxatda), text — hujjatga faqat o'zbekcha yoziladi.
export const financialAidReasons = (t) =>
  KEYS.map(([id, key]) => ({
    id,
    name: t(`documentPage.command.form.${key}`),
    text: t(`documentPage.command.form.${key}`, 'uz')
  }))
