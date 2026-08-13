<script setup>
  import { ref, computed } from 'vue'
  import { useEtspStore } from '@/store/modules/index.js'
  import { Key24Regular, LockClosed24Regular } from '@vicons/fluent'

  const store = useEtspStore()

  const selected = ref(null) // tanlangan kalit indeksi
  const password = ref('')

  const visible = computed({
    get: () => store.visible,
    set: (v) => (store.visible = v)
  })

  const canConfirm = computed(
    () => selected.value !== null && !!password.value && !store.loading
  )

  const onConfirm = async () => {
    if (!canConfirm.value) return
    const key = store.allKeys[selected.value]
    await store._accepted(key, password.value)
    // muvaffaqiyatda store.visible=false bo'ladi; xatoda modal ochiq qoladi
    if (!store.visible) {
      password.value = ''
      selected.value = null
    }
  }

  const onClose = () => {
    store.visible = false
    password.value = ''
    selected.value = null
  }
</script>

<template>
  <n-modal
    v-model:show="visible"
    :mask-closable="!store.loading"
    :close-on-esc="!store.loading"
    @after-leave="onClose"
  >
    <n-card
      style="width: 460px; max-width: 92vw"
      :bordered="false"
      role="dialog"
      aria-modal="true"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <n-icon :component="Key24Regular" size="22" />
          <span class="font-semibold">ETSP kalit bilan kirish</span>
        </div>
      </template>

      <div class="flex flex-col gap-3">
        <p class="text-sm opacity-70 m-0">Kirish uchun kalitni tanlang:</p>

        <n-radio-group v-model:value="selected" class="w-full">
          <div class="flex flex-col gap-2">
            <n-radio
              v-for="(k, i) in store.allKeys"
              :key="k.file + i"
              :value="i"
              :disabled="k.expired"
              class="etsp-key-item"
            >
              <div class="flex flex-col">
                <span class="font-medium">{{ k.fio }}</span>
                <span class="text-xs opacity-60">
                  {{ k.pinfl ? 'PINFL: ' + k.pinfl : k.file }}
                  <template v-if="k.notAfter"> · {{ k.notAfter }}</template>
                  <template v-if="k.expired"> · muddati tugagan</template>
                </span>
              </div>
            </n-radio>
          </div>
        </n-radio-group>

        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          placeholder="Kalit paroli"
          size="large"
          :disabled="store.loading"
          @keyup.enter="onConfirm"
        >
          <template #prefix>
            <n-icon :component="LockClosed24Regular" />
          </template>
        </n-input>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button :disabled="store.loading" @click="onClose">Bekor qilish</n-button>
          <n-button
            type="primary"
            :loading="store.loading"
            :disabled="!canConfirm"
            @click="onConfirm"
          >
            Kirish
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
  .etsp-key-item {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--login-border, #e5e7eb);
    border-radius: 10px;
  }
</style>
