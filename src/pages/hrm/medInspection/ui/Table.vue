<script setup>
import {NoDataPicture,UIPagination, UIMenuButton, UIUser, UIStatus} from "@/components/index.js"
import {useMedInspectionStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useMedInspectionStore()
const emits = defineEmits(['openEv'])

const openDocument = (v)=>{
  emits('openEv', v)
}




const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.delete){
    store.elementId = v.data.id
    store._delete()
  }else if(v.key === Utils.ActionTypes.view){
    openDocument(v.data.id)
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
          <th class="min-w-[200px]">{{$t('medInspection.form.hospital')}}</th>
          <th class="w-[60px]">{{$t('medInspection.form.status')}}</th>
          <th class="w-[60px]">{{$t('medInspection.form.start_date')}}</th>
          <th class="w-[80px]">{{$t('content.status')}}</th>
          <th class="w-[120px]">{{$t('content.document')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :short="false"
                :data="{
                    photo:item?.worker.photo,
                    lastName:item?.worker.last_name,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    position:item?.position,
                }"
            />
          </td>
          <td>
            <span @click="openDocument(item.id)" class="hover:underline hover:text-primary cursor-pointer">{{item?.polyclinic?.name}}</span>
          </td>
            <td>
              <UIStatus v-if="item?.status?.id" :status="item?.status"/>
              <UIStatus v-else :status="Utils.documentStatus[2]"/>
            </td>
          <td>
            {{Utils.timeOnlyDate(item?.start_date)}}
          </td>
          <td>
            <UIStatus :status="item.confirmation"/>
          </td>
          <td><UIStatus :status="Utils.documentStatus[item?.generate]"/></td>
          <td>
            <UIMenuButton
                :data="item"
                :show-view="true"
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