<script setup>
  /**
   * "Kim bilan bog'lanish?" kartasidagi "Ro'yxatni ochish" tugmasi shu oynani
   * ochadi — tizim bo'yicha mas'ul xodimlar ro'yxati.
   *
   * Ro'yxat API'dan kelmaydi (bunday endpoint yo'q), shuning uchun ma'lumot
   * shu yerda konstanta sifatida turadi. Xodim/telefon o'zgarsa faqat shu
   * massiv tahrirlanadi.
   *
   * Yo'nalish matnlari i18n'ga chiqarilmadi: ular ish jarayoniga oid aniq
   * atamalar va faqat o'zbekcha berilgan — tarjimani o'ylab topib qo'yishdan
   * ko'ra asl matnni saqlagan ma'qul.
   */
  import { UIModal } from '@/components/index.js'
  import PhoneIcon from '@/assets/icons/figPhoneCall.svg'

  const visible = defineModel('visible', { type: Boolean, default: false })

  const PEOPLE = [
    {
      name: 'Raximov Jamshid',
      phone: '+998 99 501 60 04',
      role: "Tizim bo'yicha taklif va muammolar"
    },
    {
      name: 'Ibragimov Shuhrat Shoyizoqovich',
      phone: '+998 99 974 85 96',
      role: "Kadrlar bo'yicha mas'ul xodim"
    },
    {
      name: "Ergashov Sherzod Bahodir o'g'li",
      phone: '+998 93 320 45 01',
      role: "O'qish va sertifikatlar bo'yicha mas'ul xodim"
    },
    {
      name: "Azamjonov Azamshox Kozimjon o'g'li",
      phone: '+998 90 963 26 56',
      role: "Turniket bo'yicha mas'ul xodim"
    },
    {
      name: "Xakimov Javlonbek Oybek o'g'li",
      phone: '+998 33 285 20 00',
      role: "Turniket bo'yicha mas'ul xodim"
    },
    {
      name: 'Safarov Samandar Abdiqodirovich',
      phone: '+998 90 912 04 09',
      role: "Turniket bo'yicha mas'ul xodim"
    },
    {
      name: "Eshboyev Ulug'bek Farxodovich",
      phone: '+998 97 700 01 53',
      role: "Ekonomist bo'yicha mas'ul xodim"
    }
  ]

  // `tel:` sxemasi bo'shliqlarni qabul qilmaydi
  const telHref = (phone) => `tel:${phone.replace(/\s/g, '')}`
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :width="560"
    height="70vh"
    :persistent="false"
    fullscreen-on-mobile
    :title="$t('contactPage.responsible.title')"
  >
    <ul class="flex flex-col gap-3">
      <li
        v-for="(person, index) in PEOPLE"
        :key="person.phone"
        class="flex items-start gap-3 rounded-2xl bg-fig-bg-secondary p-3"
      >
        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fig-bg-brand-surface text-[12px] leading-4 font-semibold text-fig-text-brand"
        >
          {{ index + 1 }}
        </span>

        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <p class="text-[14px] leading-[18px] font-semibold text-fig-text-primary">
            {{ person.name }}
          </p>
          <p class="text-[12px] leading-4 text-fig-text-tertiary">
            {{ person.role }}
          </p>
        </div>

        <a
          :href="telHref(person.phone)"
          class="flex shrink-0 items-center gap-1.5 text-[14px] leading-[18px] font-semibold whitespace-nowrap text-fig-text-brand transition-opacity hover:opacity-80"
        >
          <span class="contact-phone-icon"><PhoneIcon /></span>
          {{ person.phone }}
        </a>
      </li>
    </ul>
  </UIModal>
</template>

<style scoped>
  .contact-phone-icon {
    display: flex;
    height: 16px;
    width: 16px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }
</style>
