<script setup>
import {ArrowCircleDownRight20Regular, ArrowCircleUpLeft20Regular, ClockArrowDownload24Regular} from "@vicons/fluent"
import {NoDataPicture,UIPageFilter, UIPagination, UIUser} from "@/components/index.js"
import {useTurnstileWorkDurationStore} from "@/store/modules/index.js"
import {useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"


const store = useTurnstileWorkDurationStore()

const onSearch = ()=>{
  store.lateParams.page = 1
  store._lateComers()
}

const onChangePage = (v)=>{
  store.lateParams.page = v.page
  store.lateParams.per_page = v.per_page
  store._lateComers()
}

const initialDefaultValue = ()=>{
  store.lateParams.first_time = '09:00'
  store.lateParams.from = new Date().getTime()
  store.lateParams.to = new Date().getTime()
}

const filterEvent = ()=>{
  store.lateParams.page = 1
  store._lateComers()
}

const onEnter = ()=>{
  if(store.lateParams.first_time?.length !==5) return
  store._lateComers()
}

onMounted(()=>{
  initialDefaultValue()
  store._lateComers()
})
</script>

<template>
<div class="grid grid-cols-12">
  <div class="col-span-12">
    <UIPageFilter
        :show-add-button="false"
        :show-filter-button="false"
        v-model:search="store.lateParams.search"
        :search-loading="store.lateLoading"
        @onSearch="onSearch"
    >
      <template #filterAction>
        <n-button
            @click="store._download()"
            :loading="store.downloadLoading"
            class="!mt-5"
            type="success">
          {{$t('content.download')}}
          <template #icon>
            <ClockArrowDownload24Regular/>
          </template>
        </n-button>
        <div class="w-[300px]">
          <label class="text-textColor3 ml-1">{{$t('turnstile.workDurationPage.startTime')}}</label>
          <n-input
              v-mask="'##:##'"
              class="w-full"
              type="text"
              v-model:value="store.lateParams.first_time"
              @keydown.enter="onEnter"
              :loading="store.lateLoading"
              :disabled="store.lateLoading"
          />
        </div>
        <div class="w-[300px]">
          <label class="text-textColor3 ml-1">{{$t('content.from')}}</label>
          <n-date-picker
              clearable
              class="w-full"
              v-model:value="store.lateParams.from"
              type="date"
              :format="useAppSetting.datePicketFormat"
              @update:value="filterEvent"
          />
        </div>
        <div class="w-[300px]">
          <label class="text-textColor3 ml-1">{{$t('content.to')}}</label>
          <n-date-picker
              clearable
              class="w-full"
              v-model:value="store.lateParams.to"
              type="date"
              :format="useAppSetting.datePicketFormat"
              @update:value="filterEvent"
              :is-date-disabled="(v)=>Utils.disablePasteDate(v,store.lateParams.from)"
          />
        </div>
      </template>
    </UIPageFilter>
  </div>
  <div class="col-span-12">
    <n-spin :show="store.lateLoading" style="min-height: 200px">
      <div class="w-full mt-4 h-[calc(100vh-260px)] overflow-x-auto ">
        <n-table
            v-if="store.lateList.length>0"
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
            <th class="min-w-[200px]">{{$t('content.worker')}}</th>
            <th class="min-w-[60px] w-[60px]">{{$t('content.status')}}</th>
            <th class="min-w-[100px] w-[300px]">{{$t('content.organization')}}</th>
            <th class="min-w-[100px] w-[130px]">{{$t('content.date')}}</th>

          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.lateList" :key="idx">
            <td><span class="text-center block">{{ (store.lateParams.page - 1) * store.lateParams.per_page + idx + 1 }}</span></td>
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
            <td>
              <div class="text-center">
                <n-button secondary :type="item.event_type? 'primary' : 'error'" size="tiny">
                  {{$t(item.event_type? 'turnstile.workDurationPage.enter' : 'turnstile.workDurationPage.exit') }}
                  <template #icon>
                    <n-icon size="17">
                      <ArrowCircleDownRight20Regular/>
                    </n-icon>
                  </template>
                </n-button>

              </div>
            </td>
            <td>
              <div>{{item.organization?.name}}</div>
            </td>
            <td>
              <div class="text-center">{{item.event_time}}
              </div>
            </td>
          </tr>
          </tbody>
        </n-table>
        <NoDataPicture v-if="store.lateList.length===0 && !store.lateLoading" />
      </div>
      <UIPagination
          :page="store.lateParams.page"
          :per_page="store.lateParams.size"
          :total="store.totalItems"
          @change-page="onChangePage"
      />
    </n-spin>
  </div>
</div>
</template>

<style scoped>

</style>