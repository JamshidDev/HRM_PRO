<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMenuButton} from "@/components/index.js"
import {useExportStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

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
          class="mt-3"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.type')}}</th>
          <th class="min-w-[200px] w-[300px]">{{$t('content.status')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.created')}}</th>
          <th class="min-w-[200px]">{{$t('content.action')}}</th>
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
            <n-button typeof="warning" dashed size="tiny">
              {{item.status.name}}
            </n-button>
          </td>
          <td>
            {{Utils.timeWithMonth(item.created_at)}}
          </td>
          <td>

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