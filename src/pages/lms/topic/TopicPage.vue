<script setup>
import {UIDrawer, UIPageFilter} from "@/components/index.js"
import Cards from "./ui/Cards.vue"
import createFrom from "./ui/createForm.vue"
import {useTopicStore} from "@/store/modules/index.js"
import {useRoute} from "vue-router";

const store = useTopicStore()

const onAdd = () => {
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = () => {
  store.params.page = 1
  store._index()
}

onMounted(() => {
  store._index()
})
const route = useRoute()
</script>

<template>
  <div class="mx-2 mt-4 mb-4 rounded flex flex-col gap-3"
       style="min-height:calc(100vh - 100px);height:calc(100vh - 100px);">
    <div :style="{gap: route.params?.id ? '10px' : 0}" class="flex h-full">
      <div class="basis-[40%] grow shrink-0 h-full flex flex-col gap-2">
        <UIPageFilter
            class="shrink-0"
            v-model:search="store.params.search"
            :show-search-input="false"
            @onAdd="onAdd"
            @onSearch="onSearch"
        />
        <div class="grow basis-auto">
          <Cards/>
        </div>
      </div>
      <div :style="{'flex-basis': route.params?.id ? '60%' : 0, 'flex-grow': !!route.params?.id}"
           class="transition-all shrink-1 overflow-hidden h-full">
        <router-view :key="$route.fullPath"/>
      </div>
    </div>
    <UIDrawer
        :title="store.visibleType? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
        :visible="store.visible"
        :width="600"
        @update:visible="(v)=>store.visible = v"
    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
  </div>
</template>
