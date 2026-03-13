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

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store._send()
      }
    })
  }

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
        <n-form-item :label="$t(`content.title`)" path="title" rule-path="requiredStringField">
          <n-input v-model:value="store.payload.title" />
        </n-form-item>
        <n-form-item :label="$t('content.type')" path="alert" rule-path="requiredStringField">
          <n-select
            v-model:show="showNotificationAlertSelectMenu"
            v-model:value="store.payload.alert"
            :menu-props="{
              class: 'p-2'
            }"
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
        <UIEditor
          with-validation
          class="col-span-2"
          container-class="rounded-[10px] overflow-hidden"
          :label="$t('content.description')"
          :tool-bar-exclude-keys="['group-image']"
          v-model:text="store.payload.message"
          path="ques"
          show-toolbar
          is-form-item
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <n-button @click="store.openVisible(false)" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </n-spin>
</template>

<style scoped></style>
