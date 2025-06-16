<script setup>
import {NoDataPicture,UIPagination, UIMenuButton, UIStatus} from "@/components/index.js"
import {useDocumentArchiveStore} from "@/store/modules/index.js"
import {ArrowCircleDown48Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import { v4 as uuidv4 } from 'uuid';
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useDocumentArchiveStore()




const onEdit = (v)=>{
  store.elementId = v.id
  store.payload.title = v.title
  store.payload.description = v.description
  store.payload.document_date = new Date(v.document_date).getTime()
  store.payload.type = v.type.id
  store.payload.visibility_type = v.visibility_type
  store.payload.file = [
    {
      id:uuidv4(),
      name:Utils.fileNameFromUrl(v.file),
      file:v.file
    }
  ]
  store.visibleType = false
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
  if(!accStore.checkAction(accStore.pn.hrDocumentsWrite)) return
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
  }
}

const openFile = (url)=>{
  window.open(url, "_blank");
}

const statusData = (id)=>{
  return store.visibleTypes.filter(v=>v.id === id)?.[0]
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
          <th class="min-w-[200px]">{{$t('documentArchive.form.title')}}</th>
          <th class="min-w-[200px]">{{$t('documentArchive.form.type')}}</th>
          <th class="min-w-[80px] w-[200px]">{{$t('documentArchive.form.visibility_type')}}</th>
          <th class="min-w-[100px]">{{$t('documentArchive.form.description')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('documentArchive.form.file')}}</th>
          <th class="min-w-[80px] w-[80px]">{{$t('documentArchive.form.document_date')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              {{item.title}}
            </div>
          </td>
          <td>
            <div>
              <UIStatus :status="item.type"/>
            </div>
          </td>
          <td>
            <UIStatus :status="statusData(item.visibility_type)"/>
          </td>
          <td>
            {{item.description}}
          </td>
          <td>
            <div class="flex justify-center">
              <n-button
                  @click="openFile(item.file)"
                  size="small">
                <template #icon>
                  <ArrowCircleDown48Regular/>
                </template>
              </n-button>
            </div>
          </td>

          <td>
            {{Utils.timeOnlyDate(item.document_date)}}
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