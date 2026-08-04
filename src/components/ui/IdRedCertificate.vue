<script setup>
  import { ref, computed } from 'vue'
  import frontSide from '@/assets/images/content/redCertificateFront.png'
  import backSide from '@/assets/images/content/redCertificateBack.png'

  const props = defineProps({
    data: { type: Object, required: true }
  })

  const isFlipped = ref(false)
  const isAnimating = ref(false)

  const postNameLines = computed(() => (props.data.postName || '').split('\n'))

  function toggleFlip() {
    isFlipped.value = !isFlipped.value
    isAnimating.value = true
    setTimeout(() => (isAnimating.value = false), 700)
  }

  function yearLastDigit(iso) {
    if (!iso) return ''
    const [y] = iso.split('-')
    return y ? y.slice(-1) : ''
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

        <!-- Lavozim, 1-qator -->
        <span
          class="handwritten absolute left-[4%] top-[50%] w-[44%] cert-text truncate"
          >{{ postNameLines[0] }}</span
        >

        <!-- Lavozim, 2-qator -->
        <span
          class="handwritten absolute left-[4%] top-[59%] w-[44%] cert-text truncate"
          >{{ postNameLines[1] }}</span
        >

        <!-- Berilgan yili (202_ dagi oxirgi raqam) -->
        <span
          class="handwritten absolute left-[38.5%] top-[68%] max-w-[4%] text-center cert-text truncate"
          >{{ yearLastDigit(data.issueDate) }}</span
        >

        <!-- Amal qilish muddati yili (202_ dagi oxirgi raqam) -->
        <span
          class="handwritten absolute left-[38.5%] top-[77%] max-w-[4%] text-center cert-text truncate"
          >{{ yearLastDigit(data.expiryDate) }}</span
        >

        <!-- Korxona rahbari (F.I.O) - old chap tomon imzo qatori -->
        <span
          v-if="data.managerName"
          class="handwritten absolute left-[14%] top-[85.5%] max-w-[18%] cert-text truncate"
          >{{ data.managerName }}</span
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

        <!-- Uzaytirilgan muddati -->
        <span
          v-if="data.extendedDate"
          class="handwritten absolute right-[16%] top-[19%] max-w-[27%] cert-text truncate"
          >{{ formatDate(data.extendedDate) }}</span
        >

        <!-- Korxona rahbari (F.I.O) -->
        <span
          v-if="data.managerName"
          class="handwritten absolute right-[16%] top-[44%] max-w-[27%] cert-text truncate"
          >{{ data.managerName }}</span
        >

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

  .cert-text-lg {
    font-size: 13px;
  }

  @supports (container-type: inline-size) {
    .cert-text {
      font-size: clamp(9px, 2.1cqw, 14px);
    }

    .cert-text-lg {
      font-size: clamp(10px, 2.3cqw, 15px);
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
