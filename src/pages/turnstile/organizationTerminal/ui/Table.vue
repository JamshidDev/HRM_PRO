<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import { useTurnstileOrganizationStore} from "@/store/modules/index.js"

const store = useTurnstileOrganizationStore()

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
    store.visibleType = false
    store.visible= true
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center w-[30px] min-w-[30px] flex-grow-0">{{$t('content.number')}}</th>
          <th class="!text-center">{{$t('content.workplace')}}</th>
          <th class="!text-center">{{$t('turnstile.organization.terminal')}}</th>
          <th class="!text-center">{{$t('turnstile.terminalPage.building')}}</th>
          <th class="max-w-[60px] w-[60px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td class="!text-center">{{item.organization.name}}</td>
          <td class="!text-center">{{item.terminal.name}}</td>
          <td class="!text-center">{{item.terminal.building.name}}</td>
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
