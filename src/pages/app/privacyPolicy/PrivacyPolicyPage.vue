<script setup>
import { useRouter } from 'vue-router'
import i18n from '@/i18n/index.js'
import { AppPaths, useAppSetting } from '@/utils/index.js'
import { setSeo } from '@/utils/seo.js'

const router = useRouter()

// Matn uz/ru/en; boshqa ilova tillarida o'zbekcha. Sahifada til almashtirgich bor (Google Play uchun inglizchasi ham).
const lang = ref(['ru', 'en'].includes(i18n.global.locale) ? i18n.global.locale : 'uz')
const LANGS = [
  { key: 'uz', label: "O'zbekcha" },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
]

const TEXT = {
  uz: {
    seoTitle: 'Maxfiylik siyosati — HRM PRO',
    seoDescription:
      "HRM PRO va HR Rail mobil ilovasining maxfiylik siyosati: qanday ma'lumotlar yig'iladi, nima uchun ishlatiladi va qanday himoyalanadi.",
    title: 'Maxfiylik siyosati',
    effective: 'Kuchga kirgan sana: 2026-yil 1-yanvar',
    intro:
      "HRM PRO temir yo'l tashkilotlari ichida xodimlarni boshqarish va kadrlar bilan bog'liq jarayonlarni yuritish uchun ishlab chiqilgan.",
    back: 'Kirish sahifasiga qaytish',
    rights: '© 2026 HRM PRO. Barcha huquqlar himoyalangan.',
    sections: [
      { title: "Yig'iladigan ma'lumotlar", lead: "Ilova quyidagi ma'lumotlarni yig'ishi va qayta ishlashi mumkin:", list: ["Xodimni identifikatsiya qiluvchi ma'lumotlar (F.I.Sh., lavozim, bo'lim)", "Aloqa ma'lumotlari (telefon raqami, elektron pochta)", "Davomat va ish grafigi ma'lumotlari", "Qurilma haqidagi ma'lumotlar (qurilma turi, operatsion tizim)", "Xavfsiz kirish uchun autentifikatsiya ma'lumotlari"] },
      { title: "Ma'lumotlardan foydalanish", lead: "Yig'ilgan ma'lumotlar faqat quyidagi maqsadlarda ishlatiladi:", list: ['Xodimlar hisobini yuritish', 'Davomatni hisobga olish', 'Ichki aloqa', 'Tizimga xavfsiz kirish', 'Tashkiliy hisobot va tahlil'] },
      { title: "Ma'lumotlar xavfsizligi", text: ["Shaxsga doir ma'lumotlarni ruxsatsiz kirish, oshkor qilish yoki suiiste'mol qilishdan himoya qilish uchun tegishli texnik va tashkiliy choralar ko'riladi.", "Barcha ma'lumotlar xavfsiz, shifrlangan ulanish orqali uzatiladi."] },
      { title: "Ma'lumotlarni uzatish", list: ["Shaxsga doir ma'lumotlar uchinchi shaxslarga sotilmaydi va berilmaydi.", "Ma'lumotlardan faqat tashkilotning vakolatli xodimlari foydalana oladi."] },
      { title: "Ma'lumotlarni saqlash", text: ["Shaxsga doir ma'lumotlar faqat kadrlar ishi va qonun talablarini bajarish uchun zarur bo'lgan muddatda saqlanadi."] },
      { title: 'Foydalanuvchi huquqlari', text: ["Foydalanuvchilar o'z ma'lumotlarini ko'rish, tuzatish yoki o'chirish bo'yicha tashkilotining kadrlar bo'limiga murojaat qilishi mumkin."] },
      { title: "Aloqa ma'lumotlari", contact: true, text: ["Ushbu maxfiylik siyosati bo'yicha savollaringiz bo'lsa, tashkilotingiz administratoriga murojaat qiling."] }
    ]
  },
  ru: {
    seoTitle: 'Политика конфиденциальности — HRM PRO',
    seoDescription:
      'Политика конфиденциальности HRM PRO и мобильного приложения HR Rail: какие данные собираются, как используются и защищаются.',
    title: 'Политика конфиденциальности',
    effective: 'Дата вступления в силу: 1 января 2026 г.',
    intro:
      'HRM PRO разработан для внутреннего использования в железнодорожных организациях для управления персоналом и кадровыми процессами.',
    back: 'Вернуться ко входу',
    rights: '© 2026 HRM PRO. Все права защищены.',
    sections: [
      { title: 'Собираемые данные', lead: 'Приложение может собирать и обрабатывать следующие данные:', list: ['Идентификационные данные сотрудника (ФИО, должность, подразделение)', 'Контактные данные (номер телефона, электронная почта)', 'Данные о посещаемости и графике работы', 'Сведения об устройстве (тип устройства, операционная система)', 'Учётные данные для безопасного входа'] },
      { title: 'Использование данных', lead: 'Собранные данные используются исключительно для:', list: ['Ведения учёта сотрудников', 'Учёта посещаемости', 'Внутренней коммуникации', 'Безопасного входа в систему', 'Отчётности и аналитики организации'] },
      { title: 'Безопасность данных', text: ['Мы применяем надлежащие технические и организационные меры для защиты персональных данных от несанкционированного доступа, раскрытия или злоупотребления.', 'Все данные передаются по защищённым зашифрованным соединениям.'] },
      { title: 'Передача данных', list: ['Мы не продаём и не передаём персональные данные третьим лицам.', 'Доступ к данным имеют только уполномоченные сотрудники организации.'] },
      { title: 'Хранение данных', text: ['Персональные данные хранятся только в течение срока, необходимого для кадровых и законодательных требований.'] },
      { title: 'Права пользователей', text: ['Пользователи могут обратиться в отдел кадров своей организации по вопросам доступа, исправления или удаления персональных данных.'] },
      { title: 'Контактная информация', contact: true, text: ['По вопросам данной политики конфиденциальности обращайтесь к администратору вашей организации.'] }
    ]
  },
  en: {
    seoTitle: 'Privacy Policy — HRM PRO',
    seoDescription:
      'Privacy policy of HRM PRO and the HR Rail mobile app: what data is collected, how it is used and protected.',
    title: 'Privacy Policy',
    effective: 'Effective Date: January 1, 2026',
    intro:
      'HRM PRO is developed for internal use within railway organizations to facilitate employee management and HR-related processes.',
    back: 'Back to Login',
    rights: '© 2026 HRM PRO. All rights reserved.',
    sections: [
      { title: 'Information We Collect', lead: 'The App may collect and process the following information:', list: ['Employee identification data (name, position, department)', 'Contact information (phone number, email address)', 'Attendance and work schedule data', 'Device-related information (device type, operating system)', 'Authentication credentials for secure access'] },
      { title: 'How We Use Information', lead: 'The collected information is used solely for:', list: ['Managing employee records', 'Attendance tracking', 'Internal communication', 'Secure system authentication', 'Organizational reporting and analytics'] },
      { title: 'Data Security', text: ['We implement appropriate technical and organizational measures to protect personal data against unauthorized access, disclosure, or misuse.', 'All data is transmitted over secure, encrypted connections.'] },
      { title: 'Data Sharing', list: ['We do not sell or share personal information with third parties.', 'Data is accessible only to authorized personnel within the organization.'] },
      { title: 'Data Retention', text: ['Personal data is retained only as long as necessary to fulfill HR and legal requirements.'] },
      { title: 'User Rights', text: ["Users may contact their organization's HR department regarding access, correction, or deletion of personal data."] },
      { title: 'Contact Information', contact: true, text: ["If you have any questions regarding this Privacy Policy, please contact your organization's administrator."] }
    ]
  }
}

const tx = computed(() => TEXT[lang.value])
const DOTS = ['bg-primary-color', 'bg-success-color', 'bg-warning-color', '', '', 'bg-primary-color', 'bg-success-color']
const DOT_STYLE = ['', '', '', 'background: #a855f7', 'background: #f97316', '', '']

watchEffect(() => setSeo({ title: tx.value.seoTitle, description: tx.value.seoDescription, path: AppPaths.PrivacyPolicy }))
</script>

<template>
  <div class="privacy-bg w-full min-h-screen flex flex-col items-center justify-start py-10 px-4">
    <!-- Header -->
    <div class="w-full max-w-[800px] flex flex-wrap items-center justify-between gap-3 mb-8">
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push(AppPaths.Login)">
        <img :src="useAppSetting.appLogoUrl" alt="HRM PRO logotipi" class="h-[44px] object-contain" />
        <span class="text-white font-bold text-xl uppercase tracking-wide">HRM PRO</span>
      </div>
      <div class="flex items-center gap-1 rounded-full bg-white/10 p-1">
        <button
          v-for="l in LANGS"
          :key="l.key"
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium text-white transition-colors"
          :class="lang === l.key ? 'bg-white/25' : 'opacity-70 hover:opacity-100'"
          @click="lang = l.key"
        >
          {{ l.label }}
        </button>
      </div>
    </div>

    <!-- Card -->
    <div class="privacy-card w-full max-w-[800px] rounded-[20px] overflow-hidden">
      <!-- Card Header -->
      <div class="privacy-card-header px-10 py-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="privacy-shield-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" opacity="0.9" />
              <path d="M9 12l2 2 4-4" stroke="#1279F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="text-white text-3xl font-bold">{{ tx.title }}</h1>
        </div>
        <p class="text-white opacity-70 text-sm mt-1">{{ tx.effective }}</p>
        <p class="text-white opacity-85 mt-4 leading-relaxed text-sm">{{ tx.intro }}</p>
      </div>

      <!-- Card Body -->
      <div class="privacy-card-body px-10 py-8 flex flex-col gap-8">
        <template v-for="(sec, i) in tx.sections" :key="i">
          <div v-if="i > 0" class="privacy-divider"></div>
          <div :class="sec.contact ? 'privacy-contact-block' : 'privacy-section'">
            <div class="section-title-row" :class="sec.contact ? 'mb-2' : ''">
              <div class="section-dot" :class="DOTS[i]" :style="DOT_STYLE[i]"></div>
              <h2 class="section-title">{{ sec.title }}</h2>
            </div>
            <p v-if="sec.lead" class="section-lead">{{ sec.lead }}</p>
            <ul v-if="sec.list" class="privacy-list">
              <li v-for="item in sec.list" :key="item">{{ item }}</li>
            </ul>
            <div v-if="sec.text" class="flex flex-col gap-3">
              <p v-for="t in sec.text" :key="t" class="section-text">{{ t }}</p>
            </div>
          </div>
        </template>
      </div>

      <!-- Card Footer -->
      <div class="privacy-card-footer px-10 py-5 flex items-center justify-between">
        <span class="text-sm opacity-60">{{ tx.rights }}</span>
        <n-button size="small" class="footer-back-btn" @click="router.push(AppPaths.Login)">
          {{ tx.back }}
        </n-button>
      </div>
    </div>

    <div class="h-10"></div>
  </div>
</template>

<style scoped>
.privacy-bg {
  background: linear-gradient(160deg, #042440 0%, #0b4d8e 50%, #0177d7 100%);
}

.privacy-card {
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.privacy-card-header {
  background: linear-gradient(135deg, #0f3a6e 0%, #1279F0 100%);
}

.privacy-card-body {
  background: var(--surface-section);
}

.privacy-card-footer {
  background: var(--surface-ground);
  border-top: 1px solid var(--surface-line);
  color: var(--surface-text);
}

.privacy-shield-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.privacy-divider {
  height: 1px;
  background: var(--surface-line);
}

.privacy-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privacy-contact-block {
  border-radius: 12px;
  padding: 20px;
  background: var(--surface-ground);
  border: 1px solid var(--surface-line);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bg-primary-color  { background: var(--primary-color); }
.bg-success-color  { background: var(--success-color); }
.bg-warning-color  { background: var(--warning-color); }

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--surface-text);
  margin: 0;
}

.section-lead {
  font-size: 14px;
  color: var(--surface-text);
  opacity: 0.75;
  margin: 0;
}

.section-text {
  font-size: 14px;
  color: var(--surface-text);
  line-height: 1.7;
  margin: 0;
  opacity: 0.85;
}

.privacy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.privacy-list li {
  font-size: 14px;
  color: var(--surface-text);
  opacity: 0.85;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.privacy-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.6;
}

.footer-back-btn {
  background: var(--primary-color) !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
}
</style>
