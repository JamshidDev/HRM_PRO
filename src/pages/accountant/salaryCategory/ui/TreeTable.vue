<script setup>
import { computed, ref } from 'vue';
import {Folder20Filled, ChevronRight12Regular, FolderOpen24Filled, DocumentBulletList24Filled} from "@vicons/fluent"
import {useSalaryCategoryStore} from "@/store/modules/index.js"

const store = useSalaryCategoryStore()


const flattenData = computed(()=>{

   function flattenTreeWithLevel(tree, level = 0) {
    const result = [];

    function traverse(nodes, currentLevel) {
      for (const node of nodes) {
        const { children, ...rest } = node;
        result.push({ ...rest, level: currentLevel, isHasChildren: !!children.length })
        const isExpanded = store.expandSet.has(node.id)
        if (isExpanded && children && children.length > 0) {
          traverse(children, currentLevel + 1);
        }
      }
    }

    traverse(tree, level);
    return result;
  }
  return  flattenTreeWithLevel(store.organizationList, 0)
})

const toggleExpand =(id)=> {
  if (store.expandSet.has(id)) {
    store.expandSet.delete(id)
  } else {
    store.expandSet.add(id)
  }
}



onMounted(()=>{
  store._byOrganization()
})
</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full pb-4 mt-4 overflow-y-auto h-[calc(100vh-186px)] relative">
      <n-table
          style="border-collapse: collapse"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th rowspan="3" colspan="4" class="min-w-[400px] w-[400px] !text-center">{{$t('content.organization')}}</th>
          <th colspan="2" rowspan="2" class="min-w-[100px] w-[100px] !text-center ">{{$t('salaryCategory.label.all')}}</th>
          <th rowspan="2" colspan="2" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.external')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.capital')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.construction')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.other')}}</th>
          <th colspan="6" class="min-w-[100px] w-[100px] !text-center">{{$t('salaryCategory.label.fromIt')}}</th>
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
        <template v-for="(item, idx) in flattenData" :key="idx">
          <tr class="!text-center">
            <td colspan="4" class="!text-left">
              <div :style="{paddingLeft:(item.level*15+'px')}" class="flex items-start">
                <div class="flex justify-end w-[40px]">
                  <n-icon
                      v-if="item.isHasChildren"
                      @click="toggleExpand(item.id)"
                      :class="[store.expandSet.has(item.id)? 'rotate-90' : 'rotate-0' ]"
                      class="transition-all " size="18">
                    <ChevronRight12Regular/>
                  </n-icon>
                  <n-icon size="20">
                    <template v-if="item.isHasChildren">
                      <FolderOpen24Filled
                          v-if="store.expandSet.has(item.id)"
                          class="text-[#a312df]"
                      />
                      <Folder20Filled
                          v-else
                          class="text-[#a312df]"
                      />
                    </template>
                    <DocumentBulletList24Filled v-else class="text-primary"/>
                  </n-icon>
                </div>
                <span class="ml-2 leading-[1.2] inline-block text-wrap text-sm w-[calc(100%-40px)]">{{' '+ item.name}}</span>
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


          </tr>
        </template>

        </tbody>
      </n-table>
    </div>
  </n-spin>

</template>
