// Turniket dashboardining YAGONA rang to'plami («Ko'k»). Har rang bitta ma'noni bildiradi —
// sahifadagi barcha kartalar shu yerdan oladi, yangi rang qo'shmang.
//   main   — asosiy / kelgan / ishlayapti (ko'k)
//   second — ikkinchi kanal / reja / boshqa (indigo)
//   warn   — sababli / ogohlantirish (amber)
//   bad    — yomon: kelmagan, kech kelgan, oflayn (qizil)
//   soft   — neytral: jami, dam olish kuni (och ko'k / qorong'ida kulrang)

// Rol → rang nomi (sarlavha chipi `TINT_STYLE` dagi kalit).
export const TINT = {
  main: 'blue',
  second: 'indigo',
  warn: 'amber',
  bad: 'red'
}

// Rol → chiziq/nuqta/ustun tokeni.
export const PALETTE = {
  main: '--fig-icon-brand',
  second: '--fig-icon-indigo',
  warn: '--fig-icon-amber',
  bad: '--fig-icon-red',
  // `--ts-soft` — page.vue da: yorug'da `--fig-blue-300`, qorong'ida `--fig-text-disable`
  // (`--fig-blue-300` qorong'ida 32% shaffof — donutda xira ko'k bo'lib qolardi).
  soft: '--ts-soft'
}

// Rol → son yonidagi kichik pill klassi.
export const CHIP_CLASS = {
  main: 'bg-fig-chip-brand text-fig-chip-brand-text',
  second: 'bg-fig-chip-indigo text-fig-chip-indigo-text',
  warn: 'bg-fig-chip-amber text-fig-chip-amber-text',
  bad: 'bg-fig-red-100 text-fig-text-red'
}

// Sarlavha/KPI chipi: rang nomi → [fon klassi, ikonka tokeni].
export const TINT_STYLE = {
  blue: ['bg-fig-blue-100', '--fig-icon-brand'],
  indigo: ['bg-fig-indigo-100', '--fig-icon-indigo'],
  amber: ['bg-fig-amber-100', '--fig-icon-amber'],
  red: ['bg-fig-red-100', '--fig-icon-red']
}
