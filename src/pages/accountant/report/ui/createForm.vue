<script setup>
  import { UIUpload, UIYearMonth } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import { CheckboxChecked24Filled } from '@vicons/fluent'
  import { useUploadReportStore, useComponentStore, useUploadSourceConfigStore } from '@/store/modules/index.js'
  import ValidationRules from '@/utils/validationRules.js'
  import LockWrapper from './LockWrapper.vue'

  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const formRef = ref(null)

  const store = useUploadReportStore()
  const componentStore = useComponentStore()
  const sourceConfigStore = useUploadSourceConfigStore()

  // Barcha hisobot turlari (Oylik + INPS 4/5/to'lovlar) 1C manbasini qo'llaydi.
  const hasSource = computed(() => [1, 2, 3, 4].includes(Number(store.payload.type)))
  const isOnes = computed(() => hasSource.value && Number(store.payload.source) === 2)

  const ALL_SOURCE_OPTIONS = [
    { label: t('uploadReport.source.excel'), value: 1 },
    { label: t('uploadReport.source.ones'), value: 2 }
  ]

  // Tanlangan korxona uchun ruxsat etilgan manba (1=Excel, 2=1C, 3=ikkalasi)
  const orgAllowedSource = computed(() => {
    const orgId = store.params.organization_id
    if (!orgId || !sourceConfigStore.tree.length) return 3
    const find = (nodes) => {
      for (const n of nodes) {
        if (n.id === orgId) return n
        if (n.children?.length) { const f = find(n.children); if (f) return f }
      }
      return null
    }
    return find(sourceConfigStore.tree)?.allowed_source ?? 3
  })

  const sourceOptions = computed(() => {
    const allowed = orgAllowedSource.value
    if (allowed === 1) return [ALL_SOURCE_OPTIONS[0]]
    if (allowed === 2) return [ALL_SOURCE_OPTIONS[1]]
    return ALL_SOURCE_OPTIONS
  })

  // Manba opsiyalari o'zgarganda avtomatik to'g'ri qiymatga o'rnat
  watch(sourceOptions, (opts) => {
    if (opts.length === 1) store.payload.source = opts[0].value
  })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        // 1C manba — fayl shart emas, backend salary-1c ma'lumotidan quradi.
        if (isOnes.value) {
          store._createFromOnes()
          return
        }
        if (store.payload.file.length === 0) {
          $Toast.warning(t('rules.requiredFileField'))
          return
        }
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        }
      }
    })
  }

  onMounted(() => {
    componentStore._enumAccountant()
    if (!sourceConfigStore.tree.length) sourceConfigStore._index()
  })
</script>

<template>
  <n-form class="relative" ref="formRef" :rules="validationRules.common" :model="store.payload">
    <LockWrapper />
    <div class="grid grid-cols-12 gap-x-2">
      <div class="col-span-12 mb-2">
        <p class="px-2 py-1 bg-primary/5 border-primary/10 border rounded-lg relative">
          {{ store.selectedOrgName }}
          <span class="absolute top-[6px] right-[8px]">
            <n-icon size="18" class="text-success">
              <CheckboxChecked24Filled />
            </n-icon>
          </span>
        </p>
      </div>
      <n-form-item
        class="col-span-12"
        :label="$t(`uploadReport.form.type`)"
        path="type"
        :rule-path="ValidationRules.rulesNames.requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.type"
          :options="componentStore.uploadTypes"
          label-field="name"
          value-field="id"
          :loading="componentStore.accountantEnumLoading"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t(`uploadReport.form.year`)"
        path="year"
        :rule-path="ValidationRules.rulesNames.requiredNumberField"
      >
        <UIYearMonth
          v-model:year="store.payload.year"
          v-model:month="store.payload.month"
          :clearable="false"
        />
      </n-form-item>
      <!-- Barcha hisobot turlari uchun manba: Excel yoki 1C dan -->
      <n-form-item v-if="hasSource" class="col-span-12" :label="$t('uploadReport.source.label')">
        <n-radio-group v-model:value="store.payload.source" name="source">
          <n-radio-button v-for="o in sourceOptions" :key="o.value" :value="o.value" :label="o.label" />
        </n-radio-group>
      </n-form-item>
      <!-- 1C manbada fayl kerak emas -->
      <UIUpload
        v-if="!isOnes"
        class="col-span-12 mb-[40px]"
        v-model:files="store.payload.file"
        :multiple="false"
      >
      </UIUpload>
      <p v-else class="col-span-12 mb-[40px] text-xs text-secondary px-2">
        {{ $t('uploadReport.source.onesHint') }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-2">
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
