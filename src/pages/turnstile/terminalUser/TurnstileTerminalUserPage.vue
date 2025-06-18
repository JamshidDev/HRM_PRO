<script setup>
import {AddCircle20Regular} from "@vicons/fluent"
import {UIDrawer, UIModal, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Form from "./ui/Form.vue"
import UserForm from "./ui/UserForm.vue"
import {useAccountStore, useTurnstileTerminalUserStore} from "@/store/modules/index.js";

const store = useTurnstileTerminalUserStore()
const accStore = useAccountStore()


const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersWrite)) return
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersRead)) return
  store.params.page = 1
  store._index()
}

const addUserEv = ()=>{
  store.resetUserForm()
  store.addVisible = true
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersRead)) return
  store.params.page = 1
  store.params.per_page = 10
  store.params.search = null
  store._index()
})
</script>

<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        @onAdd="onAdd"
        :show-filter-button="false"
    >
      <template #filterAction>
        <n-button
            type="error"
            @click="addUserEv"
        >
          <template #icon>
            <AddCircle20Regular/>
          </template>
          {{$t('turnstile.terminalUser.addBtn')}}
        </n-button>
      </template>
    </UIPageFilter>
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('turnstile.terminalUser.create') : $t('turnstile.terminalUser.edit')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
    <UIModal
        :width="1200"
        :visible="store.addVisible"
        @update:visible="(v)=>store.addVisible = v"
        :title="$t('turnstile.terminalUser.addUser')"
    >
      <template #default>
        <UserForm/>
      </template>
    </UIModal>
  </UIPageContent>
</template>
