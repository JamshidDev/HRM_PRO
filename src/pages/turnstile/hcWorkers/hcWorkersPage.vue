<script setup>
import {UIDrawer, UIModal, UIPageContent} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import faceForm from "./ui/faceForm.vue"
import Filter from "./ui/Filter.vue"
import deviceForm from "../accessLevels/ui/deviceForm.vue"
import {
  useAccountStore,
  useTurnstileHikCentralStore,
  useTurnstileHikCentralWorkerStore
} from "@/store/modules/index.js"
const levelStore = useTurnstileHikCentralStore()
const store = useTurnstileHikCentralWorkerStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileHikCentralWorkers)) return
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = null
  store._index()
})
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('turnstile.hcWorkersPage.create') : $t('turnstile.hcWorkersPage.edit')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
    <UIModal
        :visible="store.editVisible"
        @update:visible="(v)=>store.editVisible = v"
        :title="$t('turnstile.hcWorkersPage.edit')"
    >
      <faceForm/>
    </UIModal>
    <UIModal
        width="600px"
        :visible="levelStore.deviceVisible"
        @update:visible="(v)=>levelStore.deviceVisible = v"
        :title="$t('turnstile.hcWorkersPage.device')"
    >
      <deviceForm/>
    </UIModal>

  </UIPageContent>
</template>
