<script setup>
import {UIMenuButton} from "@/components/index.js"
import {useMilitaryStore} from "@/store/modules/index.js"
import {AddCircle28Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useMilitaryStore()


const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true

}

const onEdit = (v)=>{
  store.activeTab = 1
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.status = v.status.id
  store.payload.number = v.number
  store.payload.speciality = v.speciality
  store.payload.commissariat = v.commissariat
  store.visible = true
}

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }else if(v.key === Utils.ActionTypes.delete){
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
        class="w-full flex justify-between items-end border-surface-line border-dashed pb-2 mt-16"
        :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length>0">{{$t('militaryPage.title')}}</span>
      <span v-else class="text-sm text-gray-300">{{$t('militaryPage.no-data')}}</span>

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
          <th class="min-w-[100px]">{{$t('militaryPage.form.name')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('militaryPage.form.status')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('militaryPage.form.number')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('militaryPage.form.speciality')}}</th>
          <th class="min-w-[100px] w-[300px]">{{$t('militaryPage.form.commissariat')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span class="text-sm">{{item.name}}</span></td>
          <td>{{item.status.name}}</td>
          <td>{{item.number}}</td>
          <td>{{item.speciality}}</td>
          <td>{{item.commissariat}}</td>

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
    </div>


  </n-spin>
</template>

<style scoped>

</style>