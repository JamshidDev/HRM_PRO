<script setup>
import {CalendarQuestionMark20Regular} from '@vicons/fluent'
import {usePageInstructionStore} from "@/store/modules/index.js"
import { UIModal, UIDrawer } from '@/components/index.js'
import Utils from "@/utils/Utils.js"
import en from "@/assets/images/content/en.png"
import ru from "@/assets/images/content/ru.png"
import uz from "@/assets/images/content/uz.png"
import login from "@/assets/images/content/login-overall.png"
import Form from './createForm.vue'

const photos = [
  en,
  ru,
  uz,
  login,
]
const store = usePageInstructionStore()
const route = useRouter()

onMounted(() => {
  console.log(route)
})

</script>
<template>
  <n-spin :show="store.loading">
    <UIDrawer
      :width="1000"
      v-model:visible="store.visible"
      title="Yo'riqnoma"
    >
      <template #content>
        <n-tabs type="line" v-model:value="store.activeSection" placement="right" animated>
          <n-tab-pane v-for="(section, idx) in store.sections" :name="section.id" :tab="section.title" >
            <div class="page_instruction_section">
              <div>
                <n-carousel draggable autoplay show-arrow :show-dots="false">
                  <n-carousel-item v-for="(photo, photo_idx) in section.photos" :key="photo_idx">
                    <img
                        class="page_instruction_image"
                        :src="photo"
                    >
                  </n-carousel-item>
                </n-carousel>
              </div>
              <h2 class="text-xl font-bold">{{section.title}}</h2>
              <!--   !Do not touch the classname. It is styling html from wange editor. you can customize it in wange editor styles in custom scss files   -->
              <div class="w-e-viewer" v-html="section.text"></div>
            </div>
          </n-tab-pane>
          <n-tab-pane :name="99999" tab="Yangi qo'shish">
            <Form/>
          </n-tab-pane>
        </n-tabs>

      </template>
    </UIDrawer>
    <div class="page_instruction_activator" @click="store.openVisible(true)">
      <n-icon size="30" color="var(--surface-section)">
        <CalendarQuestionMark20Regular />
      </n-icon>
    </div>
  </n-spin>
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
}
.page_instruction_image{
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover;
}

</style>