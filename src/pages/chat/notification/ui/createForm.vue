<script setup>
  import { Checkmark12Regular } from '@vicons/fluent'

  import validationRules from '@/utils/validationRules.js'

  const formRef = ref(null)
  import { useComponentStore, useNotificationStore } from '@/store/modules/index.js'
  import { UIEditor, UISelect } from '@components'
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

  const showNotificationAlertSelectMenu = ref(false)

  const renderNotificationBadge = ({ option, selected }) => {
    return h(
      'div',
      {
        class:
          'p-1 cursor-pointer transition-all hover:bg-info/10 flex items-center rounded-md justify-between',
        onClick: () => {
          store.payload.alert = option.value
          showNotificationAlertSelectMenu.value = false
        }
      },
      [
        h(NotificationBadge, { alert: option.value }),
        selected ? h(Checkmark12Regular, { class: 'size-6 text-info' }) : null
      ]
    )
  }

  const renderNotificationLabel = ({ option }) => {
    return h('div', { class: 'flex items-center' }, h(NotificationBadge, { alert: option.value }))
  }

  onMounted(() => {
    if (componentStore.roles.length === 0) {
      componentStore._enums()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
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
      <div class="grid grid-cols-2 gap-x-4">
        <!-- Yuborish rejimi — select -->
        <n-form-item class="col-span-2" :label="$t('notificationPage.mode')">
          <n-select v-model:value="store.mode" :options="modeOptions" />
        </n-form-item>

        <!-- Til tab (title/description uz/ru/en) -->
        <div class="col-span-2">
          <n-tabs v-model:value="activeLang" type="segment" size="small">
            <n-tab v-for="l in langs" :key="l.key" :name="l.key">
              <span class="flex items-center gap-1">
                {{ l.label }}
                <span
                  v-if="langFilled(l.key)"
                  class="inline-block w-1.5 h-1.5 rounded-full bg-success"
                />
              </span>
            </n-tab>
          </n-tabs>
        </div>

        <!-- Sarlavha va tavsif — ketma-ket, full row -->
        <n-form-item
          class="col-span-2"
          :label="$t(`content.title`)"
          path="title"
          :rule="[
            {
              trigger: ['input', 'blur'],
              validator() {
                return store.payload.title?.uz?.trim()
                  ? true
                  : new Error(t(`rules.requiredField`))
              }
            }
          ]"
        >
          <n-input v-model:value="store.payload.title[activeLang]" />
        </n-form-item>
        <n-form-item
          class="col-span-2"
          :label="$t('content.description')"
          path="message"
          :rule="[
            {
              trigger: ['input', 'blur'],
              validator() {
                return store.payload.message?.uz?.trim()
                  ? true
                  : new Error(t(`rules.requiredField`))
              }
            }
          ]"
        >
          <UIEditor
            class="w-full"
            container-class="rounded-[10px] overflow-hidden"
            :tool-bar-exclude-keys="['group-image']"
            v-model:text="store.payload.message[activeLang]"
            show-toolbar
          />
        </n-form-item>

        <!-- TOPIC rejimi — topic va tur bitta rowda -->
        <template v-if="store.mode === 'topic'">
          <n-form-item :label="$t('notificationPage.topic')">
            <n-select v-model:value="store.payload.topic" :options="topicOptions" />
          </n-form-item>
          <n-form-item :label="$t('content.type')" path="alert" rule-path="requiredStringField">
            <n-select
              v-model:show="showNotificationAlertSelectMenu"
              v-model:value="store.payload.alert"
              :menu-props="{ class: 'p-2' }"
              :options="Object.values(notificationTypes)"
              :render-option="renderNotificationBadge"
              :render-tag="renderNotificationLabel"
            />
          </n-form-item>
        </template>

        <!-- QO'LDA rejim — tur col-2, so'ng korxona/rol/userlar -->
        <template v-if="store.mode === 'manual'">
          <n-form-item
            class="col-span-2"
            :label="$t('content.type')"
            path="alert"
            rule-path="requiredStringField"
          >
            <n-select
              v-model:show="showNotificationAlertSelectMenu"
              v-model:value="store.payload.alert"
              :menu-props="{ class: 'p-2' }"
              :options="Object.values(notificationTypes)"
              :render-option="renderNotificationBadge"
              :render-tag="renderNotificationLabel"
            />
          </n-form-item>
          <n-form-item :label="$t('organizationPage.name')">
            <UISelect
              :options="componentStore.structureList"
              :model-v="store.payload.filter.organizations"
              @update-model="(v) => (store.payload.filter.organizations = v)"
              @defaultValue="(v) => (store.payload.filter.organizations = v)"
              :checked-val="store.structureCheck"
              @updateCheck="(v) => (store.structureCheck = v)"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              :loading="componentStore.structureLoading"
            />
          </n-form-item>
          <n-form-item :label="$t(`content.role`)">
            <n-select
              multiple
              v-model:value="store.payload.filter.roles"
              filterable
              :options="componentStore.roles"
              :loading="componentStore.enumLoading"
              label-field="name"
              value-field="id"
              :max-tag-count="1"
            />
          </n-form-item>
          <n-form-item
            class="col-span-2"
            :label="$t('content.users')"
            path="userIds"
            :rule="[
              {
                trigger: ['input', 'blur-sm'],
                validator() {
                  return !store.payload.all && !store.payload.userIds.length
                    ? new Error(t(`rules.requiredField`))
                    : true
                }
              }
            ]"
          >
            <UserRoleInfiniteSelect />
          </n-form-item>
        </template>

        <!-- Rejalashtirilgan yuborish vaqti (bo'sh = darhol) -->
        <n-form-item class="col-span-2" :label="$t('notificationPage.sendTime')">
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

      <div class="grid grid-cols-2 gap-4">
        <n-button @click="store.resetForm()" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{
            store.payload.scheduled_at
              ? $t('notificationPage.schedule')
              : $t('notificationPage.send')
          }}
        </n-button>
      </div>
    </n-form>
  </n-spin>
</template>

<style scoped></style>
