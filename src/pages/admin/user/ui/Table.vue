<script setup>
import Utils from "@/utils/Utils.js"
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {useUserStore} from "@/store/modules/index.js"

const store = useUserStore()





const onEdit = (v)=>{

}

const onDelete = (v)=>{

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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('content.photo')}}</th>
          <th class="min-w-[200px]">{{$t('content.fullName')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.phone')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div
                class="flex justify-center items-center"
            >
              <n-avatar
                  size="large"
                  :src="item.photo"
                  :fallback-src="Utils.noAvailableImage"
              />
            </div>

          </td>
          <td>{{item.last_name +' ' +item.first_name +' '+item.middle_name }}</td>
          <td>{{item?.phone}}</td>
          <td>
            <UIActionButton
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
          v-show="store.totalItems>10"
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