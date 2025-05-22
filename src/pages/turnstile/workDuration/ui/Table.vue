<script setup>
import {NoDataPicture, UIPagination, UIUser, UIBadge, UIMenuButton} from "@/components/index.js"
import {useTurnstileWorkDurationStore, useComponentStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useTurnstileWorkDurationStore()
const compStore = useComponentStore()


const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = async (v)=>{
  if(Utils.ActionTypes.view === v.key){
    store.workerInstance = v.data
  }
}

const statuses = {
  AT_WORK: 'in-work'
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.worker')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('turnstile.workDurationPage.building')}}</th>
          <th class="min-w-[100px] w-[120px] !text-center">{{$t('turnstile.workDurationPage.workTime')}}</th>
          <th class="min-w-[180px] w-[180px] !text-center">{{$t('turnstile.workDurationPage.actionTime')}}</th>

          <th class="min-w-[100px] w-[100px] !text-center">{{$t('turnstile.workDurationPage.action')}}</th>
          <th class="min-w-[100px] w-[100px] !text-center">{{$t('content.status')}}</th>
          <th class="min-w-[40px] w-[40px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :short="false"
                  :data="{
                    photo:item?.worker?.photo,
                    firstName:item?.worker?.first_name,
                    middleName:item?.worker?.middle_name,
                    lastName:item?.worker?.last_name,
                    position:item?.worker_position,
                  }"
              />
            </div>
          </td>
          <td>{{item.building.name}}</td>
          <td class="!text-center">
            <n-button type="info" :ghost="!Math.round(item.total_minutes/60)" circle size="tiny">
              <span class="text-[14px] font-bold">{{Math.round(item.total_minutes/60)}}</span>
            </n-button>
          </td>
          <td class="!text-center">
            <UIBadge :show-icon="false" :label="Utils.timeWithMonth(item?.event_time)" />
          </td>
          <td class="!text-center">
            <n-button :type="item.event_type ? 'primary' : 'error'" dashed size="tiny">
              <span class="text-[14px]">{{$t(item.event_type ? 'turnstile.workDurationPage.enter' : 'turnstile.workDurationPage.exit')}}</span>
            </n-button>
          </td>
          <td class="!text-center">
            <n-button tertiary size="tiny" :type="item.status === statuses.AT_WORK ? 'primary' : 'success' ">
              <span class="text-[14px]">{{$t(item.status === statuses.AT_WORK ? 'turnstile.workDurationPage.at_work' : 'turnstile.workDurationPage.outside')}}</span>
            </n-button>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                show-view
                :show-delete="false"
                @selectEv="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
