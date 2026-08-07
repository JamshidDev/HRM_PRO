// Permission tizimining ichki muvofiqligini tekshiradi.
// Ishga tushirish: node scripts/check-permissions.mjs   (yoki npm run check:permissions)
//
// Nima uchun kerak: ruxsat slug'lari to'rt joyda yashaydi —
//   1) src/utils/AppPermissions.js   — frontend konstantalari
//   2) src/utils/permissionGroups.js — ENFORCED (backend) / MEANINGFUL / rol formasi guruhlari
//   3) src/layouts/data/navigations.js — menyu va route qo'riqchisi
//   4) src/pages/**                  — sahifadagi tekshiruvlar
// Ular qo'lda sinxronlanadi, shuning uchun jimgina bir-biridan uzoqlashadi:
// menyu ko'rinadi-yu sahifa 403 beradi, yoki backend enforce qiladigan ruxsatni
// adminning berish imkoni bo'lmaydi. Quyidagi tekshiruvlar shu sinfni ushlaydi.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join, relative } from 'node:path'

import { appPermissions } from '../src/utils/AppPermissions.js'
import { ENFORCED, MEANINGFUL, PERMISSION_GROUPS, ACTION_ORDER } from '../src/utils/permissionGroups.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const NAV_FILE = resolve(ROOT, 'src/layouts/data/navigations.js')
const SRC_DIR = resolve(ROOT, 'src')

// ---------------------------------------------------------------- yordamchilar

const problems = []
const report = (check, message) => problems.push({ check, message })

const slugByKey = appPermissions
const keyBySlug = new Map(Object.entries(appPermissions).map(([k, v]) => [v, k]))

/** Menyu ko'rinishi qoidasi — SidebarContent/router bilan bir xil: bare YOKI '-read'. */
const viewable = (slug) => MEANINGFUL.has(slug) || MEANINGFUL.has(`${slug}-read`)

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(vue|js)$/.test(entry)) out.push(full)
  }
  return out
}

/** Izohga olingan qatorlarni tashlab yuboradi — o'chirilgan menyu bandlari hisobga olinmasin. */
const stripComments = (text) =>
  text
    .split('\n')
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n')

// -------------------------------------------------- 1. appPermissions.X mavjudmi

// `accStore.pn.X`, `store.pn.X`, `appPermissions.X` — hammasi bitta obyektga ishora qiladi.
const REFERENCE_RE = /(?:\bpn|\bappPermissions)\.([A-Za-z0-9_]+)/g

const files = walk(SRC_DIR)
/** kalit -> unga murojaat qilgan fayllar */
const referencedKeys = new Map()

for (const file of files) {
  const text = stripComments(readFileSync(file, 'utf8'))
  for (const [, key] of text.matchAll(REFERENCE_RE)) {
    if (!referencedKeys.has(key)) referencedKeys.set(key, new Set())
    referencedKeys.get(key).add(relative(ROOT, file))
  }
}

for (const [key, where] of referencedKeys) {
  if (!(key in slugByKey)) {
    report(
      'unknown-constant',
      `appPermissions.${key} mavjud emas — ${[...where].slice(0, 3).join(', ')}`
    )
  }
}

// ------------------------------------- 2. sahifada ishlatilgan slug grant qilinadimi

// navigations.js bu yerdan chiqarib tashlanadi: u menyu ko'rinishini bildiradi va
// bare/'-read' qoidasi bo'yicha 3-tekshiruvda alohida (to'g'riroq) baholanadi.
const NAV_REL = relative(ROOT, NAV_FILE)

for (const [key, where] of referencedKeys) {
  const slug = slugByKey[key]
  if (!slug) continue // 1-tekshiruvda xabar berilgan
  const runtimeUsers = [...where].filter((f) => f !== NAV_REL)
  if (runtimeUsers.length === 0) continue
  // Amal qo'shimchasi bo'lmagan slug — bu "ko'rinish identifikatori", u
  // `canView` orqali tekshiriladi (bare YOKI '-read'), shuning uchun yumshoqroq qoida.
  const hasActionSuffix = ACTION_ORDER.some((a) => slug.endsWith(`-${a}`))
  const ok = hasActionSuffix ? MEANINGFUL.has(slug) : viewable(slug)
  if (!ok) {
    report(
      'unmeaningful-usage',
      `'${slug}' (pn.${key}) frontendda tekshiriladi, lekin MEANINGFUL emas — adminda berish yo'li yo'q. ${runtimeUsers.slice(0, 2).join(', ')}`
    )
  }
}

// ------------------------------------------------ 3. navigations.js slug'lari

const navText = stripComments(readFileSync(NAV_FILE, 'utf8'))
const navKeys = [...navText.matchAll(/permission:\s*appPermissions\.([A-Za-z0-9_]+)/g)].map(
  (m) => m[1]
)
const uniqueNavKeys = [...new Set(navKeys)]

for (const key of uniqueNavKeys) {
  const slug = slugByKey[key]
  if (!slug) continue // 1-tekshiruv
  if (!viewable(slug)) {
    report(
      'nav-not-grantable',
      `navigations.js: '${slug}' (pn.${key}) — na o'zi, na '${slug}-read' MEANINGFUL. Bu menyu bandini hech kimga berib bo'lmaydi.`
    )
  }
}

// --------------------------------- 4. ENFORCED slug rol formasida beriladimi

// createForm.vue dagi `mappedNames` bilan bir xil: guruh prefiksi + har amal + custom actions.
const mappedNames = new Set()
for (const mod of PERMISSION_GROUPS) {
  for (const g of mod.groups) {
    mappedNames.add(g.prefix)
    for (const a of ACTION_ORDER) mappedNames.add(`${g.prefix}-${a}`)
    if (g.actions) for (const a of g.actions) mappedNames.add(a.slug)
  }
}

for (const slug of ENFORCED) {
  // Guruh orqali chiziladi
  if (mappedNames.has(slug)) continue
  // Yoki "Boshqa" tabiga tushadi
  if (MEANINGFUL.has(slug)) continue
  report(
    'enforced-ungrantable',
    `'${slug}' backend'da enforce qilinadi, lekin rol formasida ko'rinmaydi (guruhga ham, "Boshqa"ga ham tushmaydi).`
  )
}

// ------------------------- 5. guruh prefiksi haqiqiy slug'ga mos keladimi

for (const mod of PERMISSION_GROUPS) {
  // `integration` guard'i uchun MEANINGFUL/ENFORCED to'plamlari ma'lumot bermaydi:
  // ular sanctum sluglaridan yig'ilgan. Rol formasi bu guard'da switchlarni to'g'ridan
  // to'g'ri API qaytargan ro'yxatdan chizadi (createForm.vue `isIntegrationGuard`),
  // shuning uchun bu yerda tekshirmaymiz.
  if ((mod.guard ?? 'sanctum') === 'integration') continue

  for (const g of mod.groups) {
    const candidates = [g.prefix, ...ACTION_ORDER.map((a) => `${g.prefix}-${a}`)]
    const anyReal = candidates.some((s) => MEANINGFUL.has(s) || ENFORCED.has(s))
    const hasActions = Array.isArray(g.actions) && g.actions.length > 0
    if (!anyReal && !hasActions) {
      report(
        'dead-group',
        `PERMISSION_GROUPS[${mod.module}] '${g.prefix}' — hech bir varianti MEANINGFUL/ENFORCED emas, guruh hech qachon chizilmaydi.`
      )
    }
  }
}

// --------------------------------------------------------------- 6. *Delete qamrovi

for (const slug of ENFORCED) {
  if (!slug.endsWith('-delete')) continue
  if (!keyBySlug.has(slug)) {
    report(
      'missing-delete-constant',
      `'${slug}' enforce qilinadi, lekin AppPermissions.js da konstantasi yo'q — frontend uni hech qachon tekshira olmaydi.`
    )
  }
}

// ------------------------------------------------------------------- natija

const byCheck = new Map()
for (const p of problems) {
  if (!byCheck.has(p.check)) byCheck.set(p.check, [])
  byCheck.get(p.check).push(p.message)
}

const TITLES = {
  'unknown-constant': "Mavjud bo'lmagan appPermissions kaliti",
  'unmeaningful-usage': 'Frontend tekshiradi, lekin berib bo\'lmaydi',
  'nav-not-grantable': 'Menyu bandini berib bo\'lmaydi',
  'enforced-ungrantable': 'Backend enforce qiladi, rol formasida yo\'q',
  'dead-group': "Hech qachon chizilmaydigan guruh",
  'missing-delete-constant': "Yetishmayotgan *Delete konstantasi"
}

if (problems.length === 0) {
  console.log('✓ Permission muvofiqligi: muammo topilmadi.')
  process.exit(0)
}

for (const [check, messages] of byCheck) {
  console.log(`\n── ${TITLES[check] ?? check} (${messages.length})`)
  for (const m of messages) console.log(`   • ${m}`)
}
console.log(`\n${problems.length} ta muammo topildi.`)
process.exit(1)
