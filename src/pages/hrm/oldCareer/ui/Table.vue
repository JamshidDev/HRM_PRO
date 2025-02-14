<script setup>
import {UIActionButton, UIMenuButton} from "@/components/index.js"
import {useOldCareerStore} from "@/store/modules/index.js"
import {AddCircle28Regular} from "@vicons/fluent"

const store = useOldCareerStore()


const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true

}

const onEdit = (v)=>{
  store.activeTab = 1
  store.visibleType = false
  store.elementId = v.id
  store.payload.from_date = new Date(v.from_date).getTime()
  store.payload.to_date = new Date(v.to_date).getTime()
  store.payload.post_name = v.post_name
  store.visible = true
}

const selectEv = (v)=>{
  if(v.key === 'edit'){
    onEdit(v.data)
  }else if(v.key === 'delete'){
    onDelete(v.data)
  }
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}
</script>

<template>
  <n-spin :show="store.loading">
    <div
        class="w-full flex justify-between items-end border-surface-line border-dashed pb-2"
        :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length>0">{{$t('oldCareerPage.title')}}</span>
      <span v-else class="text-sm text-gray-300">{{$t('oldCareerPage.no-data')}}</span>

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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('oldCareerPage.form.post_name')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('oldCareerPage.form.from_date')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('oldCareerPage.form.to_date')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.post_name}}</td>
          <td><span class="text-sm">{{item.from_date}}</span></td>
          <td>{{item.to_date}}</td>
          <td>
           <UIMenuButton
               :data="item"
               :show-edit="true"
               @selectEv="selectEv"
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