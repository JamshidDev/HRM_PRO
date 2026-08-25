<script setup>
  import {
    Certificate24Regular,
    Info20Regular,
    Password24Regular,
    QrCode24Regular
  } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import ShieldIcon from '@/assets/icons/lock.svg'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAccountStore()

  // Uchala usul ham ko'rsatiladi; `editable:false` bo'lganlari (e-imzo, QR)
  // «tez orada» tegi bilan bloklanadi — backend ham ularni hozircha rad etadi.
  const methods = [
    { key: 'password', icon: Password24Regular },
    { key: 'eimzo', icon: Certificate24Regular },
    { key: 'qr', icon: QrCode24Regular }
  ]

  const stateOf = (key) => store.loginMethods?.[key] ?? { enabled: true, editable: false }

  // Parol tasdiqlash modali — yoqishda ham, o'chirishda ham so'raladi.
  const confirm = ref({ visible: false, method: null, enabled: true })
  const password = ref('')
  const passwordRef = ref(null)

  const openConfirm = (key, nextEnabled) => {
    confirm.value = { visible: true, method: key, enabled: nextEnabled }
    password.value = ''
  }

  // Fokus `@after-enter` da beriladi — modal kontenti ochilish animatsiyasi
  // TUGAGACH mount bo'ladi, `nextTick` esa hali erta (input topilmaydi).
  const focusPassword = () => passwordRef.value?.focus()

  const closeConfirm = () => {
    confirm.value.visible = false
    password.value = ''
  }

  const submit = () => {
    if (!password.value) return
    store
      ._updateLoginMethod({
        method: confirm.value.method,
        enabled: confirm.value.enabled,
        current_password: password.value
      })
      .then(() => {
        $Toast.success(t('loginMethods.saved'))
        closeConfirm()
      })
      // Xato xabari interceptor orqali ko'rsatiladi (masalan «Joriy parol
      // noto'g'ri») — modal ochiq qoladi, foydalanuvchi qayta urinadi.
      .catch(() => {})
  }
</script>

<template>
  <SectionHeader :title="$t('loginMethods.title')" :icon="ShieldIcon" large>
    <!-- Izoh oddiy <p> edi — sarlavha tagiga tiqilib, uzun bitta qator bo'lib
         ko'rinardi. Endi info-banner: nafas oladi va o'qish oson. -->
    <div class="flex items-start gap-3 rounded-2xl bg-primary/8 px-4 py-3 mb-5">
      <n-icon size="20" class="text-primary shrink-0 mt-0.5">
        <Info20Regular />
      </n-icon>
      <p class="text-sm text-textColor2 leading-relaxed max-w-[760px]">
        {{ $t('loginMethods.description') }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <div
        v-for="item in methods"
        :key="item.key"
        class="flex items-center gap-4 rounded-2xl bg-surface-ground px-4 py-3"
      >
        <span class="w-10 h-10 rounded-xl bg-surface-section flex items-center justify-center shrink-0">
          <n-icon size="22" class="text-primary">
            <component :is="item.icon" />
          </n-icon>
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-base font-semibold text-textColor0">
              {{ $t(`loginMethods.${item.key}.title`) }}
            </h3>
            <n-tag v-if="!stateOf(item.key).editable" size="small" type="info" round>
              {{ $t('loginMethods.comingSoon') }}
            </n-tag>
          </div>
          <p class="text-sm text-textColor2 mt-0.5">
            {{ $t(`loginMethods.${item.key}.hint`) }}
          </p>
        </div>

        <n-switch
          :value="stateOf(item.key).enabled"
          :disabled="!stateOf(item.key).editable"
          :loading="store.loginMethodLoading === item.key"
          @update:value="(v) => openConfirm(item.key, v)"
        />
      </div>
    </div>
  </SectionHeader>

  <n-modal
    v-model:show="confirm.visible"
    preset="card"
    class="max-w-[420px]"
    :title="$t('loginMethods.confirmTitle')"
    :mask-closable="false"
    @after-enter="focusPassword"
    @after-leave="closeConfirm"
  >
    <p class="text-sm text-textColor2 mb-3">{{ $t('loginMethods.confirmHint') }}</p>
    <n-input
      ref="passwordRef"
      v-model:value="password"
      type="password"
      show-password-on="click"
      :placeholder="$t('loginMethods.currentPassword')"
      @keyup.enter="submit"
    />

    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button ghost type="error" class="w-[120px]" @click="confirm.visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          class="w-[120px]"
          :disabled="!password"
          :loading="store.loginMethodLoading === confirm.method"
          @click="submit"
        >
          {{ $t('content.confirm') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>
