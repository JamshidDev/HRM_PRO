export const useAppSetting = {
  defaultLanguage: 'uz',
  languageKey: 'app-language',
  themeKey: 'app-theme',
  defaultThemeKey: 'light',
  tokenKey: 'app-token',
  accountUserId: 'account-user-id',
  telegramPopup: 'telegramPopup',
  noAvailableImage: '/no-picture.png',
  appLogoUrl: '/main-logo.svg',
  datePicketFormat: 'dd.MM.yyyy',
  timePicketFormat: 'dd.MM.yyyy hh:mm',
  signatureUseType: {
    idCard: 'idcard',
    pfx: 'pfx'
  },
  appPermission: 'appPermission',
  adminSecret: 'JAMACODER',
  adminExistSecret: 'EXIST',
  adminSecretKey: 'secretKey',
  temporaryToken: 'temporarySecretKey',
  mustChangeKey: 'must-change-password',
  soundEnabledKey: 'app-sound-enabled',
  // Brauzer qurilma id — push shu qatorga bog'lanadi (login + logout header'i).
  deviceUuidKey: 'app-device-uuid',
  // Ruxsat bir marta so'raladi; token o'zgarmasa qayta yuborilmaydi.
  pushAskedKey: 'app-push-asked',
  pushTokenKey: 'app-push-token',
  sidebarThemeKey: 'app-sidebar-theme',
  // Joriy (rol + tashkilot) juftligi — `accountStore._index()` yozadi, chiqishda
  // o'chiriladi. Sidebar sozlamalari shu bo'yicha ajratiladi: bitta foydalanuvchi
  // ikki rol bilan ishlaganda menyu tartibi aralashib ketmasin.
  accountRoleScopeKey: 'account-role-scope',
  // Sidebar menyusidagi pin/tartib sozlamalari. Foydalanuvchi id'si va rol
  // scope'i bilan qo'shilib to'liq kalit yasaladi:
  // `app-sidebar-menu:<userId>:<roleId>-<orgId>`.
  sidebarMenuPrefsKey: 'app-sidebar-menu',
  defaultSidebarTheme: 'mint',
  screenFilterKey: 'app-screen-filter',
  defaultScreenFilter: 'none',
  fontScaleKey: 'app-font-scale',
  defaultFontScale: 0,
  // Login sahifasi hero panelidagi mavsumiy dekoratsiya.
  // Build vaqtida VITE_SEASON orqali qo'lda belgilanadi (admin tahrirlab, qayta deploy qiladi;
  // sana asosida avtomatik hisoblanmaydi). Ruxsat etilgan qiymatlar: spring | summer | autumn | winter | null.
  loginSeason: ['spring', 'summer', 'autumn', 'winter'].includes(import.meta.env.VITE_SEASON)
    ? import.meta.env.VITE_SEASON
    : null
}

/**
 * Parolni tiklash Telegram boti.
 *
 * Ikki joyda kerak: login sahifasidagi tiklash formasi (`loginnew/ui/ResetForm.vue`)
 * va parol muddati o'tganda chiqadigan ogohlantirishlar (bosh sahifa + profil).
 * Ilgari manzil faqat `ResetForm.vue` ichida qattiq yozilgan edi.
 *
 * `?start=reset` — Telegram deep-link: bot ochilganda "START" darhol yuboriladi.
 */
const isProdMode = import.meta.env.MODE === 'production'

export const resetBotHandle = isProdMode ? '@hrmpro_robot' : '@dev_hrm_pro_robot'
export const resetBotUrl = isProdMode
  ? 'https://t.me/hrmpro_robot?start=reset'
  : 'https://t.me/dev_hrm_pro_robot?start=reset'
