<script setup>
import {useConfStaffingApprovalStore} from "@stores"
import {UIPageFilter} from "@components"

const store = useConfStaffingApprovalStore()

const onSearchEv = () => {
  store.params.page = 1
  store._index()
}
</script>

<template>
<UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="onSearchEv"
    :show-filter-button="false"
    :show-add-button="false"
/>
</template>