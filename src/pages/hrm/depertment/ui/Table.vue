x<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useDepartmentStore} from "@/store/modules/index.js"
import {FlowchartCircle24Regular, Circle48Regular, ChevronRight12Regular} from "@vicons/fluent"
import MenuButton from "@/components/buttons/MenuButton.vue"
import Utils from "@/utils/Utils.js"

const store = useDepartmentStore()

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
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }else if (v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }else if(v.key === Utils.ActionTypes.attachment){
    onAdd(v.data)
  }
}
</script>



<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="data.length>0">
      <n-table
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[30px] w-[30px]"></th>
          <th class="min-w-[200px]">{{$t('departmentPage.form.name')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('departmentPage.form.level')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in data" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <n-button
                v-if="item.descendants>0"
                :loading="loading === item.id"
                quaternary
                circle
                type="primary"
                @click="onDeep(item.id)"
            >
              <template #icon>
                <n-icon size="20">
                  <ChevronRight12Regular/>
                </n-icon>
              </template>
            </n-button>
          </td>
          <td>{{item.name}}</td>
          <td>{{item.level.name}}</td>
          <td>
            <MenuButton
                :data="item"
                :show-edit="true"
                :show-attachment="true"
                @selectEv="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="deep===1"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="data.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>