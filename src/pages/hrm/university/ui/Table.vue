<script setup>
import {UIActionButton} from "@/components/index.js"
import {ArrowCircleDown24Regular} from "@vicons/fluent"
import {useUniversityStore} from "@/store/modules/index.js"
import {AddCircle28Regular} from "@vicons/fluent"
import Utils from "../../../../utils/Utils.js"

const store = useUniversityStore()


const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true

}

const onEdit = (v)=>{
  store.activeTab = 1
  store.visibleType = false
  store.elementId = v.id
  store.payload.university_id = v.university.id
  store.payload.speciality_id = v.speciality.id
  store.payload.from_date = new Date(v.from_date).getTime()
  store.payload.to_date = new Date(v.from_date).getTime()
  store.payload.file = {
    name:v.file
  }
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}
const onDownload = (v)=>{
  window.open(v.file, '_blank');
}

</script>

<template>
  <n-spin :show="store.loading">
    <div
        class="w-full flex justify-between items-end border-surface-line border-dashed pb-2 mt-16"
        :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length>0">{{$t('universityPage.title')}}</span>
      <span v-else class="text-sm text-gray-300">{{$t('universityPage.no-language')}}</span>

      <n-button
          round
          @click="onAdd"
      >
        <template #icon>
          <AddCircle28Regular/>
        </template>
        {{$t(`content.add`)}}</n-button>

    </div>
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('universityPage.form.university_id')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('universityPage.form.speciality_id')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('universityPage.form.from_date')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('universityPage.form.to_date')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.file')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span class="text-sm">{{item.university.name}}</span></td>
          <td><span class="text-sm">{{item.speciality.name}}</span></td>
          <td><span class="text-sm">{{Utils.timeOnlyDate(item.from_date)}}</span></td>
          <td><span class="text-sm">{{Utils.timeOnlyDate(item.to_date)}}</span></td>
          <td>
            <n-button v-if="item.file" @click="onDownload(item)">
              <template #icon>
                <ArrowCircleDown24Regular/>
              </template>
              {{$t('content.download')}}
            </n-button>
          </td>
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
    </div>

  </n-spin>
</template>

<style scoped>

</style>