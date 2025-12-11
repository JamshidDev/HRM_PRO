<script setup>
import {UIUserGroup} from "@/components/index.js"
import {useTurnstileDashboardStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import i18n from '@/i18n/index.js'

const store = useTurnstileDashboardStore()
const t = i18n.global.t

const props = defineProps({
  type:{
    type: String,
    default: "primary",
  },
  count: Number,
  title:String,
  icon:Object,
  list:Array,
  listMore:{
    type:Number,
    default:null,
  },
  badgeText:{
    type: String,
    default: null,
  },

})

const typeClass = computed(()=>{
  const classes = {
    primary:'text-primary bg-primary/10',
    warning:'text-warning bg-warning/10',
    dark:'text-dark bg-dark/10',
    danger:'text-danger bg-danger/10',
    success:'text-success bg-success/10',
  }
  return classes[props.type]
})


const badgeText = computed(()=>{
  const today = Utils.timeToZone(new Date().getTime())
  return Utils.timeToZone(store.dashboardParams.date) === today ? t('content.today') : Utils.timeOnlyDate(store.dashboardParams.date)

})
</script>

<template>
  <div class="grid cursor-pointer border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative overflow-hidden">

    <div class="flex justify-between items-start bg-surface-section">
      <div
          :class="[typeClass]" class=" w-[40px] h-[40px] rounded-lg flex justify-center items-center">
        <n-icon size="26">
          <component :is="icon" />
        </n-icon>
      </div>
      <div v-if="badgeText" :class="[typeClass]" class="px-2 py-1 rounded-lg text-[10px] font-medium">{{badgeText}}</div>
    </div>

    <div class="content-between z-10 text-right flex items-center justify-between mt-2">
      <div>
        <p class="text-left leading-[1.2] font-bold text-textColor2 text-lg">{{count}}</p>
        <p class="text-secondary text-xs font-medium leading-[1.2] line-clamp-1 text-left">{{title}}</p>
      </div>
      <span class="flex items-center" v-if="listMore">
            <UIUserGroup
                @click.stop
                :max="4"
                :data="listMore>3? [...list, ...list] : list"
                :has-more="listMore-3"
            />
          </span>
    </div>

    <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
  </div>
</template>
