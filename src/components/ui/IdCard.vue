<script setup>
import { ref, computed } from "vue"
import frontSide from "@/assets/images/content/IdFrontSide.webp"
import backSide from "@/assets/images/content/IdBackSide.jpg"

const props = defineProps({
  data: { type: Object, required: true }
})

const isFlipped = ref(false)
const isAnimating = ref(false)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
  isAnimating.value = true
  setTimeout(() => (isAnimating.value = false), 700)
}

function formatDate(iso) {
  if (!iso) return "00.00.0000"
  const [y, m, d] = iso.split("-")
  return y && m && d ? `${d}.${m}.${y}` : iso
}

function mrzPad(value, length) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9<]/g, (ch) => (ch === " " ? "<" : ""))
  return cleaned.length >= length ? cleaned.slice(0, length) : cleaned + "<".repeat(length - cleaned.length)
}

const mrz = computed(() => {
  const d = props.data
  const line1 = mrzPad(`I UZB${d.cardNumber}`, 30)
  const dob = d.birthDate?.split("-") || []
  const exp = d.expiryDate?.split("-") || []
  const dobMrz = dob.length === 3 ? `${dob[0].slice(2)}${dob[1]}${dob[2]}` : "000000"
  const expMrz = exp.length === 3 ? `${exp[0].slice(2)}${exp[1]}${exp[2]}` : "000000"
  return [
    line1,
    mrzPad(`${d.personalNumber}${dobMrz}${d.sex}${expMrz}`, 30),
    mrzPad(`${d.surname}<<${d.givenName}`, 30)
  ]
})
</script>

<template>
  <div class="relative w-full max-w-[450px] sm:max-w-[500px] md:max-w-[550px] ">
    <button
      type="button"
      class="relative w-full aspect-[1014/638] border-none p-0 bg-transparent cursor-pointer [transform-style:preserve-3d] transition-transform duration-700 "
      :class="isFlipped ? '[transform:rotateY(180deg)]' : ''"
      @click="toggleFlip"
    >
      <!-- FRONT -->
      <div
        class="absolute inset-0 [backface-visibility:hidden] rounded-[10px] overflow-hidden shadow-lg bg-cover bg-center text-[#1c2b22]"
        :style="{ backgroundImage: `url(${frontSide})` }"
      >
        <div class="absolute left-[6%] top-[21%] w-[26%] h-[52%] rounded-[5px] overflow-hidden bg-[#eceadd] flex items-center justify-center">
          <img v-if="data.photoUrl" :src="data.photoUrl" alt="" class="w-full h-full object-cover" />
        </div>
        <span class="absolute left-[34.5%] top-[24.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold truncate max-w-[54%]">{{ data.surname }}</span>
        <span class="absolute left-[34.5%] top-[36.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold truncate max-w-[54%]">{{ data.givenName }}</span>
        <span class="absolute left-[34.5%] top-[48.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold truncate max-w-[54%]">{{ data.patronymic }}</span>
        <span class="absolute left-[34.5%] top-[59.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ formatDate(data.birthDate) }}</span>
        <span class="absolute right-[4.5%] top-[59.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ data.sex === "M" ? "ERKAK / M" : "AYOL / F" }}</span>
        <span class="absolute left-[34.5%] top-[71.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ formatDate(data.issueDate) }}</span>
        <span class="absolute right-[4.5%] top-[71.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ data.nationality }}</span>
        <span class="absolute left-[34.5%] top-[82.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ formatDate(data.expiryDate) }}</span>
        <span class="absolute right-[4.5%] top-[82.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold font-mono tracking-wide">{{ data.cardNumber }}</span>
      </div>

      <!-- BACK -->
      <div
        class="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[10px] overflow-hidden shadow-lg bg-cover bg-center text-[#1c2b22]"
        :style="{ backgroundImage: `url(${backSide})` }"
      >
        <!-- QR placeholder: install `qrcode` later, generate data.qrDataUrl, swap for <img> -->
        <div class="absolute left-[6.1%] top-[27.9%] w-[18%] h-[27.7%] bg-white rounded-[2px] flex items-center justify-center text-[6px] text-gray-400">
          QR
        </div>

        <span class="absolute left-[28.7%] top-[31.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold font-mono tracking-wide">{{ data.personalNumber }}</span>
        <span class="absolute left-[28.7%] top-[42.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ data.birthPlace }}</span>
        <span class="absolute left-[28.7%] top-[53.5%] text-[8px] sm:text-[10px] md:text-[12px] font-bold">{{ data.issuePlace }}</span>

        <div class="absolute left-0 top-[75.5%] w-full h-[20%] flex flex-col items-center justify-center gap-1 px-[6%]">
  <div
    v-for="(line, i) in mrz"
    :key="i"
    class="w-full grid font-mono font-extrabold text-[8px] sm:text-[10px] text-[#17231b]"
    style="grid-template-columns: repeat(30, 1fr)"
  >
    <span v-for="(char, j) in line.split('')" :key="j" class="text-center">{{ char }}</span>
  </div>
</div>
      </div>
    </button>

    <div v-if="isAnimating" class="pointer-events-none absolute inset-0 rounded-[10px] overflow-hidden">
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
  background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.55) 45%, transparent 90%);
  transform: skewX(-15deg);
  animation: shine-sweep-move .8s ease-in-out;
}
@keyframes shine-sweep-move {
  0% { left: -60%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { left: 120%; opacity: 0; }
}
</style>