<script setup>
import {QuizNew48Regular, VideoPersonSparkle28Regular, PersonAccounts24Regular,
  NotepadPerson24Regular, WeatherSunnyLow24Regular, Doctor20Regular, PeopleSearch24Regular, CheckmarkCircle32Regular} from "@vicons/fluent"
import GeneralInfo from "./ui/GeneralInfo.vue"
import i18n from "@/i18n/index.js"



const visible =defineModel('visible', {type:Boolean, default:false})
const {t} = i18n.global

const tabList = [
  {
    name:t('workerView.tabs.general'),
    id:1,
    icon:VideoPersonSparkle28Regular,
  },
  {
    name:t('workerView.tabs.career'),
    id:2,
    icon:PersonAccounts24Regular,
  },
  {
    name:t('workerView.tabs.relative'),
    id:3,
    icon:PeopleSearch24Regular,
  },
  {
    name:t('workerView.tabs.med'),
    id:4,
    icon:Doctor20Regular,
  },
  {
    name:t('workerView.tabs.vacation'),
    id:5,
    icon:WeatherSunnyLow24Regular,
  },
  {
    name:t('workerView.tabs.incentive'),
    id:6,
    icon:NotepadPerson24Regular,
  },
  {
    name:t('workerView.tabs.punishment'),
    id:7,
    icon:NotepadPerson24Regular,
  },
  {
    name:t('workerView.tabs.attestation'),
    id:8,
    icon:QuizNew48Regular,
  },
]
const activeTab = ref(1)

const onChange = (v)=>{
  activeTab.value = v
}
</script>

<template>
  <n-modal
      v-model:show="visible"
      draggable
      style="width:100%; height: 100vh"
  >
    <div class="w-full flex max-w-[1200px] bg-white ">
      <div class="bg-effect-wing w-[240px] border-r border-surface-line bg-surface-100 flex flex-col px-4 pt-6">
          <div class=" border border-surface-line w-[140px] mx-auto rounded-lg overflow-hidden mb-10">
            <img
                class="w-full"
                src="http://192.168.82.90:9000/docflow/worker-photos/640f8d56df6d148d4aa4539d1287b4d1.png"
                alt="worker image" />
          </div>

        <template v-for="(item, idx) in tabList" :key="idx">
          <div
              @click="onChange(item.id)"
              class="cursor-pointer w-full p-2 mb-2 flex items-center gap-2
              rounded-md border border-surface-200 hover:bg-primary hover:text-white transition-all hover:scale-90"
              :class="[activeTab === item.id && 'bg-primary text-white']"
          >
            <n-icon size="22">
              <component v-if="activeTab === item.id"  :is="CheckmarkCircle32Regular" />
              <component v-else :is="item.icon" />
            </n-icon>
            <span class="font-semibold">{{item.name}}</span>
          </div>
        </template>

      </div>

      <div class="px-4 py-10 overflow-x-hidden overflow-y-auto relative" style="width: calc(100% - 240px)">
        <n-tabs animated v-model:value="activeTab" class="hidden-tab-header" type="segment">
          <n-tab-pane v-for="(item, idx) in tabList" :name="item.id" :key="idx">
            <template v-if="tabList[0].id === item.id">
              <GeneralInfo/>
            </template>
            <template v-if="tabList[1].id === item.id">
              <GeneralInfo/>
            </template>
            <template v-if="tabList[2].id === item.id">
              <GeneralInfo/>
            </template>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </n-modal>
</template>