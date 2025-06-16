<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {usePageInstructionStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = usePageInstructionStore()

const onEdit = (v)=>{
  store.elementId = v.data.id
  store.payload.text = v.data.text
  store.payload.title = v.data.title
  store.payload.photos = v.data.photos.map(v=>({photo:v.photo, id:v.id}))
  store.visibleType = false
  store.visible =true
  store.activeSection = 99999
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
  if(!accStore.checkAction(accStore.pn.instructionsWrite)) return
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v)
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
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.name')}}</th>
          <th class="min-w-[120px] w-[200px]">{{$t('instructionPage.form.menu')}}</th>
          <th class="min-w-[120px] w-[200px]">{{$t('instructionPage.form.subMenu')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td> {{item.title}}</td>
          <td>{{item.menu}}</td>
          <td>{{item.sub_menu}}</td>
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
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
