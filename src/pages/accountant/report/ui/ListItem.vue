<script setup>
import {NoDataPicture, UIMenuButton} from "@/components/index.js"
import {useUploadReportStore} from "@/store/modules/index.js"
import {CloudArrowDown48Regular} from '@vicons/fluent'
import Utils from "../../../../utils/Utils.js"

const store = useUploadReportStore()

const onSelect = (v)=>{

}
</script>

<template>
  <div class="w-full overflow-x-auto overflow-y-auto h-[calc(100vh-200px)]">
    <n-spin :show="store.loading">
      <div  v-if="store.list.length>0">
        <n-table
            class="w-full table-fixed"
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th class="text-center w-[30px] min-w-[30px] grow-0">{{$t('content.number')}}</th>
            <th class="text-center">{{$t('content.date')}}</th>
            <th class="text-center w-[180px]">{{$t('content.status')}}</th>
            <th class="text-center w-[120px]">{{$t('content.file')}}</th>
            <th class="max-w-[60px] w-[60px]"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">
            {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
          </span></td>
            <td>
              <span class="cursor-pointer hover:underline hover:text-primary">{{Utils.getMonthNameById(item.month)}} {{item.year}}</span>
            </td>
            <td>
              {{item.status}}
            </td>
            <td>
              <div class="flex flex-wrap items-center gap-4 justify-end">
                <n-button size="small">{{$t('content.download')}}
                  <template #icon>
                    <CloudArrowDown48Regular/>
                  </template>
                </n-button>
              </div>
            </td>
            <td>
              <UIMenuButton
                  :show-delete="false"
                  :show-view="true"
                  :data="item"
                  @select-ev="onSelect"
              />
            </td>
          </tr>
          </tbody>
        </n-table>
      </div>
      <NoDataPicture v-if="store.list.length===0 && !store.loading" />
    </n-spin>
  </div>

</template>

<style scoped>

</style>