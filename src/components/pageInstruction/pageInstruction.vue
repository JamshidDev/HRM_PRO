<script setup>
import {CalendarQuestionMark20Regular} from '@vicons/fluent'
import {useAccountStore, usePageInstructionStore} from "@/store/modules/index.js"
import { UIDrawer, UIMenuButton, NoDataPicture } from '@/components/index.js'

import Form from './createForm.vue'
import Utils from "@/utils/Utils.js"

const store = usePageInstructionStore()
const accStore = useAccountStore()
const route = useRoute()

watch(route, (v)=>{
  if(v.matched.length>2){
    store.payload.menu = v.matched[1].meta.permission
    store.payload.sub_menu = v.meta.permission
  }else{
    store.payload.menu = null
    store.payload.sub_menu = null
  }
}, {
  immediate: true
})

const onSelectEv = (v) => {
  if (v.key === Utils.ActionTypes.delete) {
    store.elementId = v.data.id
    store._delete()
  }else if(v.key === Utils.ActionTypes.edit) {
    store.elementId = v.data.id
    store.payload.text = v.data.text
    store.payload.title = v.data.title
    store.payload.photos = v.data.photos
    store.activeSection = 99999
    store.visibleType = false
  }
}

const openDrawer = ()=>{
  store._sections()
  store.resetForm()
  store.openVisible(true)
}

const showImage = (image)=>{
  $MediaViewer.showMediaViewer(image, 'jpg')
}

const isAdmin = computed(()=>{
  return accStore.checkAction(accStore.pn.admin)
})

</script>
<template>
    <UIDrawer
      :width="1000"
      v-model:visible="store.visible"
      title="Yo'riqnoma"
    >
      <template #content>
        <n-spin :show="store.loading">
          <n-tabs type="line" v-model:value="store.activeSection" placement="right" animated :default-value="100000">
            <n-tab-pane v-for="(section, idx) in store.sections" :name="section.id" :tab="section.title" >
              <div class="page_instruction_section">
                <div>
                  <n-carousel :draggable="(section.photos.length>1)" autoplay show-arrow :show-dots="false">
                    <n-carousel-item v-for="(item) in section.photos" :key="item.id">
                      <img
                          @click="showImage(item.photo)"
                          class="page_instruction_image"
                          :src="item.photo"
                      >
                    </n-carousel-item>
                  </n-carousel>
                </div>
                <div class="flex justify-between">
                  <h2 class="text-xl font-bold">{{section.title}}</h2>
                  <UIMenuButton v-if="isAdmin" :data="section" show-edit @select-ev="onSelectEv" />
                </div>
                <!--   !Do not touch the classname. It is styling html from wange editor. you can customize it in wange editor styles in custom scss files   -->
                <div class="w-e-viewer" v-html="section.text"></div>
              </div>
            </n-tab-pane>
            <n-tab-pane v-if="isAdmin" :name="99999">
              <template #tab>
                <n-button block>
                  {{store.elementId ? $t('content.edit') : $t('content.add')}}
                </n-button>
              </template>
              <Form/>
            </n-tab-pane>
            <n-tab-pane :name="100000" :tab="$t('content.empty')" :tab-props="{
              style: 'display: none;'
            }">
              <NoDataPicture />
            </n-tab-pane>
          </n-tabs>
        </n-spin>
      </template>
    </UIDrawer>
    <div class="page_instruction_activator z-[20]" @click="openDrawer" v-show="store.payload.menu">
      <n-icon size="30" color="var(--surface-section)">
        <CalendarQuestionMark20Regular />
      </n-icon>
    </div>
</template>
<style>
.page_instruction_activator{
  position: fixed;
  bottom: 35px;
  right: 35px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all .3s ease-out;
}
.page_instruction_section{
  height: calc(100vh - 90px);
  max-height: calc(100vh - 90px);
  overflow-y:auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.page_instruction_image{
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}

</style>