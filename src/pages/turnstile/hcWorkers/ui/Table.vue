<script setup>
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import { useTurnstileHikCentralWorkerStore} from "@/store/modules/index.js"
import {AddSquareMultiple20Regular} from '@vicons/fluent'
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useTurnstileHikCentralWorkerStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onEdit = (v)=>{
  store.editPayload.id = v.id
  store.payload.worker_id = v.worker?.id
  store._worker_photos(()=>{
    store.editVisible = true
  })
}

const onSelect = (v)=>{
  if(!accStore.checkAction(accStore.pn.turnstileWorkersWrite)) return
  if(v.key === 'delete'){
    store.elementId = v.data.worker.id
  }else if(v.key==='edit'){
    store.resetEditPayload()
    store.resetForm()
    onEdit(v.data)
  }
}

const onShow = (v)=>{
  store.instanceData = null
  store.elementId = v
  // store._show()
}

const toggleDetachTerminals = (v)=>{
  // if(store.payload.detachTerminals.includes(v)){
  //   store.payload.detachTerminals = store.payload.detachTerminals.filter(i=>i!==v)
  // }else{
  //   store.payload.detachTerminals.push(v)
  // }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-5 w-full table-fixed"
          :single-line="false"F
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! w-[30px] min-w-[30px] grow-0">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.staff')}}</th>
          <th class="text-center! min-w-[300px] w-[500px]">{{$t('turnstile.hcWorkersPage.access_levels')}}</th>
          <th class="max-w-[65px] w-[65px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :short="false"
              :data="{
                photo: item?.photo?.photo || item.worker?.photo,
                lastName: item.worker.last_name,
                firstName: item.worker.first_name,
                middleName: item.worker.middle_name,
                position: item.post_name
              }"
            />
          </td>
          <td class="text-center!">
            <div class="flex flex-wrap gap-2">
              <template v-for="level in item.access_levels" :key="level.id">
                <n-button size="tiny" dashed type="primary">{{level.name}}
                  <template #icon>
                   <n-icon size="19">
                     <AddSquareMultiple20Regular/>
                   </n-icon>
                  </template>
                </n-button>
              </template>
            </div>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
                @select-ev="onSelect"
            />
<!--                :loading="store.elementId === item.worker.id && store.deleteLoading"-->
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
