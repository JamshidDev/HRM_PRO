<script setup>
import {UIActionButton, UIMenuButton} from "@/components/index.js"
import {ArrowCircleDown24Regular} from "@vicons/fluent"
import {useLanguageStore} from "@/store/modules/index.js"
import {AddCircle28Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useLanguageStore()


const onAdd = ()=>{
  store.visibleType = true
  store.resetForm()
  store.visible = true

}

const onEdit = (v)=>{
  store.activeTab = 1
  store.visibleType = false
  store.elementId = v.id
  store.payload.language_id = v.language.id
  store.payload.file = {
    name:v.file
  }
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const onSelect = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }else if(v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }
}

const onDownload = (v)=>{
  window.open(v.file, '_blank');
}
</script>

<template>
  <n-spin :show="store.loading">
    <div
        class="w-full flex justify-between items-end border-surface-line border-dashed pb-2"
        :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length>0">{{$t('languagePage.title')}}</span>
      <span v-else class="text-sm text-gray-300">{{$t('languagePage.no-language')}}</span>

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
          <th class="min-w-[100px]">{{$t('content.name')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('content.file')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span class="text-sm">{{item.language.name}}</span></td>
          <td>
            <n-button v-if="item.file" @click="onDownload(item)">
              <template #icon>
                <ArrowCircleDown24Regular/>
              </template>
              {{$t('content.download')}}
            </n-button>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
                @selectEv="onSelect"
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