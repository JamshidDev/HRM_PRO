<script setup>
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import ExamsPanel from './ExamsPanel.vue'
import FilesPanel from './FilesPanel.vue'
import {DismissCircle32Filled, PeopleEdit20Filled} from '@vicons/fluent'
import {TopicUtils} from "@/pages/lms/Utils/index.js";
import i18n from "@/i18n/index.js";

const store = useWorkerExamStore()
const t = i18n.global.t
const examStore = useExamAttemptStore()

onMounted(() => {
  examStore._config_localstorage()
})

const emptyTab = {
  component: markRaw(ExamsPanel),
  props: {},
  title: t('examPage.name'),
  count: 0,
  id: 0,
  icon: markRaw(PeopleEdit20Filled),
  color: TopicUtils.getMediaProperty(0).color
}

const tabs = ref([])

watch(store, (v) => {
  if (v.selectedLesson) {
    tabs.value=[]
    tabs.value.push({
      ...emptyTab,
      props: {
        exams: v.selectedLesson.exams
      },
      count: v.selectedLesson.exams.length,
    })
    v.selectedLesson.files.forEach((fileType)=>{
      tabs.value.push({
        component: markRaw(FilesPanel),
        props: {
          files: fileType.items,
          type: fileType.id
        },
        title: fileType.name,
        count: fileType.items.length,
        id: fileType.id,
        icon: markRaw(TopicUtils.getMediaProperty(fileType.id).icon),
        color: TopicUtils.getMediaProperty(fileType.id).color
      })
    })
  } else {
    tabs.value=[]
  }
}, {
  immediate: true
})


const activeTab = ref(0)

</script>
<template>
  <div class="flex flex-col h-full">
    <div class="flex  justify-between border-b border-surface-line p-3 shrink-0">
      <p class="text-2xl font-semibold">{{ store.selectedLesson?.name }}</p>
      <n-button color="#747b81" icon-placement="right" quaternary type="tertiary" @click="store.selectedLesson = null">
        {{ $t('content.close') }}
        <template #icon>
          <n-icon :component="DismissCircle32Filled"/>
        </template>
      </n-button>
    </div>
    <div class="p-2 grow basis-auto overflow-hidden">
      <div class="flex flex-col h-full ">
        <div v-if="store.selectedLesson" class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 shrink-0">
          <template v-for="(tab, idx) in tabs" :key="idx">
            <div
                class="px-3 py-2 bg-blue-50 rounded-md transition-all hover:bg-blue-100 cursor-pointer flex flex-col gap-2"
                :class="{'bg-blue-100!': tab.id==activeTab}"
                @click="activeTab=tab.id"
            >
              <div class="flex items-center gap-1">
                <n-icon-wrapper :border-radius="6" :color="tab.color" :size="30" class="shrink-0">
                  <n-icon :component="tab.icon" :size="18" color="#FFF"/>
                </n-icon-wrapper>
                <p class="font-medium">{{ tab.title }}</p>
                <n-button size="tiny" circle  tertiary>
                  <span class="font-bold">{{  tab.count }}</span>
                </n-button>
              </div>
            </div>
          </template>
        </div>
        <div class="grow basis-auto overflow-auto">
          <n-tabs v-model:value="activeTab" :tab-style="{display: 'none'}" animated>
            <n-tab-pane v-for="(tab, idx) in tabs" :key="idx" :name="tab.id">
              <component :is="tab.component" v-bind="tab.props" />
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>
    </div>
  </div>
</template>