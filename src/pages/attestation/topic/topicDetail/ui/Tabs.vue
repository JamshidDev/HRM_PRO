<script setup>
import FilePanel from './FilePanel.vue'
import TopicExamsTable from './ExamsTable.vue'
import {Add12Regular, Book24Filled, Image48Filled, MusicNote224Filled, VideoClip24Filled, PeopleEdit20Filled} from "@vicons/fluent";
import {useTopicExamStore, useTopicFileStore} from "@/store/modules/index.js";
import {TopicUtils} from "@/pages/attestation/Utils/index.js";
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const fileStore = useTopicFileStore()
const examStore = useTopicExamStore()

const examTabNumber = 0
const activeTab = ref(examTabNumber)
const onAdd = ()=>{
  if(!accStore.checkAction(accStore.pn.examTopicsRead)) return
  fileStore.accept = TopicUtils.getMediaProperty(activeTab.value).accept
  fileStore.resetForm()
  fileStore.visibleType = true
  fileStore.visible = true
}

const onAddExam = ()=>{
  if(!accStore.checkAction(accStore.pn.examTopicsWrite)) return
  examStore.resetForm()
  examStore.visibleType = true
  examStore.visible = true
}


</script>
<template>
  <div class="h-full py-3 px-8 flex flex-col">
    <div class="shrink-0">
      <p class="text-[16px] text-textColor0">{{$t('examPage.materials')}}</p>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 my-4">
        <div
            @click="activeTab=examTabNumber"
            class="w-full p-4 py-3 bg-blue-50 rounded-xl transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
          :class="{'bg-info/10!': activeTab===examTabNumber}"
        >
          <div class="flex items-center gap-1">
            <n-icon-wrapper :border-radius="6" :color="TopicUtils.getMediaProperty(examTabNumber).color" :size="30" class="shrink-0">
              <n-icon :component="PeopleEdit20Filled" :size="18" color="#FFF"/>
            </n-icon-wrapper>
            <p class="font-medium text-textColor0">{{ $t('examPage.name') }}</p>
            <n-button size="tiny" circle  tertiary>
              <span class="font-bold">{{  examStore.totalItems }}</span>
            </n-button>
          </div>
        </div>
        <template v-for="(item, idx) in  fileStore.list">
          <div
              @click="activeTab=item.id"
              class="w-full p-4 py-3 bg-blue-50 rounded-xl transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
              :class="{'bg-info/10!': activeTab===item.id}"
          >
            <div class="flex items-center gap-1">
              <n-icon-wrapper :border-radius="6" :color="TopicUtils.getMediaProperty(item.id).color" :size="30" class="shrink-0">
                <n-icon :component="TopicUtils.getMediaProperty(item.id).icon" :size="18" color="#FFF"/>
              </n-icon-wrapper>
              <p class="font-medium text-textColor0">{{ item.name }}</p>
              <n-button size="tiny" circle  tertiary>
                <span>{{  item.items?.length }}</span>
              </n-button>
            </div>
          </div>
        </template>
      </div>
    </div>
    <n-tabs :value="activeTab" class="grow basis-auto overflow-hidden" animated :tab-style="{ display: 'none', margin: 0 }" :pane-wrapper-style="{height: '100%'}">
      <n-tab-pane class="h-full pt-0!" :name="examTabNumber">
        <div class="flex flex-col h-full">
          <div class="flex shrink-0 justify-between  mb-2">
            <p class="text-[16px] font-bold">{{$t('topicDetailsPage.exams.name')}}</p>
            <n-button size="small"  secondary  @click="onAddExam">
              <template #icon>
                <n-icon size="18" :component="Add12Regular" />
              </template>
            </n-button>
          </div>
          <div class="grow basis-auto overflow-hidden">
            <TopicExamsTable />
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane v-for="(item) in fileStore.list" :key="item.id" :name="item.id" class="h-full pt-0!">
        <div class="flex justify-between  mb-2">
          <p class="text-[16px]">
            {{item.name}}
          </p>
          <n-button  type="tertiary" quaternary @click="onAdd">
            <template #icon>
              <n-icon size="24" :component="Add12Regular" />
            </template>
          </n-button>
        </div>
        <FilePanel :object="item" />

      </n-tab-pane>
    </n-tabs>
  </div>
</template>