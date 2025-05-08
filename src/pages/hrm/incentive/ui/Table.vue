<script setup>
import {NoDataPicture,UIPagination, UIUser, UIBadge} from "@/components/index.js"
import {useComponentStore, useIncentiveStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useIncentiveStore()
const compStore = useComponentStore()




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
          <th class="min-w-[200px] w-[300px]">{{$t('confirmationPage.table.worker')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('incentive.form.type')}}</th>
          <th class="min-w-[100px] ">{{$t('incentive.form.who')}}</th>
          <th class="min-w-[100px] ">{{$t('incentive.form.reason')}}</th>
          <th class="min-w-[80px] w-[120px]">{{$t('content.date')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :short="false"
                  :data="{
                    photo:item?.worker_position?.worker.photo,
                    firstName:item?.worker_position?.worker.first_name,
                    middleName:item?.worker_position?.worker.middle_name,
                    lastName:item?.worker_position?.worker.last_name,
                    position:item?.worker_position?.post_short_name,
                  }"
              />
            </div>
          </td>
          <td>
            <UIBadge
                :show-icon="false"
                :label="item.gift"
                :type="Utils.colorTypes.success"
            />
          </td>
          <td>
            {{item.by_whom}}
          </td>
          <td>
            {{item.reason}}
          </td>
          <td>
            <UIBadge :type="Utils.colorTypes.dark" :show-icon="false" :label="Utils.timeOnlyDate(item.date)" />
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