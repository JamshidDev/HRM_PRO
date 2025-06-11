<script setup>
import {UIPageFilter} from "@/components/index.js"
import {useTicketStore} from "@/store/modules/index.js"
import {CheckboxPerson16Regular} from "@vicons/fluent"

const store = useTicketStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="onSearch"
    :show-add-button="false"
>
  <template #filterAction>
    <n-button type="primary" @click="onAdd">
      {{$t('ticket.attachCommission')}}
      <template #icon>
        <n-icon size="20">
          <CheckboxPerson16Regular/>
        </n-icon>
      </template>
    </n-button>
  </template>
</UIPageFilter>
</template>
