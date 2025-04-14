<script setup>
import {NoDataPicture, UIBadge, UIPageFilter, UIPagination} from "@/components/index.js"
import {useReportStore} from "@/store/modules/index.js"

const store = useReportStore()
</script>

<template>
  <n-spin :show="store.positionLoading" style="min-height: 200px">
    <UIPageFilter
        class="mt-4"
        :show-add-button="false"
        :show-filter-button="false"
        :search-loading="store.positionLoading"
        v-model:search="store.positionParams.search"
        @onSearch="store.getPosition()"
    >
      <template #filterAction>
        <n-button type="error" secondary>{{$t('content.clear')}}</n-button>
      </template>
    </UIPageFilter>
    <div class="w-full min-w-[600px]"  v-if="store.positionList.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="!text-center min-w-[32px] w-[32px]"></th>
          <th class="min-w-[50px]">{{$t('reportPage.form.position')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('reportPage.form.rate')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('reportPage.form.realRate')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.positionList" :key="idx">
          <td>

            <span class="text-center text-[12px] text-gray-600 block">{{ (store.positionParams.page - 1) * store.positionParams.per_page + idx + 1 }}</span>

          </td>
          <td>
            <n-checkbox
                @click="store.changePosition(item.id)"
                :checked="store.position === item.id"
            ></n-checkbox>
          </td>

          <td>{{item.position.name}}
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.rate" />
          </td>
          <td>
            <UIBadge :show-icon="false" :label="item.real_rate" />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          class="w-full"
          :page="store.positionParams.page"
          :per_page="store.positionParams.size"
          :total="store.totalPosition"
          @change-page="store.changePosition"
      />
    </div>
    <NoDataPicture v-if="store.positionList.length===0 && !store.positionLoading" />
  </n-spin>
</template>
