/**
 * «Foydalanuvchilar faolligi» (Figma node 3831:81221) — backend endpointi hali
 * yo'q, shu sababli bob to'liq shu fayldagi ma'lumotdan chiziladi. Endpoint
 * paydo bo'lganda javob shu shaklda kelsa, komponentlarga tegmasdan faqat
 * manba almashtiriladi.
 *
 * Kunlik qiymatlar maketdagi ustun balandliklaridan olingan (1px = 4 amal),
 * yig'indisi maketdagi «Jami amallar» (11 850) ga teng.
 */
import avatar from '@/assets/icons/hrmDashboard/activity/avatar.png'

/** Amal turlari — ustun ichida pastdan yuqoriga shu tartibda chiziladi. */
export const ActionType = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  CREATE: 'create'
}

export const actionTypes = [
  { key: ActionType.ADD, label: 'dashboardPage.activity.types.add', color: 'bg-fig-green' },
  { key: ActionType.EDIT, label: 'dashboardPage.activity.types.edit', color: 'bg-fig-brand' },
  { key: ActionType.DELETE, label: 'dashboardPage.activity.types.delete', color: 'bg-fig-red' },
  { key: ActionType.CREATE, label: 'dashboardPage.activity.types.create', color: 'bg-fig-purple' }
]

// [qo'shish, tahrirlash, o'chirish, yaratish] — oyning 1..31-kunlari
const DAILY = [
  [10, 25, 11, 9],
  [7, 18, 8, 7],
  [101, 252, 114, 94],
  [95, 235, 107, 88],
  [99, 245, 111, 91],
  [89, 222, 100, 83],
  [85, 212, 96, 79],
  [11, 28, 13, 11],
  [6, 16, 7, 6],
  [104, 259, 117, 96],
  [98, 242, 110, 90],
  [100, 249, 113, 93],
  [109, 271, 123, 101],
  [126, 319, 141, 119],
  [12, 30, 14, 11],
  [8, 19, 9, 7],
  [100, 248, 112, 92],
  [94, 233, 105, 87],
  [95, 237, 107, 88],
  [92, 229, 104, 85],
  [88, 218, 99, 81],
  [11, 26, 12, 10],
  [7, 17, 8, 6],
  [101, 251, 114, 93],
  [96, 239, 108, 89],
  [98, 243, 110, 91],
  [92, 228, 103, 85],
  [85, 212, 96, 79],
  [9, 23, 11, 9],
  [6, 15, 7, 6],
  [106, 263, 119, 91]
]

const toCounts = ([add, edit, del, create]) => ({ add, edit, delete: del, create })

/** Tanlangan oyning kunlik amallari (`days` — oydagi kunlar soni). */
export const buildDaily = (days) =>
  DAILY.slice(0, days).map((row, idx) => ({ day: idx + 1, ...toCounts(row) }))

export const rolesMock = [
  { name: 'Kadrlar inspektori', count: 4620 },
  { name: "Bo'lim boshlig'i", count: 2870 },
  { name: 'Tabelchi', count: 1940 },
  { name: 'Bosh mutaxassis', count: 1460 },
  { name: 'Administrator', count: 960 }
]

/** Tizimdagi jami mas'ullar soni («86 / 112» dagi maxraj). */
export const totalUsersMock = 112

// Oxirgi faollik — joriy vaqtga nisbatan (`daysAgo`, `HH:mm`), shunda «Bugun» /
// «Kecha» yozuvlari har kuni to'g'ri chiqadi.
const at = (daysAgo, time) => {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

// Mock otasining ismi — ayollar familiyasi «-a» bilan tugaydi.
const PATRONYMICS = ['Rustam', 'Akmal', 'Bahodir', 'Shavkat', 'Olim']
const middleName = (id, lastName) =>
  `${PATRONYMICS[id % PATRONYMICS.length]}${/a$/.test(lastName) ? 'ovna' : 'ovich'}`

const user = (id, lastName, firstName, position, department, counts, lastActivity) => ({
  id,
  last_name: lastName,
  first_name: firstName,
  middle_name: middleName(id, lastName),
  photo: avatar,
  position,
  department,
  ...toCounts(counts),
  last_activity: lastActivity
})

export const usersMock = [
  user(
    1,
    'Karimova',
    'Dilnoza',
    'Kadrlar inspektori',
    'Markaziy apparat',
    [110, 275, 122, 105],
    at(0, '11:40')
  ),
  user(
    2,
    'Toshmatov',
    'Jasur',
    'Kadrlar inspektori',
    'Toshkent MTU',
    [106, 264, 117, 100],
    at(0, '10:52')
  ),
  user(
    3,
    'Rahimova',
    'Nigora',
    'Bosh mutaxassis',
    'Buxoro MTU',
    [98, 245, 109, 92],
    at(0, '09:31')
  ),
  user(
    4,
    'Yusupov',
    'Sardor',
    'Kadrlar inspektori',
    'Buxoro MTU',
    [99, 234, 104, 84],
    at(0, '11:05')
  ),
  user(
    5,
    'Abdullayeva',
    'Malika',
    'Mutaxassis',
    'Markaziy apparat',
    [95, 224, 99, 80],
    at(0, '08:47')
  ),
  user(
    6,
    'Ergashev',
    'Bobur',
    'Kadrlar inspektori',
    'Qarshi MTU',
    [90, 214, 96, 76],
    at(1, '16:12')
  ),
  user(
    7,
    'Xolmatova',
    'Zarina',
    'Yetakchi mutaxassis',
    'Toshkent MTU',
    [86, 205, 91, 73],
    at(0, '10:15')
  ),
  user(8, 'Qodirov', 'Aziz', 'Mutaxassis', 'Termiz MTU', [82, 194, 86, 69], '2026-09-23T09:00:00'),
  user(
    9,
    'Nazarova',
    'Gulnora',
    'Kadrlar inspektori',
    "Qo'qon MTU",
    [78, 184, 82, 66],
    at(0, '09:20')
  ),
  user(10, 'Sobirov', "Ulug'bek", 'Mutaxassis', 'Buxoro MTU', [74, 176, 79, 63], at(1, '18:03')),
  user(11, 'Mirzayev', 'Otabek', 'Tabelchi', 'Qarshi MTU', [72, 170, 76, 61], at(1, '15:40')),
  user(12, 'Hamidova', 'Shahnoza', 'Mutaxassis', 'Termiz MTU', [69, 163, 73, 58], at(0, '08:12')),
  user(
    13,
    'Rustamov',
    'Jahongir',
    "Bo'lim boshlig'i",
    'Markaziy apparat',
    [66, 156, 70, 56],
    at(2, '17:25')
  ),
  user(14, 'Aliyeva', 'Madina', 'Tabelchi', 'Toshkent MTU', [63, 149, 67, 53], at(0, '10:02')),
  user(
    15,
    'Saidov',
    'Sherzod',
    'Kadrlar inspektori',
    "Qo'qon MTU",
    [60, 142, 64, 51],
    at(1, '11:48')
  ),
  user(
    16,
    "Po'latova",
    'Feruza',
    'Bosh mutaxassis',
    'Buxoro MTU',
    [57, 135, 61, 48],
    at(3, '14:30')
  ),
  user(
    17,
    'Nurmatov',
    'Doston',
    'Administrator',
    'Markaziy apparat',
    [54, 128, 58, 46],
    at(0, '09:05')
  ),
  user(18, "Jo'rayeva", 'Kamola', 'Mutaxassis', 'Qarshi MTU', [51, 121, 55, 43], at(2, '12:16')),
  user(19, 'Tursunov', 'Akmal', 'Tabelchi', 'Termiz MTU', [48, 114, 51, 41], at(1, '09:55')),
  user(
    20,
    'Ismoilova',
    'Sevara',
    "Bo'lim boshlig'i",
    'Toshkent MTU',
    [45, 107, 48, 38],
    at(4, '16:40')
  )
]

/**
 * Xodim modali (Figma node 3871:63669) — so'nggi 30 kunlik faollik va oxirgi
 * amallar. Qiymatlar maketdagi ustunlardan olingan, xodimning jami amaliga
 * mutanosib ravishda o'lchanadi (maketdagi xodim — 612 amal).
 */
const WORKDAY_VALUES = [
  38, 41, 36, 39, 39, 40, 39, 40, 37, 42, 40, 44, 42, 38, 44, 41, 58, 43, 36, 38, 40
]
const OFFDAY_VALUES = [4, 0, 0, 6, 0, 0, 0, 3, 0]
// Bayram kunlari (oy-kun)
const HOLIDAYS = ['01-01', '03-08', '03-21', '05-09', '09-01', '10-01', '12-08']

const pad = (n) => String(n).padStart(2, '0')

export const isOffDay = (date) => {
  const wd = date.getDay()
  return (
    wd === 0 || wd === 6 || HOLIDAYS.includes(`${pad(date.getMonth() + 1)}-${pad(date.getDate())}`)
  )
}

const LOGS = [
  {
    type: 'edit',
    title: "Xodim ma'lumotlari tahrirlandi",
    detail: 'Aliyev Sherzod · Lavozim: katta mashinist',
    ago: [0, '16:24']
  },
  {
    type: 'create',
    title: 'Buyruq yaratildi',
    detail: "№ 412-K · Ta'til berish",
    ago: [0, '14:10']
  },
  {
    type: 'add',
    title: 'Hujjat yuklandi',
    detail: 'Mehnat shartnomasi.pdf · Olimov Behruz',
    ago: [0, '11:37']
  },
  {
    type: 'add',
    title: "Yangi xodim qo'shildi",
    detail: 'Olimov Behruz · Toshkent MTU',
    ago: [1, '17:52']
  },
  {
    type: 'delete',
    title: "Hujjat o'chirildi",
    detail: "Eski ma'lumotnoma.pdf · Saidov Anvar",
    ago: [1, '09:15']
  }
]

export const buildUserActivity = (person, days = 30) => {
  const factor = (person?.total || 612) / 612
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  let work = 0
  let off = 0
  const daily = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end)
    date.setDate(end.getDate() - i)
    const offDay = isOffDay(date)
    const base = offDay
      ? OFFDAY_VALUES[off++ % OFFDAY_VALUES.length]
      : WORKDAY_VALUES[work++ % WORKDAY_VALUES.length]
    daily.push({ date, value: Math.round(base * factor), off: offDay })
  }
  const logs = LOGS.map((log, idx) => ({ id: idx + 1, ...log, at: at(...log.ago) }))
  return { daily, logs, updatedAt: at(0, '10:42') }
}
