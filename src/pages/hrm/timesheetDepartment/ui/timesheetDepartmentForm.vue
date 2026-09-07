<script setup>
  import { useComponentStore, useTimesheetDepartmentStore } from '@/store/modules'
  import { SuperSelect, UISelect } from '@/components/index.js'
  import { Info16Regular } from '@vicons/fluent'
  import ValidationRules from '@/utils/validationRules.js'

  const store = useTimesheetDepartmentStore()
  const componentStore = useComponentStore()

  // Xodim sahifasidan ochilganda tabelchi kontekstdan ma'lum; «Tabelchilar»
  // sahifasidagi «Qo'shish» da esa uni shu formada tanlaymiz.
  const props = defineProps({
    withWorker: { type: Boolean, default: false }
  })

  const formRef = ref(null)

  const changeOrg = (v) => {
    store.payload.organizations = v
    store.payload.departments = []
    store.departmentList = []
    if (props.withWorker) {
      store.payload.worker_position_id = null
      store.workerList = []
      store.workerParams.page = 1
      store.workerParams.search = null
      store.workerParams.organization_id = v?.[0]?.id ?? null
      if (v.length) store._workers()
    }
    if (v.length) store._department()
  }

  const onSearchWorker = (v) => {
    store.workerParams.search = v || null
    store.workerParams.page = 1
    store._workers()
  }
  const onScrollWorker = () => {
    store.workerParams.page += 1
    store._workers(true)
  }

  const onSearchEv = (v) => {
    store.departmentParams.search = v
    store.departmentParams.page = 1
    store._department()
  }
  const onScrollEv = () => {
    store.departmentParams.page += 1
    store._department(true)
  }

  const onCancel = () => {
    store.visible = false
    store.resetForm()
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) store._create()
    })
  }

  // Tugmalar drawer FOOTER'ida — sahifa shu metodlarni chaqiradi.
  defineExpose({ onSubmit, onCancel })

  onMounted(() => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  })
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex-1 overflow-y-auto">
      <n-form ref="formRef" :model="store.payload" :rules="ValidationRules.common">
        <n-form-item
          :label="$t(`content.workplace`)"
          path="organizations"
          rule-path="requiredMultiSelectField"
        >
          <UISelect
            :options="componentStore.structureList"
            :modelV="store.payload.organizations"
            @defaultValue="changeOrg"
            @updateModel="changeOrg"
            :checkedVal="store.structureCheck"
            @updateCheck="(v) => (store.structureCheck = v)"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            :multiple="false"
          />
        </n-form-item>

        <!-- Tabelchi: faqat TimesheetHR roli berilgan xodimlar (izoh — label'dagi ikonkada). -->
        <n-form-item v-if="withWorker" path="worker_position_id" rule-path="requiredNumberField">
          <template #label>
            <div class="flex w-full items-center justify-between gap-2">
              <span>{{ $t('documentPage.form.worker') }}</span>
              <n-popover trigger="click" placement="left-start" style="max-width: 280px">
                <template #trigger>
                  <n-icon class="cursor-pointer text-secondary hover:text-primary" :size="16">
                    <Info16Regular />
                  </n-icon>
                </template>
                <span class="text-xs leading-[1.35]">
                  {{ $t('timesheetWorkerPage.worker_role_info') }}
                </span>
              </n-popover>
            </div>
          </template>
          <SuperSelect
            :disabled="store.payload.organizations.length === 0"
            :options="store.workerList"
            :loading="store.workerLoading"
            :total-count="store.totalWorker"
            :per-page="store.workerParams.per_page"
            v-model:value="store.payload.worker_position_id"
            v-model:search="store.workerParams.search"
            value-field="id"
            @onSearch="onSearchWorker"
            @onScrollEv="onScrollWorker"
          />
        </n-form-item>

        <!-- Bo'limlar (izoh — label'dagi ikonkada). -->
        <n-form-item path="departments" rule-path="requiredMultiSelectField">
          <template #label>
            <div class="flex w-full items-center justify-between gap-2">
              <span>{{ $t('documentPage.form.department') }}</span>
              <n-popover trigger="click" placement="left-start" style="max-width: 280px">
                <template #trigger>
                  <n-icon class="cursor-pointer text-secondary hover:text-primary" :size="16">
                    <Info16Regular />
                  </n-icon>
                </template>
                <span class="text-xs leading-[1.35]">
                  {{ $t('timesheetWorkerPage.departments_info') }}
                </span>
              </n-popover>
            </div>
          </template>
          <SuperSelect
            multiple
            :disabled="store.payload.organizations.length === 0"
            :options="store.departmentList"
            :loading="store.departmentLoading"
            :total-count="store.totalDepartmentCount"
            :per-page="store.departmentParams.per_page"
            v-model:value="store.payload.departments"
            v-model:search="store.departmentParams.search"
            value-field="id"
            @onSearch="onSearchEv"
            @onScrollEv="onScrollEv"
          />
        </n-form-item>
        <p
          v-if="
            store.payload.organizations.length > 0 &&
            !store.departmentLoading &&
            store.departmentList.length === 0
          "
          class="-mt-2 mb-3 text-xs text-warning"
        >
          {{ $t('timesheetWorkerPage.free_departments_empty') }}
        </p>
      </n-form>
    </div>

  </div>
</template>

<style scoped>
  /* Label ichidagi izoh ikonkasi input'ning O'NG chekkasiga tekislanishi uchun
     naive-ui label'i to'liq kenglikka cho'ziladi (aks holda matnga qarab qisqaradi). */
  :deep(.n-form-item-label) {
    width: 100%;
  }
  :deep(.n-form-item-label__text) {
    width: 100%;
  }
</style>
