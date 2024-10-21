<script setup>
import {ActionButton, NoDataPicture, UIPagination} from "@/components/index.js";
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import Utils from "@/utils/Utils.js";
import {v4 as uuidv4} from "uuid";

const onEdit = (v)=>{
  store.visibleType = false
  store.categoryId = v.id
  store.payload.name = v.name
  store.payload.description = v.description
  store.payload.parent_id = v.description
  store.payload.image = [{
    id:uuidv4(),
    file:null,
    base64:null,
    url:v.image,
  }]
  store.openVisible(true)
}

const onDelete = (v)=>{
  store.categoryId = v.id
  store.deleteItem()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.size = v.per_page
  store._index()
}

const store = useCategoriesStore()
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('content.photo')}}</th>
          <th class="min-w-[200px]">{{$t('content.name')}}</th>
          <th class="min-w-[120px] w-[500px]">{{$t('content.description')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.size + idx + 1 }}</span></td>
          <td>
            <div
                class="flex justify-center items-center"
            >
              <n-avatar
                  size="large"
                  :src="item.image"
                  :fallback-src="Utils.noAvailableImage"
              />
            </div>

          </td>
          <td>{{item.name}}</td>
          <td>{{item.description}}</td>
          <td>
            <ActionButton
                :data="item"
                :loading-delete="item.id === store.categoryId && store.deleteLoading"
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