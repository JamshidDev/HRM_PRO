<script setup>
  import { ref, computed } from 'vue'
  import { useQrCode } from '@/composables/index.js'
  import i18n from '@/i18n/index.js'
  import frontSide from '@/assets/images/content/redCertificateFront.png'
  import backSide from '@/assets/images/content/redCertificateBack.png'

  const { t } = i18n.global

  const monthKeys = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ]

  const nameSuffixes = new Set(["o'g'li", 'ogli', 'oglu', 'qizi', 'угли', 'кизи'])

  const props = defineProps({
    data: { type: Object, required: true }
  })

  const isFlipped = ref(false)
  const isAnimating = ref(false)

  // O'ng tomondagi "Muddati" qatori: guvohnoma uzaytirilgan bo'lsa o'sha sana,
  // aks holda amal qilish muddati ko'rsatiladi
  const validUntilDate = computed(() => props.data.extendedDate || props.data.expiryDate || '')

  // Blankadagi imzo qatorlari tor, shuning uchun rahbar F.I.Sh. qisqartiriladi:
  // "Begaliyev Bobur Maxmadali o'g'li" -> "Begaliyev B.M."
  const managerShortName = computed(() => {
    const raw = (props.data.managerName || '').trim()
    if (!raw) return ''
    const parts = raw
      .split(/\s+/)
      .filter((part) => !nameSuffixes.has(part.replace(/[’‘`´]/g, "'").toLowerCase()))
    if (parts.length < 2) return parts[0] || ''
    const initials = parts
      .slice(1)
      .map((part) => `${part[0].toUpperCase()}.`)
      .join('')
    return `${parts[0]} ${initials}`
  })

  // Hozircha QR joriy sahifaga olib boradi, keyinchalik guvohnomani tekshirish
  // havolasiga almashtiriladi
  const { qrDataUrl } = useQrCode(() => props.data.qrValue)

  function toggleFlip() {
    isFlipped.value = !isFlipped.value
    isAnimating.value = true
    setTimeout(() => (isAnimating.value = false), 700)
  }

  function fullYear(iso) {
    if (!iso) return ''
    const [y] = iso.split('-')
    return y || ''
  }

  function dayOf(iso) {
    if (!iso) return ''
    const [, , d] = iso.split('-')
    return d ? String(Number(d)) : ''
  }

  function monthOf(iso) {
    if (!iso) return ''
    const [, m] = iso.split('-')
    const key = monthKeys[Number(m) - 1]
    return key ? t(`month.${key}`) : ''
  }

  function formatDate(iso) {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return y && m && d ? `${d}.${m}.${y}` : iso
  }
</script>

<template>
  <div class="w-full overflow-x-auto sm:overflow-visible">
  <div class="cert-container relative min-w-[640px] sm:min-w-0">
    <button
      type="button"
      aria-label="Flip Certificate"
      :aria-expanded="isFlipped"
      class="relative w-full aspect-[1489/467] border-none p-0 bg-transparent rounded-2xl cursor-pointer [transform-style:preserve-3d] transition-transform duration-700 box-shadow"
      :class="isFlipped ? '[transform:rotateY(180deg)]' : ''"
      @click="toggleFlip"
    >
      <!-- FRONT: opened certificate spread -->
      <div
        class="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-lg bg-cover bg-center text-[#1c2b22]"
        :style="{ backgroundImage: `url(${frontSide})` }"
      >
        <!-- Guvohnoma № -->
        <span
          class="absolute left-[16%] top-[30%] max-w-[20%] cert-text font-medium sm:font-bold font-mono tracking-wide truncate"
          >{{ data.cardNumber }}</span
        >

        <!-- F.I.O (ism, familiya, sharif) -->
        <span
          class="handwritten absolute left-[4%] top-[40%] w-[44%] cert-text truncate"
          >{{ data.fullName }}</span
        >

        <!-- Lavozim: blankadagi ikkita chiziq bo'ylab o'ziga o'zi qatorlanadi -->
        <span
          class="handwritten absolute left-[4%] top-[48.2%] w-[44%] cert-text-sm post-name whitespace-pre-line break-words line-clamp-2"
          >{{ data.postName }}</span
        >

        <!-- Berilgan sanasi: kuni -->
        <span
          class="handwritten absolute left-[4%] top-[68%] w-[3.5%] text-center cert-text truncate"
          >{{ dayOf(data.issueDate) }}</span
        >

        <!-- Berilgan sanasi: oyi -->
        <span
          class="handwritten absolute left-[8.3%] top-[68%] w-[26.5%] text-center cert-text truncate"
          >{{ monthOf(data.issueDate) }}</span
        >

        <!-- Berilgan yili: blankadagi "202" o'rniga to'liq yil yoziladi -->
        <div
          v-if="data.issueDate"
          class="absolute left-[35.73%] top-[68.31%] w-[2.62%] h-[4.93%] bg-[#f5f8fb]"
        />
        <span
          class="handwritten absolute left-[35.73%] top-[68%] w-[5%] text-center cert-text truncate"
          >{{ fullYear(data.issueDate) }}</span
        >

        <!-- Amal qilish muddati: kuni -->
        <span
          class="handwritten absolute left-[4%] top-[77%] w-[3.5%] text-center cert-text truncate"
          >{{ dayOf(data.expiryDate) }}</span
        >

        <!-- Amal qilish muddati: oyi -->
        <span
          class="handwritten absolute left-[8.3%] top-[77%] w-[26.5%] text-center cert-text truncate"
          >{{ monthOf(data.expiryDate) }}</span
        >

        <!-- Amal qilish muddati yili: blankadagi "202" o'rniga to'liq yil yoziladi -->
        <div
          v-if="data.expiryDate"
          class="absolute left-[35.73%] top-[77.09%] w-[2.62%] h-[4.93%] bg-[#f5f8fb]"
        />
        <span
          class="handwritten absolute left-[35.73%] top-[77%] w-[5%] text-center cert-text truncate"
          >{{ fullYear(data.expiryDate) }}</span
        >

        <!-- Korxona rahbari (F.I.O) - old chap tomon imzo qatori -->
        <span
          v-if="data.managerName"
          class="handwritten absolute left-[13%] top-[85.5%] w-[20.5%] text-center cert-text truncate"
          >{{ managerShortName }}</span
        >

        <!-- Rasm -->
        <div
          class="absolute left-[54.3%] top-[9%] w-[11.8%] h-[47.7%] rounded-xl overflow-hidden bg-[#eceadd] flex items-center justify-center "
        >
          <img
            v-if="data.photoUrl"
            :src="data.photoUrl"
            alt="Profile Photo"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Muddati: uzaytirilgan sana, bo'lmasa amal qilish muddati -->
        <span
          v-if="validUntilDate"
          class="handwritten absolute left-[66.6%] top-[18.5%] w-[29.4%] text-center cert-text truncate"
          >{{ formatDate(validUntilDate) }}</span
        >

        <!-- Korxona rahbari (F.I.O) -->
        <span
          v-if="data.managerName"
          class="handwritten absolute left-[66.6%] top-[44.4%] w-[29.4%] text-center cert-text truncate"
          >{{ managerShortName }}</span
        >

        <!-- QR kod (blankadagi bo'sh oq katakcha) -->
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="QR"
          class="absolute left-[84.02%] top-[62.1%] w-[9.07%] h-[28.91%] object-contain p-[0.5%] bg-white"
        />

        <!-- Shaxsiy imzo (korxona rahbari signature) -->
        <span
          v-if="data.signature"
          class="handwritten absolute left-[55%] top-[70%] max-w-[24%] cert-text-lg truncate"
          >{{ data.signature }}</span
        >
      </div>

      <!-- BACK: closed leather cover -->
      <div
        class="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden shadow-lg bg-cover bg-center"
        :style="{ backgroundImage: `url(${backSide})` }"
      />
    </button>

    <div
      v-if="isAnimating"
      class="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
    >
      <div class="shine-sweep" />
    </div>
  </div>
  </div>
</template>

<style scoped>
  .cert-container {
    container-type: inline-size;
  }

  .cert-text {
    font-size: 12px;
  }

  .cert-text-sm {
    font-size: 10px;
  }

  .cert-text-lg {
    font-size: 13px;
  }

  /* Blankadagi ikkita chiziq orasidagi masofa: 45/467 balandlik = 3.02cqw */
  .post-name {
    line-height: 19px;
  }

  @supports (container-type: inline-size) {
    .cert-text {
      font-size: clamp(9px, 2.1cqw, 14px);
    }

    .cert-text-sm {
      font-size: clamp(8px, 1.75cqw, 12px);
    }

    .cert-text-lg {
      font-size: clamp(10px, 2.3cqw, 15px);
    }

    .post-name {
      line-height: 3.02cqw;
    }
  }

  .handwritten {
    font-family: 'Meddon', cursive;
    font-style: italic;
    font-weight: 400;
    color: #1570ef;
    letter-spacing: 0.015em;
  }

  .shine-sweep {
    position: absolute;
    top: 0;
    left: -60%;
    width: 40%;
    height: 100%;
    background: linear-gradient(
      115deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 45%,
      transparent 90%
    );
    transform: skewX(-15deg);
    animation: shine-sweep-move 0.8s ease-in-out;
  }

  .box-shadow {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  @keyframes shine-sweep-move {
    0% {
      left: -60%;
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% {
      left: 120%;
      opacity: 0;
    }
  }
</style>
