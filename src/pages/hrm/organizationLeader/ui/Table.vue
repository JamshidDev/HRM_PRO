<script setup>
import {CodeCircle20Regular, DismissCircle24Regular} from "@vicons/fluent"
import {NoDataPicture, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import {useOrganizationLeaderStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import { Mask } from "maska"

const mask = new Mask({ mask: ['##-###-##-##', '##-###']})
const store = useOrganizationLeaderStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}


const onSelect = (v)=>{
  if(v.key === 'delete'){
    store.elementId = v.data.id
    store._delete()
  }else if(v.key==='edit'){
    store.elementId = v.data.id
    store.visibleType = false
    store.visible= true
    store.payload.phones = [...v.data.phone]
  }
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
          <th class="w-[200px]">{{$t('content.worker')}}</th>
          <th class="min-w-[200px]">{{$t('content.organization')}}</th>
          <th class="min-w-[200px]">{{$t('content.phone')}}</th>
          <th class="w-[40px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :data="{
                  photo:item?.worker_position.worker?.photo,
                  lastName:item?.worker_position.worker?.last_name,
                  firstName:item?.worker_position.worker?.first_name,
                  middleName:item?.worker_position.worker?.middle_name,
                }"
            />
          </td>
          <td>{{item.organization.name}}</td>
          <td>
            <div class="flex gap-2 flex-wrap">
              <n-button v-for="(i, idx) in item.phone" :key="idx" type="primary" dashed size="tiny">
                {{mask.masked(i)}}
              </n-button>
            </div>
          </td>
          <td>
            <UIMenuButton
                :loading="store.elementId === item.id && store.deleteLoading"
                :data="item"
                show-edit
                @selectEv="onSelect"
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

<style scoped>

</style>