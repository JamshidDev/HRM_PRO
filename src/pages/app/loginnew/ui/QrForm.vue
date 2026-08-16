<script setup>
  import { QrCode24Regular, ArrowClockwise24Regular } from '@vicons/fluent'
  import { useQrLoginStore } from '@/store/modules/index.js'

  const store = useQrLoginStore()

  // ⚠️ Sessiya (socket) hayotini `page.vue` boshqaradi — `watch(tab)`.
  // Bu komponentda `onMounted/onBeforeUnmount` ATAYLAB YO'Q: tab animatsiyasi
  // chiqayotgan komponentni ushlab turadi va unmount'dagi `close()` yangi
  // ochilgan sessiyani yopib yuborishi mumkin edi (race).
</script>

<template>
  <div class="w-full">
    <!-- QR maydoni -->
    <div class="flex justify-center mt-6">
      <div
        class="relative w-[216px] h-[216px] rounded-2xl bg-white flex items-center justify-center border border-login-border overflow-hidden"
      >
        <img
          v-if="store.image"
          :src="store.image"
          alt="QR"
          class="w-[200px] h-[200px] transition-opacity duration-200"
          :class="store.status === 'connecting' ? 'opacity-0' : 'opacity-100'"
        />

        <!-- Yuklanmoqda — ilk ochilish VA yangilash (qayta ulanish) paytida.
             Quti ichida, o'lchamini o'zgartirmasdan. -->
        <div
          v-if="store.status === 'connecting' || (!store.image && store.status === 'idle')"
          class="absolute inset-0 bg-white flex items-center justify-center"
        >
          <span class="qr-loader" />
        </div>

        <!-- Muddati tugadi / xato — QR ustidan qoplama -->
        <div
          v-if="store.status === 'expired' || store.status === 'error'"
          class="absolute inset-0 bg-white/92 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 px-4 text-center"
        >
          <n-icon :size="30" class="text-gray-500" :component="QrCode24Regular" />
          <p class="text-sm font-medium text-gray-700">
            {{
              store.status === 'error' ? $t('loginPage.qr.connectionError') : $t('loginPage.qr.expired')
            }}
          </p>
          <n-button size="small" secondary class="rounded-lg!" @click="store.refresh()">
            <template #icon>
              <n-icon :component="ArrowClockwise24Regular" />
            </template>
            {{ $t('loginPage.qr.refresh') }}
          </n-button>
        </div>

        <!-- Tasdiqlandi — brauzer kirmoqda -->
        <div
          v-if="store.status === 'approved'"
          class="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-3"
        >
          <n-spin size="medium" />
          <p class="text-sm font-medium text-gray-700">{{ $t('loginPage.qr.signingIn') }}</p>
        </div>
      </div>
    </div>

    <!-- Tushuntirish — QR qutisi tagida -->
    <p class="pt-6 text-center text-login-body text-[13px] leading-relaxed px-3">
      {{ $t('loginPage.qr.description') }}
    </p>
  </div>
</template>

<style scoped>
  /* QR yuklanayotgandagi halqa — quti o'lchamini o'zgartirmaydi (absolute qoplama ichida) */
  .qr-loader {
    width: 38px;
    height: 38px;
    border-radius: 9999px;
    border: 3px solid rgba(18, 121, 240, 0.18);
    border-top-color: var(--login-link);
    animation: qr-loader-spin 0.8s linear infinite;
  }

  @keyframes qr-loader-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
