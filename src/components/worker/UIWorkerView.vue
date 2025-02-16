<script setup>
import {
  QuizNew48Regular,
  VideoPersonSparkle28Regular,
  PersonAccounts24Regular,
  NotepadPerson24Regular,
  WeatherSunnyLow24Regular,
  Doctor20Regular,
  PeopleSearch24Regular,ChevronLeft12Regular,
  CheckmarkCircle32Regular, ChevronRight24Filled,
} from "@vicons/fluent"
import GeneralInfo from "./ui/GeneralInfo.vue"
import CareerInfo from "./ui/CareerInfo.vue"
import RelativeInfo from "./ui/RelativeInfo.vue"
import MainInfo from "./ui/MainInfo.vue"
import i18n from "@/i18n/index.js"
import {useWorkerProfileStore} from "@/store/modules/index.js"

const store = useWorkerProfileStore()
const carouselRef = ref(null)
const currentIndex = ref(1)
const visible =defineModel('visible', {type:Boolean, default:false})
const props = defineProps({
  workerId:{
    type:String,
    default:null
  },
})
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

const onChangeIndex = (v)=>{
  currentIndex.value = v+1
}

const nextSlide =()=>{
  carouselRef.value?.next()
}

const prevSlide =()=>{
  carouselRef.value?.prev()
}


onMounted(()=>{
  const id = "685f9715-f929-4eb9-bc33-b6196d896b65"
  store._workerPreview(id)
  if(props.workerId){
    const id = "685f9715-f929-4eb9-bc33-b6196d896b65"
    store._workerPreview(id)
  }
})

</script>

<template>
  <n-modal
      v-model:show="visible"
      draggable
      style="width:100%;height:96vh"
  >
    <div class="w-full flex max-w-[1200px] bg-white rounded-md overflow-hidden">
      <div class="bg-effect-wing w-[240px] border-r border-surface-line bg-surface-100 flex flex-col px-4 pt-6">
        <div class="relative w-full">
          <div class="absolute top-1/2 translate-y-[-50%] right-1 cursor-pointer">
            <n-icon @click="nextSlide" size="26" class="text-primary">
              <ChevronRight24Filled/>
            </n-icon>
          </div>
          <div class="absolute top-1/2 translate-y-[-50%] left-1 cursor-pointer">
            <n-icon @click="prevSlide" size="26" class="text-primary">
              <ChevronLeft12Regular/>
            </n-icon>
          </div>
          <div class=" cursor-pointer relative border border-surface-line w-[140px] mx-auto rounded-lg overflow-hidden mb-10">
            <n-carousel
                ref="carouselRef"
                :show-dots="false"
                :space-between="10"
                draggable
                @update-current-index="onChangeIndex"
            >

              <n-carousel-item class="hover:scale-90 transition-all rounded-lg">
                <img
                    class="w-full"
                    src="http://192.168.82.90:9000/docflow/worker-photos/640f8d56df6d148d4aa4539d1287b4d1.png"
                    alt="worker image" />
              </n-carousel-item>
              <n-carousel-item class="hover:scale-90 transition-all rounded-lg">
                <img
                    class="w-full"
                    src="http://192.168.82.90:9000/docflow/worker-photos/2723bc1c1524cfddb8cb18b79b073c4c.png"
                    alt="worker image" />
              </n-carousel-item>
              <n-carousel-item class="hover:scale-90 transition-all rounded-lg">
                <img
                    class="w-full"
                    src="http://192.168.82.90:9000/docflow/worker-photos/640f8d56df6d148d4aa4539d1287b4d1.png"
                    alt="worker image" />
              </n-carousel-item>
              <n-carousel-item class="hover:scale-90 transition-all rounded-lg">
                <img
                    class="w-full"
                    src="http://192.168.82.90:9000/docflow/worker-photos/2723bc1c1524cfddb8cb18b79b073c4c.png"
                    alt="worker image" />
              </n-carousel-item>
            </n-carousel>
            <div class="w-[28px] h-[24px] bg-[#04020238] rounded-md overflow-hidden text-white absolute top-[4px] right-[4px] text-xs flex justify-center items-center">{{currentIndex}}/4</div>
          </div>
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

      <div class="px-4 overflow-x-hidden overflow-y-auto relative" style="width: calc(100% - 240px)">
        <MainInfo/>
        <n-tabs animated v-model:value="activeTab" class="hidden-tab-header" type="segment">
          <n-tab-pane v-for="(item, idx) in tabList" :name="item.id" :key="idx">
            <template v-if="tabList[0].id === item.id">
              <GeneralInfo/>
            </template>
            <template v-if="tabList[1].id === item.id">
              <CareerInfo/>
            </template>
            <template v-if="tabList[2].id === item.id">
              <RelativeInfo/>
            </template>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </n-modal>
</template>