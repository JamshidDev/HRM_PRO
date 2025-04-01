<script setup>
import {UIDrawer, UIPageContent, UIPageFilter} from "@/components/index.js"
import Cards from "./ui/Cards.vue"
import createFrom from "./ui/createForm.vue"
import {useTopicStore} from "@/store/modules/index.js"

const store = useTopicStore()

const onAdd = ()=>{
  store.resetForm()
  store.visibleType = true
  store.visible = true
}

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  store._index()
})
</script>

<template>
<UIPageContent>
  <div class="flex gap-2">
    <div class="basis-[30%] grow shrink-0">
      <UIPageFilter
          :show-search-input="false"
          v-model:search="store.params.search"
          @onSearch="onSearch"
          @onAdd="onAdd"
      />
      <Cards/>
    </div>
    <div class="transition-all shrink-1 overflow-hidden" :style="{'flex-basis': $route.params?.id ? '70%' : 0, 'flex-grow': !!$route.params?.id}">
      <router-view :key="$route.fullPath" v-slot="{ Component }">
        <transition name="slide-right" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

  </div>
  <UIDrawer
      :width="600"
      :visible="store.visible"
      @update:visible="(v)=>store.visible = v"
      :title="store.visibleType? $t('topicPage.createTitle') : $t('topicPage.updateTitle')"
  >
    <template #content>
      <createFrom/>
    </template>
  </UIDrawer>
</UIPageContent>
</template>
