<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useAccountStore, useTurnstileHikCentralStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useTurnstileHikCentralStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index_access_levels()
}

// const onSelect = (v)=>{
//   if(!accStore.checkAction(accStore.pn.turnstileBuildingWrite)) return
//
//   if(v.key === 'delete'){
//     store.elementId = v.data.id
//     store._delete()
//   }else if(v.key==='edit'){
//     store.elementId = v.data.id
//     store.payload.name = v.data.name
//     store.payload.name_en = v.data.name_en
//     store.payload.name_ru = v.data.name_ru
//     store.visibleType = false
//     store.visible= true
//   }
// }

</script>

<template>
  <n-spin :show="store.accessLevelsLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.accessLevels.length>0">
      <n-table
          class="mt-3 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! w-[30px] min-w-[30px] grow-0">{{$t('content.number')}}</th>
          <th class="text-center!">{{$t('content.name')}}</th>
          <th class="text-center!">{{$t('content.description')}}</th>
          <th class="text-center!">{{$t('turnstile.accessLevelPage.deviceCount')}}</th>
          <th class="text-center!">{{$t('turnstile.accessLevelPage.server')}}</th>
<!--          <th class="max-w-[60px] w-[60px]">{{$t('content.action')}}</th>-->
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.accessLevels" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td class="text-center!">{{item.name}}</td>
          <td class="text-center!">{{item.description}}</td>
          <td class="text-center!">{{item.devices_count}}</td>
          <td class="text-center!">{{item.hik_server}}</td>
<!--          <td>-->
<!--            <UIMenuButton-->
<!--                :show-edit="true"-->
<!--                :data="item"-->
<!--                @select-ev="onSelect"-->
<!--            />-->
<!--          </td>-->
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
    <NoDataPicture v-if="store.accessLevels.length===0 && !store.accessLevelsLoading" />
  </n-spin>
</template>
