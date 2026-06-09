<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useEventStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import UINSelect from '@/components/ui/UINSelect.vue'
  import { useMessage } from 'naive-ui'
  import i18n from '@/i18n/index.js'

  const formRef = ref(null)
  const t = i18n.global.t.bind(i18n.global)
  const message = useMessage()

  const store = useEventStore()

  const MAX_DAYS = 30

  const getDaysDifference = (from, to) => {
    if (!from || !to) return 0
    const diffTime = Math.abs(to - from)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const validateDateRange = () => {
    const { from_date, to_date } = store.syncPayload
    if (!from_date || !to_date) return true

    if (to_date < from_date) {
      message.error(t('content.dateRangeError') || 'Tugash sanasi boshlanish sanasidan katta bo\'lishi kerak')
      return false
    }

    const days = getDaysDifference(from_date, to_date)
    if (days > MAX_DAYS) {
      message.error(t('content.maxDaysError', { days: MAX_DAYS }) || `Maksimal ${MAX_DAYS} kunlik oraliq tanlanishi mumkin`)
      return false
    }

    return true
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (!validateDateRange()) return
        store._syncEvent()
      }
    })
  }

  onMounted(() => {
    store._levels()
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.syncPayload">
    <div>
      <div class="grid grid-cols-2 gap-4">
        <n-form-item
          class="w-full"
          :label="$t(`content.from`)"
          path="from_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.syncPayload.from_date"
            type="date"
            update-value-on-close
            :actions="null"
            :format="useAppSetting.datePicketFormat"
            clearable
          />
        </n-form-item>
        <n-form-item
          class="w-full"
          :label="$t(`content.to`)"
          path="to_date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.syncPayload.to_date"
            type="date"
            update-value-on-close
            :actions="null"
            :format="useAppSetting.datePicketFormat"
            clearable
          />
        </n-form-item>
      </div>
      <p class="days-hint">* {{ $t('content.maxDaysHint', { n: MAX_DAYS }) }}</p>

      <n-form-item
        :label="$t(`hcServer.form.access_level_id`)"
        path="access_level_ids"
        :rule-path="validationRules.rulesNames.requiredMultiSelectField"
      >
        <UINSelect
          :options="store.levelList"
          :loading="store.levelLoading"
          v-model:value="store.syncPayload.access_level_ids"
          value-field="id"
          label-field="name"
          :max-tag-count="2"
          multiple
        >
        </UINSelect>
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2 mt-8">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.syncLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>
.days-hint {
  font-size: 12px;
  color: var(--textColor3);
  margin-top: -12px;
  margin-bottom: 16px;
}
</style>
