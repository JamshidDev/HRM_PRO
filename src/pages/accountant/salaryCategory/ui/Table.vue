<script setup>
import {UIMenuButton} from "@/components/index.js"
import {useSalaryCategoryStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"


const store = useSalaryCategoryStore()


const onSelect = (v)=>{
    store.elementId = v.data.data.id
    if(v.key === Utils.ActionTypes.edit){
      for(const key in store.payload){
        store.payload[key] =v.data.data[key]
      }
      store.visibleType = false
      store.visible  = true

    }else if(v.key === Utils.ActionTypes.delete){
      store._delete()
    }
}

onMounted(()=>{
  store.params.year = new Date().getFullYear()
  store.params.month = new Date().getMonth()
  store._index()
})

</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full pb-4 mt-4 overflow-y-auto">
      <n-table
          v-if="store.list.length>0"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th rowspan="3" class="!text-center">{{$t('content.month')}}</th>
          <th colspan="2" rowspan="2" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.all')}}</th>
          <th rowspan="2" colspan="2" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.external')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.capital')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.construction')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.other')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.fromIt')}}</th>
          <th rowspan="3" class="min-w-[40px] w-[100px]"></th>
        </tr>
        <tr>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forOrganization')}}</th>
          <th colspan="2"  class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forOwn')}}</th>
          <th colspan="2"  class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forForeign')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forOrganization')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forOwn')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forForeign')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forLogistic')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal">{{$t('salaryCategory.label.forForeign')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal !text-wrap leading-[1.2] !text-center">{{$t('salaryCategory.label.forOther')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal !text-wrap leading-[1.2] !text-center">{{$t('salaryCategory.label.fixed-term')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !font-normal !text-wrap leading-[1.2] !text-center">{{$t('salaryCategory.label.contract')}}</th>
          <th colspan="2" class="min-w-[100px] w-[100px] !border-r !text-wrap leading-[1.2] !text-center">{{$t('salaryCategory.label.Housekeeper')}}</th>
        </tr>
        <tr >
          <template v-for="(item) in 28">
            <th class="min-w-[100px] w-[100px] !text-wrap leading-[1.2] !font-normal text-xs !text-center !border-r">{{item%2===1? $t('salaryCategory.label.mediumWorkerCount') : $t('salaryCategory.label.mediumSalaryAmount')  }}</th>
          </template>
        </tr>
        </thead>
        <tbody>
        <template v-for="(item, idx) in store.list" :key="idx">
          <tr class="!text-center">
            <td>
              <div class="flex items-center justify-center">
                <span class="px-2 py-1 text-secondary bg-surface-ground/50 rounded-lg capitalize">{{item.month}}</span>
              </div>
            </td>
            <td>{{item.data?.result_worker_count}}</td>
            <td>{{item.data?.result_salary_fund}}</td>

            <td>{{item.data?.external_worker_count}}</td>
            <td>{{item.data?.external_salary_fund}}</td>

            <td>{{item.data?.capital_society_worker_count}}</td>
            <td>{{item.data?.capital_society_salary_fund}}</td>
            <td>{{item.data?.capital_own_use_worker_count}}</td>
            <td>{{item.data?.capital_own_use_salary_fund}}</td>
            <td>{{item.data?.capital_foreign_company_worker_count}}</td>
            <td>{{item.data?.capital_foreign_company_salary_fund}}</td>

            <td>{{item.data?.construction_society_worker_count}}</td>
            <td>{{item.data?.construction_society_salary_fund}}</td>
            <td>{{item.data?.construction_own_use_worker_count}}</td>
            <td>{{item.data?.construction_own_use_salary_fund}}</td>
            <td>{{item.data?.construction_foreign_company_worker_count}}</td>
            <td>{{item.data?.construction_foreign_company_salary_fund}}</td>

            <td>{{item.data?.other_society_worker_count}}</td>
            <td>{{item.data?.other_society_salary_fund}}</td>
            <td>{{item.data?.other_own_use_worker_count}}</td>
            <td>{{item.data?.other_own_use_salary_fund}}</td>
            <td>{{item.data?.other_foreign_company_worker_count}}</td>
            <td>{{item.data?.other_foreign_company_salary_fund}}</td>

            <td>{{item.data?.temporary_contract_worker_count}}</td>
            <td>{{item.data?.temporary_contract_salary_fund}}</td>
            <td>{{item.data?.civil_contract_worker_count}}</td>
            <td>{{item.data?.civil_contract_salary_fund}}</td>
            <td>{{item.data?.freelancer_worker_count}}</td>
            <td>{{item.data?.freelancer_salary_fund}}</td>

            <td>
              <template v-if="item.data">
                <UIMenuButton
                    @selectEv="onSelect"
                    show-edit
                    :data="item"
                />
              </template>

            </td>

          </tr>
        </template>

        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>
