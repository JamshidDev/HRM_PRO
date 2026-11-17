<script setup>
  import { alertState, cancelAlert, closeAlert, confirmAlert, extraAlert } from './alertDialog.js'
  import AlertCard from './AlertCard.vue'
  import { useAppStore } from '@stores'
  import i18n from '@/i18n/index.js'
  import { useNotificationSound } from '@/composables/useNotificationSound.js'

  // Global `$Alert` / `confirmDialog` oynasi — navbatdagi birinchi element ko'rsatiladi.
  const { t } = i18n.global
  const appStore = useAppStore()
  const notificationSound = useNotificationSound()

  const current = computed(() => alertState.queue[0] ?? null)
  // Ko'rsatiladigan alert: oxirgi bo'sh bo'lmagan element. Yopilganda ham saqlanadi — aks holda oyna yopilish
  // animatsiyasida bo'sh qoladi va naive «default slot is empty» deydi (DAS-15970). `@after-leave` da
  // tozalash ham shu ogohlantirishni beradi (modal hali o'chirilmagan) — ataylab tozalanmaydi.
  const shown = shallowRef(null)
  watch(current, (item) => item && (shown.value = item), { immediate: true })
  const paused = ref(false)
  const isConfirm = computed(() => Boolean(shown.value?.onConfirm))
  // Tasdiqda sarlavha «Ishonchingiz komilmi?» kabi, xatoda — «Amalni bajarib bo'lmaydi» kabi.
  const title = computed(
    () =>
      shown.value?.title ||
      t(`alertDialog.${isConfirm.value ? 'confirmTitles' : 'titles'}.${shown.value?.type}`)
  )
  // Ro'yxat ustidagi izoh: berilmasa — forma xatolari matni, bo'sh satr — yashiriladi.
  const listHint = computed(() => shown.value?.listHint ?? t('alertDialog.checkFields'))
  // Bajarilayotganda (loading) fon / Esc oynani yopmaydi.
  const show = computed({
    get: () => Boolean(current.value),
    set: (v) => !v && closeAlert()
  })

  // Har yangi modalda animatsiya qayta boshlanishi uchun kalit.
  const playKey = ref(0)
  watch(
    () => current.value?.key,
    (key) => {
      if (!key) return
      playKey.value++
      paused.value = false
      // Ovoz — faqat xato / ogohlantirishda; foydalanuvchi o'zi so'ragan tasdiqda jim.
      if (appStore.soundEnabled && !current.value.onConfirm) {
        notificationSound.play(`alert-${current.value.type}`)
      }
    }
  )

  // Internet qaytsa «Aloqa uzildi» o'zi yopiladi.
  const onOnline = () => current.value?.type === 'network' && closeAlert()
  onMounted(() => window.addEventListener('online', onOnline))
  onBeforeUnmount(() => window.removeEventListener('online', onOnline))
</script>

<template>
  <n-modal v-model:show="show" :auto-focus="true" :mask-closable="true" :close-on-esc="true">
    <AlertCard
      v-if="shown"
      :key="playKey"
      :type="shown.type"
      :title="title"
      :message="shown.message"
      :errors="shown.errors"
      :list-hint="listHint"
      :confirm="isConfirm"
      :confirm-text="shown.confirmText"
      :cancel-text="shown.cancelText"
      :extra-text="shown.extraText"
      :danger="shown.danger"
      :cancel-type="shown.cancelType"
      :confirm-type="shown.confirmType"
      :loading="shown.loading"
      @confirm="confirmAlert"
      @cancel="cancelAlert"
      @extra="extraAlert"
      @hover="(v) => (paused = v)"
    >
      <component :is="shown.content" v-if="shown.content" />
      <template #actions>
        <div class="relative mt-6 overflow-hidden rounded-xl">
          <n-button type="primary" block size="large" class="!rounded-xl" @click="closeAlert">
            {{ $t('alertDialog.ok') }}
          </n-button>
          <!-- Vaqt tugasa yopiladi; sichqoncha modal ustida bo'lsa to'xtab turadi. -->
          <span
            v-if="shown.duration"
            class="alert-dialog__countdown"
            :style="{ animationDuration: `${shown.duration}ms`, animationPlayState: paused ? 'paused' : 'running' }"
            @animationend="closeAlert"
          ></span>
        </div>
      </template>
    </AlertCard>
  </n-modal>
</template>

<style scoped>
  .alert-dialog__countdown {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 100%;
    background: rgb(255 255 255 / 0.7);
    transform-origin: left;
    pointer-events: none;
    animation-name: alert-countdown;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
  @keyframes alert-countdown {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }

</style>
