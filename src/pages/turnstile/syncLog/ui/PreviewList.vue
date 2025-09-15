<script setup>
import {NoDataPicture, UIPagination, UIBadge, UIStatus, UIMenuButton} from "@/components/index.js"
import {useSyncLogStore} from "@/store/modules/index.js"
import {ErrorCircle24Filled,PersonAvailable20Filled, Person12Filled} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"

const {t} = i18n.global
const store = useSyncLogStore()


const onSelect = (v)=>{
  store.elementId = v.data.id
  if(v.key === Utils.ActionTypes.view){

  }
}

const statusObj = {
  1: {
    name:t('content.process'),
    id:1,
  },
  2: {
    name:t('content.error'),
    id:4,
  },
  3: {
    name:t('content.success'),
    id:3,
  }
}

</script>

<template>
  <n-spin :show="store.showLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto h-[calc(100vh-200px)]"  v-if="store.previewList.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('content.name')}}</th>
          <th class="min-w-[160px]">{{$t('syncLog.form.deviceLastSync')}}</th>
          <th class="min-w-[100px]">{{$t('hcServer.form.exported_count')}}</th>
          <th class="min-w-[80px] w-[180px]">{{$t('content.from')}}</th>
          <th class="min-w-[80px] w-[180px]">{{$t('content.to')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.previewList" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.device?.area_name}}</td>
          <td>{{item.device?.last_sync}}</td>
          <td>
            <div>
              <UIBadge
                  :type="item?.events_count>0? Utils.colorTypes.success : Utils.colorTypes.warning"
                  :show-icon="true"
                  :label="item?.events_count">
                <template #icon>
                  <n-icon size="20" :class="[item?.events_count>0? 'text-success' : 'text-warning']">
                    <PersonAvailable20Filled/>
                  </n-icon>
                </template>
              </UIBadge>
            </div>
          </td>
          <td>{{item.start_time}}</td>
          <td>{{item.end_time}}</td>
        </tr>
        </tbody>
      </n-table>
    </div>
    <NoDataPicture v-if="store.previewList.length===0 && !store.showLoading" />
  </n-spin>
</template>
