<script setup>
import {UIPageFilter} from "@/components/index.js"
import Utils from "@/utils/Utils.js"
import {DocumentArrowUp20Regular} from "@vicons/fluent"
import {useUploadReportStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useUploadReportStore()

const onAdd = async () => {
  if(store.params.organization_id.length === 0){
    $Toast.warning(t('uploadReport.form.requiredOrganization'))
    return
  }
  store.resetForm()
  store.visibleType=true
  store.visible = true
}




onMounted(()=>{
  store.params.year = new Date().getFullYear()
  store.params.month = new Date().getMonth()
})
</script>

<template>
<UIPageFilter
    :show-filter-button="false"
    :show-add-button="false"
>
  <template #filterAction>

    <n-select
        class="!w-[200px]"
        v-model:value="store.params.year"
        :options="Utils.yearList"
        label-field="name"
        value-field="id"
        @update:value="store._cards"
    />
    <n-select
        class="!w-[200px]"
        v-model:value="store.params.month"
        :options="Utils.monthList"
        label-field="name"
        value-field="id"
        @update:value="store._cards"
    />
    <n-button @click="onAdd" type="success">
      {{$t('uploadReport.form.uploadFile')}}
      <template #icon>
        <DocumentArrowUp20Regular/>
      </template>
    </n-button>
  </template>
</UIPageFilter>
</template>
