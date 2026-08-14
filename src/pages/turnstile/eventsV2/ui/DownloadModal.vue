<script setup>
  import { useEventV2Store, useComponentStore, useAccountStore } from '@stores'
  import { UIModal, UISelect, SuperSelect } from '@components'
  import { useAppSetting, validationRules } from '@utils'
  import { LockClosed20Regular } from '@vicons/fluent'

  const store = useEventV2Store()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const canAbsent = computed(() => accStore.checkAction(accStore.pn.turnstileAbsentWorkersExport))

  // Modal ochilganda korxona daraxti va xodim ro'yxati bir marta tortiladi.
  watch(() => store.download.visible, (v) => {
    if (!v) return
    if (!componentStore.structureList.length) componentStore._structures()
    if (!store.download.worker.list.length) store._downloadWorkers()
  })

  // --- Umumiy filtrlar (ikkala tab uchun) ---
  const { proxy } = getCurrentInstance()
  const submitBtnRef = ref(null)
  const downloadFormRef = ref(null)

  const departmentAction = {
    onSearch: () => {
      store.download.department.params.page = 1
      store._downloadDepartments()
    },
    onScroll: () => {
      store.download.department.params.page++
      store._downloadDepartments(true)
    }
  }

  const workerAction = {
    onSearch: () => {
      store.download.worker.params.page = 1
      store._downloadWorkers()
    },
    onScroll: () => {
      store.download.worker.params.page++
      store._downloadWorkers(true)
    }
  }

  const onDownloadSubmit = () => {
    downloadFormRef.value?.validate((error) => {
      if (!error) {
        const btnEl = submitBtnRef.value?.$el || submitBtnRef.value
        store._download(() => proxy.$flyUpload(btnEl))
      }
    })
  }

  // --- Kelmaganlar tab ---
  const absentFormRef = ref(null)
  const absentBtnRef = ref(null)

  const absentDisabled = computed(() =>
    !store.absent.payload.from_date || !store.absent.payload.to_date
  )

  const onAbsentSubmit = () => {
    absentFormRef.value?.validate((error) => {
      if (!error) {
        const btnEl = absentBtnRef.value?.$el || absentBtnRef.value
        store._downloadAbsent(() => proxy.$flyUpload(btnEl))
      }
    })
  }
</script>

<template>
  <UIModal v-model:visible="store.download.visible" :title="$t('content.download')" :width="420">
    <n-tabs v-model:value="store.download.activeTab" type="segment" size="small" class="mb-4">
      <n-tab name="download">{{ $t('hcEvent.tabDownload') }}</n-tab>
      <n-tab name="absent" :disabled="!canAbsent">
        <div class="flex items-center gap-1">
          <n-icon v-if="!canAbsent" size="14"><LockClosed20Regular /></n-icon>
          {{ $t('hcEvent.tabAbsent') }}
        </div>
      </n-tab>
    </n-tabs>

    <!-- Umumiy filtrlar — ikkala tab ham AYNAN shu korxona/bo'lim/xodim
         tanlovi bilan yuklaydi (backend'da ikkala endpoint bir xil qabul qiladi). -->
    <div class="grid grid-cols-12 gap-x-4">
      <n-form-item class="col-span-12" :label="$t('content.organization')">
        <UISelect
          :options="componentStore.structureList"
          :model-v="store.download.payload.organizations"
          :checked-val="store.download.structureCheck"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @updateModel="store._onDownloadOrganizations"
          @updateCheck="(v) => (store.download.structureCheck = v)"
          @defaultValue="store._onDownloadOrganizations"
          @onSearch="componentStore._structures"
        />
      </n-form-item>
      <n-form-item class="col-span-12" :label="$t('content.department')">
        <SuperSelect
          :disabled="store.download.payload.organizations.length === 0"
          v-model:value="store.download.payload.departments"
          v-model:search="store.download.department.params.search"
          :options="store.download.department.list"
          :per-page="store.download.department.params.per_page"
          :total-count="store.download.department.totalItems"
          :loading="store.download.department.loading"
          @update:value="store._onDownloadDepartments"
          @onScrollEv="departmentAction.onScroll"
          @onSearch="departmentAction.onSearch"
          multiple
          clearable
        />
      </n-form-item>
      <n-form-item class="col-span-12" :label="$t('content.workers')">
        <SuperSelect
          v-model:value="store.download.payload.workers"
          v-model:search="store.download.worker.params.search"
          :options="store.download.worker.list"
          :per-page="store.download.worker.params.per_page"
          :total-count="store.download.worker.totalItems"
          :loading="store.download.worker.loading"
          @onScrollEv="workerAction.onScroll"
          @onSearch="workerAction.onSearch"
          :max-tag-count="2"
          multiple
          clearable
        />
      </n-form-item>
    </div>

    <!-- Yuklash tab — sanalar -->
    <n-form
      v-if="store.download.activeTab === 'download'"
      ref="downloadFormRef"
      :model="store.download.payload"
      :rules="validationRules.common"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item
        class="col-span-12"
        :label="$t('content.from')"
        path="from"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="store.download.payload.from"
          type="date"
          :actions="null"
          :format="useAppSetting.datePicketFormat"
          class="w-full"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t('content.to')"
        path="to"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="store.download.payload.to"
          type="date"
          :actions="null"
          :format="useAppSetting.datePicketFormat"
          class="w-full"
        />
      </n-form-item>
      <div class="col-span-12 grid grid-cols-2 gap-2 mt-8">
        <n-button @click="store.download.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          ref="submitBtnRef"
          @click="onDownloadSubmit"
          :loading="store.download.loading"
          type="primary"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>

    <!-- Kelmaganlar tab — sanalar (filtrlar yuqoridagi umumiy blokdan) -->
    <n-form
      v-else-if="store.download.activeTab === 'absent'"
      ref="absentFormRef"
      :model="store.absent.payload"
      :rules="validationRules.common"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item
        class="col-span-12"
        :label="$t('content.from')"
        path="from_date"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="store.absent.payload.from_date"
          type="date"
          :actions="null"
          :format="useAppSetting.datePicketFormat"
          class="w-full"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t('content.to')"
        path="to_date"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          v-model:value="store.absent.payload.to_date"
          type="date"
          :actions="null"
          :format="useAppSetting.datePicketFormat"
          class="w-full"
        />
      </n-form-item>
      <div class="col-span-12 grid grid-cols-2 gap-2 mt-8">
        <n-button @click="store.download.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          ref="absentBtnRef"
          @click="onAbsentSubmit"
          :loading="store.absent.loading"
          :disabled="absentDisabled"
          type="primary"
        >
          {{ $t('content.download') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
