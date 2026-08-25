<script setup>
  /**
   * Figma "Aloqa" (fayl kB7JzDpdhDB8kan1gt3mxF, node 2042:173778 -> 2042:173780)
   * — "Bog'lanish" sahifasi. Bosh sahifadagi "Aloqa" tugmasi shu yerga olib keladi.
   *
   * Kontent maketda qat'iy yozilgan (telegram, e-pochta, manzil, ish vaqti),
   * shuning uchun u shu faylda konstanta sifatida turadi — API'si yo'q.
   */
  import { UIPageContent, LogoutButton } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import ContactCard from './ui/ContactCard.vue'
  import ResponsibleModal from './ui/ResponsibleModal.vue'
  import SoonBadge from './ui/SoonBadge.vue'
  import HouseIcon from '@/assets/icons/contact/house.svg'
  import MailIcon from '@/assets/icons/contact/mail.svg'
  import HeadphonesIcon from '@/assets/icons/contact/headphones.svg'
  import MicrochipIcon from '@/assets/icons/contact/microchip.svg'
  import TelegramIcon from '@/assets/icons/contact/telegram.svg'
  import ArrowRightIcon from '@/assets/icons/contact/arrow-right.svg'
  import LocationPinIcon from '@/assets/icons/contact/location-pin.svg'
  import ClockIcon from '@/assets/icons/contact/clock.svg'
  import YoutubeIcon from '@/assets/icons/contact/youtube.svg'
  import FacebookIcon from '@/assets/icons/contact/facebook.svg'
  import InstagramIcon from '@/assets/icons/contact/instagram.svg'
  import telegramArt from '@/assets/images/contact/telegram-art.png'
  import faqArt from '@/assets/images/contact/faq-art.png'

  const router = useRouter()

  const TELEGRAM_USERNAME = 'hrmrail'
  const EMAIL = 'dasuty@uzrailway.uz'

  // Xarita: Toshkent, Taras Shevchenko 7 — 41.303531, 69.276154.
  // Yandex `map-widget` iframe API kalit talab qilmaydi.
  // DIQQAT: `ll` va `pt` da tartib UZUNLIK,KENGLIK (lon,lat) — koordinata
  // odatda teskari (lat,lon) yoziladi, shuning uchun alohida konstantalar.
  // Qisqartirilgan `yandex.uz/maps/-/...` havolasi iframe'da ochilmaydi:
  // u to'liq saytga yo'naltiradi, u yerda esa framing taqiqlangan.
  const MAP_LAT = 41.303531
  const MAP_LON = 69.276154
  const MAP_SRC = `https://yandex.uz/map-widget/v1/?ll=${MAP_LON}%2C${MAP_LAT}&z=17&pt=${MAP_LON},${MAP_LAT},pm2rdm&l=map`

  /**
   * TODO: rasmiy sahifalar manzillari berilgach to'ldiriladi.
   * `url` bo'sh bo'lsa ikonka chiziladi, lekin havola sifatida ishlamaydi.
   */
  const SOCIAL_LINKS = [
    { key: 'youtube', icon: markRaw(YoutubeIcon), url: '' },
    { key: 'facebook', icon: markRaw(FacebookIcon), url: '' },
    { key: 'instagram', icon: markRaw(InstagramIcon), url: '' },
    { key: 'telegram', icon: markRaw(TelegramIcon), url: `https://t.me/${TELEGRAM_USERNAME}` }
  ]

  const goHome = () => router.push(AppPaths.Home)

  // Mas'ul xodimlar ro'yxati — modal oynada (`ResponsibleModal.vue`).
  const responsibleVisible = ref(false)
</script>

<template>
  <UIPageContent class="!h-auto !gap-6">
    <!-- Sarlavha -->
    <div class="flex w-full shrink-0 flex-wrap items-center justify-between gap-4">
      <h1 class="text-[24px] leading-[30px] font-semibold text-fig-text-primary">
        {{ $t('contactPage.title') }}
      </h1>

      <div class="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          class="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-fig-bg-brand px-2.5 text-[14px] leading-[18px] font-medium text-white transition-opacity hover:opacity-90 sm:px-4"
          @click="goHome"
        >
          <span class="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-white">
            <HouseIcon />
          </span>
          <span class="hidden sm:inline">{{ $t('contactPage.home') }}</span>
        </button>

        <LogoutButton />
      </div>
    </div>

    <div class="flex w-full flex-col gap-4">
      <!-- 1-qator: Telegram va FAQ (rasmli kartalar) -->
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          class="relative flex min-h-[118px] items-center overflow-hidden rounded-2xl bg-fig-block p-4"
        >
          <div class="relative flex flex-1 flex-col gap-5">
            <div class="flex flex-col gap-1">
              <p class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
                {{ $t('contactPage.telegram.title') }}
              </p>
              <p class="text-[12px] leading-4 text-fig-text-secondary">
                {{ $t('contactPage.telegram.subtitle') }}
              </p>
            </div>

            <a
              :href="`https://t.me/${TELEGRAM_USERNAME}`"
              target="_blank"
              rel="noopener noreferrer"
              class="flex w-fit items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <span class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5">
                <span class="flex h-4 w-4 items-center justify-center"><TelegramIcon /></span>
              </span>
              <span class="text-[14px] leading-[18px] font-semibold text-fig-text-brand">
                @{{ TELEGRAM_USERNAME }}
              </span>
            </a>
          </div>

          <img
            :src="telegramArt"
            alt=""
            aria-hidden="true"
            class="contact-art contact-art--telegram"
          />
        </div>

        <div
          class="relative flex min-h-[118px] items-center overflow-hidden rounded-2xl bg-fig-block p-4"
        >
          <div class="relative flex flex-1 flex-col justify-between gap-5">
            <div class="flex flex-col gap-1">
              <p class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
                {{ $t('contactPage.faq.title') }}
              </p>
              <p class="text-[12px] leading-4 text-fig-text-secondary">
                {{ $t('contactPage.faq.subtitle') }}
              </p>
            </div>

            <!-- Sahifasi hali yo'q — "Tez kunda" belgisi bilan -->
            <SoonBadge class="w-fit" :text="$t('contactPage.comingSoon')" />
          </div>

          <img :src="faqArt" alt="" aria-hidden="true" class="contact-art contact-art--faq" />
        </div>
      </div>

      <!-- 2-qator: e-pochta / bo'lim xodimi / AI chatbot -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ContactCard :icon="MailIcon" :title="$t('contactPage.email.title')">
          <a
            :href="`mailto:${EMAIL}`"
            class="text-[14px] leading-[18px] font-semibold text-fig-text-brand transition-opacity hover:opacity-80"
          >
            {{ EMAIL }}
          </a>
          <p class="text-[14px] leading-5 text-fig-text-tertiary">
            {{ $t('contactPage.email.replyTime') }}
            <span class="text-fig-text-primary">{{ $t('contactPage.email.replyTimeValue') }}</span>
          </p>
        </ContactCard>

        <ContactCard :icon="HeadphonesIcon" :title="$t('contactPage.callback.title')">
          <p class="text-[14px] leading-5 text-fig-text-tertiary">
            {{ $t('contactPage.callback.text') }}
          </p>
          <button
            type="button"
            class="flex w-fit cursor-pointer items-center gap-2 text-[12px] leading-4 font-medium text-fig-text-brand transition-opacity hover:opacity-80"
            @click="responsibleVisible = true"
          >
            {{ $t('contactPage.callback.action') }}
            <span class="contact-arrow"><ArrowRightIcon /></span>
          </button>
        </ContactCard>

        <ContactCard
          :icon="MicrochipIcon"
          :title="$t('contactPage.ai.title')"
          :badge="$t('contactPage.comingSoon')"
        >
          <p class="text-[14px] leading-5 text-fig-text-tertiary">
            {{ $t('contactPage.ai.text') }}
          </p>
          <!-- Havola AI chatbot ishga tushgach faollashtiriladi -->
          <span
            class="flex w-fit cursor-not-allowed items-center gap-2 text-[12px] leading-4 font-medium text-fig-text-disable"
          >
            {{ $t('contactPage.ai.action') }}
            <span class="contact-arrow"><ArrowRightIcon /></span>
          </span>
        </ContactCard>
      </div>

      <!-- 3-qator: manzil / ish vaqti / ijtimoiy tarmoqlar + xarita -->
      <div class="flex flex-col gap-3 overflow-hidden rounded-2xl bg-fig-block p-4 lg:flex-row">
        <div class="flex flex-1 flex-col gap-5">
          <div class="flex flex-col gap-2">
            <div class="flex h-6 items-center gap-1.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                <LocationPinIcon />
              </span>
              <span class="text-[12px] leading-4 text-fig-text-secondary">
                {{ $t('contactPage.address') }}
              </span>
            </div>
            <p class="px-1 text-[14px] leading-5 text-fig-text-primary">
              {{ $t('contactPage.addressValue') }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex h-6 items-center gap-1.5">
              <span class="flex h-4 w-4 shrink-0 items-center justify-center"><ClockIcon /></span>
              <span class="text-[12px] leading-4 text-fig-text-secondary">
                {{ $t('contactPage.workHours') }}
              </span>
            </div>
            <p class="px-1 text-[14px] leading-5 text-fig-text-primary">
              {{ $t('contactPage.workHoursValue') }}
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <p class="text-[14px] leading-5 text-fig-text-secondary">
              {{ $t('contactPage.social') }}
            </p>
            <div class="flex flex-wrap items-center gap-2.5">
              <component
                :is="item.url ? 'a' : 'span'"
                v-for="item in SOCIAL_LINKS"
                :key="item.key"
                :href="item.url || null"
                :target="item.url ? '_blank' : null"
                :rel="item.url ? 'noopener noreferrer' : null"
                class="flex shrink-0 items-center rounded-full bg-fig-blue-100 p-1.5 transition-opacity"
                :class="item.url ? 'hover:opacity-80' : 'cursor-default opacity-50'"
              >
                <span class="flex h-4 w-4 items-center justify-center">
                  <component :is="item.icon" />
                </span>
              </component>
            </div>
          </div>
        </div>

        <div class="relative min-h-[240px] flex-1 overflow-hidden rounded-xl bg-fig-bg-secondary">
          <iframe
            :src="MAP_SRC"
            :title="$t('contactPage.addressValue')"
            class="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allowfullscreen
          />
        </div>
      </div>
    </div>

    <ResponsibleModal v-model:visible="responsibleVisible" />
  </UIPageContent>
</template>

<style scoped>
  /* Maketdagi 20px o'ng strelka — klass sifatida: uzun Tailwind ro'yxati
     inline `<span>` ichida prettier va eslint qoidalarini to'qnashtiradi. */
  .contact-arrow {
    display: flex;
    height: 20px;
    width: 20px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  /* Maketdagi bezak rasmlari: kartaning o'ng chetida, biroz burilgan, 32% shaffof */
  .contact-art {
    position: absolute;
    top: 50%;
    right: 0;
    max-width: none;
    opacity: 0.32;
    pointer-events: none;
  }

  .contact-art--telegram {
    width: 120px;
    height: 120px;
    transform: translateY(-50%) rotate(11.25deg);
  }

  .contact-art--faq {
    width: 130px;
    height: 130px;
    transform: translateY(-50%) rotate(5.25deg);
  }
</style>
