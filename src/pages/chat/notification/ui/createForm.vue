<script setup>
import {Checkmark12Regular} from "@vicons/fluent"

import validationRules from '@/utils/validationRules.js'

const formRef = ref(null)
import {useNotificationStore} from '@/store/modules/index.js'
import {UIEditor} from "@components";
import {notificationAlerts} from "@utils";
import NotificationBadge from "./NotificationBadge.vue";

const store = useNotificationStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {

    }
  })
}

const showNotificationSelectMenu = ref(false)

const renderNotificationBadge = ({option, selected}) => {
  return h('div', {
    class: 'p-1 cursor-pointer transition-all hover:bg-info/10 flex items-center rounded-md justify-between',
    onClick: () => {
      store.payload.alert = option.value
      showNotificationSelectMenu.value = false
    }
  }, [h(NotificationBadge, {alert: option.value}), selected ? h(Checkmark12Regular, {class: 'size-6 text-info'}) : null])
}

const renderNotificationLabel = ({option}) => {
  return h('div', {class: 'flex items-center'}, h(NotificationBadge, {alert: option.value}))
}

</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload" size="large">
    <div class="grid grid-cols-2 gap-x-4">
      <n-form-item :label="$t(`content.title`)" path="title" rule-path="requiredStringField">
        <n-input v-model:value="store.payload.title"/>
      </n-form-item>
      <n-form-item :label="$t('content.type')" rule-path="requiredStringField">
        <n-select v-model:show="showNotificationSelectMenu" v-model:value="store.payload.alert"
                  :menuProps="{
                     class: 'p-2'
                  }"
                  :options="Object.values(notificationAlerts)"
                  :render-option="renderNotificationBadge" :render-tag="renderNotificationLabel"/>
      </n-form-item>
      <UIEditor
          class="col-span-2"
          container-class="rounded-[10px] overflow-hidden"
          :label="$t('content.description')"
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
</template>

<style scoped></style>
