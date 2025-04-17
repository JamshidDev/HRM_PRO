<script setup>
import {NoDataPicture, UIPageFilter, UIPagination, UIUser} from "@/components/index.js"
import {useReportStore} from "@/store/modules/index.js"

const store = useReportStore()

const onPagination = (v)=>{
  store.workerParams.page = v.page
  store.workerParams.per_page = v.per_page
  store.getWorker()

}
</script>

<template>
  <n-spin :show="store.workerLoading" style="min-height: 200px">
    <UIPageFilter
        class="mt-4"
        :show-add-button="false"
        :show-filter-button="false"
        :search-loading="store.workerLoading"
        v-model:search="store.workerParams.search"
        @onSearch="store.getWorker()"
    >
    </UIPageFilter>
    <div class="w-full"  v-if="store.workerList.length>0">
      <n-table
          class="mt-4"
          size="small"
          :single-column="true"
          :striped="true"
      >
        <thead>
        <tr>
          <th>{{$t('content.number')}}</th>
          <th>{{$t('content.worker')}}</th>
          <th>{{$t('reportPage.form.rate')}}</th>
          <th>{{$t('reportPage.form.realRate')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.workerList" :key="idx">
          <td>

            <span class=" text-[12px] text-gray-600 block">{{ (store.workerParams.page - 1) * store.workerParams.per_page + idx + 1 }}</span>

          </td>
          <td>
            <UIUser
                :short="false"
                @onClickFullName="onPreview(item.uuid)"
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:'',
                  }"
            />
          </td>
          <td>
            <n-button circle size="tiny">{{item.rate}}</n-button>
          </td>
          <td>
            <n-button circle size="tiny">{{item.rank}}</n-button>
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          class="w-full"
          :page="store.workerParams.page"
          :per_page="store.workerParams.size"
          :total="store.totalWorker"
          @change-page="onPagination"
          :short="true"
      />
    </div>
    <NoDataPicture v-if="store.workerList.length===0 && !store.workerLoading" />
  </n-spin>
</template>
