<script setup>
  import { ref, computed } from 'vue'
  import { useQrCode } from '@/composables/index.js'
  import frontSide from '@/assets/images/content/IdRailwayFront.png'
  import backSide from '@/assets/images/content/IdRailwayBack.png'

  const props = defineProps({
    data: { type: Object, required: true }
  })

  // Hozircha QR joriy sahifaga olib boradi, keyinchalik tekshirish havolasiga almashtiriladi
  const { qrDataUrl } = useQrCode(() => props.data.qrValue)

  const isFlipped = ref(false)
  const isAnimating = ref(false)

  function toggleFlip() {
    isFlipped.value = !isFlipped.value
    isAnimating.value = true
    setTimeout(() => (isAnimating.value = false), 700)
  }

  function formatDate(iso) {
    if (!iso) return '00.00.0000'
    const [y, m, d] = iso.split('-')
    return y && m && d ? `${d}.${m}.${y}` : iso
  }

  const MRZ_LINE_LENGTH = 61 // measured from the design

  function digitsOnly(value) {
    return (value || '').toString().replace(/\D/g, '')
  }

  function padLine(value, length = MRZ_LINE_LENGTH) {
    const str = digitsOnly(value)
    return str.length >= length ? str.slice(0, length) : str + '>'.repeat(length - str.length)
  }

  function dateDigits(iso) {
    // YYMMDD, same convention as the national ID MRZ
    const [y, m, d] = (iso || '').split('-')
    return y && m && d ? `${y.slice(2)}${m}${d}` : ''
  }

  // TODO: this is a placeholder encoding (numeric fields, '>' padded) — swap the
  // concatenation order/fields once the backend/coworkers confirm the real spec
  const backStrip = computed(() => {
    const d = props.data
    const sexDigit = d.sex === 'M' ? '1' : d.sex === 'F' ? '0' : ''
    return [
      padLine(`${d.personalNumber || ''}${digitsOnly(d.cardNumber)}`),
      padLine(`${dateDigits(d.birthDate)}${sexDigit}${dateDigits(d.expiryDate)}`),
      padLine(`${dateDigits(d.issueDate)}${digitsOnly(d.cardNumber)}`)
    ]
  })
</script>

<template>
  <div class="relative">
    <button
      type="button"
      aria-label="Flip Card"
      :aria-expanded="isFlipped"
      class="relative w-full aspect-[1011/638] border-none p-0 bg-transparent rounded-2xl cursor-pointer [transform-style:preserve-3d] transition-transform duration-700 box-shadow"
      :class="isFlipped ? '[transform:rotateY(180deg)]' : ''"
      @click="toggleFlip"
    >
      <!-- FRONT -->
      <div
        class="absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden shadow-lg bg-cover bg-center text-[#1c2b22]"
        :style="{ backgroundImage: `url(${frontSide})` }"
      >
        <div
          class="absolute left-[4.2%] top-[35.1%] w-[20.8%] h-[41.2%] rounded-[5px] overflow-hidden bg-[#eceadd] flex items-center justify-center"
        >
          <img
            v-if="data.photoUrl"
            :src="data.photoUrl"
            alt="Profile Photo"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Familiyasi / Фамилия -->
        <span
          class="absolute left-[29.6%] top-[38.9%] max-w-[58%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ data.surname }}</span
        >
        <!-- Ismi / Имя -->
        <span
          class="absolute left-[29.6%] top-[50.2%] max-w-[26%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ data.givenName }}</span
        >
        <!-- Otasining ismi / Отчество -->
        <span
          class="absolute left-[29.6%] top-[61.4%] max-w-[26%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ data.patronymic }}</span
        >
        <!-- Jinsi / Пол -->
        <span
          class="absolute left-[29.6%] top-[72.6%] max-w-[58%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ data.sex === 'M' ? 'ERKAK / M' : 'AYOL / F' }}</span
        >
        <!-- Seriya raqami / Серия и номер -->
        <span
          class="absolute left-[4.2%] top-[83.9%] max-w-[24%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold font-mono tracking-wide truncate"
          >{{ data.cardNumber }}</span
        >

        <!-- Berilgan sanasi / Выдано -->
        <span
          class="absolute left-[59.5%] top-[50.2%] max-w-[30%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ formatDate(data.issueDate) }}</span
        >
        <!-- Amal qiladi / Годен до -->
        <span
          class="absolute left-[59.5%] top-[61.4%] max-w-[30%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ formatDate(data.expiryDate) }}</span
        >
      </div>

      <!-- BACK -->
      <div
        class="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden shadow-lg bg-cover bg-center text-[#1c2b22]"
        :style="{ backgroundImage: `url(${backSide})` }"
      >
        <div
          class="absolute left-[4.2%] top-[34.2%] w-[20.3%] h-[32.1%] bg-white rounded-[2px] flex items-center justify-center text-[6px] text-gray-400"
        >
          <img
            v-if="qrDataUrl"
            :src="qrDataUrl"
            alt="QR"
            class="w-full h-full object-contain p-[4%]"
          />
          <template v-else>QR</template>
        </div>

        <!-- Shaxsiy raqami / Личный номер -->
        <span
          class="absolute left-[27.3%] top-[41.7%] max-w-[65%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold font-mono tracking-wide truncate"
          >{{ data.personalNumber }}</span
        >
        <!-- Berilgan joyi / Место выдачи -->
        <span
          class="absolute left-[27.4%] top-[52.8%] max-w-[65%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
          >{{ data.issuePlace }}</span
        >

        <div class="absolute left-[2%] top-[85%] w-[96%] flex flex-col gap-[1.2%]">
          <div
            v-for="(line, i) in backStrip"
            :key="i"
            class="w-full grid font-mono text-[7px] sm:text-[9px] md:text-[11px] text-[#1c2b22]"
            :style="{ gridTemplateColumns: `repeat(${line.length}, 1fr)` }"
          >
            <span v-for="(char, j) in line.split('')" :key="j" class="text-center">{{ char }}</span>
          </div>
        </div>
      </div>
    </button>

    <div
      v-if="isAnimating"
      class="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
    >
      <div class="shine-sweep" />
    </div>
  </div>
</template>

<style scoped>
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
