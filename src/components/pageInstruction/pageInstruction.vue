<script setup>
import {CalendarQuestionMark20Regular} from '@vicons/fluent'
import {usePageInstructionStore} from "@/store/modules/index.js"
import { UIDrawer, UIMenuButton } from '@/components/index.js'

import Form from './createForm.vue'
import Utils from "@/utils/Utils.js"

const store = usePageInstructionStore()
const route = useRoute()



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
  }
}

</script>
<template>
    <UIDrawer
      :width="1000"
      v-model:visible="store.visible"
      title="Yo'riqnoma"
    >
      <template #content>
        <n-spin :show="store.loading">
          <n-tabs type="line" v-model:value="store.activeSection" placement="right" animated>
            <n-tab-pane v-for="(section, idx) in store.sections" :name="section.id" :tab="section.title" >
              <div class="page_instruction_section">
                <div>
                  <n-carousel draggable autoplay show-arrow :show-dots="false">
                    <n-carousel-item v-for="(photo) in section.photos" :key="photo.id">
                      <img
                          class="page_instruction_image"
                          :src="photo.url"
                      >
                    </n-carousel-item>
                  </n-carousel>
                </div>
                <div class="flex justify-between">
                  <h2 class="text-xl font-bold">{{section.title}}</h2>
                  <UIMenuButton :data="section" show-edit @select-ev="onSelectEv" />
                </div>
                <!--   !Do not touch the classname. It is styling html from wange editor. you can customize it in wange editor styles in custom scss files   -->
                <div class="w-e-viewer" v-html="section.text"></div>
              </div>
            </n-tab-pane>
            <n-tab-pane :name="99999" :tab="store.elementId ? $t('content.edit') : $t('content.add') ">
              <Form/>
            </n-tab-pane>
          </n-tabs>
        </n-spin>


      </template>
    </UIDrawer>
    <div class="page_instruction_activator" @click="store.openVisible(true)">
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