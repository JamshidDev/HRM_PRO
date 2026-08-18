// Telegram log botining chat_id va topic (message_thread_id) larini topadi.
// Ishga tushirish: node scripts/telegram-chat-info.mjs   (yoki npm run telegram:info)
//
// Nima uchun kerak: frontend xatolari guruhning "website" topic'iga yuboriladi
// (src/utils/errorReporter.js). Buning uchun ikkita raqam kerak — guruh chat_id si
// va topic'ning message_thread_id si. Ularni Telegram faqat getUpdates javobida
// beradi, shuning uchun shu skript.
//
// Bosqichlar:
//   1) Botni guruhga qo'shing (topic'lar yoqilgan supergroup bo'lsin).
//   2) "website" topic'iga bitta xabar yozing (masalan "test") — bot ko'rishi uchun.
//   3) node scripts/telegram-chat-info.mjs --token=<BOT_TOKEN>
//   4) Chiqqan id larni .env ga yozing va tekshiring:
//      node scripts/telegram-chat-info.mjs --send="test" --chat=<id> --topic=<id>
//
// Eslatma: getUpdates faqat oxirgi ~24 soatlik yangilanishlarni beradi va webhook
// o'rnatilgan bo'lsa umuman ishlamaydi. Bot guruhda "privacy mode" da bo'lsa,
// oddiy xabarlarni ko'rmaydi — BotFather → /setprivacy → Disable.

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const { fetch } = globalThis
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENV_FILES = ['.env', '.env.production', '.env.development']

// ---------------------------------------------------------------- yordamchilar

const arg = (name) => {
  const prefix = `--${name}=`
  const found = process.argv.slice(2).find((item) => item.startsWith(prefix))
  return found ? found.slice(prefix.length).replace(/^["']|["']$/g, '') : ''
}

// .env fayllardan bitta kalitni o'qiydi (dependency'siz, oddiy KEY=VALUE).
const fromEnvFiles = (key) => {
  for (const file of ENV_FILES) {
    const path = resolve(ROOT, file)
    if (!existsSync(path)) continue
    const line = readFileSync(path, 'utf-8')
      .split('\n')
      .map((row) => row.trim())
      .filter((row) => !row.startsWith('#'))
      .find((row) => row.replace(/\s/g, '').startsWith(`${key}=`))
    if (!line) continue
    const value = line
      .slice(line.indexOf('=') + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (value) return value
  }
  return ''
}

const api = async (token, method, payload) => {
  const url = `https://api.telegram.org/bot${token}/${method}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  })
  const data = await response.json()
  if (!data.ok) {
    throw new Error(`${method}: ${data.description || response.status}`)
  }
  return data.result
}

const fail = (message) => {
  console.error(`\n❌ ${message}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------- asosiy oqim

const token =
  arg('token') || process.env.VITE_TG_LOG_BOT_TOKEN || fromEnvFiles('VITE_TG_LOG_BOT_TOKEN')

if (!token) {
  fail('Token topilmadi. --token=<BOT_TOKEN> bering yoki .env ga VITE_TG_LOG_BOT_TOKEN=... yozing.')
}

const me = await api(token, 'getMe').catch((error) => fail(error.message))
console.log(`\n🤖 Bot: @${me.username} (id=${me.id})`)

// --send rejimi: kanal ishlayotganini tekshirish.
const testText = arg('send')
if (testText) {
  const chatId =
    arg('chat') || process.env.VITE_TG_LOG_CHAT_ID || fromEnvFiles('VITE_TG_LOG_CHAT_ID')
  const topicId =
    arg('topic') || process.env.VITE_TG_LOG_TOPIC_ID || fromEnvFiles('VITE_TG_LOG_TOPIC_ID')
  if (!chatId) fail("--chat=<chat_id> bering (yoki .env da VITE_TG_LOG_CHAT_ID bo'lsin).")

  const payload = { chat_id: chatId, text: `✅ ${testText}`, parse_mode: 'HTML' }
  if (topicId) payload.message_thread_id = Number(topicId)

  await api(token, 'sendMessage', payload).catch((error) => fail(error.message))
  console.log(`\n✅ Xabar yuborildi → chat ${chatId}${topicId ? `, topic ${topicId}` : ''}\n`)
  process.exit(0)
}

const updates = await api(token, 'getUpdates', { limit: 100, timeout: 0 }).catch((error) =>
  fail(error.message)
)

if (!updates.length) {
  console.log(
    [
      '',
      "⚠️  getUpdates bo'sh qaytdi. Sabablari:",
      "   • botga/topic'ga hali xabar yozilmagan (yozing va qayta ishga tushiring)",
      '   • xabar 24 soatdan eski',
      "   • botda webhook o'rnatilgan (getUpdates ishlamaydi)",
      '   • guruhda privacy mode yoqiq (BotFather → /setprivacy → Disable, keyin botni',
      "     guruhdan chiqarib qayta qo'shing)",
      ''
    ].join('\n')
  )
  process.exit(0)
}

// chat_id -> { title, type, topics: Map(threadId -> nom/namuna) }
const chats = new Map()

for (const update of updates) {
  const message = update.message || update.edited_message || update.channel_post
  if (!message?.chat) continue

  const chat = message.chat
  if (!chats.has(chat.id)) {
    chats.set(chat.id, {
      title: chat.title || chat.username || chat.first_name || '—',
      type: chat.type,
      topics: new Map()
    })
  }

  const threadId = message.message_thread_id
  if (!threadId) continue

  const name =
    message.forum_topic_created?.name ||
    chats.get(chat.id).topics.get(threadId) ||
    (message.text ? `xabar: "${message.text.slice(0, 40)}"` : 'nomaʼlum')
  chats.get(chat.id).topics.set(threadId, name)
}

console.log(`\n📋 Topilgan chatlar (${chats.size} ta):\n`)

for (const [chatId, info] of chats) {
  console.log(`  chat_id: ${chatId}   [${info.type}]  ${info.title}`)
  if (!info.topics.size) {
    console.log('     (topic aniqlanmadi — kerakli topic ichiga xabar yozing)')
  }
  for (const [threadId, name] of info.topics) {
    console.log(`     topic: ${threadId}  →  ${name}`)
  }
  console.log('')
}

console.log(
  [
    '👉 .env ga yozing:',
    '   VITE_TG_LOG_BOT_TOKEN=<token>',
    '   VITE_TG_LOG_CHAT_ID=<yuqoridagi chat_id>',
    '   VITE_TG_LOG_TOPIC_ID=<"website" topic id>',
    '',
    '👉 Keyin tekshiring:',
    '   node scripts/telegram-chat-info.mjs --send="test"',
    ''
  ].join('\n')
)
