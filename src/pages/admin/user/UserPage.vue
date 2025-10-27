<script setup>
import {LockClosed32Filled, LockOpen28Filled} from "@vicons/fluent"
import {UIDrawer, UIPageContent, UIDConfirm} from "@/components/index.js"
import {useUserStore, useAccountStore} from "@/store/modules/index.js";
import Table from "./ui/Table.vue"
import createForm from "./ui/createForm.vue"
import Filter from "./ui/Filter.vue"

const store = useUserStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.usersRead)) return
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
      :title="store.visibleType? $t('userPage.createTitle') : $t('userPage.updateTitle')"
  >
    <template #content>
      <createForm/>
    </template>
  </UIDrawer>
  <UIDConfirm 
  v-model:visible="store.confirmVisible"
  >
    <template #icon>
      <div class="flex justify-center w-full pt-4 mb-6">
        <n-icon size="56" :class="[store.isSpam? 'text-success' : 'text-danger']">
          <LockOpen28Filled v-if="store.isSpam" />
          <LockClosed32Filled v-else />
        </n-icon>
      </div>
    </template>
    <h2 class="text-center font-semibold" :class="[store.isSpam? 'text-success' : 'text-danger']">{{$t(store.isSpam? 'userPage.form.cancelSpam' : 'userPage.form.confirmSpam')}}</h2>
  <template #action>
    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.confirmVisible = false" type="error" secondary>{{$t('content.close')}}</n-button>
      <n-button @click="store._onSpam" type="primary" secondary>{{$t('content.confirm')}}</n-button>
    </div>
  </template>
  </UIDConfirm>
</UIPageContent>
</template>