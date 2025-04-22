<script setup>
import {UIDrawer, UIPageContent, UIPageFilter, NoDataPicture} from "@/components/index.js"
import Form from "./ui/Form.vue"
import TurnstileOrgTree from './ui/TurnstileOrgTree.vue'
import TerminalList from './ui/TerminalList.vue'
import {useComponentStore, useTurnstileOrganizationStore} from "@/store/modules/index.js";

const store = useTurnstileOrganizationStore()
const componentStore = useComponentStore()

onMounted(() => {
  store._index()
  componentStore._turnstileTerminal()
})
</script>

<template>
  <UIPageContent>
    <n-spin :show="componentStore.turnstileTerminalListLoading || store.loading" class="h-full">

        <n-grid cols="2" x-gap="12">
          <n-gi span="1" class="bg-surface-section rounded-md">
            <TurnstileOrgTree class="p-2 "/>
          </n-gi>
          <n-gi span="1" class="rounded-md">
            <div class="p-2 h-full">
              <NoDataPicture class="!my-0" v-if="!store.payload.organization_id"/>
              <TerminalList v-else/>
            </div>
          </n-gi>
        </n-grid>

    </n-spin>
    <!--    <router-view v-slot="{ Component }">-->
    <!--      <transition name="slide-right" mode="out-in">-->
    <!--        <component :is="Component" />-->
    <!--      </transition>-->
    <!--    </router-view>-->
    <UIDrawer
        :width="550"
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('turnstile.buildingPage.create') : $t('turnstile.buildingPage.edit')"
    >
      <template #content>
        <Form/>
      </template>
    </UIDrawer>
  </UIPageContent>
</template>
