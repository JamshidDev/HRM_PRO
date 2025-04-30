<script setup>
import {UIDrawer, UIPageContent, UIPageFilter, NoDataPicture, UIModal} from "@/components/index.js"
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
      <div class="flex gap-3 relative">
        <div class="bg-surface-section rounded-md grow basis-[50%] shrink-0 overflow-auto w-full md:w-auto">
          <TurnstileOrgTree class="p-2 "/>
        </div>
        <div class="bg-surface-ground transition-all rounded-md grow basis-[40%] shrink-0 absolute md:static w-full md:w-auto top-0 bottom-0" :style="{right: store.payload.organization_id?.length ? '0' : '-100%'}">
          <div class="md:p-2 h-full">
            <NoDataPicture class="!my-0" v-if="!store.payload.organization_id?.length"/>
            <TerminalList v-else/>
          </div>
        </div>
      </div>
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
