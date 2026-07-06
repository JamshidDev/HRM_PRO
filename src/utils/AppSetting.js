export const useAppSetting = {
  defaultLanguage: 'uz',
  languageKey: 'app-language',
  themeKey: 'app-theme',
  defaultThemeKey: 'light',
  tokenKey: 'app-token',
  accountUserId: 'account-user-id',
  telegramPopup: 'telegramPopup',
  noAvailableImage: '/no-picture.png',
  appLogoUrl: '/logo.png',
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
  // Login sahifasi hero panelidagi mavsumiy dekoratsiya.
  // Build vaqtida VITE_SEASON orqali qo'lda belgilanadi (admin tahrirlab, qayta deploy qiladi;
  // sana asosida avtomatik hisoblanmaydi). Ruxsat etilgan qiymatlar: spring | summer | autumn | winter | null.
  loginSeason: ['spring', 'summer', 'autumn', 'winter'].includes(import.meta.env.VITE_SEASON)
    ? import.meta.env.VITE_SEASON
    : null
}
