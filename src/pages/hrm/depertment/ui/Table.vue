<script setup>
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {useDepartmentStore} from "@/store/modules/index.js"
import {FlowchartCircle24Regular, Circle48Regular} from "@vicons/fluent"

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

const emits = defineEmits(['onDeep', 'onEdit', 'onDelete', 'onChangePage'])


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

const changePage = (v)=>{
  emits('onChangePage', v)
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[30px] w-[30px]"></th>
          <th class="min-w-[200px]">{{$t('departmentPage.form.name')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('departmentPage.form.level')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
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
                <n-icon size="24">
                  <FlowchartCircle24Regular/>
                </n-icon>
              </template>
            </n-button>
            <n-button quaternary circle type="primary" v-else>
              <n-icon size="20">
                <Circle48Regular/>
              </n-icon>
            </n-button>
          </td>
          <td>{{item.name}}</td>
          <td>{{item.level.name}}</td>
          <td>
            <UIActionButton
                :data="item"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-edit="onEdit"
                @on-delete="onDelete"
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