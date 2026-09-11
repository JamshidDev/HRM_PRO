<script setup>
  // «HRM PRO» boti orqali ommaviy xabar yuborish formasi.
  import { useTelegramBroadcastStore } from '@stores'
  import i18n from '@/i18n/index.js'
  import UserSelect from './UserSelect.vue'

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
  const currentLength = computed(() => store.payload.message[activeLang.value]?.length ?? 0)

  const onSubmit = () => {
    // uz bo'sh bo'lsa — uz tabiga qaytaramiz, xato o'sha yerda ko'rinadi.
    if (!store.payload.message?.uz?.trim()) activeLang.value = 'uz'
    formRef.value?.validate((error) => {
      if (!error) store._store()
    })
  }
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.payload"
    :disabled="store.saveLoading"
    size="large"
  >
    <n-form-item :label="$t('telegramBroadcast.audienceLabel')">
      <n-select v-model:value="store.payload.audience" :options="audienceOptions" />
    </n-form-item>

    <n-form-item
      v-if="store.payload.audience === 'selected'"
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

    <!-- Til tablari — to'ldirilgan tilda yashil nuqta -->
    <n-tabs v-model:value="activeLang" type="segment" size="small" class="mb-2">
      <n-tab v-for="l in langs" :key="l.key" :name="l.key">
        <span class="flex items-center gap-1">
          {{ l.label }}
          <span v-if="langFilled(l.key)" class="inline-block h-1.5 w-1.5 rounded-full bg-success" />
        </span>
      </n-tab>
    </n-tabs>

    <n-form-item
      :label="$t('content.description')"
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
      <n-input
        v-model:value="store.payload.message[activeLang]"
        type="textarea"
        :rows="6"
        :maxlength="MAX_LENGTH"
        :placeholder="placeholders[activeLang]"
      />
    </n-form-item>
    <div class="-mt-3 mb-3 flex justify-between text-xs text-gray-400">
      <span>{{ $t('telegramBroadcast.uzFallback') }}</span>
      <span>{{ currentLength }} / {{ MAX_LENGTH }}</span>
    </div>

    <n-form-item :label="$t('notificationPage.sendTime')">
      <n-date-picker
        class="w-full"
        type="datetime"
        clearable
        :actions="['clear', 'confirm']"
        format="yyyy-MM-dd HH:mm"
        value-format="yyyy-MM-dd HH:mm:ss"
        v-model:formatted-value="store.payload.scheduled_at"
        :placeholder="$t('notificationPage.sendTimePlaceholder')"
      />
    </n-form-item>

    <!-- Ommaviy yuborish sekin ketadi (Telegram limiti) — foydalanuvchi kutmasin. -->
    <n-alert v-if="store.payload.audience === 'all_staff'" type="info" :bordered="false" class="mb-3">
      <span class="text-xs">{{ $t('telegramBroadcast.slowHint') }}</span>
    </n-alert>

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
