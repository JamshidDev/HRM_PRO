<script setup>
  import { v4 as uuidv4 } from 'uuid'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import { UIProfileButton, UIFigBlock } from '@/components/index.js'
  import { useWorkerProfileStore } from '@/store/modules/index.js'

  /** Figma "Telefon raqam" bloki (node 2596:206982) */
  const store = useWorkerProfileStore()
  const editing = ref(false)

  const MAX_PHONES = 3
  const phones = computed(() => store.payload.phones ?? [])

  const onAdd = () => {
    store.payload.phones.push({ id: uuidv4(), phone: '+998', main: false, exist: false })
  }

  const onRemove = (item) => {
    if (item.exist) store._deletePhone(item.id)
    store.payload.phones = store.payload.phones.filter((x) => x.id !== item.id)
  }

  // Bitta raqam login sifatida ishlatiladi — belgilanganda qolganlari bo'shatiladi
  const onSetMain = (item) => {
    if (!editing.value) return
    store.payload.phones = store.payload.phones.map((v) => ({ ...v, main: v.id === item.id }))
  }

  const onCancel = () => {
    editing.value = false
    store._index()
  }

  const onSave = () => {
    store.savePersonalInfo()
    editing.value = false
  }
</script>

<template>
  <UIFigBlock :title="$t('workerProfile.personal.phoneTitle')" :icon="icons.figPhoneCall">
    <template #trailing>
      <span class="phone-chip">
        <n-icon :size="16">
          <component :is="icons.figKey" />
        </n-icon>
        {{ $t('workerProfile.personal.usedAsLogin') }}
      </span>
    </template>

    <div class="flex flex-col gap-3 w-full">
      <div v-for="(item, idx) in phones" :key="item.id" class="flex items-center gap-4">
        <button
          type="button"
          class="phone-check"
          :class="item.main && 'phone-check--on'"
          :disabled="!editing"
          @click="onSetMain(item)"
        >
          <svg v-if="item.main" width="9" height="6" viewBox="0 0 9 6" fill="none">
            <path
              d="M1 2.8L3.3 5 8 1"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div class="phone-input">
          <n-icon :size="20" class="text-fig-text-tertiary shrink-0">
            <component :is="icons.figPhone" />
          </n-icon>
          <input
            v-if="editing"
            v-model="item.phone"
            v-mask="`+998##-###-##-##`"
            class="phone-input__control"
            type="text"
          />
          <span v-else class="phone-input__value">{{ item.phone || '—' }}</span>
        </div>

        <button
          v-if="editing && idx + 1 === phones.length && phones.length < MAX_PHONES"
          type="button"
          class="phone-round"
          @click="onAdd"
        >
          <n-icon :size="24" class="text-fig-text-secondary">
            <component :is="icons.figPlus" />
          </n-icon>
        </button>

        <button v-if="editing && idx > 0" type="button" class="phone-round" @click="onRemove(item)">
          <n-icon :size="18" class="text-fig-text-red">
            <component :is="icons.figTrash" />
          </n-icon>
        </button>
      </div>

      <n-collapse-transition :show="!store.isExistAccount">
        <n-alert type="error" size="small">
          {{
            store.anotherProfile
              ? $t('createWorkerPage.otherProfile', {
                  n: `${Utils.combineFullName(store.anotherProfile?.worker)}`
                })
              : $t('createWorkerPage.no-account')
          }}
        </n-alert>
      </n-collapse-transition>
    </div>

    <template #actions>
      <template v-if="editing">
        <UIProfileButton variant="danger" @click="onCancel">
          {{ $t('content.cancel') }}
        </UIProfileButton>
        <UIProfileButton :loading="store.loading" @click="onSave">
          {{ $t('content.save') }}
        </UIProfileButton>
      </template>
      <UIProfileButton v-else @click="editing = true">{{ $t('content.edit') }}</UIProfileButton>
    </template>
  </UIFigBlock>
</template>

<style lang="scss" scoped>
  .phone-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 9999px;
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    white-space: nowrap;
  }

  .phone-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    border: 1px solid var(--fig-neutral-300);
    border-radius: 8px;
    background: transparent;
    color: #ffffff;
    cursor: pointer;

    &:disabled {
      cursor: default;
    }
  }

  .phone-check--on {
    border-color: var(--fig-icon-brand);
    background: var(--fig-icon-brand);
  }

  .phone-input {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 344px;
    max-width: 100%;
    min-height: 44px;
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--fig-bg-secondary);
  }

  .phone-input__value,
  .phone-input__control {
    flex: 1 0 0;
    min-width: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
  }

  .phone-input__control {
    border: none;
    outline: none;
    background: transparent;
  }

  .phone-round {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 10px;
    border: none;
    border-radius: 9999px;
    background: var(--fig-bg-secondary);
    cursor: pointer;
  }
</style>
