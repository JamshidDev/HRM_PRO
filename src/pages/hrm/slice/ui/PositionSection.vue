<script setup>
import {NoDataPicture, UIBadge, UIPageFilter, UIPagination} from "@/components/index.js"
import {useReportStore} from "@/store/modules/index.js"

const store = useReportStore()

const onPagination = (v)=>{
  store.positionParams.page = v.page
  store.positionParams.per_page = v.per_page
  store.getPosition()

}
</script>

<template>
  <n-spin class="min-w-[600px]" :show="store.positionLoading" style="min-height:200px">
    <UIPageFilter
        class="mt-4"
        :show-add-button="false"
        :show-filter-button="false"
        :search-loading="store.positionLoading"
        v-model:search="store.positionParams.search"
        @onSearch="store.getPosition()"
    >
    </UIPageFilter>
    <div class="w-full"  v-if="store.positionList.length>0">
      <n-table
          class="mt-4"
          size="small"
          :single-column="true"
          :striped="true"
      >
        <thead>
        <tr>
          <th>{{$t('content.number')}}</th>
          <th></th>
          <th>{{$t('reportPage.form.position')}}</th>
          <th>{{$t('reportPage.form.rate')}}</th>
          <th>{{$t('reportPage.form.realRate')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.positionList" :key="idx">
          <td>

            <span class=" text-[12px] text-gray-600 block">{{ (store.positionParams.page - 1) * store.positionParams.per_page + idx + 1 }}</span>

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
            <n-button circle size="tiny">{{item.rate}}</n-button>
          </td>
          <td>
            <n-button circle size="tiny">{{item.real_rate}}</n-button>
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          class="w-full"
          :page="store.positionParams.page"
          :per_page="store.positionParams.size"
          :total="store.totalPosition"
          @change-page="onPagination"
          :short="true"
      />
    </div>
    <NoDataPicture v-if="store.positionList.length===0 && !store.positionLoading" />
  </n-spin>
</template>
