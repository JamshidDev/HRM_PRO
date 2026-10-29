// Oylik nazorati — IZOHLAR (self-documenting layer).
// Har bir KPI, grafik, bo'lim va ustun uchun:
//   sub  — grafik/karta sarlavhasi ostidagi qisqa izoh (maketdagi `.sub`).
//   info — (i) belgisi tooltipi: "bu nima, qanday hisoblangan, nimaga e'tibor berish".
// Maqsad (foydalanuvchi talabi): ko'rgan odam "bu nima?" deb so'rashiga hojat qolmasin.
// Manba: oylik_nazorat_dashboard_5.html `.sub` matnlari + HUJJAT.md.

// —— Bo'lim (tab) darajasidagi izohlar ————————————————————————————————————
export const SECTION = {
  summary: {
    title: 'Umumiy ko‘rinish',
    sub: 'Oylik vedomost bo‘yicha asosiy ko‘rsatkichlar va avtomatik aniqlangan tekshirilishi kerak bo‘lgan holatlar.',
    info: 'Ma’lumot 1C oylik hisobotidan olinadi. Har bir ko‘rsatkich va holat quyida izohlangan. Belgilangan holatlar — avtomatik mezon natijasi, yakuniy xulosa emas: buyruq, tabel va hujjatlar bilan tasdiqlanadi.'
  },
  rules: {
    title: 'To‘lov turlari mezonlari (9 tur)',
    sub: 'Har bir nazorat qilinadigan to‘lov turi uchun natija: Asosli, Asossiz yoki Qo‘shimcha tekshirish.',
    info: 'Manba: "To‘lov turlari bo‘yicha noqonuniy yoki asossiz to‘lovlarni aniqlash" talablari. 047/050/055/270 turlari buyruq bo‘yicha ruxsat etilgan JSHSHIR ro‘yxati bilan solishtiriladi — ro‘yxatni pastda kiritsangiz, natija darhol qayta hisoblanadi.'
  },
  risks: {
    title: 'Ish haqi bo‘yicha 14 ta risk',
    sub: '5 blok, 14 risk. Har biri avgust ma’lumoti bilan tekshirildi; ma’lumot yetmagan joyda nima kerakligi ko‘rsatilgan.',
    info: 'Manba: "Xodimlarga ish haqini hisoblash va to‘lashda mavjud risklar". Holatlar: Xavf aniqlandi (qizil), Tekshirish kerak (sariq), Me’yorda (yashil), Ma’lumot yetarli emas (kulrang).'
  },
  who: {
    title: 'Kimga ko‘p to‘lanyapti',
    sub: 'Eng ko‘p hisoblangan va daromad olgan xodimlar; oklad va jami hisoblangan nisbati.',
    info: '⚠ belgisi — xodimda tekshirilishi kerak bo‘lgan holat bor. Yil boshidan daromad NDFL-4 va NDFL-5 jamiga asoslanadi.'
  },
  vids: {
    title: 'To‘lov turlari',
    sub: 'To‘lovlarning tarkibi, taqsimoti va mukofotning ishlangan vaqtga mutanosibligi.',
    info: 'Har bir to‘lov turi (vid) 1C kodi bilan belgilanadi (masalan 004 — vaqtbay, 011 — mukofot). Summalar va oluvchilar soni avgust bo‘yicha.'
  },
  deductions: {
    title: 'Ushlanmalar',
    sub: 'Jami hisoblangan summadan ushlanmalar ayrilib, kartaga o‘tkazilgan summagacha.',
    info: 'Ushlanmalar: daromad solig‘i (882), INPS (883), kasaba badali, aliment (889), ijro hujjati (901), kredit/omonat (897/899), ortiqcha moddiy yordam (875) va boshqalar.'
  },
  reports: {
    title: 'Hisobotlar solishtiruvi',
    sub: 'Vedomostdagi jamlar NDFL-4, NDFL-5 va INPS hisobotlari bilan solishtiriladi.',
    info: 'Farq bo‘lsa — hisobotga kiritilmagan yoki ortiqcha kiritilgan summa bor. (NDFL/INPS hisobotlari ulangach to‘liq ishlaydi.)'
  },
  employees: {
    title: 'Barcha xodimlar',
    sub: 'Har bir xodimning to‘liq oylik tarkibi. Ustun nomini bosib saralang.',
    info: '⚠ belgisi — xodimda tekshirilishi kerak bo‘lgan holat bor. JSHSHIR bo‘yicha bir shaxsning qatorlari birlashtirilgan.'
  }
}

// —— KPI kartalari (Umumiy) ——————————————————————————————————————————————
export const KPI = {
  tot: { label: 'Jami hisoblangan', info: 'Barcha xodimlarga avgustda hisoblangan umumiy summa (soliq va ushlanmalardan oldin). MHTF — mehnatga haq to‘lash fondi; MHTFdan tashqari — moddiy yordam, nafaqa kabi to‘lovlar.' },
  n: { label: 'Xodimlar soni', info: 'Avgustda hisoblanma olgan xodimlar soni (JSHSHIR bo‘yicha). To‘liq oy ishlaganlar — vaqtbay haqi okladning ~100% i bo‘lganlar.' },
  avg: { label: 'O‘rtacha oylik', info: 'Jami hisoblangan / xodimlar soni. Median — o‘rtadagi xodim oyligi (chetdagi katta summalar ta’sir qilmaydi).' },
  card: { label: 'Kartaga o‘tkazildi', info: 'Ushlanmalardan keyin plastik kartaga o‘tkazilgan sof summa. Qolgani — daromad solig‘i va boshqa ushlanmalar.' },
  suspicious: { label: 'Shubhali to‘lovlar', info: 'Yuqori xavfli holatlardagi summa (takroriy/soliq holatlari hisobga olinmaydi, chunki ular summa dublikatsiyasi). Yakuniy xulosa emas — tekshirish kerak.' },
  flagged: { label: 'Belgilangan holatlar', info: '14 avtomatik tekshiruv aniqlagan jami holatlar soni, xavf darajasi (Yuqori/O‘rta/Past) bo‘yicha.' }
}

// —— Grafiklar (id → sarlavha/izoh) ——————————————————————————————————————
export const CHART = {
  // Umumiy
  catc: { title: 'Holatlar turi bo‘yicha', sub: 'Har bir muammo turidagi holatlar soni, xavf darajasi kesimida (Yuqori/O‘rta/Past).' },
  cats: { title: 'Shubhali summa — muammo turi bo‘yicha', sub: 'Belgilangan holatlardagi summa, mln so‘m. Bir xodim bir necha turda bo‘lishi mumkin.' },
  // Kimga ko'p
  top: { title: 'Eng ko‘p hisoblangan — avgust', sub: 'Jami hisoblangan summa, top 15 · ⚠ — tekshirilishi kerak bo‘lgan holati bor.' },
  ytd: { title: 'Eng ko‘p daromad — yil boshidan', sub: 'NDFL-4 va NDFL-5 bo‘yicha yanvar–avgust, top 15.' },
  spike: { title: 'Keskin o‘sish: avgust / yillik o‘rtacha', sub: 'Avgustdagi summa yillik oylik o‘rtachasiga necha barobar (top 15). Yil davomida yangi kelganlar hisobga olinmagan.' },
  okx: { title: 'Oklad va jami hisoblangan', sub: 'Chiziqlar: jami = 1×, 2×, 3× oklad. 2× dan yuqoridagi nuqtalar alohida e’tiborga loyiq.' },
  // To'lov turlari
  hist: { title: 'Oylik taqsimoti', sub: 'Jami hisoblangan summa bo‘yicha xodimlar soni, 2 mln so‘mlik oraliqlar.' },
  grp: { title: 'Lavozim guruhlari', sub: 'Jami hisoblangan: eng kam – eng ko‘p oraliq va o‘rtacha (nuqta). Qavsda — xodimlar soni.' },
  stk: { title: 'Top 20 xodim oyligi tarkibi', sub: 'Avgust, jami hisoblangan summa to‘lov guruhlari (vaqtbay, mukofot, ustama, ta’til, oziq-ovqat, moddiy yordam) bo‘yicha.' },
  sc: { title: 'Mukofot va ishlangan vaqt', sub: 'X: vaqtbay haq / oklad (ishlangan ulush) · Y: mukofot / oklad. Chiziqdan yuqoridagi nuqtalarda mukofot ishlangan vaqtdan ortiq.' },
  vid: { title: 'To‘lov turlari (vidlar) tarkibi', sub: 'Avgust bo‘yicha har bir to‘lov turining jami summasi va oluvchilar soni.' },
  strip: { title: 'Mukofot foizi — lavozim guruhlari bo‘yicha', sub: 'Har bir nuqta — bitta xodim: mukofot (011) / vaqtbay haq (004). Guruh ichida tarqoqlik — mukofot bir xil qoidada hisoblanmayotganining belgisi.' },
  // Ushlanmalar
  wf: { title: 'Hisoblangandan kartagacha', sub: 'Jami hisoblangan summadan ushlanmalar bosqichma-bosqich ayriladi, qolgani kartaga o‘tkaziladi (mln so‘m).' },
  dsh: { title: 'Ushlanmalar ulushi — eng yuqori 15 xodim', sub: 'Soliqdan tashqari ushlanmalar (aliment, kredit, ijro hujjati va boshq.) / jami hisoblangan.' },
  // Xavflar (rules)
  r11chart: { title: '011 mukofoti — lavozim toifasi bo‘yicha', sub: '011 vaqtbay ishchilar uchun. Mutaxassis va rahbarlarga to‘langan bo‘lsa, 012 turi bo‘yicha to‘lanishi kerakligi tekshiriladi.' },
  // 14 risk grafiklari
  c14a: { title: 'Risk 4 · Bir xil lavozim — turlicha oklad', sub: 'Har bir nuqta — lavozimdagi alohida oklad miqdori, mln so‘m. Qavsda — xodimlar soni.' },
  c14b: { title: 'Risk 11 · Ushlanmalar ulushi', sub: 'Soliq bilan birga barcha ushlanmalar / hisoblangan ish haqi, top 15. Qizil chiziqlar: 50% va 70% chegaralar (* — aliment yoki ijro hujjati bor).' },
  c14c: { title: 'Risk 9 · Ishlangan soatlar taqsimoti', sub: 'Avgust: 21 ish kuni × 8 = 168 soat me’yor. Sariq ustunlar — me’yordan ko‘p ishlaganlar.' }
}

// —— Jadval ustunlari (Barcha xodimlar) ——————————————————————————————————
export const COLUMN = {
  fio: 'Xodimning familiyasi, ismi, otasining ismi (JSHSHIR bo‘yicha birlashtirilgan).',
  lav: 'Lavozim(lar). Bir shaxs bir necha lavozimda bo‘lsa — " / " bilan birlashtiriladi.',
  ok: 'Oklad — tarif stavkasi bo‘yicha oylik asosiy maosh.',
  t: 'Avgustda ishlangan soat. Me’yor: 168 soat (21 ish kuni × 8).',
  b004: 'Vaqtbay to‘lov (004) — ishlangan vaqt uchun tarif bo‘yicha haq.',
  b011: 'Mukofot (011) — vaqtbay ishchilarga oylik mukofot.',
  oth: 'Boshqa to‘lovlar — ustama, ta’til, moddiy yordam va h.k. (jami − 004 − 011).',
  tot: 'Jami hisoblangan — barcha to‘lovlar yig‘indisi (soliqdan oldin).',
  card: 'Kartaga o‘tkazilgan sof summa (ushlanmalardan keyin).',
  ytd: 'Yil boshidan (yanvar–avgust) jami daromad — NDFL-4 + NDFL-5.'
}

// —— 14 risk uchun "avtomatik tekshiruv" usuli (HUJJAT §7) ————————————————————
export const RISK_METHOD = {
  1: 'Vedomostda avans (880) borligini tekshiradi. To‘liq tahlil uchun bank to‘lov topshiriqnomalari kerak.',
  2: 'To‘lov sanalari vedomostda yo‘q — kechikishni aniqlab bo‘lmaydi (bank sanalari kerak).',
  3: 'To‘lov kalendari kerak — dam olish kuni arafasidagi to‘lovni tekshirish uchun.',
  4: 'Bir xil lavozimdagi turli oklad miqdorlari taqqoslanadi (razryad/toifa/staj bilan asoslanishi kerak).',
  5: 'Oklad MHTEKM (MW) dan kam bo‘lgan xodimlar aniqlanadi.',
  6: '160+ soat ishlab, vaqtbay haqi (004) okladning 99,5% idan kam bo‘lganlar.',
  7: 'O‘rtacha hisoblangan ish haqi tarmoq o‘rtachasi (SECTOR) bilan solishtiriladi.',
  8: 'NDFL-4 shartnoma turi va 047-tur to‘lovi tekshiriladi (hisobot ulangach).',
  9: 'Soat me‘yordan (NORM) ko‘p, lekin 072/073 bo‘yicha oshirilgan haq yo‘q.',
  10: 'Ta‘til puli/kompensatsiya (032/040) oluvchilar — 12 oylik o‘rtacha bilan tekshirish kerak.',
  11: 'Barcha ushlanmalar / jami > 50% (aliment yoki ijro hujjati bo‘lsa 70%); 875 ushlanmasi alohida.',
  12: 'Bitta JSHSHIR vedomostda 2+ marta uchrashi.',
  13: 'Oklad tarixi va indeksatsiya tartibi kerak — bir oylik ma‘lumotda aniqlab bo‘lmaydi.',
  14: 'Majburiy sug‘urta polisi ma‘lumoti kerak.'
}

// —— Natija/xavf darajasi badge izohlari ————————————————————————————————————
export const BADGE = {
  Asosli: 'To‘lov mezonga mos — asosli.',
  'Qo‘shimcha tekshirish': 'Ma’lumot yetarli emas yoki chegaraviy holat — hujjat bilan tekshirish kerak.',
  Asossiz: 'To‘lov mezonga mos emas — asossiz bo‘lishi mumkin, tekshiring.',
  Yuqori: 'Yuqori xavf — darhol e’tibor talab qiladi.',
  'O‘rta': 'O‘rta xavf — tekshirish tavsiya etiladi.',
  Past: 'Past xavf — e’tiborga olinadi.',
  'Xavf aniqlandi': 'Ma’lumotda risk belgisi topildi.',
  'Tekshirish kerak': 'Shubhali holat — hujjat bilan tasdiqlash kerak.',
  'Me’yorda': 'Risk topilmadi.',
  'Ma’lumot yetarli emas': 'Tekshirish uchun qo‘shimcha ma’lumot kerak.'
}
