<script setup>
  // «HRM PRO» boti orqali ommaviy xabar yuborish formasi.
  import { useTelegramBroadcastStore } from '@stores'
  import i18n from '@/i18n/index.js'
  import UserSelect from './UserSelect.vue'
  import MessageEditor from './MessageEditor.vue'
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

  const onSubmit = () => {
    // uz bo'sh bo'lsa — uz tabiga qaytaramiz, xato o'sha yerda ko'rinadi.
    if (!store.payload.message?.uz?.trim()) activeLang.value = 'uz'
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

      <n-form-item :label="$t('notificationPage.sendTime')">
        <n-date-picker
          class="w-full"
          type="datetime"
          clearable
          :actions="['clear', 'confirm']"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
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

      <!-- Til switch (ixcham) + tayyor xabar tanlash + belgilar hisoblagichi -->
      <div class="col-span-2 mb-2 flex items-center gap-2">
        <n-radio-group v-model:value="activeLang" size="small" class="shrink-0">
          <n-radio-button v-for="l in langs" :key="l.key" :value="l.key">
            <span class="flex items-center gap-1">
              {{ l.label }}
              <span
                v-if="langFilled(l.key)"
                class="inline-block h-1.5 w-1.5 rounded-full bg-success"
              />
            </span>
          </n-radio-button>
        </n-radio-group>

        <n-select
          v-model:value="selectedTemplate"
          class="min-w-0 flex-1"
          size="small"
          clearable
          :options="templateOptions"
          :placeholder="$t('telegramBroadcast.templatePlaceholder')"
          @update:value="applyTemplate"
        />

        <span class="shrink-0 text-xs text-gray-400">{{ currentLength }} / {{ MAX_LENGTH }}</span>
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
        <MessageEditor
          :key="`${activeLang}-${editorKey}`"
          v-model="store.payload.message[activeLang]"
          :placeholder="placeholders[activeLang]"
          :disabled="store.saveLoading"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <n-button ghost type="error" @click="store.resetForm()">{{ $t('content.cancel') }}</n-button>
      <n-button type="primary" :loading="store.saveLoading" @click="onSubmit">
        {{
          store.payload.scheduled_at
            ? $t('telegramBroadcast.schedule')
            : $t('telegramBroadcast.send')
        }}
      </n-button>
    </div>
  </n-form>
</template>
