<script setup>
import { useStaffApprovalStore} from "@stores"
import { UIPageFilter} from "@components"

const store = useStaffApprovalStore()

const filterEvent = (v) => {
  store._index()
}

const onSearch = () => {
  store.params.page = 1
  store._index()
}

const onAdd = ()=> {
  store.resetForm()
  store.visibleType = true
  store.visible = true
  store._showGenerate()
}

</script>

<template>
  <UIPageFilter
      v-model:search="store.params.search"
      :search-loading="store.loading"
      :show-filter-button="false"
      @onSearch="onSearch"
      @onAdd="onAdd"
  />
</template>
