<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useUserDepartmentStore} from "@/store/modules/index.js"

const store = useUserDepartmentStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'view'){
    store.elementId = v.data.id
    store._show()
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
          <th class="!text-center w-[30px] max-w-[30px]">{{$t('content.number')}}</th>
          <th class="!text-center min-w-[500px]">{{$t('content.name')}}</th>
          <th class="!text-center">{{$t('userDepartmentPage.level_name')}}</th>
          <th class="!text-center max-w-[100px] w-[100px]">{{$t('userDepartmentPage.user_count')}}</th>
          <th class="max-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.name}}</td>
          <td class="!text-center">{{item.level.name}}</td>
          <td class="!text-center">{{item.workers_count}}</td>
          <td>
            <UIMenuButton
                :loading="store.visibleLoading && store.elementId===item.id"
                :show-view="true"
                :data="item"
                :show-delete="false"
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
