<script setup>
  /**
   * Figma "Kim bilan bog'lanish" modali (fayl kB7JzDpdhDB8kan1gt3mxF,
   * node 3291:79370). "Kim bilan bog'lanish?" kartasidagi "Ro'yxatni ochish"
   * tugmasi shu oynani ochadi — tizim bo'yicha mas'ul xodimlar ro'yxati.
   *
   * Ro'yxat API'dan kelmaydi (bunday endpoint yo'q), shuning uchun ma'lumot
   * shu yerda konstanta sifatida turadi. Xodim/telefon o'zgarsa faqat shu
   * massiv tahrirlanadi.
   *
   * Yo'nalish matnlari i18n'ga chiqarilmadi: ular ish jarayoniga oid aniq
   * atamalar va faqat o'zbekcha berilgan — tarjimani o'ylab topib qo'yishdan
   * ko'ra asl matnni saqlagan ma'qul.
   */
  import { Copy16Regular } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { CATEGORY_ICONS } from '@/pages/app/categoryIcons.js'
  import XmarkIcon from '@/assets/icons/figXmark.svg'
  import ClockIcon from '@/assets/icons/contact/clock.svg'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const visible = defineModel('visible', { type: Boolean, default: false })

  // "Ko'p beriladigan savollar" bo'limlari bilan bir xil ikonka — xodim qaysi
  // bo'lim bo'yicha mas'ul bo'lsa, o'sha bo'limning ikonkasi ko'rsatiladi.
  const CATEGORY_TINTS = {
    staff: 'bg-fig-bg-brand-surface text-fig-brand',
    salary: 'bg-fig-indigo-100 text-fig-indigo',
    vacation: 'bg-fig-green-100 text-fig-green',
    turnstile: 'bg-fig-amber-100 text-fig-amber',
    technical: 'bg-fig-red-100 text-fig-red'
  }

  const PEOPLE = [
    {
      category: 'technical',
      name: 'Raximov Jamshid',
      phone: '+998 99 501 60 04',
      role: "Tizim bo'yicha taklif va muammolar"
    },
    {
      category: 'staff',
      name: 'Ibragimov Shuhrat Shoyizoqovich',
      phone: '+998 99 974 85 96',
      role: "Kadrlar bo'yicha mas'ul xodim"
    },
    {
      category: 'staff',
      name: "Ergashov Sherzod Bahodir o'g'li",
      phone: '+998 93 320 45 01',
      role: "O'qish va sertifikatlar bo'yicha mas'ul xodim"
    },
    {
      category: 'turnstile',
      name: "Azamjonov Azamshox Kozimjon o'g'li",
      phone: '+998 90 963 26 56',
      role: "Turniket bo'yicha mas'ul xodim"
    },
    {
      category: 'turnstile',
      name: "Xakimov Javlonbek Oybek o'g'li",
      phone: '+998 33 285 20 00',
      role: "Turniket bo'yicha mas'ul xodim"
    },
    {
      category: 'turnstile',
      name: 'Safarov Samandar Abdiqodirovich',
      phone: '+998 90 912 04 09',
      role: "Turniket bo'yicha mas'ul xodim"
    },
    {
      category: 'salary',
      name: "Eshboyev Ulug'bek Farxodovich",
      phone: '+998 97 700 01 53',
      role: "Ekonomist bo'yicha mas'ul xodim"
    }
  ]

  // `tel:` sxemasi bo'shliqlarni qabul qilmaydi
  const telHref = (phone) => `tel:${phone.replace(/\s/g, '')}`

  const copyPhone = (phone) => {
    Utils.copyToClipboard(phone, () => $Toast.success(i18n.global.t('content.successCopied')))
  }
</script>

<template>
  <!--
    Maketdagi karta: kengligi 708px, burchagi 32px (`UIModal` ning odatdagi
    radiusi kichikroq). `height="auto"` — balandlik kontentga qarab, lekin
    `max-h` orqali ekrandan chiqmaydi va ro'yxat ichida skroll qilinadi.
  -->
  <UIModal
    v-model:visible="visible"
    :width="708"
    height="auto"
    :persistent="false"
    fullscreen-on-mobile
    card-class="!rounded-none md:!rounded-[32px] !max-h-[calc(100dvh-4rem)]"
  >
    <!-- Maketdagi sarlavha (node 3291:79371): kulrang fon, 32px yon chet va
         oq doiradagi yopish tugmasi — `UIModal` ning standart sarlavhasidan
         farq qiladi, shuning uchun slot orqali qayta yozilgan.
         `-m-2` tashqi `p-2` ni bekor qiladi (fon karta chetiga tegib turadi). -->
    <template #header>
      <div
        class="-m-2 flex items-center justify-between gap-3 border-b border-fig-br-disable bg-fig-bg-tertiary px-4 py-3 md:rounded-t-[32px] md:px-8"
      >
        <h3
          class="min-w-0 flex-1 truncate text-[20px] leading-[26px] font-semibold text-fig-text-primary"
        >
          {{ $t('contactPage.responsible.title') }}
        </h3>

        <button
          type="button"
          :aria-label="$t('content.close')"
          class="flex shrink-0 cursor-pointer items-center rounded-full bg-fig-block p-1.5 text-fig-text-primary transition-opacity hover:opacity-80"
          @click="visible = false"
        >
          <span class="responsible-modal__close"><XmarkIcon /></span>
        </button>
      </div>
    </template>

    <!-- Maketda ro'yxat 24px yon chetda (`UIModal` tanasi 16px beradi),
         ro'yxat bilan ajratuvchi chiziq orasi 12px, qatorlar orasi 8px. -->
    <div class="flex flex-col gap-3 md:px-2">
      <ul class="flex flex-col gap-2">
        <li
          v-for="person in PEOPLE"
          :key="person.phone"
          class="flex items-center gap-2.5 rounded-2xl bg-fig-bg-secondary p-3"
        >
          <!-- 36px tint doira + 20px ikonka (node 3291:79420) -->
          <span
            class="flex shrink-0 items-center rounded-full p-2"
            :class="CATEGORY_TINTS[person.category]"
          >
            <span class="responsible-modal__icon">
              <component :is="CATEGORY_ICONS[person.category]" />
            </span>
          </span>

          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
              {{ person.name }}
            </p>
            <p class="text-[12px] leading-4 text-fig-text-secondary">
              {{ person.role }}
            </p>
          </div>

          <!-- Maketda telefon oddiy matn; bosib qo'ng'iroq qilish qulayligi
               saqlanadi, shuning uchun havola ko'rinishi matnga teng. -->
          <a
            :href="telHref(person.phone)"
            class="shrink-0 text-[14px] leading-[18px] font-medium whitespace-nowrap text-fig-text-primary transition-colors hover:text-fig-text-brand"
          >
            {{ person.phone }}
          </a>

          <button
            type="button"
            :aria-label="$t('content.copy')"
            class="flex shrink-0 cursor-pointer items-center rounded-lg p-1.5 text-fig-text-tertiary transition-colors hover:bg-fig-bg-tertiary hover:text-fig-text-brand"
            @click="copyPhone(person.phone)"
          >
            <n-icon size="16"><Copy16Regular /></n-icon>
          </button>
        </li>
      </ul>

      <div class="h-px w-full shrink-0 rounded-full bg-fig-br-disable"></div>

      <div class="flex h-6 items-center gap-1.5">
        <span class="responsible-modal__clock"><ClockIcon /></span>
        <p class="text-[12px] leading-4 text-fig-text-secondary">
          {{ $t('contactPage.workHours') }} {{ $t('contactPage.workHoursValue') }}
        </p>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  /* Maketdagi qat'iy o'lchamlar — uzun Tailwind ro'yxati inline `<span>`
     ichida prettier va eslint qoidalarini to'qnashtiradi. */
  .responsible-modal__icon {
    display: flex;
    height: 20px;
    width: 20px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .responsible-modal__icon :deep(svg) {
    width: 100%;
    height: 100%;
  }

  .responsible-modal__clock {
    display: flex;
    height: 16px;
    width: 16px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .responsible-modal__close {
    display: flex;
    height: 24px;
    width: 24px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .responsible-modal__close :deep(svg) {
    width: 24px;
    height: 24px;
  }
</style>
