<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { DocumentArrowUp20Regular, LockClosed24Filled, LockOpen16Filled } from '@vicons/fluent'
  import { useAccountStore, useUploadReportStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()
  const accStore = useAccountStore()

  const onAdd = async () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsWrite)) return
    if (!store.params.organization_id) {
      $Toast.warning(t('uploadReport.form.requiredOrganization'))
      return
    }
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const onChange = () => {
    if (!accStore.checkAction(accStore.pn.economistUploadsRead)) return
    store.params.organization_id = null
    store.resetCards()
    store._structures()
  }

  onMounted(() => {
    store.params.year = new Date().getFullYear()
    store.params.month = new Date().getMonth()
  })
</script>

<template>
  <UIPageFilter :show-filter-button="false" :show-add-button="false">
    <template #filterAction>
      <n-button
        v-if="
          store.params.organization_id &&
          accStore.checkPermission(accStore.pn.economistUploadsStatus)
        "
        :type="store.orgStatus ? 'error' : 'success'"
        @click="store._uploadStatus"
        :loading="store.structuresLoading"
      >
        {{
          $t(store.orgStatus ? 'uploadReport.form.openFromBlock' : 'uploadReport.form.closeToBlock')
        }}
        <template #icon>
          <LockClosed24Filled v-if="store.orgStatus" />
          <LockOpen16Filled v-else />
        </template>
      </n-button>

      <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.params.year"
        :options="Utils.yearList"
        label-field="name"
        value-field="id"
        @update:value="onChange"
      />
      <n-select
        class="w-full! md:w-[200px]!"
        v-model:value="store.params.month"
        :options="Utils.monthList"
        label-field="name"
        value-field="id"
        @update:value="onChange"
      />
      <n-button @click="onAdd" type="success" class="w-full! md:w-auto!">
        {{ $t('uploadReport.form.uploadFile') }}
        <template #icon>
          <DocumentArrowUp20Regular />
        </template>
      </n-button>
    </template>
  </UIPageFilter>
</template>
