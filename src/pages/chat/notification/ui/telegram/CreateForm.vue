<script setup>
  // «HRM PRO» boti orqali ommaviy xabar yuborish formasi.
  import { useTelegramBroadcastStore } from '@stores'
  import i18n from '@/i18n/index.js'
  import UserSelect from './UserSelect.vue'
  import MessageEditor from './MessageEditor.vue'
  import { Notepad20Regular } from '@vicons/fluent'
  import dayjs from 'dayjs'
  import { telegramTextLength } from '@/utils/telegramHtml.js'
  import { messageTemplates } from './templates.js'

  const { t } = i18n.global
  const store = useTelegramBroadcastStore()
  const formRef = ref(null)

  // Matn 3 tilda; uz majburiy, qolgani bo'sh bo'lsa o'sha odamga ham uz ketadi.
  const activeLang = ref('uz')
  const langs = [
    { key: 'uz', label: t('content.uz') },
    { key: 'ru', label: t('content.ru') },
    { key: 'en', label: t('content.en') }
  ]
  const langFilled = (lang) => Boolean(store.payload.message?.[lang]?.trim())

  const audienceOptions = computed(() => [
    { label: t('telegramBroadcast.audience.all_staff'), value: 'all_staff' },
    { label: t('telegramBroadcast.audience.selected'), value: 'selected' }
  ])

  const placeholders = {
    uz: "Masalan: Hurmatli xodimlar, ertaga tizimda profilaktika ishlari bo'ladi.",
    ru: 'Например: Уважаемые сотрудники, завтра плановые работы в системе.',
    en: 'e.g. Dear colleagues, scheduled maintenance takes place tomorrow.'
  }

  // Telegram bitta xabarda 4096 belgi oladi — 4000 da to'xtatamiz (backend ham shunday).
  const MAX_LENGTH = 4000
  const currentLength = computed(() =>
    telegramTextLength(store.payload.message[activeLang.value])
  )

  // Tayyor xabarlar — tanlansa uchala til inputi birdan to'ladi (keyin tahrirlash mumkin).
  const selectedTemplate = ref(null)
  const templateOptions = computed(() =>
    messageTemplates.map((tpl) => ({
      label: t(`telegramBroadcast.templates.${tpl.labelKey}`),
      value: tpl.key
    }))
  )
  // Muharrir `contenteditable` — tashqaridan matn kelganda uni qayta qurish kerak.
  const editorKey = ref(0)
  const applyTemplate = (key) => {
    const tpl = messageTemplates.find((i) => i.key === key)
    if (!tpl) return
    store.payload.message = { ...tpl.message }
    editorKey.value += 1
  }

  // Faqat kelajak: o'tgan kun tanlanmaydi, o'tgan soat esa submitda ushlanadi.
  const disablePastDate = (ts) => ts < dayjs().startOf('day').valueOf()
  const isPastTime = computed(() => {
    const v = store.payload.scheduled_at
    return !!v && dayjs(v, 'YYYY-MM-DD HH:mm:ss').valueOf() <= Date.now()
  })

  const onSubmit = () => {
    // uz bo'sh bo'lsa — uz tabiga qaytaramiz, xato o'sha yerda ko'rinadi.
    if (!store.payload.message?.uz?.trim()) activeLang.value = 'uz'
    if (isPastTime.value) return
    formRef.value?.validate((error) => {
      if (!error) store._store()
    })
  }
</script>

<template>
  <!-- Kompakt joylashuv: «Kimga» + «Rejalashtirilgan» bir qatorda, qolgan
       elementlar to'liq kenglikda (FCM formasidagi 2-ustunli grid kabi). -->
  <n-form ref="formRef" :model="store.payload" :disabled="store.saveLoading" size="medium">
    <div class="grid grid-cols-2 gap-x-3">
      <n-form-item :label="$t('telegramBroadcast.audienceLabel')">
        <n-select v-model:value="store.payload.audience" :options="audienceOptions" />
      </n-form-item>

      <n-form-item
        :label="$t('telegramBroadcast.sendTimeLabel')"
        :validation-status="isPastTime ? 'error' : undefined"
        :feedback="isPastTime ? $t('telegramBroadcast.sendTimeFuture') : undefined"
      >
        <n-date-picker
          class="w-full"
          type="datetime"
          clearable
          :actions="['clear', 'confirm']"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          :is-date-disabled="disablePastDate"
          v-model:formatted-value="store.payload.scheduled_at"
          placeholder=""
        />
      </n-form-item>

      <n-form-item
        v-if="store.payload.audience === 'selected'"
        class="col-span-2"
        :label="$t('content.users')"
        path="user_ids"
        :rule="[
          {
            trigger: ['change', 'blur'],
            validator() {
              return store.payload.user_ids.length ? true : new Error($t('rules.requiredField'))
            }
          }
        ]"
      >
        <UserSelect v-model="store.payload.user_ids" />
      </n-form-item>

      <!-- Til almashtirgich (segment) + tayyor xabar + belgilar hisoblagichi -->
      <div class="col-span-2 mb-2 flex items-center gap-2">
        <div class="tg-lang shrink-0">
          <button
            v-for="l in langs"
            :key="l.key"
            type="button"
            class="tg-lang__btn"
            :class="{ 'tg-lang__btn--active': activeLang === l.key }"
            @click="activeLang = l.key"
          >
            {{ l.label }}
            <span v-if="langFilled(l.key)" class="tg-lang__dot" />
          </button>
        </div>

        <n-select
          v-model:value="selectedTemplate"
          class="min-w-0 flex-1"
          size="small"
          clearable
          :options="templateOptions"
          :placeholder="$t('telegramBroadcast.templatePlaceholder')"
          @update:value="applyTemplate"
        >
          <template #prefix>
            <n-icon size="15" class="text-textColor3"><Notepad20Regular /></n-icon>
          </template>
        </n-select>
      </div>

      <n-form-item
        class="col-span-2"
        :label="$t('telegramBroadcast.messageText')"
        path="message"
        :rule="[
          {
            trigger: ['input', 'blur'],
            validator() {
              return store.payload.message?.uz?.trim() ? true : new Error($t('rules.requiredField'))
            }
          }
        ]"
      >
        <!-- `key` — til almashganda muharrir yangi matn bilan qayta quriladi. -->
        <div class="w-full">
          <MessageEditor
            :key="`${activeLang}-${editorKey}`"
            v-model="store.payload.message[activeLang]"
            :placeholder="placeholders[activeLang]"
            :disabled="store.saveLoading"
          />
          <!-- Belgilar hisoblagichi — maydon ostida, o'ngda. -->
          <div
            class="mt-1 text-right text-xs tabular-nums"
            :class="currentLength > MAX_LENGTH * 0.9 ? 'text-warning' : 'text-textColor3'"
          >
            {{ currentLength }} / {{ MAX_LENGTH }}
          </div>
        </div>
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <n-button ghost type="error" @click="store.resetForm()">{{ $t('content.cancel') }}</n-button>
      <n-button
        type="primary"
        :loading="store.saveLoading"
        :disabled="isPastTime"
        @click="onSubmit"
      >
        {{
          store.payload.scheduled_at
            ? $t('telegramBroadcast.schedule')
            : $t('telegramBroadcast.send')
        }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>
  /* Til almashtirgich — segment ko'rinishidagi ixcham «pill»lar. */
  .tg-lang {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border-radius: 999px;
    background: var(--surface-ground, rgb(0 0 0 / 4%));
  }

  .tg-lang__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--textColor2);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .tg-lang__btn:hover {
    color: var(--textColor0);
  }

  .tg-lang__btn--active {
    background: var(--surface-section, #fff);
    color: var(--color-primary);
    box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
  }

  /* To'ldirilgan til — yashil nuqta. */
  .tg-lang__dot {
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--color-success);
  }
</style>
