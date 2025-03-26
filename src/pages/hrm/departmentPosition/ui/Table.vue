<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIMenuButton} from "@/components/index.js"
import {useComponentStore, useDepartmentPositionStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useDepartmentPositionStore()
const componentStore = useComponentStore()



const onEdit = (v)=>{
  componentStore._enums()
  componentStore._departments()
  componentStore._positions()
  store.visibleType = false
  store.elementId = v.id

  store.payload.position_id = v.position?.id
  store.payload.department_id = v.department?.id
  store.payload.group = v.group?.id
  store.payload.rank = v.rank?.id
  store.payload.max_rank = v?.max_rank?.id
  store.payload.education = v.education?.id
  store.payload.rate =v.rate.toString()
  store.payload.salary = v.salary.toString()
  store.payload.experience = v.experience.toString()

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

const onSelectEv = (v)=>{
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('departmentPositionPage.table.position')}}</th>
          <th class="min-w-[120px] w-[300px]">{{$t('departmentPositionPage.table.department')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('departmentPositionPage.table.group')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('departmentPositionPage.table.rank')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('departmentPositionPage.table.rate')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('departmentPositionPage.table.salary')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('departmentPositionPage.table.education')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('departmentPositionPage.table.experience')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.position?.name}}</td>
          <td>{{item.department?.name}}</td>
          <td><div class="w-full flex justify-center "><n-tag round>{{item.group?.name}}</n-tag></div></td>
          <td>
            <div class="w-full flex justify-center "><n-tag round>{{item.rank?.name}}</n-tag></div>
          </td>
          <td>
            <div class="w-full flex justify-center "><n-tag round>{{item.rate}}</n-tag></div>
          </td>
          <td>{{item.salary}} {{$t('content.sum')}}</td>
          <td>{{item.education?.name}}</td>
          <td>{{item.experience}} {{$t('content.month')}}</td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
                @selectEv="onSelectEv"
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