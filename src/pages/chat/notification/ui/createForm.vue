<script setup>
  import { Checkmark12Regular, Desktop20Regular, Phone20Regular } from '@vicons/fluent'

  import validationRules from '@/utils/validationRules.js'

  const formRef = ref(null)
  import { useComponentStore, useNotificationStore } from '@/store/modules/index.js'
  import { notificationTypes } from '@utils'
  import NotificationBadge from './NotificationBadge.vue'
  import UserRoleInfiniteSelect from '@pages/chat/notification/ui/UserRoleInfiniteSelect.vue'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useNotificationStore()
  const componentStore = useComponentStore()

  // Ko'p tilli — title/message {uz, ru, en}. Til tab bilan almashadi.
  const activeLang = ref('uz')
  const langs = [
    { key: 'uz', label: t('content.uz') },
    { key: 'ru', label: t('content.ru') },
    { key: 'en', label: t('content.en') }
  ]
  const langFilled = (lang) =>
    Boolean(store.payload.title?.[lang]?.trim() || store.payload.message?.[lang]?.trim())

  const onSubmit = () => {
    // uz majburiy — bo'sh bo'lsa uz tabiga qaytaramiz.
    if (!store.payload.title?.uz?.trim() || !store.payload.message?.uz?.trim()) {
      activeLang.value = 'uz'
    }
    formRef.value?.validate((error) => {
      if (!error) {
        // Topic rejimi (FCM: all/hr/economist) yoki qo'lda userlarga.
        if (store.mode === 'topic') {
          store._send_topic()
        } else {
          store._send()
        }
      }
    })
  }

  // FCM topic'lari — backend `send-topic` (all/hr/economist).
  const topicOptions = computed(() => [
    { label: t('notificationPage.topics.all'), value: 'all' },
    { label: t('notificationPage.topics.hr'), value: 'hr' },
    { label: t('notificationPage.topics.economist'), value: 'economist' }
  ])

  // Yuborish rejimi — select (topic / qo'lda).
  const modeOptions = computed(() => [
    { label: t('notificationPage.byTopic'), value: 'topic' },
    { label: t('notificationPage.byUser'), value: 'manual' }
  ])

  // Sarlavha / tavsif uchun til bo'yicha example (placeholder).
  const titleExamples = {
    uz: 'Masalan: Tizimda yangilanmoqda..',
    ru: 'Например: Идёт обновление системы..',
    en: 'e.g. System is updating..'
  }
  const messageExamples = {
    uz: "Masalan: Iltimos, biroz kuting, tizim tez orada tayyor bo'ladi.",
    ru: 'Например: Пожалуйста, подождите, система скоро будет готова.',
    en: 'e.g. Please wait, the system will be ready soon.'
  }

  // Qurilma turi — faqat qo'lda yuborishda tanlanadi; topic rejimida ikkalasi ham qat'iy.
  const isTopicMode = computed(() => store.mode === 'topic')
  const platformOptions = computed(() => [
    { value: 'mobile', label: t('notificationPage.platformMobile'), icon: Phone20Regular },
    { value: 'web', label: t('notificationPage.platformWeb'), icon: Desktop20Regular }
  ])

  const isPlatformOn = (value) =>
    isTopicMode.value || store.payload.platforms.includes(value)

  const togglePlatform = (value) => {
    if (isTopicMode.value) return
    const list = store.payload.platforms
    if (list.includes(value)) {
      // Kamida bittasi qolishi shart
      if (list.length === 1) return
      store.payload.platforms = list.filter((i) => i !== value)
    } else {
      store.payload.platforms = [...list, value]
    }
  }

  const showTypeMenu = ref(false)

  const renderTypeOption = ({ option, selected }) => {
    return h(
      'div',
      {
        class:
          'p-1 cursor-pointer transition-all hover:bg-info/10 flex items-center rounded-md justify-between',
        onClick: () => {
          store.payload.action.type = option.value
          showTypeMenu.value = false
        }
      },
      [
        h(NotificationBadge, { alert: option.value }),
        selected ? h(Checkmark12Regular, { class: 'size-6 text-info' }) : null
      ]
    )
  }

  const renderTypeTag = ({ option }) => {
    return h('div', { class: 'flex items-center' }, h(NotificationBadge, { alert: option.value }))
  }

  onMounted(() => {
    if (componentStore.roles.length === 0) {
      componentStore._enums()
    }
  })
</script>

<template>
  <n-spin :show="componentStore.enumLoading">
    <n-form
      :disabled="store.saveLoading"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
      size="large"
    >
      <!-- Elementlar widthga qarab 2-ustunli grid'ga taqsimlangan.
           col-span-2 = keng (full row), aks holda = yarim (1/2). -->
      <div class="grid grid-cols-2 gap-x-3">
        <!-- Row 1: Yuborish rejimi | Xabar turi -->
        <n-form-item :label="$t('notificationPage.mode')">
          <n-select v-model:value="store.mode" :options="modeOptions" />
        </n-form-item>
        <n-form-item :label="$t('content.type')">
          <n-select
            v-model:show="showTypeMenu"
            v-model:value="store.payload.action.type"
            :menu-props="{ class: 'p-2' }"
            :options="Object.values(notificationTypes)"
            :render-option="renderTypeOption"
            :render-tag="renderTypeTag"
            :placeholder="$t('content.type')"
          />
        </n-form-item>

        <!-- Row 2: bitta qatorda — o'ngда platforma tanlovi va til tab -->
        <div class="col-span-2 mb-1 flex items-center justify-between gap-3">
          <n-tabs
            v-model:value="activeLang"
            type="segment"
            size="small"
            class="shrink-0"
            style="width: 190px"
          >
            <n-tab v-for="l in langs" :key="l.key" :name="l.key">
              <span class="flex items-center gap-1">
                {{ l.label }}
                <span
                  v-if="langFilled(l.key)"
                  class="inline-block h-1.5 w-1.5 rounded-full bg-success"
                />
              </span>
            </n-tab>
          </n-tabs>

          <!-- Topic rejimida platforma qat'iy: ikkalasi ham oladi, o'zgartirilmaydi -->
          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-for="p in platformOptions"
              :key="p.value"
              @click="togglePlatform(p.value)"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors select-none whitespace-nowrap',
                isTopicMode ? 'cursor-default opacity-70' : 'cursor-pointer',
                isPlatformOn(p.value)
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-surface-ground border-surface-line text-textColor3'
              ]"
            >
              <component :is="p.icon" class="size-3.5" />
              {{ p.label }}
            </span>
          </div>
        </div>

        <!-- Row 3: Sarlavha (full) -->
        <n-form-item
          class="col-span-2"
          :label="$t('content.title')"
          path="title"
          :rule="[
            {
              trigger: ['input', 'blur'],
              validator() {
                return store.payload.title?.uz?.trim() ? true : new Error(t('rules.requiredField'))
              }
            }
          ]"
        >
          <n-input v-model:value="store.payload.title[activeLang]" :placeholder="titleExamples[activeLang]" />
        </n-form-item>

        <!-- Row 4: Matn — oddiy textarea (full) -->
        <n-form-item
          class="col-span-2"
          :label="$t('content.description')"
          path="message"
          :rule="[
            {
              trigger: ['input', 'blur'],
              validator() {
                return store.payload.message?.uz?.trim() ? true : new Error(t('rules.requiredField'))
              }
            }
          ]"
        >
          <n-input
            v-model:value="store.payload.message[activeLang]"
            type="textarea"
            :rows="4"
            :placeholder="messageExamples[activeLang]"
          />
        </n-form-item>

        <!-- ── Kimga + qolgan sozlamalar ──────────────────────────── -->
        <!-- TOPIC rejimi: Topic | Ekran  +  Vaqt (full) -->
        <template v-if="store.mode === 'topic'">
          <n-form-item :label="$t('notificationPage.topic')">
            <n-select v-model:value="store.payload.topic" :options="topicOptions" />
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
              :placeholder="$t('notificationPage.sendTimePlaceholder')"
            />
          </n-form-item>
        </template>

        <!-- QO'LDA rejim: Foydalanuvchi (9/12) va Rejalashtirish (3/12) bitta qatorda -->
        <template v-else>
          <div class="col-span-2 grid grid-cols-12 gap-x-3">
            <n-form-item
              class="col-span-9"
              :label="$t('content.users')"
              path="userIds"
              :rule="[
                {
                  trigger: ['input', 'blur-sm'],
                  validator() {
                    return !store.payload.all && !store.payload.userIds.length
                      ? new Error(t('rules.requiredField'))
                      : true
                  }
                }
              ]"
            >
              <UserRoleInfiniteSelect />
            </n-form-item>
            <n-form-item class="col-span-3" :label="$t('notificationPage.sendTime')">
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
          </div>
        </template>
      </div>

      <!-- Row (oxirgi): tugmalar -->
      <div class="mt-2 grid grid-cols-2 gap-3">
        <n-button @click="store.resetForm()" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{
            store.payload.scheduled_at ? $t('notificationPage.schedule') : $t('notificationPage.send')
          }}
        </n-button>
      </div>
    </n-form>
  </n-spin>
</template>

