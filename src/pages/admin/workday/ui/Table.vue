<script setup>
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {useWorkdayStore} from "@/store/modules/index.js"

const store = useWorkdayStore()


const format = (v)=>{
  if(v){
    const date = new Date()
    date.setHours(v.split(':')[0])
    date.setMinutes(v.split(':')[1])
    date.setSeconds(v.split(':')[2])
    return  date.getTime()
  }else return null

}

const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.schedule_id = v.schedule.id
  store.payload.type = v.type.id
  store.payload.day_of_week = v.day_of_week.toString()
  store.payload.start_time =format(v.start_time)
  store.payload.end_time =format(v.end_time)
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
          <th class="min-w-[200px]">{{$t('workdayPage.form.schedule_id')}}</th>
          <th class="min-w-[200px]">{{$t('workdayPage.form.type')}}</th>
          <th class="min-w-[200px]">{{$t('workdayPage.form.day_of_week')}}</th>
          <th class="min-w-[200px]">{{$t('workdayPage.form.start_time')}}</th>
          <th class="min-w-[200px]">{{$t('workdayPage.form.end_time')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.schedule?.name}}</td>
          <td>{{item.type?.name}}</td>
          <td>{{item?.day_of_week}}</td>
          <td>{{item.start_time}}</td>
          <td>{{item.end_time}}</td>
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