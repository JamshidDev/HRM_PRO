<script setup>
  import { useSignatureStore } from '@/store/modules/index.js'
  import {
    UsbStick24Filled,
    CheckmarkCircle16Filled,
    ErrorCircle24Filled,
    ArrowSyncCircle16Filled
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  // eimzoGate ulanishi (olib tashlashda shu ikki qator ham o'chadi).
  import { useEimzoGateStore } from '@/features/eimzoGate/eimzoGateStore.js'
  import { GATE_SIGNATURE_TYPE } from '@/features/eimzoGate/config.js'
  const store = useSignatureStore()
  const gateStore = useEimzoGateStore()

  const hasKeys = computed(() => store.usbVisible || store.allKeys.length > 0)

  // Login oqimida tasdiqlash tugmasi yo'q: kalit bosilishi bilan E-IMZO paroli
  // so'raladi va parol to'g'ri bo'lsa tizimga avtomatik kiritiladi. Hujjat
  // imzolashda esa avvalgidek tanlab, keyin "Davom etish" bosiladi.
  const isAuth = computed(() => store.signatureType === store.signatureTypes.auth)

  const onRefreshKeys = async () => {
    store.loading = true
    try {
      await store._checkVersion()
      store.checkListKey()
      store.checkCardPluggedIn()
    } finally {
      store.loading = false
    }
  }

  const selected = ref(null)

  // eslint-disable-next-line vue/return-in-computed-property
  const activeCallback = computed(() => {
    if (store.signatureType === store.signatureTypes.auth) return store._auth
    if (store.signatureType === store.signatureTypes.contract) return store._contract
    // eimzoGate: olib tashlashda shu qator va yuqoridagi import o'chiriladi.
    if (store.signatureType === GATE_SIGNATURE_TYPE) return gateStore._sign
  })

  const canContinue = computed(() => {
    if (selected.value === 'usb') return store.usbVisible
    if (typeof selected.value === 'number') return !!store.allKeys[selected.value]?.isValid
    return false
  })

  const onContinue = () => {
    if (selected.value === 'usb') {
      store._accepted(useAppSetting.signatureUseType.idCard, activeCallback.value)
    } else if (typeof selected.value === 'number') {
      store._accepted(selected.value, activeCallback.value)
    }
  }

  const onSelect = (value) => {
    if (store.loading) return
    selected.value = value
    if (isAuth.value) onContinue()
  }

  const storageLabel = (type) =>
    type === 'pfx' ? 'signature.storagePfx' : 'signature.storageToken'

  const validPeriod = (key) => {
    const to = Utils.timeOnlyDate(key.validDate)
    const from = key.validFrom ? Utils.timeOnlyDate(key.validFrom) : null
    return from ? `${from} — ${to}` : to
  }

  watch(
    () => store.visible,
    (v) => {
      if (v) selected.value = null
    }
  )
</script>

<template>
  <n-modal v-model:show="store.visible">
    <n-card
      style="width: 640px; --n-border-radius: 20px"
      :bordered="false"
      size="medium"
      role="dialog"
      aria-modal="true"
      closable
      @close="store.visible = false"
      class="bg-surface-section shadow-lg! overflow-hidden!"
    >
      <template #header>
        <div class="text-lg font-semibold text-textColor1">
          {{
            isAuth
              ? $t('signature.authKeySelectTitle')
              : $t('documentPage.signature.keySelectTitle')
          }}
        </div>
      </template>
      <p v-if="hasKeys" class="text-sm text-gray-400 mb-3">
        {{
          isAuth ? $t('signature.authKeySelectDesc') : $t('documentPage.signature.keySelectDesc')
        }}
      </p>
      <n-spin :show="store.loading" class="min-h-[100px]">
        <div
          v-if="!hasKeys"
          class="flex flex-col items-center justify-center text-center py-10 mb-4"
        >
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <n-icon size="22" class="text-primary">
              <ErrorCircle24Filled />
            </n-icon>
          </div>
          <h3 class="text-base font-semibold text-textColor1 mb-1">
            {{ $t('signature.noKeysTitle') }}
          </h3>
          <p class="text-sm text-gray-400 max-w-[360px] mb-3">
            {{ $t('signature.noKeysDesc') }}
          </p>
          <n-button @click="onRefreshKeys" tertiary size="small">
            <template #icon>
              <n-icon size="16">
                <ArrowSyncCircle16Filled />
              </n-icon>
            </template>
            {{ $t('content.refresh') }}
          </n-button>
        </div>
        <div v-else class="flex flex-col w-full max-h-[420px] overflow-y-auto space-y-2.5">
          <div
            v-if="store.usbVisible"
            @click="onSelect('usb')"
            class="flex items-center gap-3 border rounded-2xl px-4 py-3 cursor-pointer transition-colors"
            :class="[
              selected === 'usb'
                ? 'border-primary bg-primary/5'
                : 'border-surface-line hover:border-primary/40'
            ]"
          >
            <div
              class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="[selected === 'usb' ? 'border-primary' : 'border-surface-line']"
            >
              <div v-if="selected === 'usb'" class="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <n-icon size="24" class="text-success">
              <UsbStick24Filled />
            </n-icon>
            <span class="font-semibold uppercase text-textColor0">
              {{ $t('content.loginByUsb') }}
            </span>
          </div>

          <template v-for="(key, idx) in store.allKeys" :key="idx">
            <div
              @click="key.isValid && onSelect(idx)"
              class="border rounded-2xl px-4 py-3 transition-colors"
              :class="[
                !key.isValid
                  ? 'opacity-60 cursor-not-allowed border-surface-line'
                  : 'cursor-pointer',
                key.isValid && selected === idx
                  ? 'border-primary bg-primary/5'
                  : key.isValid && 'border-surface-line hover:border-primary/40'
              ]"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 min-w-0">
                  <div
                    v-if="key.isValid"
                    class="w-4 h-4 mt-1 rounded-full border-2 flex items-center justify-center shrink-0"
                    :class="[selected === idx ? 'border-primary' : 'border-surface-line']"
                  >
                    <div v-if="selected === idx" class="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-textColor0 truncate">
                      {{ key?.fullName
                      }}<template v-if="key.key_type === 'signature.legalPerson'">
                        — {{ $t('signature.sealKeyLabel') }}
                      </template>
                    </div>
                    <div class="text-xs text-textColor3 mt-0.5">
                      {{ $t(key.key_type) }} · {{ $t(storageLabel(key.storageType)) }}
                    </div>
                  </div>
                </div>
                <n-button
                  :type="key.isValid ? 'success' : 'error'"
                  size="tiny"
                  secondary
                  class="shrink-0"
                >
                  <template #icon>
                    <n-icon>
                      <CheckmarkCircle16Filled v-if="key.isValid" />
                      <ErrorCircle24Filled v-else />
                    </n-icon>
                  </template>
                  {{ key.isValid ? $t('signature.validKey') : $t('signature.notValidDate') }}
                </n-button>
              </div>

              <dl class="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
                <div v-if="key.pinfl" class="flex gap-1.5 min-w-0">
                  <dt class="text-textColor3 shrink-0">{{ $t('signature.pinfl') }}:</dt>
                  <dd class="text-textColor1 truncate">{{ key.pinfl }}</dd>
                </div>
                <div v-if="key.inn" class="flex gap-1.5 min-w-0">
                  <dt class="text-textColor3 shrink-0">{{ $t('signature.inn') }}:</dt>
                  <dd class="text-textColor1 truncate">{{ key.inn }}</dd>
                </div>
                <div v-if="key.organization" class="flex gap-1.5 min-w-0 sm:col-span-2">
                  <dt class="text-textColor3 shrink-0">{{ $t('signature.organization') }}:</dt>
                  <dd class="text-textColor1 truncate">{{ key.organization }}</dd>
                </div>
                <div v-if="key.position" class="flex gap-1.5 min-w-0 sm:col-span-2">
                  <dt class="text-textColor3 shrink-0">{{ $t('signature.position') }}:</dt>
                  <dd class="text-textColor1 truncate">{{ key.position }}</dd>
                </div>
                <div v-if="key.serialNumber" class="flex gap-1.5 min-w-0">
                  <dt class="text-textColor3 shrink-0">{{ $t('signature.certificate') }}:</dt>
                  <dd class="text-textColor1 truncate">{{ key.serialNumber }}</dd>
                </div>
                <div class="flex gap-1.5 min-w-0">
                  <dt class="text-textColor3 shrink-0">{{ $t('signature.validDate') }}:</dt>
                  <dd class="text-textColor1 truncate">{{ validPeriod(key) }}</dd>
                </div>
              </dl>
            </div>
          </template>
        </div>
      </n-spin>

      <div v-if="!isAuth" class="grid grid-cols-2 gap-3 mt-4">
        <n-button secondary @click="store.visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="success" :disabled="!canContinue" @click="onContinue">
          {{ $t('content.continue') }}
        </n-button>
      </div>
    </n-card>
  </n-modal>
</template>
