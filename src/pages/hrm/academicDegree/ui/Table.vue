<script setup>
import {UIMenuButton} from "@/components/index.js"
import {useAcademicDegreeStore} from "@/store/modules/index.js"
import {AddCircle28Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useAcademicDegreeStore()


const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true

}

const onEdit = (v)=>{
  store.activeTab = 1
  store.visibleType = false
  store.elementId = v.id
  store.payload.type = v.type.id
  store.payload.file =[
    {
      id: v.id,
      name: Utils.fileNameFromUrl(v.file),
      file:null,
    }
  ]
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

const onDownload = (url)=>{
  window.open(url, "_blank");
}
</script>

<template>
  <n-spin :show="store.loading">
    <div
        class="w-full flex justify-between items-end border-surface-line border-dashed pb-2 mt-16"
        :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length>0">{{$t('academicDegreePage.title')}}</span>
      <span v-else class="text-sm text-gray-300">{{$t('academicDegreePage.no-data')}}</span>

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
          <th class="min-w-[100px]">{{$t('academicDegreePage.form.type')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('academicDegreePage.form.file')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span class="text-sm">{{item.type?.name}}</span></td>
          <td>
            <div v-if="item?.file" class="flex justify-center w-full">
              <n-button @click="onDownload(item.file)">{{Utils.fileNameFromUrl(item?.file)}}</n-button>
            </div>
          </td>

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