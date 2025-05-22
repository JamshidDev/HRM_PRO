<script setup>

import Utils from "@/utils/Utils.js"
import {NoDataPicture, UIPagination, UIUser, UIPageFilter} from "@/components/index.js"
import {useVacationScheduleStore} from "@/store/modules/index.js"
import {AppsListDetail24Regular} from '@vicons/fluent'
import i18n from '@/i18n/index.js'
const store = useVacationScheduleStore()
const {t} = i18n.global


const onAdd = (v)=>{
  if(!v.month) return $Toast.warning(t('vacationSchedule.requiredMonth'))

  store.payload.month = v.month
  store.payload.organization_id =[v.organization]
  store.payload.worker_position_id = v.id
  store._create(()=>{
    store._otherWorkers()
  })

}

const changePage = (v)=>{
  store.otherParam.page = v.page
  store.otherParam.per_page = v.per_page
  store._otherWorkers()
}

const onSearch = ()=>{
  store.otherParam.page = 1
  store._otherWorkers()
}
onMounted(()=>{
  store._otherWorkers()
})
</script>

<template>
<div class="w-full" style="height: calc(100vh - 100px)">
  <n-spin :show="store.otherLoading" style="min-height:200px">
    <UIPageFilter
        v-model:search="store.otherParam.search"
        :search-loading="store.otherLoading"
        @onSearch="onSearch"
        class="mb-4"
        :show-add-button="false"
        :show-filter-button="false"
    />
    <div class="w-full overflow-y-auto" style="height: calc(100vh - 200px)">
      <template v-if="store.othersList.length>0">
        <n-table
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
            <th class="min-w-[200px]">{{$t('content.worker')}}</th>
            <th class="min-w-[200px]">{{$t('content.organization')}}</th>
            <th class="min-w-[80px] w-[200px]">{{$t('content.month')}}</th>
            <th class="min-w-[80px] w-[120px]"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.othersList" :key="idx">
            <td><span class="text-center block">{{ (store.otherParam.page - 1) * store.otherParam.per_page + idx + 1 }}</span></td>
            <td>
              <div>
                <UIUser
                    :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.position?.name,
                  }"
                />
              </div>
            </td>
            <td>
              <div>
                {{item.organization?.name}}
              </div>
            </td>
            <td>
              <n-select
                  v-model:value="item.month"
                  filterable

                  :options="Utils.monthList"
                  label-field="name"
                  value-field="id"
              />
            </td>
            <td>
              <div class="w-full flex justify-center">
                <n-button
                    @click="onAdd(item)"
                    type="warning"
                >{{$t('content.attachment')}}
                  <template #icon>
                    <AppsListDetail24Regular/>
                  </template>
                </n-button>
              </div>
            </td>
          </tr>
          </tbody>
        </n-table>
        <NoDataPicture v-if="store.othersList.length===0 && !store.otherLoading" />
      </template>

    </div>
    <UIPagination
        :page="store.otherParam.page"
        :per_page="store.otherParam.per_page"
        :total="store.otherTotal"
        @change-page="changePage"
    />
  </n-spin>
</div>
</template>

<style scoped>

</style>