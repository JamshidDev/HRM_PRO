<script setup>
  import { useSignatureStore } from '@/store/modules/index.js'
  import { UsbStick24Filled } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  const store = useSignatureStore()

  // eslint-disable-next-line vue/return-in-computed-property
  const activeCallback = computed(() => {
    if (store.signatureType === store.signatureTypes.auth) return store._auth
    if (store.signatureType === store.signatureTypes.contract) return store._contract
  })

  onMounted(async () => {
    // window.onload = await store._initialSignature
  })
</script>

<template>
  <n-modal v-model:show="store.visible">
    <n-card
      style="width: 700px; --n-border-radius: 20px"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="bg-surface-section shadow-lg! overflow-hidden!"
    >
      <n-spin :show="store.loading" class="min-h-[100px]">
        <div class="flex flex-col w-full max-h-[420px] overflow-y-auto px-1 space-y-2.5">
          <div
            @click="store._accepted(useAppSetting.signatureUseType.idCard, activeCallback)"
            class="flex justify-center gap-3 items-center bg-surface-ground border border-surface-line rounded-2xl min-h-[64px] transition-colors"
            :class="[
              store.usbVisible
                ? 'cursor-pointer hover:border-primary hover:bg-primary/5'
                : 'cursor-not-allowed'
            ]"
          >
            <n-icon size="28" :class="[store.usbVisible ? 'text-success' : 'text-textColor3']">
              <UsbStick24Filled />
            </n-icon>
            <span
              class="font-semibold uppercase text-lg"
              :class="[store.usbVisible ? 'text-success' : 'text-textColor3 line-through']"
            >{{ $t('content.loginByUsb') }}</span>
          </div>
          <template v-for="(key, idx) in store.allKeys" :key="idx">
            <div
              @click="store._accepted(idx, activeCallback)"
              :class="[!key.isValid && 'bg-danger/6']"
              class="grid grid-cols-12 gap-y-3 w-full bg-surface-ground border border-surface-line rounded-2xl px-5 py-4 cursor-pointer transition-all hover:border-primary hover:shadow-sm"
            >
              <div
                class="col-span-12 font-bold text-base mb-1 text-textColor0 flex items-center gap-3"
              >
                {{ key?.fullName }}
                <n-button v-if="!key.isValid" type="error" size="tiny" secondary>
                  {{
                    $t('signature.notValidDate')
                  }}
                </n-button>
              </div>

              <div class="col-span-4 font-bold">
                <span class="text-[11px] font-medium uppercase tracking-wide block text-textColor3 mb-0.5">{{
                  $t('signature.pinfl')
                }}</span>
                <span class="text-sm block font-semibold text-textColor2">{{ key?.pinfl }}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-[11px] font-medium uppercase tracking-wide block text-textColor3 mb-0.5">{{
                  $t('signature.inn')
                }}</span>
                <span class="text-sm block font-semibold text-textColor2">{{ key?.inn }}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-[11px] font-medium uppercase tracking-wide block text-textColor3 mb-0.5">{{
                  $t('signature.keyType')
                }}</span>
                <span class="text-primary text-sm block font-semibold">{{
                  $t(key?.key_type)
                }}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-[11px] font-medium uppercase tracking-wide block text-textColor3 mb-0.5">{{
                  $t('signature.certificate')
                }}</span>
                <span class="text-sm block font-semibold text-textColor2">{{
                  key?.certificate
                }}</span>
              </div>
              <div class="col-span-4 font-bold">
                <span class="text-[11px] font-medium uppercase tracking-wide block text-textColor3 mb-0.5">{{
                  $t('signature.validDate')
                }}</span>
                <span
                  :class="[!key?.isValid && '!text-danger']"
                  class="text-sm block font-semibold text-textColor2"
                >{{ Utils.timeWithMonth(key?.validDate) }}</span>
              </div>
            </div>
          </template>
        </div>
      </n-spin>
    </n-card>
  </n-modal>
</template>
