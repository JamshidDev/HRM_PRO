<script setup>
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {usePositionStore} from "@/store/modules/index.js"

const store = usePositionStore()




const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.name_ru = v.name_ru
  store.payload.classification_index = v.classification_index?.toString()
  store.payload.classification_code = v.classification_code?.toString()
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('positionPage.form.name')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('positionPage.form.name_ru')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('positionPage.form.classification_index')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('positionPage.form.classification_code')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.name}}</td>
          <td>{{item.name_ru}}</td>
          <td>{{item.classification_index}}</td>
          <td>{{item.classification_code}}</td>
          <td>
            <UIActionButton
                :data="item"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-edit="onEdit"
                @on-delete="onDelete"
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