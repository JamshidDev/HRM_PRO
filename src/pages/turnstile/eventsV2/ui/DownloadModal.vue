<script setup>
  import { useEventV2Store, useComponentStore, useAccountStore } from '@stores'
  import { UIModal, UISelect } from '@components'
  import { useAppSetting, validationRules } from '@utils'
  import { LockClosed20Regular } from '@vicons/fluent'

  const store = useEventV2Store()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const canAbsent = computed(() => accStore.checkAction(accStore.pn.turnstileAbsentWorkersExport))

  const onOpenAbsent = () => {
    if (!componentStore.structureList.length) componentStore._structures()
  }

  watch(() => store.download.activeTab, (v) => {
    if (v === 'absent') onOpenAbsent()
  })

  // --- Yuklash tab ---
  const downloadFormRef = ref(null)
  const { proxy } = getCurrentInstance()
  const submitBtnRef = ref(null)

  const onDownloadSubmit = () => {
    downloadFormRef.value?.validate((error) => {
      if (!error) {
        const btnEl = submitBtnRef.value?.$el || submitBtnRef.value
        proxy.$flyUpload(btnEl)
        store._download()
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

    <!-- Yuklash tab -->
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

    <!-- Kelmaganlar tab -->
    <n-form
      v-else-if="store.download.activeTab === 'absent'"
      ref="absentFormRef"
      :model="store.absent.payload"
      :rules="validationRules.common"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item class="col-span-12" :label="$t('content.organization')">
        <UISelect
          :options="componentStore.structureList"
          :model-v="store.absent.payload.organizations"
          :checked-val="store.absent.structureCheck"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @updateModel="(v) => (store.absent.payload.organizations = v)"
          @updateCheck="(v) => (store.absent.structureCheck = v)"
          @defaultValue="(v) => (store.absent.payload.organizations = v)"
          @onSearch="componentStore._structures"
        />
      </n-form-item>
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
