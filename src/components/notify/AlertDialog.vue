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
  const paused = ref(false)
  const isConfirm = computed(() => Boolean(current.value?.onConfirm))
  // Tasdiqda sarlavha «Ishonchingiz komilmi?» kabi, xatoda — «Amalni bajarib bo'lmaydi» kabi.
  const title = computed(
    () =>
      current.value?.title ||
      t(`alertDialog.${isConfirm.value ? 'confirmTitles' : 'titles'}.${current.value?.type}`)
  )
  // Ro'yxat ustidagi izoh: berilmasa — forma xatolari matni, bo'sh satr — yashiriladi.
  const listHint = computed(() => current.value?.listHint ?? t('alertDialog.checkFields'))
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
      if (appStore.soundEnabled && !isConfirm.value) {
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
      v-if="current"
      :key="playKey"
      :type="current.type"
      :title="title"
      :message="current.message"
      :errors="current.errors"
      :list-hint="listHint"
      :confirm="isConfirm"
      :confirm-text="current.confirmText"
      :cancel-text="current.cancelText"
      :extra-text="current.extraText"
      :danger="current.danger"
      :loading="current.loading"
      @confirm="confirmAlert"
      @cancel="cancelAlert"
      @extra="extraAlert"
      @hover="(v) => (paused = v)"
    >
      <component :is="current.content" v-if="current.content" />
      <template #actions>
        <div class="relative mt-6 overflow-hidden rounded-xl">
          <n-button type="primary" block size="large" class="!rounded-xl" @click="closeAlert">
            {{ $t('alertDialog.ok') }}
          </n-button>
          <!-- Vaqt tugasa yopiladi; sichqoncha modal ustida bo'lsa to'xtab turadi. -->
          <span
            v-if="current.duration"
            class="alert-dialog__countdown"
            :style="{ animationDuration: `${current.duration}ms`, animationPlayState: paused ? 'paused' : 'running' }"
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
