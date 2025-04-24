<script setup>

import Utils from "@/utils/Utils.js"
import {NoDataPicture, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import {useVacationScheduleStore} from "@/store/modules/index.js"
const store = useVacationScheduleStore()

onMounted(()=>{
  store._otherWorkers()
})
</script>

<template>
<div class="w-full" style="height: calc(100vh - 100px)">
  <n-spin :show="store.otherLoading" style="min-height:200px">
    <div class="w-full overflow-y-auto" style="height: calc(100vh - 160px)">
      <template v-if="store.othersList.length>0">
        <n-table
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
            <th class="min-w-[200px]">{{$t('content.worker')}}</th>
            <th class="min-w-[200px]">{{$t('content.organization')}}</th>
            <th class="min-w-[80px] w-[200px]">{{$t('content.month')}}</th>
            <th class="min-w-[80px] w-[120px]">{{$t('content.month')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.othersList" :key="idx">
            <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
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
                  :placeholder="$t(`content.choose`)"
                  :options="Utils.monthList"
                  label-field="name"
                  value-field="id"
              />
            </td>
            <td>
              <div class="w-full flex justify-center">
                <n-button type="primary">{{$t('content.add')}}</n-button>
              </div>
            </td>
          </tr>
          </tbody>
        </n-table>
        <NoDataPicture v-if="store.othersList.length===0 && !store.otherLoading" />
      </template>

    </div>
    <UIPagination
        :page="store.params.page"
        :per_page="store.params.size"
        :total="store.otherTotal"
        @change-page="changePage"
    />
  </n-spin>
</div>
</template>

<style scoped>

</style>