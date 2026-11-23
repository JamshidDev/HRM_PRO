// Ochiq «Modullar» sahifalari matni (uz/ru/en) — Google indekslaydi, ichki ma'lumot yo'q.
import {
  People24Regular,
  DocumentText24Regular,
  Certificate24Regular,
  DoorArrowRight20Regular,
  HatGraduation24Regular,
  Money24Regular,
  Stethoscope24Regular,
  Megaphone24Regular,
  CalendarLtr24Regular,
  Phone24Regular
} from '@vicons/fluent'

// Ilova tili → sahifa matni tili (kirill/yangi alifbo/qoraqalpoq — o'zbekcha).
export const pageLang = (locale) => (locale === 'ru' || locale === 'en' ? locale : 'uz')

export const PLAY_URL = 'https://play.google.com/store/apps/details?id=hrms.railway.uz'

export const UI = {
  uz: {
    pageTitle: 'HRM PRO modullari — kadrlar boshqaruvi tizimi imkoniyatlari',
    pageDescription:
      "HRM PRO modullari: kadrlar boshqaruvi va shtat, elektron hujjat aylanishi va E-IMZO, attestatsiya va onlayn imtihonlar, turniket va ish vaqti nazorati, tabel, o'quv markazlari, ish haqi fondi, tibbiy ko'rik, ichki aloqa va HR Rail mobil ilovasi.",
    heading: 'HRM PRO modullari',
    lead: "«O'zbekiston temir yo'llari» AJ uchun kadrlar boshqaruvi va elektron hujjat aylanishi tizimi. Har bir modul — alohida jarayon uchun.",
    features: 'Imkoniyatlar',
    more: 'Batafsil',
    login: 'Tizimga kirish',
    allModules: 'Barcha modullar',
    download: 'Google Play’dan yuklab olish',
    otherModules: 'Boshqa modullar'
  },
  ru: {
    pageTitle: 'Модули HRM PRO — возможности системы управления кадрами',
    pageDescription:
      'Модули HRM PRO: управление кадрами и штатом, электронный документооборот и E-IMZO, аттестация и онлайн-экзамены, турникеты и учёт рабочего времени, табель, учебные центры, фонд оплаты труда, медосмотры, внутренние коммуникации и мобильное приложение HR Rail.',
    heading: 'Модули HRM PRO',
    lead: 'Система управления кадрами и электронного документооборота АО «Узбекистон темир йуллари». Каждый модуль — для отдельного процесса.',
    features: 'Возможности',
    more: 'Подробнее',
    login: 'Войти в систему',
    allModules: 'Все модули',
    download: 'Скачать в Google Play',
    otherModules: 'Другие модули'
  },
  en: {
    pageTitle: 'HRM PRO modules — HR management system features',
    pageDescription:
      'HRM PRO modules: HR and staffing, electronic document workflow with E-IMZO, attestation and online exams, turnstiles and working-time control, timesheets, training centres, payroll fund, medical check-ups, internal communication and the HR Rail mobile app.',
    heading: 'HRM PRO modules',
    lead: 'HR management and electronic document workflow system of «Uzbekistan Railways» JSC. Each module covers a separate process.',
    features: 'Features',
    more: 'Details',
    login: 'Sign in',
    allModules: 'All modules',
    download: 'Get it on Google Play',
    otherModules: 'Other modules'
  }
}

export const MODULES = [
  {
    slug: 'kadrlar-boshqaruvi',
    icon: People24Regular,
    title: { uz: 'Kadrlar boshqaruvi va shtat', ru: 'Управление кадрами и штатом', en: 'HR and staffing management' },
    short: {
      uz: 'Xodimlar, shtat va kadr hujjatlari bitta tizimda — qabul qilishdan bo‘shatishgacha.',
      ru: 'Сотрудники, штат и кадровые документы в одной системе — от приёма до увольнения.',
      en: 'Employees, staffing and HR documents in one system — from hiring to dismissal.'
    },
    features: {
      uz: [
        'Xodimlar kartochkasi, bo‘linmalar va lavozimlar (shtat jadvali)',
        'Mehnat shartnomasi, buyruq, qo‘shimcha kelishuv va arizalar',
        'Ta’tillar, ta’tillar grafigi va xizmat safarlari',
        'Rag‘batlantirish va intizomiy jazolar',
        'Tabel, KPI ko‘rsatkichlari va «Plan-Fakt»',
        'Pensionerlar, arxiv, malaka oshirish va hisobotlar'
      ],
      ru: [
        'Карточка сотрудника, подразделения и должности (штатное расписание)',
        'Трудовые договоры, приказы, дополнительные соглашения и заявления',
        'Отпуска, график отпусков и командировки',
        'Поощрения и дисциплинарные взыскания',
        'Табель, KPI и «План-Факт»',
        'Пенсионеры, архив, повышение квалификации и отчёты'
      ],
      en: [
        'Employee profiles, departments and positions (staffing table)',
        'Employment contracts, orders, supplementary agreements and applications',
        'Leaves, leave schedule and business trips',
        'Incentives and disciplinary actions',
        'Timesheets, KPI and plan vs. actual',
        'Pensioners, archive, professional development and reports'
      ]
    }
  },
  {
    slug: 'elektron-hujjat-aylanishi',
    icon: DocumentText24Regular,
    title: {
      uz: 'Elektron hujjat aylanishi va E-IMZO',
      ru: 'Электронный документооборот и E-IMZO',
      en: 'Electronic document workflow and E-IMZO'
    },
    short: {
      uz: 'Hujjatlarni kelishish va imzolash — elektron imzo, QR-kod bilan tekshirish.',
      ru: 'Согласование и подписание документов — электронная подпись, проверка по QR-коду.',
      en: 'Document approval and signing — electronic signature and QR-code verification.'
    },
    features: {
      uz: [
        'Kelishuv marshruti: ketma-ket yoki parallel imzolovchilar',
        'E-IMZO (kompyuter va telefon) yoki chizilgan imzo',
        'Imzolash havolasi orqali tizimga kirmasdan imzolash',
        'Har bir hujjatda QR-kod va ochiq tekshirish sahifasi',
        '«Mening hujjatlarim» — xodimning shaxsiy kabineti',
        '45 turdagi ariza namunasi'
      ],
      ru: [
        'Маршрут согласования: последовательные или параллельные подписанты',
        'E-IMZO (компьютер и телефон) или рисованная подпись',
        'Подписание по ссылке без входа в систему',
        'QR-код на каждом документе и открытая страница проверки',
        '«Мои документы» — личный кабинет сотрудника',
        '45 шаблонов заявлений'
      ],
      en: [
        'Approval route: sequential or parallel signers',
        'E-IMZO (computer and phone) or drawn signature',
        'Signing via a link without logging in',
        'QR code on every document and a public verification page',
        '«My documents» — personal employee workspace',
        '45 application templates'
      ]
    }
  },
  {
    slug: 'attestatsiya',
    icon: Certificate24Regular,
    title: { uz: 'Attestatsiya va onlayn imtihonlar', ru: 'Аттестация и онлайн-экзамены', en: 'Attestation and online exams' },
    short: {
      uz: 'Xodimlar bilimini onlayn imtihon orqali baholash va jonli kuzatish.',
      ru: 'Оценка знаний сотрудников онлайн-экзаменами с живым наблюдением.',
      en: 'Online exams to assess employee knowledge, with live proctoring.'
    },
    features: {
      uz: [
        'Imtihonlar va savollar to‘plami, Excel orqali import',
        'Doira: butun tizim, korxona yoki bo‘linmalar',
        'Savollar tili, vaqt chegarasi va urinishlar soni',
        'Kamera va ekran orqali jonli kuzatuv',
        'Natijalar va sertifikatlar'
      ],
      ru: [
        'Экзамены и банк вопросов, импорт из Excel',
        'Охват: вся система, организация или подразделения',
        'Язык вопросов, лимит времени и число попыток',
        'Живое наблюдение через камеру и экран',
        'Результаты и сертификаты'
      ],
      en: [
        'Exams and question banks, Excel import',
        'Scope: whole system, organization or departments',
        'Question language, time limit and number of attempts',
        'Live proctoring via camera and screen',
        'Results and certificates'
      ]
    }
  },
  {
    slug: 'turniket-ish-vaqti',
    icon: DoorArrowRight20Regular,
    title: { uz: 'Turniket va ish vaqti nazorati', ru: 'Турникеты и учёт рабочего времени', en: 'Turnstiles and working-time control' },
    short: {
      uz: 'Kirish-chiqish hodisalari, smenalar va ish vaqtini avtomatik hisoblash.',
      ru: 'События входа-выхода, смены и автоматический учёт рабочего времени.',
      en: 'Entry/exit events, shifts and automatic working-time tracking.'
    },
    features: {
      uz: [
        'Turniket terminallari va Face ID hodisalari',
        'Smenalar, navbatchilik va ish grafiklari',
        'Kech kelish va erta ketish, imtiyozlar',
        'Kunlik va oylik davomat dashboardi',
        'Mobil ilova orqali Face ID bilan belgilanish'
      ],
      ru: [
        'Терминалы турникетов и события Face ID',
        'Смены, дежурства и графики работы',
        'Опоздания и ранние уходы, льготы',
        'Дневная и месячная панель посещаемости',
        'Отметка через Face ID в мобильном приложении'
      ],
      en: [
        'Turnstile terminals and Face ID events',
        'Shifts, duty rosters and work schedules',
        'Late arrivals and early departures, allowances',
        'Daily and monthly attendance dashboard',
        'Face ID check-in via the mobile app'
      ]
    }
  },
  {
    slug: 'tabel',
    icon: CalendarLtr24Regular,
    title: { uz: 'Tabel va ish vaqti hisobi', ru: 'Табель и учёт рабочего времени', en: 'Timesheets and working-time accounting' },
    short: {
      uz: 'Oylik ish vaqti tabeli — turniket va ish grafigi asosida avtomatik to‘ldiriladi.',
      ru: 'Ежемесячный табель рабочего времени — заполняется автоматически по турникету и графику.',
      en: 'Monthly timesheet — filled automatically from turnstile data and work schedules.'
    },
    features: {
      uz: [
        'Turniket va ish grafigi asosida avtomatik to‘ldirish',
        'Ta’til, kasallik, xizmat safari va dam olish kunlari kodlari',
        'Tabelni yopish, kelishuvga yuborish va elektron imzolash',
        'Holatlar: ochiq, yopilgan, yuborilgan, yakunlangan',
        'Excel’ga eksport va 1C bilan integratsiya'
      ],
      ru: [
        'Автозаполнение по турникету и графику работы',
        'Коды отпуска, больничного, командировки и выходных',
        'Закрытие табеля, отправка на согласование и электронная подпись',
        'Статусы: открыт, закрыт, отправлен, завершён',
        'Экспорт в Excel и интеграция с 1С'
      ],
      en: [
        'Auto-fill from turnstile data and work schedules',
        'Codes for leave, sick leave, business trips and days off',
        'Locking, sending for approval and electronic signing',
        'Statuses: open, locked, sent, finished',
        'Excel export and 1C integration'
      ]
    }
  },
  {
    slug: 'oquv-markazlari',
    icon: HatGraduation24Regular,
    title: { uz: 'O‘quv markazlari boshqaruvi', ru: 'Управление учебными центрами', en: 'Training centre management' },
    short: {
      uz: 'O‘quv markazlari: rejalar, darslar, tinglovchilar va sertifikatlar.',
      ru: 'Учебные центры: планы, занятия, слушатели и сертификаты.',
      en: 'Training centres: plans, lessons, trainees and certificates.'
    },
    features: {
      uz: [
        'Yo‘nalishlar, ixtisosliklar va fanlar',
        'O‘quv rejasi va mashg‘ulotlar jadvali',
        'Pedagoglar va tinglovchilar',
        'Natijalar va elektron sertifikatlar'
      ],
      ru: [
        'Направления, специальности и дисциплины',
        'Учебный план и расписание занятий',
        'Педагоги и слушатели',
        'Результаты и электронные сертификаты'
      ],
      en: [
        'Programmes, specialities and subjects',
        'Curriculum and class schedule',
        'Teachers and trainees',
        'Results and electronic certificates'
      ]
    }
  },
  {
    slug: 'ish-haqi-fondi',
    icon: Money24Regular,
    title: { uz: 'Ish haqi fondi va iqtisodiy nazorat', ru: 'Фонд оплаты труда и экономический контроль', en: 'Payroll fund and economic control' },
    short: {
      uz: 'Ish haqi fondi va oylik hisobotlarni nazorat qilish.',
      ru: 'Контроль фонда оплаты труда и ежемесячной отчётности.',
      en: 'Payroll fund and monthly reporting control.'
    },
    features: {
      uz: [
        'Ish haqi fondi va oylik nazorati',
        'Oylik hisobotlar va hisobot yuklash',
        'Asossiz to‘lovlarni aniqlash',
        'Tarif setkasi va shtatlar',
        '1C bilan integratsiya'
      ],
      ru: [
        'Фонд оплаты труда и контроль зарплат',
        'Ежемесячные отчёты и их загрузка',
        'Выявление необоснованных выплат',
        'Тарифная сетка и штаты',
        'Интеграция с 1С'
      ],
      en: [
        'Payroll fund and salary control',
        'Monthly reports and uploads',
        'Detection of unjustified payments',
        'Tariff grid and staffing',
        '1C integration'
      ]
    }
  },
  {
    slug: 'tibbiy-korik',
    icon: Stethoscope24Regular,
    title: { uz: 'Tibbiy ko‘rik va yo‘llanmalar', ru: 'Медосмотры и направления', en: 'Medical check-ups and referrals' },
    short: {
      uz: 'Xodimlarning davriy tibbiy ko‘rigi va yo‘llanmalar.',
      ru: 'Периодические медосмотры сотрудников и направления.',
      en: 'Periodic employee medical check-ups and referrals.'
    },
    features: {
      uz: ['Tibbiy ko‘rik jadvali va natijalari', 'Yo‘llanmalar', 'Xodimlar va pensionerlar ro‘yxati'],
      ru: ['График и результаты медосмотров', 'Направления', 'Списки сотрудников и пенсионеров'],
      en: ['Check-up schedule and results', 'Referrals', 'Employee and pensioner lists']
    }
  },
  {
    slug: 'xabarlar',
    icon: Megaphone24Regular,
    title: { uz: 'Ichki aloqa: xabar va e’lonlar', ru: 'Внутренние коммуникации: сообщения и объявления', en: 'Internal communication: messages and announcements' },
    short: {
      uz: 'Xodimlarga bildirishnoma, yangilik va onlayn suhbat.',
      ru: 'Уведомления, новости и онлайн-чат для сотрудников.',
      en: 'Notifications, news and online chat for employees.'
    },
    features: {
      uz: ['Bildirishnomalar va push xabarlar', 'Yangiliklar va story e’lonlar', 'Telegram xabarlari', 'Onlayn suhbatlar'],
      ru: ['Уведомления и push-сообщения', 'Новости и stories', 'Сообщения в Telegram', 'Онлайн-чаты'],
      en: ['Notifications and push messages', 'News and stories', 'Telegram messages', 'Online chats']
    }
  },
  {
    slug: 'hr-rail-mobil-ilova',
    icon: Phone24Regular,
    title: { uz: 'HR Rail — xodimlar uchun mobil ilova', ru: 'HR Rail — мобильное приложение для сотрудников', en: 'HR Rail — mobile app for employees' },
    short: {
      uz: 'Har bir xodim telefonidan o‘z hujjatlarini imzolaydi va turniket ma’lumotlarini ko‘radi.',
      ru: 'Каждый сотрудник подписывает свои документы и видит данные турникета прямо в телефоне.',
      en: 'Every employee signs their own documents and sees turnstile data right on their phone.'
    },
    features: {
      uz: [
        'O‘z hujjatlarini (buyruq, shartnoma, ariza) ko‘rish va imzolash',
        'Turniket ma’lumotlari: qachon kelgani va ketgani',
        'Ishlagan soatlarini kunlar bo‘yicha ko‘rish'
      ],
      ru: [
        'Просмотр и подписание своих документов (приказы, договоры, заявления)',
        'Данные турникета: время прихода и ухода',
        'Отработанные часы по дням'
      ],
      en: [
        'View and sign own documents (orders, contracts, applications)',
        'Turnstile data: arrival and departure times',
        'Hours worked by day'
      ]
    },
    play: true
  }
]

export const findModule = (slug) => MODULES.find((m) => m.slug === slug) ?? null
