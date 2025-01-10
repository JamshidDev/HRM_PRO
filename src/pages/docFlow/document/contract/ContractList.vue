<script setup>
import {Screenshot20Regular} from "@vicons/fluent"
import {NoDataPicture, UIOfficeApp, UIPagination, UIUser} from "@/components/index.js"
import {useContractStore, useSignatureStore, useOnlyOfficeStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useContractStore()
const signature = useSignatureStore()
const onlyOfficeStore = useOnlyOfficeStore()

const props = defineProps({
  data:{
    type:Array,
    default:[],
  },
  deep:{
    type:Number,
    default:null,
  },
  loading:{
    type:Number,
    default:null,
  },
  parentId:{
    type:Number,
    default:null,
  },

})

const emits = defineEmits([ 'openOffice',])



const onAdd = (v)=>{
  store.activeDeep =props.deep
  store.activeParentId =props.parentId
  emits('onAdd', v)
}

const changePage = (v)=>{
  emits('onChangePage', v)
}

const onSignature = (v)=>{
  // signature._signatureDocument(
  //     signature.signatureTypes.contract,
  //     v.id,
  //     onSuccess
  // )
}

const onSuccess = (data)=>{
  console.log(data)
}

const onOpenFile = (v)=>{
  emits('openOffice', v.id)
}
</script>



<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[120px]">{{$t('contractPage.table.worker')}}</th>
          <th class="w-[300px]">{{$t('contractPage.table.organization')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('contractPage.table.type')}}</th>
          <th class="w-[80px]">{{$t('contractPage.table.number')}}</th>
          <th class="w-[140px]">{{$t('contractPage.table.date')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :data="{
                  photo:item.worker.photo,
                  position:item.worker.birthday,
                  lastName:item.worker.last_name,
                  firstName:item.worker.first_name,
                  middleName:item.worker.middle_name,
                }"
            />
          </td>
          <td><span class="text-sm text-gray-500">{{item?.organization.name}}</span></td>
          <td>{{item?.type}}</td>
          <td>{{item?.number}}</td>
          <td>
            <span class="text-sm text-gray-500">{{Utils.timeWithMonth(item?.contract_date)}}</span>
          </td>
          <td>
            <div class="flex gap-2">
              <n-button
                  secondary
                  type="success"
                  @click="onSignature(item)"
                  :loading="signature.loading"
              >{{$t('contractPage.statuses.confirm')}}
              </n-button>
              <n-button @click="onOpenFile(item)"  type="info" secondary circle class="cursor-pointer">
                <template #icon>
                  <n-icon size="24">
                    <Screenshot20Regular />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>10"
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