<script setup>
import {Filter, CreateModal, Table, ApproveModal } from "./ui/index.js"
import {useAccountStore, useApproveStore} from "@stores"
import {UIPageContent} from "@components"

const store = useApproveStore()
const accStore = useAccountStore()

onMounted(() => {
  if (!accStore.checkAction(accStore.pn.turnstileApproveRead)) return
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