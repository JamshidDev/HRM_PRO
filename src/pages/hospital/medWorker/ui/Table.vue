<script setup>
import {NoDataPicture,UIPagination, UIUser, UIStatus} from "@/components/index.js"
import {useMedWorkerStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useMedWorkerStore()
const emits = defineEmits(['openEv'])




const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
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
          <th v-if="store.enableCheck" class="text-center! min-w-[30px] w-[30px]"></th>
          <th class="min-w-[200px] w-[300px]">{{$t('content.worker')}}</th>
          <th class="min-w-[100px] ">{{$t('content.organization')}}</th>
          <th class="min-w-[100px]">{{$t('medWorker.form.department')}}</th>
          <th class="min-w-[100px]">{{$t('medWorker.form.position')}}</th>
          <th class="min-w-[100px]">{{$t('medWorker.form.position_date')}}</th>
          <th class="min-w-[100px]">{{$t('medWorker.form.education')}}</th>

        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :short="false"
                :data="{
                    photo:item?.photo,
                    lastName:item?.last_name,
                    firstName:item?.first_name,
                    middleName:item?.middle_name,
                    position:item?.contract_type,
                }"
            />
          </td>
          <td>
            <div>
              {{item.organization?.name}}
            </div>
          </td>
          <td>
            {{item.department}}
          </td>
          <td>
            {{item.position}}
          </td>
          <td>
            {{Utils.timeOnlyDate(item?.position_date)}}
          </td>
          <td>
            {{item.education}}
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