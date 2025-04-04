<script setup>
import FilePanel from './FilePanel.vue'
import TopicExamsTable from './ExamsTable.vue'
import {AddCircle32Regular, Book24Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled, PeopleEdit20Filled} from "@vicons/fluent";
import {useTopicExamStore, useTopicFileStore} from "@/store/modules/index.js";
import {TopicUtils} from "@/pages/lms/Utils/index.js";

const fileStore = useTopicFileStore()
const examStore = useTopicExamStore()

const examTabNumber = 0
const activeTab = ref(examTabNumber)
const onAdd = ()=>{
  fileStore.resetForm()
  fileStore.visibleType = true
  fileStore.visible = true
}

const onAddExam = ()=>{
  examStore.resetForm()
  examStore.visibleType = true
  examStore.visible = true
}


</script>
<template>
  <div class="h-full py-3 px-8">
    <p class="text-[16px]">Materiallar</p>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 my-4">
      <div
          @click="activeTab=examTabNumber"
          class="w-full p-4 py-3 bg-blue-50 rounded-md transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
        :class="{'!bg-blue-100': activeTab===examTabNumber}"
      >
        <div class="flex items-center gap-1">
          <n-icon-wrapper :border-radius="10" :color="TopicUtils.getMediaProperty(examTabNumber).color" :size="30" class="shrink-0">
            <n-icon :component="PeopleEdit20Filled" :size="18" color="#FFF"/>
          </n-icon-wrapper>
          <p class="font-medium">{{ $t('examPage.name') }}</p>
          <n-button size="tiny" circle  tertiary>
            <span class="font-bold">{{  examStore.totalItems }}</span>
          </n-button>
        </div>
      </div>
      <template v-for="(item, idx) in  fileStore.list">
        <div
            @click="activeTab=item.id"
            class="w-full p-4 py-3 bg-blue-50 rounded-md transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
            :class="{'!bg-blue-100': activeTab===item.id}"
        >
          <div class="flex items-center gap-1">
            <n-icon-wrapper :border-radius="10" :color="TopicUtils.getMediaProperty(item.id).color" :size="30" class="shrink-0">
              <n-icon :component="TopicUtils.getMediaProperty(item.id).icon" :size="18" color="#FFF"/>
            </n-icon-wrapper>
            <p class="font-medium">{{ item.name }}</p>
            <n-button size="tiny" circle  tertiary>
              <span class="font-bold">{{  item.items.length }}</span>
            </n-button>
          </div>
        </div>
      </template>
    </div>
    <n-tabs :value="activeTab" animated :tab-style="{ display: 'none', margin: 0 }">
      <n-tab-pane class="h-full !pt-0" :name="examTabNumber">
        <div class="flex justify-between  mb-2">
          <p class="text-[16px]">Imtihonlar</p>
          <n-button  type="tertiary" quaternary  @click="onAddExam">
            <template #icon>
              <n-icon size="24" :component="AddCircle32Regular" />
            </template>
          </n-button>
        </div>
        <TopicExamsTable />
      </n-tab-pane>
      <n-tab-pane v-for="(item) in fileStore.list" :key="item.id" :name="item.id" class="h-full !pt-0">
        <div class="flex justify-between  mb-2">
          <p class="text-[16px]">
            {{item.name}}
          </p>
          <n-button  type="tertiary" quaternary @click="onAdd">
            <template #icon>
              <n-icon size="24" :component="AddCircle32Regular" />
            </template>
          </n-button>
        </div>
        <FilePanel :object="item" />

      </n-tab-pane>
    </n-tabs>
  </div>
</template>