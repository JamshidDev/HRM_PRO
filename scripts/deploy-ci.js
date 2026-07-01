/**
 * CI deploy script.
 *
 * dist/ papkasini zip qiladi, serverga login qiladi va deploy upload endpointiga yuklaydi.
 * Barcha maxfiy ma'lumotlar ENV orqali uzatiladi (GitHub Secrets):
 *   DEPLOY_API_URL  — masalan: https://hrm-api.railway.uz/api
 *   DEPLOY_LOGIN    — login (phone)
 *   DEPLOY_PASSWORD — parol
 *
 * Build (npm run build / build:dev) ALOHIDA, bu skriptdan OLDIN bajariladi.
 * Xato bo'lsa process.exit(1) — CI step fail bo'ladi.
 */
import { createWriteStream, createReadStream, existsSync, unlinkSync } from 'fs'
import archiver from 'archiver'
import axios from 'axios'
import FormData from 'form-data'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const API_URL = process.env.DEPLOY_API_URL
const LOGIN = process.env.DEPLOY_LOGIN
const PASSWORD = process.env.DEPLOY_PASSWORD

const distDir = path.join(root, 'dist')
const zipPath = path.join(root, 'dist.zip')

function fail(message) {
  console.error(`❌ ${message}`)
  process.exit(1)
}

if (!API_URL || !LOGIN || !PASSWORD) {
  fail('DEPLOY_API_URL, DEPLOY_LOGIN va DEPLOY_PASSWORD ENV o\'zgaruvchilari talab qilinadi')
}

if (!existsSync(distDir)) {
  fail('dist/ papka topilmadi. Avval "npm run build" bajaring.')
}

function createZip() {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', resolve)
    archive.on('error', reject)

    archive.pipe(output)
    // buildAndDeploy.js bilan bir xil struktura (server shu formatni kutadi)
    archive.directory('dist/', true)
    archive.finalize()
  })
}

async function login() {
  const { data } = await axios.post(`${API_URL}/auth/login`, {
    phone: LOGIN,
    password: PASSWORD
  })
  if (!data?.access_token) {
    throw new Error('Login javobida access_token yo\'q')
  }
  return data.access_token
}

async function upload(token) {
  const formData = new FormData()
  formData.append('zip', createReadStream(zipPath))

  const { data } = await axios.post(`${API_URL}/v1/admin/deploy/upload`, formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: 'Bearer ' + token,
      'X-Auth-Type': 'sanctum'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })
  return data
}

async function main() {
  console.log('📦 dist/ zip qilinmoqda...')
  await createZip()
  console.log('🔑 Serverga login qilinmoqda...')
  const token = await login()
  console.log('🚀 Serverga yuklanmoqda...')
  const result = await upload(token)
  console.log('✅ Deploy muvaffaqiyatli:', JSON.stringify(result))
}

main()
  .catch((err) => {
    const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message
    fail(`Deploy xatosi: ${detail}`)
  })
  .finally(() => {
    if (existsSync(zipPath)) {
      try {
        unlinkSync(zipPath)
      } catch {
        /* ignore */
      }
    }
  })
