// Backend hali ulanmagan — shu fayl vaqtincha "API" vazifasini bajaradi.
// Backend ulanganda faqat useLiveChat.js dagi funksiyalar server chaqiruvlariga
// almashtiriladi, komponentlar (Sidebar/Window/Bubble/Input) o'zgarmaydi.

// Rasm xabari uchun tarmoqsiz (offline-safe) namuna — tashqi URL'ga bog'lanmaydi.
const placeholderImage = (bg, text) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">
      <rect width="100%" height="100%" fill="${bg}"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="22" fill="#ffffff"
        text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`
  )}`

// Boshqa foydalanuvchidan kelgan hujjat namunasi — real Blob, shuning uchun
// "yuklab olish" tugmasi demo rejimda ham ishlaydi.
const demoFileUrl = (name, content) =>
  URL.createObjectURL(new Blob([content], { type: 'text/plain' }))

export const CURRENT_USER_ID = 'me'

export const USERS = [
  {
    id: 1,
    lastName: 'Karimov',
    firstName: 'Aziz',
    middleName: 'Botirovich',
    position: 'Bosh mutaxassis',
    photo: null,
    phone: '901234567',
    online: true
  },
  {
    id: 2,
    lastName: 'Yusupova',
    firstName: 'Dilnoza',
    middleName: 'Sherzodovna',
    position: 'HR menejer',
    photo: null,
    phone: '933457890',
    online: true
  },
  {
    id: 3,
    lastName: 'Rashidov',
    firstName: 'Jasur',
    middleName: 'Anvarovich',
    position: 'Buxgalter',
    photo: null,
    phone: '971112233',
    online: false,
    lastSeenAt: '2026-09-17T16:42:00'
  },
  {
    id: 4,
    lastName: 'Nazarova',
    firstName: 'Malika',
    middleName: 'Farxodovna',
    position: "Ta'lim bo'limi",
    photo: null,
    phone: '909876543',
    online: false,
    lastSeenAt: '2026-09-16T09:05:00'
  },
  {
    id: 5,
    lastName: 'Tursunov',
    firstName: 'Bekzod',
    middleName: 'Ilhomovich',
    position: 'Turniket operatori',
    photo: null,
    phone: '993334455',
    online: true
  },
  {
    id: 6,
    lastName: 'Ergasheva',
    firstName: 'Nilufar',
    middleName: 'Davronovna',
    position: 'Kadrlar bo\'limi',
    photo: null,
    phone: '946665577',
    online: false,
    lastSeenAt: '2026-09-15T11:20:00'
  }
]

const now = Date.now()
const minutesAgo = (m) => new Date(now - m * 60 * 1000).toISOString()

export const INITIAL_MESSAGES = {
  1: [
    { id: 'm1-1', senderId: 1, type: 'text', text: 'Assalomu alaykum! Ertangi yig\'ilish soat nechida?', createdAt: minutesAgo(180) },
    { id: 'm1-2', senderId: CURRENT_USER_ID, type: 'text', text: 'Vaalaykum assalom, soat 10:00 da, 3-qavat majlislar zalida.', createdAt: minutesAgo(178), status: 'read' },
    { id: 'm1-3', senderId: 1, type: 'text', text: 'Rahmat, albatta boraman.', createdAt: minutesAgo(175) },
    {
      id: 'm1-4',
      senderId: 1,
      type: 'image',
      fileUrl: placeholderImage('#1279f0', 'Yig\'ilish tartibi.png'),
      fileName: "Yig'ilish_tartibi.png",
      fileSize: 245000,
      createdAt: minutesAgo(60)
    }
  ],
  2: [
    { id: 'm2-1', senderId: 2, type: 'text', text: "Yangi xodim uchun hujjatlar tayyor bo'ldi.", createdAt: minutesAgo(50) },
    {
      id: 'm2-2',
      senderId: 2,
      type: 'file',
      fileUrl: demoFileUrl('Ariza.docx', "Demo hujjat matni — backend ulanganda haqiqiy fayl bilan almashtiriladi."),
      fileName: 'Ariza_namunasi.docx',
      fileSize: 58200,
      createdAt: minutesAgo(49)
    },
    { id: 'm2-3', senderId: CURRENT_USER_ID, type: 'text', text: 'Ko\'rib chiqaman, rahmat!', createdAt: minutesAgo(45), status: 'read' }
  ],
  3: [
    { id: 'm3-1', senderId: 3, type: 'text', text: 'Oylik hisobot bo\'yicha savolim bor edi.', createdAt: minutesAgo(600) },
    { id: 'm3-2', senderId: CURRENT_USER_ID, type: 'text', text: 'Marhamat, tinglayman.', createdAt: minutesAgo(590), status: 'read' }
  ],
  4: [
    { id: 'm4-1', senderId: 4, type: 'text', text: "Kurs sertifikatlari tayyor, qachon yuborsam bo'ladi?", createdAt: minutesAgo(1400) }
  ],
  5: [
    { id: 'm5-1', senderId: CURRENT_USER_ID, type: 'text', text: 'Kirish qurilmasi ishlamayapti, tekshirib ko\'ring.', createdAt: minutesAgo(20), status: 'sent' },
    { id: 'm5-2', senderId: 5, type: 'text', text: "Xo'p, hozir boraman.", createdAt: minutesAgo(18) }
  ],
  6: []
}

// "Onlayn" foydalanuvchi javob berayotganday tuyulishi uchun — faqat demo maqsadida.
export const AUTO_REPLIES = [
  'Xo\'p, tushundim.',
  'Rahmat, hozir ko\'rib chiqaman.',
  'Albatta, biroz kuting.',
  "Ha, to'g'ri."
]
