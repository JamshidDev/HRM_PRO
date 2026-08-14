<script setup>
  import { ref, computed } from 'vue'
  import { useEtspStore } from '@/store/modules/index.js'

  const store = useEtspStore()

  const step = ref(1) // 1 = kalit tanlash, 2 = parol
  const selected = ref(null)
  const password = ref('')

  const visible = computed({
    get: () => store.visible,
    set: (v) => (store.visible = v)
  })

  const selectedKey = computed(() =>
    selected.value === null ? null : store.allKeys[selected.value]
  )

  const reset = () => {
    step.value = 1
    selected.value = null
    password.value = ''
  }

  const onClose = () => {
    store.visible = false
    reset()
  }

  const goPassword = () => {
    if (selected.value === null || selectedKey.value?.expired) return
    step.value = 2
  }

  const onConfirm = async () => {
    if (!password.value || store.loading) return
    await store._accepted(selectedKey.value, password.value)
    // muvaffaqiyatда store.visible=false; aks holда parol bosqichида qolamiz
    if (!store.visible) reset()
  }

  // "Amal qiladi" / "Muddati tugagan" matni
  const statusLabel = (k) => (k.expired ? 'Muddati tugagan' : 'Amal qiladi')
</script>

<template>
  <n-modal
    v-model:show="visible"
    :mask-closable="!store.loading"
    :close-on-esc="!store.loading"
    @after-leave="reset"
  >
    <div class="etsp-card" role="dialog" aria-modal="true">
      <button class="etsp-x" :disabled="store.loading" @click="onClose" aria-label="Yopish">✕</button>

      <!-- 1-BOSQICH: kalit tanlash -->
      <template v-if="step === 1">
        <div class="etsp-list">
          <label
            v-for="(k, i) in store.allKeys"
            :key="k.file + i"
            class="etsp-item"
            :class="{ selected: selected === i, disabled: k.expired }"
          >
            <input
              class="etsp-radio"
              type="radio"
              :value="i"
              v-model="selected"
              :disabled="k.expired"
            />
            <div class="etsp-info">
              <div class="etsp-name">{{ k.fio }}</div>
              <div class="etsp-meta">
                <template v-if="k.pinfl">JSHSHIR: {{ k.pinfl }}</template>
                <template v-else>{{ k.file }}</template>
                <template v-if="k.notAfter"> · {{ statusLabel(k) }}: {{ k.notAfter }}</template>
              </div>
            </div>
            <span class="etsp-badge" :class="k.expired ? 'bad' : 'ok'">
              <span class="dot">{{ k.expired ? '!' : '✓' }}</span>
              {{ statusLabel(k) }}
            </span>
          </label>
        </div>

        <div class="etsp-footer">
          <button class="etsp-btn cancel" :disabled="store.loading" @click="onClose">
            Bekor qilish
          </button>
          <button
            class="etsp-btn go"
            :disabled="selected === null || selectedKey?.expired"
            @click="goPassword"
          >
            Davom etish
          </button>
        </div>
      </template>

      <!-- 2-BOSQICH: parol -->
      <template v-else>
        <div class="etsp-pw">
          <div class="etsp-pw-name">{{ selectedKey?.fio }}</div>
          <div class="etsp-meta" v-if="selectedKey?.pinfl">JSHSHIR: {{ selectedKey.pinfl }}</div>
          <n-input
            v-model:value="password"
            type="password"
            show-password-on="click"
            placeholder="Kalit paroli"
            size="large"
            autofocus
            :disabled="store.loading"
            @keyup.enter="onConfirm"
          />
        </div>

        <div class="etsp-footer">
          <button class="etsp-btn cancel" :disabled="store.loading" @click="step = 1">
            Orqaga
          </button>
          <button class="etsp-btn go" :disabled="!password || store.loading" @click="onConfirm">
            <span v-if="store.loading">Kirilmoqda…</span>
            <span v-else>Kirish</span>
          </button>
        </div>
      </template>
    </div>
  </n-modal>
</template>

<style scoped>
  .etsp-card {
    position: relative;
    width: 560px;
    max-width: 94vw;
    background: #fff;
    border-radius: 22px;
    padding: 26px;
    box-shadow: 0 24px 60px rgba(3, 79, 146, 0.22);
  }
  .etsp-x {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 50%;
    background: #eef1f5;
    color: #6b7280;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .etsp-x:hover {
    background: #e2e6ec;
  }

  .etsp-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 10px 0 20px;
    max-height: 46vh;
    overflow-y: auto;
  }
  .etsp-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    border: 1.5px solid #eef0f4;
    border-radius: 16px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .etsp-item:hover:not(.disabled) {
    border-color: #cfe0f6;
  }
  .etsp-item.selected {
    border-color: #1279f0;
    box-shadow: 0 0 0 3px rgba(18, 121, 240, 0.12);
  }
  .etsp-item.disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
  .etsp-radio {
    width: 20px;
    height: 20px;
    accent-color: #1279f0;
    flex: 0 0 auto;
  }
  .etsp-info {
    flex: 1 1 auto;
    min-width: 0;
  }
  .etsp-name {
    font-weight: 700;
    font-size: 15px;
    color: #0f2544;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }
  .etsp-meta {
    margin-top: 3px;
    font-size: 13px;
    color: #8a94a6;
    word-break: break-word;
  }
  .etsp-badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }
  .etsp-badge .dot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    color: #fff;
    font-size: 11px;
    line-height: 1;
  }
  .etsp-badge.ok {
    background: #dff5e8;
    color: #1a9d5a;
  }
  .etsp-badge.ok .dot {
    background: #22b06b;
  }
  .etsp-badge.bad {
    background: #fde3e3;
    color: #e0483d;
  }
  .etsp-badge.bad .dot {
    background: #ef4444;
  }

  .etsp-pw {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 16px 0 22px;
  }
  .etsp-pw-name {
    font-weight: 700;
    font-size: 16px;
    color: #0f2544;
    text-transform: uppercase;
  }

  .etsp-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .etsp-btn {
    height: 52px;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.15s, opacity 0.15s;
  }
  .etsp-btn.cancel {
    background: #f2f4f7;
    color: #3b4658;
  }
  .etsp-btn.cancel:hover {
    filter: brightness(0.97);
  }
  .etsp-btn.go {
    background: #86e0af;
    color: #0b5733;
  }
  .etsp-btn.go:hover:not(:disabled) {
    filter: brightness(0.96);
  }
  .etsp-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
</style>
