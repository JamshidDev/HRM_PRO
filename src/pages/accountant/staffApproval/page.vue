<script setup>
import { useStaffApprovalStore} from "@stores"
import { UIPageContent } from "@components"
import { Filter, CreateModal, Table} from "./ui"

const store = useStaffApprovalStore()

onMounted(() => {
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <CreateModal/>
    <Table/>
  </UIPageContent>
</template>
