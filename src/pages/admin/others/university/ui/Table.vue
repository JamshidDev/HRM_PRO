<script setup>
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {useUniversityAdminStore, useComponentStore} from "@/store/modules/index.js"
const store = useUniversityAdminStore()
const compStore = useComponentStore()




const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.type = v.type?.id
  store.payload.name_ru = v.name_ru
  store.payload.region_id = v.city.region.id
  store.payload.city_id = v.city.id
  store.payload.education = v.education.id
  store.visible = true


  if(compStore.regionList.length === 0){
    compStore._regions()
  }
  if(store.districtList.length === 0){
    store._getDistrict()
  }

  if(compStore.universityTypes.length === 0){
    compStore._enumsAdmin()
  }
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
          <th class="min-w-[200px]">{{$t('othersPage.university.form.name')}}</th>
          <th class="w-[200px]">{{$t('othersPage.university.form.name_ru')}}</th>
          <th class="w-[200px]">{{$t('othersPage.university.form.region_id')}}</th>
          <th class="min-[200px]">{{$t('othersPage.university.form.education')}}</th>
          <th class="min-[200px]">{{$t('othersPage.university.form.type')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.name}}</td>
          <td>{{item.name_ru}}</td>
          <td>{{item?.city.region?.name}}</td>
          <td>{{item?.education.name}}</td>
          <td>{{item?.type.name}}</td>
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