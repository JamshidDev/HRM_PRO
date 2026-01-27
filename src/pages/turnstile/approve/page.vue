<script setup>
import {Filter, CreateModal, Table, ApproveModal } from "./ui/index.js"
import {useApproveStore} from "@stores"
import {UIPageContent} from "@components"

const store = useApproveStore()

onMounted(() => {
  store._index()
})
</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <CreateModal/>
  <ApproveModal/>
</UIPageContent>
</template>