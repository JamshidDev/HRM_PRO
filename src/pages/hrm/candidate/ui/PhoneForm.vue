<script setup>
  import { v4 as uuidv4 } from 'uuid'
  import { UIFigBlock } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import icons from '@/assets/icons'

  /** Figma "Telefon raqam" bloki (node 3132:61872) */
  const emits = defineEmits(['onDelete'])

  // `max = 1` — bitta raqamli rejim (xodim yaratish): qo'shish/o'chirish tugmalari
  // va "asosiy" belgisi ko'rsatilmaydi. Qo'shimcha raqamlar keyin xodimning
  // shaxsiy ma'lumotlaridan tahrirlanadi.
  const props = defineProps({
    max: { type: Number, default: 3 }
  })
  const single = computed(() => props.max === 1)

  const phones = defineModel('phones', {
    type: Array,
    required: true,
    default: []
  })


  const onAdd = () => {
    phones.value.push({ id: uuidv4(), phone: '+998', main: false, exist: false })
  }

  // Bitta raqam login sifatida ishlatiladi — belgilanganda qolganlari bo'shatiladi
  const onSetMain = (item) => {
    phones.value = phones.value.map((v) => ({ ...v, main: v.id === item.id }))
  }

  const onRemove = (v) => {
    emits('onDelete', v)
    phones.value = phones.value.filter((x) => x.id !== v.id)
  }

  watchEffect(() => {
    if (!phones.value.some((x) => x.main) && phones.value[0]) {
      phones.value[0].main = true
    }
  })
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
      <div v-for="(item, idx) in phones" :key="item.id" class="flex items-start gap-4">
        <button
          v-if="!single"
          type="button"
          class="phone-check"
          :class="item.main && 'phone-check--on'"
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

        <!-- Validatsiya butun ro'yxatga tegishli, shuning uchun faqat birinchi qatorda -->
        <n-form-item
          v-if="idx === 0"
          class="phone-item"
          :show-label="false"
          path="phones"
          :rule-path="validationRules.rulesNames.requiredPhonesField"
        >
          <div class="phone-input">
            <n-icon :size="20" class="text-fig-text-tertiary shrink-0">
              <component :is="icons.figPhone" />
            </n-icon>
            <input
              v-model="item.phone"
              v-mask="`+998##-###-##-##`"
              class="phone-input__control"
              type="text"
            />
          </div>
        </n-form-item>

        <div v-else class="phone-input">
          <n-icon :size="20" class="text-fig-text-tertiary shrink-0">
            <component :is="icons.figPhone" />
          </n-icon>
          <input
            v-model="item.phone"
            v-mask="`+998##-###-##-##`"
            class="phone-input__control"
            type="text"
          />
        </div>

        <button
          v-if="!single && idx + 1 === phones.length && phones.length < props.max"
          type="button"
          class="phone-round"
          @click="onAdd"
        >
          <n-icon :size="24" class="text-fig-text-secondary">
            <component :is="icons.figPlus" />
          </n-icon>
        </button>

        <button
          v-if="!single && idx > 0"
          type="button"
          class="phone-round"
          @click="onRemove(item)"
        >
          <n-icon :size="18" class="text-fig-text-red">
            <component :is="icons.figTrash" />
          </n-icon>
        </button>
      </div>

      <span class="text-xs leading-4 text-fig-text-tertiary">
        {{ single ? $t('createWorkerPage.ui.phoneSingle') : $t('createWorkerPage.ui.phone') }}
      </span>
    </div>
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
    // Maketda belgilash qutisi 44px li input markaziga tekislangan (y=10)
    margin-top: 10px;
    border: 1px solid var(--fig-neutral-300);
    border-radius: 8px;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
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

  .phone-input__control {
    flex: 1 0 0;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    color: var(--fig-text-primary);
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
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  // Xato matni input ostida chiqadi, qatordagi boshqa elementlarni surmaydi
  .phone-item {
    flex-shrink: 0;

    :deep(.n-form-item-feedback-wrapper) {
      min-height: 18px;
      font-size: 12px;
      line-height: 16px;
    }
  }
</style>
