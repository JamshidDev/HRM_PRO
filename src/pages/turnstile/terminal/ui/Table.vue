<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useTurnstileTerminalStore} from "@/store/modules/index.js"

const store = useTurnstileTerminalStore()

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
    store.payload.name = v.data.name
    store.payload.name_en = v.data.name_en
    store.payload.name_ru = v.data.name_ru
    store.payload.url = v.data.url
    store.payload.ip_address = v.data.ip_address
    store.payload.building_id = v.data.building.id
    store.visibleType = false
    store.visible= true
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-3 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center w-[30px] min-w-[30px] flex-grow-0">{{$t('content.number')}}</th>
          <th class="!text-center min-w-[150px] w-[150px]">{{$t('turnstile.terminalPage.name')}}</th>
          <th class="!text-center min-w-[150px] w-[150px] ">{{$t('turnstile.terminalPage.name_ru')}}</th>
          <th class="!text-center min-w-[150px] w-[150px] ">{{$t('turnstile.terminalPage.name_en')}}</th>
          <th class="!text-center min-w-[100px] w-[100px]">{{$t('turnstile.terminalPage.building')}}</th>
          <th class="!text-center min-w-[200px] w-[200px]">{{$t('content.url')}}</th>
          <th class="!text-center w-[130px] min-w-[120px]">{{$t('content.ip')}}</th>
          <th class="max-w-[60px] w-[60px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td class="!text-center">{{item.name}}</td>
          <td class="!text-center">{{item.name_ru}}</td>
          <td class="!text-center">{{item.name_en}}</td>
          <td class="!text-center">{{item.building.name}}</td>
          <td class="!text-center truncate">
            {{item.url}}
          </td>
          <td class="!text-center  max-w-[130px]">{{item.ip_address}}</td>
          <td>
            <UIMenuButton
                :show-edit="true"
                :data="item"
                @select-ev="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
