<script setup>
  import { ref, computed } from 'vue'
  import foreignSide from '@/assets/images/content/IdForeign.webp'

  const props = defineProps({
    data: { type: Object, required: true }
  })

  const isAnimating = ref(false)
  let animationTimeout

  function triggerShine() {
    isAnimating.value = true
    clearTimeout(animationTimeout)
    animationTimeout = setTimeout(() => (isAnimating.value = false), 700)
  }

  function formatDate(iso) {
    if (!iso) return '00.00.0000'
    const [y, m, d] = iso.split('-')
    return y && m && d ? `${d}.${m}.${y}` : iso
  }

  function mrzClean(str) {
    return (str || '')
      .toString()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, (ch) => (ch === ' ' ? '<' : ''))
  }

  function mrzPad(str, length) {
    const cleaned = mrzClean(str)
    return cleaned.length >= length
      ? cleaned.slice(0, length)
      : cleaned + '<'.repeat(length - cleaned.length)
  }

  function mrzDate(iso) {
    const [y, m, d] = (iso || '').split('-')
    return y && m && d ? `${y.slice(2)}${m}${d}` : '000000'
  }

  const mrz = computed(() => {
    const d = props.data
    const nameField = `${mrzClean(d.surname)}<<${mrzClean(d.givenName)}`
    const sex = d.sex === 'M' ? 'M' : d.sex === 'F' ? 'F' : '<'

    return [
      'P<UZB' + mrzPad(nameField, 39),
      mrzPad(d.cardNumber, 9) +
        '9UZB' +
        mrzDate(d.birthDate) +
        '9' +
        sex +
        mrzDate(d.expiryDate) +
        '9' +
        mrzPad(d.personalNumber, 14) +
        '9' +
        '9'
    ]
  })
</script>

<template>
  <div
    class="relative w-full aspect-[1014/638] rounded-3xl overflow-hidden shadow-lg bg-cover bg-center text-[#5c2a20] box-shadow"
    :style="{ backgroundImage: `url(${foreignSide})` }"
    @mouseenter="triggerShine"
  >
    <div
      class="absolute left-[4%] top-[17%] w-[26%] h-[56%] rounded-[5px] overflow-hidden bg-[#e9d9d3] flex items-center justify-center"
    >
      <img
        v-if="data.photoUrl"
        :src="data.photoUrl"
        alt="Profile Photo"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Pasport raqami / Passport No -->
    <span
      class="absolute left-[70%] top-[10.5%] max-w-[28%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold font-mono tracking-wide truncate"
      >{{ data.cardNumber }}</span
    >

    <!-- Familiyasi / Surname -->
    <span
      class="absolute left-[34.3%] top-[18.3%] max-w-[64%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ data.surname }}</span
    >
    <!-- Ismi / Given names -->
    <span
      class="absolute left-[34.3%] top-[25.5%] max-w-[64%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ data.givenName }}</span
    >
    <!-- Otasining ismi / Father's name -->
    <span
      class="absolute left-[34.3%] top-[32.9%] max-w-[64%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ data.patronymic }}</span
    >
    <!-- Tug'ilgan sanasi / Date of birth -->
    <span
      class="absolute left-[34.3%] top-[47.6%] max-w-[30%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ formatDate(data.birthDate) }}</span
    >
    <!-- Jinsi / Sex -->
    <span
      class="absolute left-[34.3%] top-[56.1%] max-w-[12%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ data.sex === 'M' ? 'ERKAK / M' : 'AYOL / F' }}</span
    >
    <!-- Tug'ilgan joyi / Place of birth -->
    <span
      class="absolute left-[47.2%] top-[56.1%] max-w-[30%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ data.birthPlace }}</span
    >
    <!-- Berilgan sanasi / Date of issue -->
    <span
      class="absolute left-[34.3%] top-[65.7%] max-w-[28%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ formatDate(data.issueDate) }}</span
    >
    <!-- Kim tomonidan berilgan / Authority -->
    <span
      class="absolute left-[64.5%] top-[65.7%] max-w-[34%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ data.issuePlace }}</span
    >
    <!-- Amal qilish muddati / Date of expiry -->
    <span
      class="absolute left-[34.3%] top-[72.7%] max-w-[30%] text-[8px] sm:text-[10px] md:text-[12px] font-medium sm:font-bold truncate"
      >{{ formatDate(data.expiryDate) }}</span
    >

    <div class="absolute left-[3%] bottom-[6%] w-[94%] flex flex-col gap-[1.5%]">
      <div
        v-for="(line, i) in mrz"
        :key="i"
        class="w-full grid font-mono text-[8px] sm:text-[10px] md:text-[12px] font-medium"
        style="grid-template-columns: repeat(44, 1fr)"
      >
        <span v-for="(char, j) in line.split('')" :key="j" class="text-center">{{ char }}</span>
      </div>
    </div>

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
