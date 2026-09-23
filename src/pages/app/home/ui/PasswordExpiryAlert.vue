<script setup>
  /**
   * Bosh sahifadagi parol muddati ogohlantirishi.
   *
   * Parol 25 kundan oshiq almashtirilmagan bo'lsa chiqadi va muddat (30 kun)
   * tugashiga necha kun qolganini aytadi. Muddat o'tgach yoki backend
   * `must_change: true` bergach — qizil holatga o'tadi.
   *
   * Hisobning O'ZI `accountStore` getter'larida: profil sahifasidagi forma
   * (`profile/ui/PasswordForm.vue`) ham aynan shu manbadan o'qiydi, shunda
   * ikki joyda ikki xil raqam chiqib qolmaydi.
   *
   * Bu yerda `n-alert` emas, o'z kartochkasi ishlatilgan: bosh sahifa gradient
   * fonli va kartalari 16px radiusli — standart alert bu tildan ajralib turardi.
   */
  import { useAccountStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import { LockClosed20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAccountStore()
  const router = useRouter()

  const visible = computed(() => store.passwordExpiringSoon)
  const expired = computed(() => store.passwordExpired)
  const daysLeft = computed(() => store.passwordDaysLeft)

  const text = computed(() => {
    if (expired.value) return t('passwordForm.expired')
    if (daysLeft.value === 1) return t('passwordForm.expiresTomorrow')
    return t('passwordForm.daysLeft', { days: daysLeft.value })
  })

  // API sana emas, kun soni beradi (`password_changed_days`) — profildagi forma
  // bilan bir xil matn: «N kun oldin yangilangan».
  const lastChangedText = computed(() =>
    store.passwordAgeDays == null
      ? null
      : t('passwordForm.lastChanged', { days: store.passwordAgeDays })
  )

  // Profildagi parol formasi birinchi tabda — sahifa oldingi tabda ochilib
  // qolmasin, shuning uchun tab ham shu yerda tanlanadi.
  const onOpen = () => {
    store.activeTab = store.tabs[0]
    router.push(AppPaths.Profile)
  }
</script>

<template>
  <div v-if="visible" class="pw-alert mb-2 md:mb-3" :class="{ 'pw-alert--expired': expired }">
    <n-icon size="20" class="pw-alert__icon">
      <LockClosed20Regular />
    </n-icon>

    <div class="min-w-0 flex-1">
      <p class="pw-alert__title">{{ $t('passwordForm.policyTitle') }}</p>
      <p class="pw-alert__text">
        {{ text }}
        <!-- Foydalanuvchi tizimda turgani uchun muddat o'tgan parolni ham shu
             saytning o'zidan (profildagi forma orqali) yangilay oladi. -->
        <span v-if="expired" class="pw-alert__rule">
          {{ $t('passwordForm.expiredChangeHint') }}
        </span>
        <span v-else class="pw-alert__rule">{{ $t('passwordForm.policyDesc') }}</span>
      </p>
      <p v-if="lastChangedText" class="pw-alert__meta">{{ lastChangedText }}</p>
    </div>

    <n-button size="small" :type="expired ? 'error' : 'warning'" @click="onOpen">
      {{ $t('passwordForm.changeTitle') }}
    </n-button>
  </div>
</template>

<style scoped>
  /* Kartalar bilan bir tilda: 16px radius, yupqa chegara. Rang esa holatdan —
     sariq (ogohlantirish) yoki qizil (muddat o'tgan). */
  .pw-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--fig-chip-amber-text) 35%, transparent);
    border-radius: 16px;
    background: var(--fig-chip-amber-bg);
  }

  .pw-alert--expired {
    border-color: color-mix(in srgb, var(--fig-text-red) 35%, transparent);
    background: var(--fig-red-50);
  }

  .pw-alert__icon {
    flex-shrink: 0;
    color: var(--fig-chip-amber-text);
  }

  .pw-alert--expired .pw-alert__icon {
    color: var(--fig-text-red);
  }

  .pw-alert__title {
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-primary);
  }

  .pw-alert__text {
    margin-top: 2px;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-secondary);
  }

  .pw-alert__meta {
    margin-top: 2px;
    font-size: 12px;
    line-height: 16px;
    color: var(--fig-text-tertiary);
  }

  /* Qoidaning o'zi — ikkinchi darajali ma'lumot: tor ekranda qatorni
     cho'zmasligi uchun yashiriladi, qolgan matn (necha kun qolgani) qoladi. */
  .pw-alert__rule {
    color: var(--fig-text-tertiary);
  }

  @media (max-width: 767.98px) {
    .pw-alert__rule {
      display: none;
    }
  }
</style>
