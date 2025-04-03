<script setup>
import FileList from './FileList.vue'
import TopicExamsTable from './ExamsTable.vue'
import {AddCircle32Regular, Book24Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled, PeopleEdit20Filled} from "@vicons/fluent";
import {useTopicExamStore, useTopicFileStore} from "@/store/modules/index.js";

const fileStore = useTopicFileStore()
const examStore = useTopicExamStore()

const MediaTypeEnum = {
  VIDEO: 1,
  IMAGE: 2,
  BOOK: 3,
  AUDIO: 4
}


const getMediaProperty = (typeId) => {
  switch (typeId) {
    case MediaTypeEnum.BOOK:
      return { color: "#2080f0", icon: Book24Filled }; // Info
    case MediaTypeEnum.IMAGE:
      return { color: "#1f2220", icon: Image48Filled }; // Success
    case MediaTypeEnum.VIDEO:
      return { color: "#d03050", icon: VideoClip24Filled }; // Error
    case MediaTypeEnum.AUDIO:
      return { color: "#18a058", icon: MusicNote224Filled }; // Primary
    default:
      return { color: "#8a8a8a", icon: AddCircle32Regular }; // Default
  }
};
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
        :class="{'bg-blue-100': activeTab===examTabNumber}"
      >
        <div class="flex items-center gap-1">
          <n-icon-wrapper :color="getMediaProperty(examTabNumber).color" class="shrink-0" :size="30" :border-radius="10" >
            <n-icon color="#FFF" :size="18" :component="PeopleEdit20Filled" />
          </n-icon-wrapper>
          <p class="text-primary font-medium text-lg">Imtihonlar</p>
        </div>
        <p class="text-xs text-gray-500 font-semibold">
          {{$t('examPage.nExams', {n: examStore.totalItems})}}
        </p>
      </div>
      <template v-for="(item, idx) in  fileStore.list">
        <div
            @click="activeTab=item.id"
            class="w-full p-4 py-3 bg-blue-50 rounded-md transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
            :class="{'bg-blue-100': activeTab===item.id}"
        >
          <div class="flex items-center gap-1">
            <n-icon-wrapper  :color="getMediaProperty(item.id).color" class="shrink-0" :size="30" :border-radius="10" >
              <n-icon color="#FFF" :size="18" :component="getMediaProperty(item.id).icon" />
            </n-icon-wrapper>
            <p class="text-primary font-medium text-lg">{{item.name}}</p>

          </div>
          <p class="text-xs text-gray-500 font-semibold">
            {{$t('examPage.nFiles', {n: item.items.length})}}
          </p>
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
        <FileList :object="item" />

      </n-tab-pane>
    </n-tabs>
  </div>
</template>