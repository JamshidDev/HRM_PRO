// Tayyor xabar shablonlari — tanlanganda uchala til inputi birdan to'ladi,
// keyin kerak bo'lsa qo'lda tahrirlanadi. Matn Telegram HTML formatida.
//
// `labelKey` — i18n kaliti (`telegramBroadcast.templates.*`).

export const messageTemplates = [
  {
    key: 'maintenance_start',
    labelKey: 'maintenance_start',
    message: {
      uz:
        '<b>Tizimda profilaktika ishlari</b>\n' +
        'Hurmatli xodimlar! Bugun soat 20:00 dan 23:00 gacha HRM tizimida rejali profilaktika ishlari olib boriladi.\n' +
        'Shu vaqt oralig‘ida tizim vaqtincha ishlamasligi mumkin. Noqulaylik uchun uzr so‘raymiz.',
      ru:
        '<b>Профилактические работы в системе</b>\n' +
        'Уважаемые сотрудники! Сегодня с 20:00 до 23:00 в системе HRM проводятся плановые профилактические работы.\n' +
        'В это время система может быть временно недоступна. Приносим извинения за неудобства.',
      en:
        '<b>Scheduled maintenance</b>\n' +
        'Dear colleagues! Today from 20:00 to 23:00 scheduled maintenance will take place in the HRM system.\n' +
        'The system may be temporarily unavailable. We apologise for the inconvenience.'
    }
  },
  {
    key: 'maintenance_done',
    labelKey: 'maintenance_done',
    message: {
      uz:
        '<b>Texnik ishlar yakunlandi</b>\n' +
        'HRM tizimidagi texnik ishlar muvaffaqiyatli yakunlandi. Tizim to‘liq ishlamoqda.\n' +
        'Muammo yuzaga kelsa, IT bo‘limiga murojaat qiling.',
      ru:
        '<b>Технические работы завершены</b>\n' +
        'Технические работы в системе HRM успешно завершены. Система работает в штатном режиме.\n' +
        'При возникновении проблем обращайтесь в отдел IT.',
      en:
        '<b>Maintenance completed</b>\n' +
        'Maintenance of the HRM system has been completed successfully. The system is fully operational.\n' +
        'If you experience any issues, please contact the IT department.'
    }
  },
  {
    key: 'new_version',
    labelKey: 'new_version',
    message: {
      uz:
        '<b>Mobil ilovaning yangi versiyasi</b>\n' +
        'HRM mobil ilovasining yangi versiyasi chiqdi. Iltimos, ilovani yangilang — yangi imkoniyatlar va tuzatishlar qo‘shildi.',
      ru:
        '<b>Новая версия мобильного приложения</b>\n' +
        'Вышла новая версия мобильного приложения HRM. Пожалуйста, обновите приложение — добавлены новые возможности и исправления.',
      en:
        '<b>New mobile app version</b>\n' +
        'A new version of the HRM mobile app is available. Please update the app — it brings new features and fixes.'
    }
  }
]
