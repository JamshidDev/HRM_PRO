// Oylik nazorati — TAHLIL ENGINE'i.
// Manba: `oylik_nazorat_dashboard_5.html` (maket) + `HUJJAT.md` (spec).
// Maketning `yigish()` (14 avtomatik tekshiruv → D.F), `evalAll()` (9 to'lov mezoni)
// va `R` (14 risk) mantig'ining AYNAN ko'chirmasi — bizning backend `emps/vids/kpi/rc`
// payloadiga moslashtirilgan. Barcha hisob client-side (maket shunday ishlaydi; 9 mezon
// buyruq ro'yxatini joylab darhol qayta hisoblashni talab qiladi).
//
// 🔑 Backend ma'lumot shakliga 2 ta moslash (maketdan farq):
//   1) Bizning `emps.ded['882']` ICHIDA 883 bor (backend: tax=max(0,882−883), inps=883).
//      Shuning uchun "jami ushlanma"ni hisoblashda 883 va 885(karta) chiqariladi.
//   2) Maketdagi `e.kas` = kasaba uyushma badali (902); bizda `emps.kas`=897(omonat).
//      Kasaba badali kerak bo'lsa xom `ded['902']` o'qiladi.

import { positionCategory, positionGroup, pinAgeSex } from './helpers.js'

// —— Konstantalar (HUJJAT §12/§14) ————————————————————————————————————————
export const CONST = {
  MW_AUG: 1271000, // MHTEKM 2025-08-01 dan
  MW_SEP: 1360000, // MHTEKM 2026-09-01 dan
  SECTOR: 11070000, // "Transport va saqlash" tarmog'i o'rtacha (2026 1-yarim yil)
  IMTIYOZ_278: 5363617, // 278 moddiy yordamning soliqdan ozod chegarasi
  TAX_RATE: 0.12, // JShDS + INPS
  BONUS_NORM_INSPECTOR: 0.6, // vagon kuzatuvchi mukofot me'yori
  BONUS_NORM_OTHER: 1.0, // qolganlar mukofot me'yori
  DED_LIMIT: 0.5, // ushlanmalar standart chegarasi
  DED_LIMIT_ALIMENT: 0.7, // aliment/ijro hujjati bo'lsa
  RETIRE_F: 54, // ayollar pensiya yoshi
  RETIRE_M: 60 // erkaklar pensiya yoshi
}

// Davr uchun MHTEKM (2026-09 dan 1 360 000).
export function minWage(year, month) {
  if (!year) return CONST.MW_AUG
  if (year > 2026 || (year === 2026 && month >= 9)) return CONST.MW_SEP
  return CONST.MW_AUG
}

// Yil boshidan necha oy o'tgani (ytd ni o'rtachaga bo'lish uchun; avg = ytd/elapsed).
export const elapsedMonths = (month) => Math.max(1, Number(month) || 8)

// —— Kichik yordamchilar ————————————————————————————————————————————————
const num = (x) => Number(x) || 0
const V = (e, k) => num(e?.v?.[k]) // hisoblanma kodi (type=1)
const D = (e, k) => num(e?.ded?.[k]) // ushlanma kodi (type=2/3)

// Jami ushlab qolingan summa (soliq + inps + kasaba + aliment + … + avans).
// Bizning `ded` barcha type=2/3 kodlarni saqlaydi; 883 (inps — 882 ichida) va
// 885 (kartaga o'tkazma — ushlanma emas) chiqariladi.
const WITHHELD_EXCLUDE = new Set(['883', '885'])
export function totalWithheld(e) {
  let s = 0
  for (const k in e.ded || {}) {
    if (WITHHELD_EXCLUDE.has(k)) continue
    s += num(e.ded[k])
  }
  return s
}

// Qisqa ism (2 so'z).
export const short = (fio) => String(fio || '').split(' ').slice(0, 2).join(' ')

// MHTFga KIRMAYDIGAN to'lov kodlari (moddiy yordam, nafaqa, kompensatsiya) — backend
// code-groups TOTAL_TWO ∪ TOTAL_THREE (unique). MHTF (fot) = jami hisoblangan − shular.
export const NON_MHTF_CODES = new Set([
  '061', '070', '086', '228', '461', '469', '470', '473', '477', '479', '557', '559',
  '563', '565', '562', '600', '042', '044', '056', '246', '251', '271', '272', '273',
  '274', '275', '277', '278', '368', '369', '474', '482', '556', '558', '560', '564', '566'
])

// Bitta xodimning MHTF (mehnatga haq to'lash fondi) qismi: jami − MHTFga kirmaydiganlar.
export function mhtfFot(e) {
  let non = 0
  for (const k in e.v || {}) if (NON_MHTF_CODES.has(k)) non += num(e.v[k])
  return Math.max(0, num(e.tot) - non)
}

// —— people[] — JSHSHIR bo'yicha birlashtirilgan + boyitilgan xodimlar ————
// Maket: `// merge employees by JSHSHIR` + `// KPIs` boyitishlari.
export function buildPeople(emps = []) {
  const byPin = new Map()
  const solo = []
  for (const e of emps) {
    const seed = () => ({ ...e, lavs: [e.lav], v: { ...e.v }, ded: { ...e.ded } })
    if (!e.j) {
      solo.push(seed())
      continue
    }
    const p = byPin.get(e.j)
    if (!p) {
      byPin.set(e.j, seed())
    } else {
      p.tot += num(e.tot)
      p.fot += num(e.fot)
      p.card += num(e.card)
      p.tax += num(e.tax)
      p.inps += num(e.inps)
      p.kas += num(e.kas)
      p.t += num(e.t)
      p.ok = Math.max(p.ok, num(e.ok))
      p.ytd = Math.max(num(p.ytd), num(e.ytd))
      p.lavs.push(e.lav)
      for (const k in e.v) p.v[k] = num(p.v[k]) + num(e.v[k])
      for (const k in e.ded) p.ded[k] = num(p.ded[k]) + num(e.ded[k])
    }
  }
  const people = [...byPin.values(), ...solo]
  for (const p of people) {
    p.lav = p.lavs.filter((l) => l && l !== '—').join(' / ') || '—'
    p.b004 = V(p, '004')
    p.b011 = V(p, '011')
    p.oth = num(p.tot) - p.b004 - p.b011
    p.g = positionGroup(p.lav)
    p.cat = positionCategory(p.lav)
  }
  return people
}

// ════════════════════════════════════════════════════════════════════════
//  9 TO'LOV TURI MEZONI — RULES + evalAll (maket satr 380-402, HUJJAT §6)
// ════════════════════════════════════════════════════════════════════════
export const RULES = [
  { k: '047', t: "Ro'yxatdan tashqari (FHSh asosida) xodimlarga ishlagan vaqti uchun to'lov", r: 'list', m: "Buyruq asosida NN yuklagan ruxsat etilgan xodimlar ro'yxati bilan solishtiriladi" },
  { k: '011', t: 'Vaqtbay ishchilarga mukofotlar (oylik)', r: 'worker', m: 'Oluvchining lavozimi tahlil qilinadi: mutaxassis, rahbar va boshqaruv xodimlari alohida aniqlanadi' },
  { k: '012', t: 'Boshqaruv xodimlari, mutaxassis va xizmatchilarga mukofotlar (oylik)', r: 'staff', m: "Lavozim asosiy mezon: rahbarlarga to'langani tekshiriladi, mutaxassislar alohida ro'yxatga chiqariladi" },
  { k: '050', t: "Ortiqcha og'irlik va uzunlikdagi poyezdlarni o'tkazganlik uchun mukofot", r: 'list', m: "Buyruq asosidagi ruxsat etilgan xodimlar ro'yxati bilan solishtiriladi" },
  { k: '055', t: "Tor doiradagi malakali ishchilar va yo'riqchilarga kasb mahorati ustamasi", r: 'list', m: "Buyruq asosidagi ruxsat etilgan xodimlar ro'yxati bilan solishtiriladi" },
  { k: '250', t: 'Alohida hollarda va tarmoq kelishuviga asosan moddiy yordam', r: 'cap', m: "Oylik ish haqi tarif setkasidagi chegara bilan solishtiriladi; chegaradan ortiq olganlar ajratiladi" },
  { k: '263', t: 'Nizomga muvofiq boshqaruv xodimlari va mutaxassislarga choraklik mukofot', r: 'mgmt', m: "Faqat boshqaruv, rahbar va mutaxassislar uchun; boshqa toifalarga to'langan bo'lsa ro'yxatga chiqariladi" },
  { k: '270', t: "Mehnat natijalari bilan bog'liq bo'lmagan bir yo'la mukofotlar", r: 'list', m: "Buyruq asosidagi ruxsat etilgan xodimlar ro'yxati bilan solishtiriladi" },
  { k: '281', t: 'Pensiyaga chiqish munosabati bilan mukofotlar', r: 'age', m: 'Jins va yosh: ayollar 54, erkaklar 60 yoshdan; yoshi yetmaganlar alohida ro‘yxatga chiqariladi' }
]

// localStorage kalitlari (maket bilan bir xil — hamyonbop).
export const LS_LIST_PREFIX = 'oy-list-'
export const LS_CAP_250 = 'oy-cap-250'

// Buyruq ro'yxatlari (047/050/055/270) va 250 chegarasini localStorage'dan o'qish.
export function loadLists() {
  const lists = {}
  for (const r of RULES) {
    if (r.r !== 'list') continue
    const set = new Set()
    try {
      const raw = localStorage.getItem(LS_LIST_PREFIX + r.k) || ''
      raw.split(/\D+/).filter((x) => x.length === 14).forEach((x) => set.add(x))
    } catch {
      /* ignore */
    }
    lists[r.k] = set
  }
  let cap = null
  try {
    const c = Number(localStorage.getItem(LS_CAP_250))
    if (c) cap = c
  } catch {
    /* ignore */
  }
  return { lists, cap }
}

export function saveList(code, text) {
  const set = new Set(String(text || '').split(/\D+/).filter((x) => x.length === 14))
  try {
    localStorage.setItem(LS_LIST_PREFIX + code, [...set].join(','))
  } catch {
    /* ignore */
  }
  return set
}

export function saveCap(value) {
  const cap = Number(value) || null
  try {
    localStorage.setItem(LS_CAP_250, cap || '')
  } catch {
    /* ignore */
  }
  return cap
}

// evalAll — har xodim × har mezon → {fio,lav,k,t,s,why,res,c}. Maket satr 394-402.
// `fmt` — pul formatlovchi (cap qoidasida xabar uchun); ixtiyoriy.
export function evalRules(emps = [], { lists = {}, cap = null, fmt } = {}) {
  const f = fmt || ((n) => String(Math.round(num(n))))
  const out = []
  for (const e of emps) {
    for (const rule of RULES) {
      const s = V(e, rule.k)
      if (!s) continue
      const c = positionCategory(e.lav)
      let res
      let why
      if (rule.r === 'list') {
        const set = lists[rule.k]
        if (!set || !set.size) {
          res = 'Qo‘shimcha tekshirish'
          why =
            "Buyruq bo‘yicha ruxsat etilgan xodimlar ro‘yxati yuklanmagan" +
            (rule.k === '055' && c !== 'Ishchi' ? `; lavozim (${c.toLowerCase()}) tur tavsifiga mos emas` : '')
        } else if (set.has(e.j)) {
          res = 'Asosli'
          why = "Ruxsat etilgan ro‘yxatda bor"
        } else {
          res = 'Asossiz'
          why = "Ruxsat etilgan ro‘yxatda yo‘q"
        }
      } else if (rule.r === 'worker') {
        if (c === 'Ishchi') {
          res = 'Asosli'
          why = 'Lavozim ishchi toifasida'
        } else {
          res = 'Qo‘shimcha tekshirish'
          why = `Lavozim ${c === 'Rahbar' ? 'rahbar/boshqaruv' : c === 'Mutaxassis' ? 'mutaxassis' : 'aniqlanmagan'} toifasida — 012-tur bo‘yicha to‘lanishi kerakmi, tekshiring`
        }
      } else if (rule.r === 'staff') {
        if (c === 'Rahbar') {
          res = 'Asosli'
          why = 'Rahbar/boshqaruv xodimi'
        } else if (c === 'Mutaxassis') {
          res = 'Qo‘shimcha tekshirish'
          why = "Mutaxassis — alohida ro‘yxat"
        } else {
          res = 'Asossiz'
          why = 'Ishchi toifasiga 012 to‘langan'
        }
      } else if (rule.r === 'mgmt') {
        if (c === 'Rahbar' || c === 'Mutaxassis') {
          res = 'Asosli'
          why = `${c} toifasi`
        } else {
          res = 'Asossiz'
          why = 'Boshqaruv/mutaxassis toifasiga kirmaydi'
        }
      } else if (rule.r === 'cap') {
        if (!cap) {
          res = 'Qo‘shimcha tekshirish'
          why = 'Tarif setkasi chegarasi kiritilmagan'
        } else if (num(e.fot) > cap) {
          res = 'Asossiz'
          why = `Oylik ${f(e.fot)} > chegara ${f(cap)}`
        } else {
          res = 'Asosli'
          why = 'Chegara doirasida'
        }
      } else if (rule.r === 'age') {
        const A = pinAgeSex(e.j)
        const lim = A.sex === 'Ayol' ? CONST.RETIRE_F : CONST.RETIRE_M
        if (A.age != null && A.age >= lim) {
          res = 'Asosli'
          why = `${A.sex}, ${A.age} yosh`
        } else if (A.age != null) {
          res = 'Asossiz'
          why = `${A.sex}, ${A.age} yosh — ${lim} yoshga yetmagan`
        } else {
          res = 'Qo‘shimcha tekshirish'
          why = 'JSHSHIR yosh/jinsni aniqlab bo‘lmadi'
        }
      }
      out.push({ fio: e.fio, lav: e.lav, k: rule.k, t: rule.t, s, why, res, c })
    }
  }
  return out
}

// ════════════════════════════════════════════════════════════════════════
//  14 AVTOMATIK TEKSHIRUV → findings (D.F). Maket `yigish()`, HUJJAT §5.
//  add('sev','cat',e,summa,'txt','chk') → {sev,cat,fio,lav,summa,txt,chk}
// ════════════════════════════════════════════════════════════════════════
export function computeFindings(emps = [], { fmt } = {}) {
  const f = fmt || ((n) => String(Math.round(num(n))))
  const F = []
  // summa 2 kasrgacha yaxlitlanadi — float artefaktlari (…66999999993) o'rniga toza
  // so'm.tiyin (masalan 146267.67). Ko'rsatishda money2 (butun qism bo'shliq, kasr nuqta).
  const r2 = (x) => Math.round(num(x) * 100) / 100
  const add = (sev, cat, e, summa, txt, chk) =>
    F.push({ sev, cat, fio: e.fio, lav: e.lav, summa: r2(summa), txt, chk })

  // 12-tekshiruv uchun: JSHSHIR qatorlar soni.
  const pinCount = new Map()
  for (const e of emps) {
    if (e.j) pinCount.set(e.j, (pinCount.get(e.j) || 0) + 1)
  }
  const dupReported = new Set()

  for (const e of emps) {
    const ok = num(e.ok)
    const v004 = V(e, '004')
    const v011 = V(e, '011')
    const v032 = V(e, '032')
    const cat = positionCategory(e.lav)
    const isInspector = /kuzatuvchi/i.test(e.lav || '')

    // 1. Mukofot ishlangan vaqtga mos emas: 011 > 004×me'yor×1.05 & farq>300k.
    if (v011 > 0 && v004 > 0) {
      const norm = isInspector ? CONST.BONUS_NORM_INSPECTOR : CONST.BONUS_NORM_OTHER
      const expected = v004 * norm
      const farq = v011 - expected
      if (v011 > expected * 1.05 && farq > 300000) {
        add(
          farq > 1000000 ? 'Yuqori' : 'O‘rta',
          'Mukofot ishlangan vaqtga mos emas',
          e,
          v011,
          `Mukofot (011) ${f(v011)} — vaqtbay haq (004) ${f(v004)} ning ${Math.round((v011 / v004) * 100)}% i (me'yor ${Math.round(norm * 100)}%). Farq ${f(farq)} so‘m.`,
          "Mukofot nizomi va ishlagan vaqtni (tabel) tekshiring."
        )
      }
    }

    // 2. Ish vaqti yo'q, mukofot to'langan: 011 bor, 004 yo'q.
    if (v011 > 0 && v004 === 0) {
      add(
        v032 > 0 ? 'O‘rta' : 'Yuqori',
        "Ish vaqti yo'q, mukofot to'langan",
        e,
        v011,
        `Mukofot (011) ${f(v011)} so‘m, vaqtbay haq (004) yo‘q${v032 > 0 ? '; ta’tilda (032)' : ''}.`,
        "Buyruq va tabel bilan asoslang."
      )
    }

    // 3. Vaqtbay haq okladdan sezilarli ortiq: 004 > oklad×1.25 va farq > 300k.
    //    Spec (HUJJAT §5) ×1.001 beradi, lekin bu ma'lumotda 004 oklad ustiga tarif
    //    koeffitsientini (~1.1) o'z ichiga oladi (median 004/oklad≈1.07) — ×1.001 bilan
    //    xodimlarning yarmi yonib ketardi. Shuning uchun sezilarli chetlanish (25% + 300k
    //    farq) olinadi. 🔧 Buxgalteriya bilan aniq koeffitsientni kelishib sozlang.
    if (ok > 0 && v004 > ok * 1.25 && v004 - ok > 300000) {
      add('O‘rta', 'Vaqtbay haq okladdan sezilarli ortiq', e, v004 - ok, `Vaqtbay haq (004) ${f(v004)} — oklad ${f(ok)} ning ${Math.round((v004 / ok) * 100)}% i (farq ${f(v004 - ok)}).`, "Tabel soatlari, tarif koeffitsienti va qo‘shimcha haqlarni tekshiring.")
    }

    // 4. O'rindoshlik/qo'shimcha ish (007) yuqori: 007 ≥ oklad×0.45.
    const v007 = V(e, '007')
    if (ok > 0 && v007 >= ok * 0.45) {
      add('O‘rta', "O'rindoshlik (007) yuqori", e, v007, `Qo‘shimcha ish haqi (007) ${f(v007)} — okladning ${Math.round((v007 / ok) * 100)}% i.`, "O‘rindoshlik shartnomasi va hajmini tekshiring.")
    }

    // 5. To'lov turi lavozimga mos emas: 055 bor, lavozim ishchi/yo'riqchi emas.
    const v055 = V(e, '055')
    if (v055 > 0 && cat !== 'Ishchi' && !/yo‘riqchi|yo'riqchi/i.test(e.lav || '')) {
      add('O‘rta', 'To‘lov turi lavozimga mos emas (055)', e, v055, `Kasb mahorati ustamasi (055) ${f(v055)} — lavozim ${cat.toLowerCase()} (ishchi/yo‘riqchi emas).`, "055 tur tavsifiga mos lavozimligini tekshiring.")
    }

    // 6. Tungi ish haqi kuzatuvchi bo'lmagan lavozimga: 023 bor, lavozim kuzatuvchi emas.
    const v023 = V(e, '023')
    if (v023 > 0 && !isInspector) {
      add('Past', 'Tungi ish haqi (023) — kuzatuvchi bo‘lmagan lavozim', e, v023, `Tungi vaqt uchun (023) ${f(v023)} so‘m, lavozim: ${e.lav || '—'}.`, "Tungi smena grafigi va tabeldagi tungi soatlarni tekshiring.")
    }

    // 7. Ishlayotgan xodimga ta'til kompensatsiyasi: 040 bor.
    const v040 = V(e, '040')
    if (v040 > 0) {
      add('Yuqori', "Ishlayotgan xodimga ta'til kompensatsiyasi (040)", e, v040, `Foydalanilmagan ta’til kompensatsiyasi (040) ${f(v040)} so‘m.`, "Ishdan bo‘shamagan bo‘lsa — asosini tekshiring (MK).")
    }

    // 8. Moddiy yordam to'liq oklad miqdorida: 278 ≥ oklad×0.99.
    const v278 = V(e, '278')
    if (ok > 0 && v278 >= ok * 0.99) {
      add('Past', 'Moddiy yordam (278) — to‘liq oklad miqdorida', e, v278, `Moddiy yordam (278) ${f(v278)} — oklad ${f(ok)} ning ${Math.round((v278 / ok) * 100)}% i.`, "278 asosini (ariza/buyruq) va imtiyoz chegarasini tekshiring.")
    }

    // 9. Kasaba badali xato: 902 ≠ MHTF×1% (farq>100). Baza = REAL MHTF (mhtfFot) —
    //    e.fot EMAS (backend e.fot=tot, jami hisoblanma → baza shishib, a'zolarda ham
    //    noto'g'ri yonardi). Faqat 902 ushlangan (kasaba a'zosi) xodim tekshiriladi —
    //    kasaba ixtiyoriy, a'zo bo'lmaganni "yo'q" deb yoqib shovqin qilmaymiz (check 3 kabi).
    const v902 = D(e, '902')
    const mhtf = mhtfFot(e)
    if (v902 > 0 && mhtf > 0) {
      const expected = mhtf * 0.01
      if (Math.abs(v902 - expected) > 100) {
        add('O‘rta', 'Kasaba badali xato (902)', e, v902, `Kasaba uyushma badali (902) ${f(v902)} — MHTF (${f(mhtf)}) ning 1% i (${f(expected)}) bilan mos emas.`, "Badal bazasi va foizini tekshiring.")
      }
    }

    // 10. Daromad solig'i kam ushlangan: (soliq+inps) ≠ 12%×(jami−061−278imtiyoz), farq>1000.
    //     Bizda tax=max(0,882−883), inps=883 → tax+inps = 882(xom) = JShDS+INPS.
    const taxInps = num(e.tax) + num(e.inps)
    const v061 = V(e, '061')
    const imtiyoz278 = Math.min(v278, CONST.IMTIYOZ_278)
    const base = num(e.tot) - v061 - imtiyoz278
    if (base > 0) {
      const expected = base * CONST.TAX_RATE
      const farq = expected - taxInps
      if (farq > 1000) {
        add('Yuqori', "Daromad solig'i kam ushlangan", e, farq, `Soliq+INPS ${f(taxInps)} — soliqqa tortiladigan (${f(base)}) ning 12% i (${f(expected)}) dan ${f(farq)} kam.`, "Imtiyozlar va soliq bazasini qayta hisoblang.")
      }
    }

    // 11. Ushlanmalar 50%dan oshgan: (889+901+897+899+875)/soliqdan keyingi > 50.5%.
    const otherDed = D(e, '889') + D(e, '901') + D(e, '897') + D(e, '899') + D(e, '875')
    const afterTax = num(e.tot) - taxInps
    if (otherDed > 0 && afterTax > 0) {
      const share = otherDed / afterTax
      if (share > 0.505) {
        add('O‘rta', 'Ushlanmalar 50% dan oshgan', e, otherDed, `Soliqdan keyingi summadan ushlanmalar (aliment, ijro, kredit, 875) ${Math.round(share * 100)}% i.`, "Ushlanma asos hujjatlarini va chegarani tekshiring.")
      }
    }

    // 12. Bitta JSHSHIR — bir necha qator.
    if (e.j && (pinCount.get(e.j) || 0) > 1 && !dupReported.has(e.j)) {
      dupReported.add(e.j)
      add('Yuqori', 'Bitta JSHSHIR — bir necha qator', e, e.tot, `Bitta JSHSHIR vedomostda ${pinCount.get(e.j)} marta uchraydi.`, "Ikki lavozim/korxona yoki dubl yozuv ekanini aniqlang.")
    }

    // 13 va 14 — NDFL-4/5 va INPS hisoboti kerak (rc ulanganda qo'shiladi).
  }
  return F
}

// ════════════════════════════════════════════════════════════════════════
//  14 TA RISK — R massivi + registry (LIST). Maket satr 435-502, HUJJAT §7.
// ════════════════════════════════════════════════════════════════════════
export const RISK_STATUS = {
  bad: 'Xavf aniqlandi',
  chk: 'Tekshirish kerak',
  ok: 'Me’yorda',
  na: 'Ma’lumot yetarli emas'
}

export function computeRisks(emps = [], kpi = {}, { year, month, fmt } = {}) {
  const f = fmt || ((n) => String(Math.round(num(n))))
  const mlnf = (n) => (num(n) / 1e6).toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' mln'
  const MW = minWage(year, month)
  const NORM = num(kpi.norm) || 168
  const E = emps.filter((e) => num(e.tot) > 0)
  const registry = []
  const r2 = (x) => Math.round(num(x) * 100) / 100
  const add = (r, e, d, s) =>
    registry.push({ r, fio: e.fio, lav: e.lav, d, s: r2(s) })

  // 1 — avans (880)
  const av = emps.reduce((a, e) => a + D(e, '880'), 0)

  // 4 — bir xil lavozim, turlicha oklad
  const G = {}
  E.filter((e) => num(e.ok) > 0).forEach((e) => {
    const key = String(e.lav || '').replace(/\s+/g, ' ').trim().toLowerCase().replace('muxandis', 'muhandis')
    ;(G[key] = G[key] || { n: String(e.lav || '').trim(), L: [] }).L.push(e)
  })
  const g4 = Object.values(G)
    .map((g) => ({ n: g.n, L: g.L, ok: [...new Set(g.L.map((e) => Math.round(num(e.ok))))].sort((a, b) => a - b) }))
    .filter((g) => g.ok.length > 1)
    .sort((a, b) => b.ok.length - a.ok.length)

  // 5 — MHTEKMdan kam
  const okVals = E.filter((e) => num(e.ok) > 0).map((e) => num(e.ok))
  const minOk = okVals.length ? Math.min(...okVals) : 0
  const low5 = E.filter((e) => num(e.ok) > 0 && num(e.ok) < MW)
  low5.forEach((e) => add(5, e, `Oklad ${f(e.ok)} < MHTEKM ${f(MW)}`, MW - num(e.ok)))

  // 6 — 160+ soat, 004 < oklad×99.5%
  const r6 = E.filter((e) => num(e.ok) > 0 && num(e.t) >= 160 && V(e, '004') > 0 && V(e, '004') < num(e.ok) * 0.995)
  r6.forEach((e) => add(6, e, `${e.t} soat ishlagan, vaqtbay haq ${f(V(e, '004'))} — okladdan ${f(num(e.ok) - V(e, '004'))} kam`, num(e.ok) - V(e, '004')))

  // 7 — o'rtacha (yashirin bandlik)
  const avg = E.length ? E.reduce((a, e) => a + num(e.tot), 0) / E.length : 0

  // 9 — me'yordan ortiq soat, 072/073 yo'q
  const r9 = E.filter((e) => num(e.t) > NORM && !V(e, '072') && !V(e, '073'))
  r9.forEach((e) => add(9, e, `${e.t} soat — me’yoridan (${NORM}) ${e.t - NORM} soat ko‘p; 072/073 bo‘yicha oshirilgan haq yo‘q`, 0))

  // 10 — ta'til puli / kompensatsiya (032/040)
  const r10 = E.filter((e) => V(e, '032') || V(e, '040'))
  const elapsed = elapsedMonths(month)
  r10.forEach((e) => {
    const v = V(e, '032') + V(e, '040')
    const m = num(e.ytd) / elapsed
    add(10, e, `Ta’til puli ${f(v)} so‘m; yillik oylik o‘rtacha ≈ ${f(m)} — 12 oylik o‘rtacha bilan qayta tekshiring`, v)
  })

  // 11 — ushlanmalar chegaradan oshgan + 875. (emps'ni O'ZGARTIRMAYMIZ — getter toza.)
  const r11 = []
  E.forEach((e) => {
    const all = totalWithheld(e)
    const hasAliment = D(e, '889') || D(e, '901')
    const lim = hasAliment ? CONST.DED_LIMIT_ALIMENT : CONST.DED_LIMIT
    const sh = num(e.tot) ? all / num(e.tot) : 0
    if (sh > lim + 0.005) {
      r11.push(e)
      add(11, e, `Ushlanmalar ${Math.round(sh * 100)}% — chegara ${lim * 100}%`, all - lim * num(e.tot))
    }
    if (D(e, '875')) add(11, e, `Ortiqcha to‘langan moddiy yordam ushlab qolingan (875): ${f(D(e, '875'))} so‘m`, D(e, '875'))
  })
  const n875 = E.filter((e) => D(e, '875')).length

  const cards = [
    { b: "1-blok: To‘lov muddatlari va davriyligi", n: 1, t: "Ish haqining oyiga bir marta to‘lanishi", st: av ? 'ok' : 'bad', f: av ? `Avans ushlanmasi (880) bor: ${mlnf(av)}.` : `Vedomostda avans (880) hech kimga ko‘rsatilmagan, kartaga oylik bitta summada o‘tkazilgan (${mlnf(kpi.card)}). Ish haqi oyiga bir marta to‘langan bo‘lishi mumkin.`, a: "MK 253-modda: ish haqi yarim oyda kamida bir marta (avans va qolgan qismi, oraliq 16 kundan oshmasin). Bank to‘lov topshiriqnomalari bilan tasdiqlang." },
    { b: "1-blok: To‘lov muddatlari va davriyligi", n: 2, t: "To‘lovlarning kechiktirilishi", st: 'na', f: "Vedomostda to‘lov sanasi yo‘q — kechikishni aniqlab bo‘lmaydi.", a: "MK 333-modda: kechiktirilgan har bir kun uchun MB qayta moliyalash stavkasining 10% miqdorida kompensatsiya. Bank to‘lov sanalarini qo‘shish kerak." },
    { b: "1-blok: To‘lov muddatlari va davriyligi", n: 3, t: "Dam olish kuni arafasida to‘lanmaslik", st: 'na', f: "To‘lov sanalari ma’lumoti yo‘q.", a: "To‘lov kuni dam olish/bayramga to‘g‘ri kelsa, oldingi ish kunida to‘lash. To‘lov kalendarini yuriting." },
    { b: "2-blok: Kamsitish va tariflarga nomuvofiqlik", n: 4, t: "Bir xil lavozimga turlicha maosh", st: g4.length ? 'chk' : 'ok', f: g4.length ? `${g4.length} ta lavozimda turlicha oklad: ` + g4.slice(0, 4).map((g) => `${g.n} — ${g.ok.length} xil (${mlnf(g.ok[0])}–${mlnf(g.ok[g.ok.length - 1])})`).join('; ') + '.' : "Bir xil lavozimlarda oklad bir xil.", a: "Farq razryad, toifa yoki staj bilan asoslanganini shtat jadvali va buyruqlar bilan tekshiring." },
    { b: "2-blok: Kamsitish va tariflarga nomuvofiqlik", n: 5, t: "MHTEKMdan kam to‘lanishi", st: low5.length ? 'bad' : 'ok', f: low5.length ? `${low5.length} xodim oklad MHTEKM (${f(MW)} so‘m) dan kam.` : `Eng kichik oklad ${mlnf(minOk)} — MHTEKM (${f(MW)} so‘m) dan ${minOk ? (minOk / MW).toFixed(1) : 0} barobar.`, a: "2026-yil 1-sentyabrdan MHTEKM 1 360 000 so‘m — sentyabr hisobida ham tekshiring." },
    { b: "2-blok: Kamsitish va tariflarga nomuvofiqlik", n: 6, t: "Shtat jadvalidan kam to‘lanishi", st: r6.length ? 'chk' : 'ok', f: r6.length ? `${r6.length} xodim 160+ soat ishlagan, lekin vaqtbay haqi okladdan kam (${r6.map((e) => short(e.fio)).join(', ')}).` : "Topilmadi.", a: "Shtat jadvali bilan solishtiring; tabeldagi soatlarni tekshiring." },
    { b: "3-blok: Bandlikning yashirin shakllari", n: 7, t: "Ish haqining yashirin to‘lanishi", st: avg >= CONST.SECTOR * 0.8 ? 'ok' : 'chk', f: `O‘rtacha hisoblangan ${mlnf(avg)} — “Transport va saqlash” tarmog‘ida o‘rtacha ${mlnf(CONST.SECTOR)} dan ${avg >= CONST.SECTOR ? 'yuqori' : 'past'}.`, a: "Soliq qo‘mitasi mezoni: o‘rtacha ish haqi tarmoqdan ancha past bo‘lmasligi. Oylar kesimida kuzating." },
    { b: "3-blok: Bandlikning yashirin shakllari", n: 8, t: "Mehnat shartnomasini FHSh bilan almashtirish", st: 'na', f: "NDFL-4 shartnoma turi va 047-tur to‘lovi kerak (hisobot ulangach aniqlanadi).", a: "Barcha shartnomalar Yagona milliy mehnat tizimida ro‘yxatdan o‘tganini tekshiring." },
    { b: "4-blok: Ish vaqti hisobi va ushlanmalar", n: 9, t: "Ish vaqtidan tashqari ish uchun oshirilgan haq", st: r9.length ? 'chk' : 'ok', f: r9.length ? `${r9.length} xodim me’yordan (${NORM} soat) ko‘p ishlagan, 072/073-turlar bo‘yicha to‘lov yo‘q.` : "Topilmadi.", a: "Jamlangan ish vaqti hisobi qo‘llanmagan bo‘lsa, ortiqcha soatlar ikki hissa to‘lanadi. Grafik va tabelni tekshiring." },
    { b: "4-blok: Ish vaqti hisobi va ushlanmalar", n: 10, t: "O‘rtacha ish haqining noto‘g‘ri hisoblanishi", st: r10.length ? 'chk' : 'ok', f: `${r10.length} xodimga ta’til puli yoki kompensatsiya (032/040) hisoblangan — jami ${mlnf(r10.reduce((a, e) => a + V(e, '032') + V(e, '040'), 0))}.`, a: "12 oylik o‘rtacha ish haqiga mukofot, ustama va indeksatsiya to‘g‘ri kiritilganini qayta hisoblang." },
    { b: "4-blok: Ish vaqti hisobi va ushlanmalar", n: 11, t: "Ish haqidan ortiqcha ushlab qolish", st: r11.length || n875 ? 'bad' : 'ok', f: (r11.length ? `${r11.length} xodimda ushlanmalar chegaradan (50%, aliment/ijro hujjatida 70%) oshgan.` : "Hech bir xodimda ushlanmalar chegaradan oshmagan.") + ` Lekin ${n875} xodimdan ortiqcha to‘langan moddiy yordam ushlab qolingan (875).`, a: "Ortiqcha to‘langan summa faqat hisoblash xatosi yoki xodim aybi isbotlanganda ushlanadi — asos hujjatini tekshiring." },
    { b: "4-blok: Ish vaqti hisobi va ushlanmalar", n: 12, t: "Hisob-kitob varaqalarining berilmasligi", st: 'na', f: "Vedomostda ma’lumot yo‘q.", a: "Har to‘lovda hisoblangan va ushlangan summalar ko‘rsatilgan hisob-kitob varaqasini berish (HRM PRO orqali elektron)." },
    { b: "5-blok: Institutsional va sug‘urta risklari", n: 13, t: "Ish haqining indeksatsiya qilinmasligi", st: 'na', f: "Bir oylik ma’lumot — oklad o‘zgarishini kuzatib bo‘lmaydi. 2026-yil 1-sentyabrdan davlat sektorida ish haqi 7% oshirilgan.", a: "Indeksatsiya tartibini ichki hujjatda belgilash va bajarilishini oylar kesimida nazorat qilish." },
    { b: "5-blok: Institutsional va sug‘urta risklari", n: 14, t: "Ish beruvchi javobgarligini majburiy sug‘urta qilish", st: 'na', f: "Sug‘urta polisi ma’lumoti yo‘q.", a: "Majburiy sug‘urta polisi amalda ekanini tekshirish; mehnatda shikastlanish (274) to‘lovini sug‘urta orqali qoplash imkoniyatini ko‘rish." }
  ]

  return { cards, registry, derived: { av, g4, minOk, low5, r6, avg, r9, r10, r11, n875, NORM, MW, E } }
}
