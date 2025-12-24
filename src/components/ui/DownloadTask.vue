<script setup>
import {Alert28Regular, ArrowCircleDown24Regular, Timer16Regular, ErrorCircle12Filled} from "@vicons/fluent"
import {useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import router from "@/router/index.js"
import {AppPaths} from "@/utils/index.js"

const store = useAccountStore()

const onShow = (v) =>{
  if(!v) return
  store._fetchTask()
}

const onDownload = (url)=>{
  window.open(url, '_blank')

}

const goViewAll = ()=>{
  router.push(Utils.routeHrmPathMaker(AppPaths.Export))
}

const viewAll = ()=>{
  const data = {
    "all": true,
  }
  store._markRead(data)
}

onMounted(()=>{
  store._fetchUnReadNotificationCount()
})
</script>

<template>
  <n-popover
      class="!p-0"
      placement="bottom-start"
      trigger="click"
      @update:show="onShow"
  >
    <template #trigger>
      <n-badge class="!text-[10px]" type="info" :value="store.unReadNotificationCount" :offset=" [10, -2]">
        <n-button size="large" text id="taskBtn" round>
          <template #icon>
            <n-icon size="24">
              <Alert28Regular/>
            </n-icon>
          </template>
        </n-button>
      </n-badge>

    </template>
    <div class="w-[300px] h-[300px] cursor-pointer overflow-hidden" >
      <div class="w-full border-b border-surface-line px-2 py-2 text-xs font-semibold flex justify-between items-center">
        <span>{{$t('content.notifications')}}</span>
        <n-button @click="viewAll" size="tiny"><span class="text-[10px]">{{$t('content.markAsRead')}}</span></n-button>

      </div>

      <n-spin class="h-[calc(100%-66px)]" :show="store.notifyLoading">
        <div class="w-full h-full overflow-y-auto px-1">
          <template v-for="item in store.notificationList" :key="item.id">
            <div class="px-2 my-1 border border-surface-line rounded-lg bg-surface-ground/30 hover:bg-surface-ground/80 pt-2">
              <div class="w-full text-xs leading-[1]">
                <n-badge v-if="!item.read_at" class="mb-[2px]" type="info" dot /> {{item.type}}
              </div>
              <div class="flex justify-between items-center mt-4 pb-1">
                <div class="text-[10px] text-textColor3">{{Utils.timeOnlyDate(item.created_at)}}</div>
                <n-button v-if="item.status.id === 2" @click="onDownload(item.file)" class="!py-1" type="success" secondary size="tiny">
                  <template #icon>
                    <ArrowCircleDown24Regular/>
                  </template>
                  {{$t('content.download')}}</n-button>
                <n-button v-if="item.status.id === 1" class="!py-1" type="warning" secondary size="tiny">
                  <template #icon>
                    <Timer16Regular/>
                  </template>
                  {{$t('content.Process')}}</n-button>
                <n-button v-if="item.status.id === 3" class="!py-1" type="error" secondary size="tiny">
                  <template #icon>
                    <ErrorCircle12Filled/>
                  </template>
                  {{$t('content.Error')}}</n-button>
              </div>
            </div>

          </template>

        </div>
      </n-spin>

      <div @click="goViewAll" class="w-full text-center border-t border-surface-line px-2 py-1 text-xs">
        {{$t('content.viewAll')}}
      </div>
    </div>
  </n-popover>
</template>
