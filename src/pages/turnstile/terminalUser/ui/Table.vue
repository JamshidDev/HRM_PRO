<script setup>
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import { useTurnstileTerminalUserStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useTurnstileTerminalUserStore()

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
    // store.elementId = v.data.id
    // store.payload.name = v.data.name
    // store.payload.name_en = v.data.name_en
    // store.payload.name_ru = v.data.name_ru
    // store.visibleType = false
    // store.visible= true
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-5 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! w-[30px] min-w-[30px] grow-0">{{$t('content.number')}}</th>
          <th class="text-center! min-w-[200px]">{{$t('content.staff')}}</th>
          <th class="text-center!">{{$t('content.organization')}}</th>
          <th class="text-center! max-w-[150px] w-[150px]">{{$t('content.deadline')}}</th>
          <th class="text-center!">{{$t('turnstile.terminals')}}</th>
          <th class="max-w-[60px] w-[60px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td class="text-center!">
            <UIUser
                :short="false"
              :data="{
                photo: item.worker_position.worker.photo,
                lastName: item.worker_position.worker.last_name,
                firstName: item.worker_position.worker.first_name,
                middleName: item.worker_position.worker.middle_name,
                position: item.worker_position.post_name
              }"
            />
          </td>
          <td class="text-center!">{{item.worker_position.organization.name}}</td>
          <td class="text-center!">
            <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.to)" />
          </td>
          <td class="text-center!">
            <div class="flex gap-3 flex-wrap">
              <n-button v-for="terminal in item.terminals" type="primary" size="tiny" dashed :key="terminal.id">{{terminal.name}}</n-button>
            </div>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                @select-ev="onSelect"
                :loading="store.elementId === item.id && store.deleteLoading"
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
