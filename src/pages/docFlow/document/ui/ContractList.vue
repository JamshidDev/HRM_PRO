<script setup>
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {useContractStore, useSignatureStore} from "@/store/modules/index.js"

const store = useContractStore()
const signature = useSignatureStore()

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

const emits = defineEmits(['onDeep', 'onEdit', 'onDelete', 'onChangePage', 'onAdd'])


const onDeep =(id)=>{
  emits('onDeep', {deep:props.deep,id})
}

const onEdit = (v)=>{
  store.activeDeep =props.deep
  store.activeParentId =props.parentId


  emits('onEdit', v)
}

const onDelete = (v)=>{
  store.activeDeep =props.deep
  store.activeParentId =props.parentId
  emits('onDelete', v)
}

const onAdd = (v)=>{
  store.activeDeep =props.deep
  store.activeParentId =props.parentId
  emits('onAdd', v)
}

const changePage = (v)=>{
  emits('onChangePage', v)
}

const onSignature = (v)=>{
  signature._signatureDocument(
      signature.signatureTypes.contract,
      v.id,
      onSuccess
  )
}

const onSuccess = (data)=>{

  console.log(data)
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
          <th class="min-w-[200px]">{{$t('contractPage.table.number')}}</th>
          <th class="min-w-[100px] w-[160px]">{{$t('contractPage.table.status')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.contract?.number}}</td>
          <td>
            <div class="flex justify-center">
              <n-button
                  ghost
                  type="success"
                  @click="onSignature(item)"
                  :loading="signature.loading"
              >{{$t('contractPage.statuses.confirm')}}
              </n-button>
            </div>
          </td>
          <td>
            <UIActionButton
                visible-add-btn
                :data="item"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-edit="onEdit"
                @on-delete="onDelete"
                @on-add="onAdd"
            />
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