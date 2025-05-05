<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMenuButton, UIStatus} from "@/components/index.js"
import {useExportStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {ArrowDownload24Regular} from '@vicons/fluent'

const store = useExportStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._tasks()
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.tasks.length>0">
      <n-table
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.type')}}</th>
          <th class="min-w-[200px] w-[300px] text-center!">{{$t('content.status')}}</th>
          <th class="min-w-[130px] w-[130px]">{{$t('content.created')}}</th>
          <th class="min-w-[130px] w-[130px]">{{$t('content.ended')}}</th>
          <th class="min-w-[50px] w-[50px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.tasks" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
<!--            <n-button type="primary" dashed size="tiny">-->
<!--              -->
<!--            </n-button>-->
            {{item.type}}
          </td>
          <td>
            <UIStatus size="tiny" :status="item.status" />
          </td>
          <td>
            {{Utils.timeWithMonth(item.created_at)}}
          </td>
          <td>
            {{Utils.timeWithMonth(item.updated_at)}}
          </td>
          <td class="text-center">
            <n-button v-if="item.file" type="primary" ghost size="small" tag="a" :href="item.file" target="_blank">
              <template #icon>
                <n-icon :component="ArrowDownload24Regular" />
              </template>
            </n-button>
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-show="store.totalItems>10"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.tasks.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>