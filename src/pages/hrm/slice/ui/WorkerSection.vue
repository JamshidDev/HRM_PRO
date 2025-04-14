<script setup>
import {NoDataPicture, UIBadge, UIPageFilter, UIPagination} from "@/components/index.js"
import {useReportStore} from "@/store/modules/index.js"

const store = useReportStore()
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
      <template #filterAction>
        <n-button type="error" secondary>{{$t('content.clear')}}</n-button>
      </template>
    </UIPageFilter>
    <div class="w-full min-w-[600px]"  v-if="store.workerList.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px]">{{$t('reportPage.form.position')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('reportPage.form.rate')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('reportPage.form.realRate')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.workerList" :key="idx">
          <td>

            <span class="text-center text-[12px] text-gray-600 block">{{ (store.workerParams.page - 1) * store.workerParams.per_page + idx + 1 }}</span>

          </td>

          <td>{{item.rank}}
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.rate" />
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.rank" />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          class="w-full"
          :page="store.workerParams.page"
          :per_page="store.workerParams.size"
          :total="store.totalWorker"
          @change-page="store.changePosition"
      />
    </div>
    <NoDataPicture v-if="store.workerList.length===0 && !store.workerLoading" />
  </n-spin>
</template>
