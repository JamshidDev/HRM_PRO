<script setup>
import {NoDataPicture, UIPagination, UIUser} from "@/components/index.js"
import {useAccountStore, useLmsLessonStore} from "@/store/modules/index.js"

const store = useLmsLessonStore()
const accStore = useAccountStore()




const changePage = (v)=>{
  store.resultParams.page = v.page
  store.resultParams.per_page = v.per_page
  store._resultIndex()
}
</script>

<template>
  <n-spin :show="store.resultLoading" style="min-height: 200px">
    <div  v-if="store.resultList.length>0">
      <div class="w-full overflow-x-auto" >
        <n-table
            class="mt-5"
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
            <th class="min-w-[200px]">{{$t('content.worker')}}</th>
            <th class="w-[400px]">{{$t('content.exam')}}</th>
            <th class="w-[160px]">{{$t('content.type')}}</th>
            <th class="w-[120px]">{{$t('lmsWorkerPage.form.eduPlan')}}</th>
            <th class="w-[250px]">{{$t('content.date')}}</th>
            <th class="min-w-[40px] w-[40px]">{{$t('content.result')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.resultList" :key="idx">
            <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.resultParams.page - 1) * store.resultParams.per_page + idx + 1 }}</span></td>
            <td>
              <UIUser
                  :short="false"
                  :hide-tooltip="true"
                  :data="{
                    photo:item?.worker?.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.exam?.name
                  }"
              />
            </td>
            <td>
              <div class="leading-[1.2]">{{item.exam.name}}</div>
              <div class="leading-[1.2] text-secondary">{{item.topic.name}}</div>
            </td>
            <td><div class="leading-[1.2]">{{item.topic?.type?.name}}</div></td>
            <td>
              <div class="text-xs">{{$t('categoryPage.questionCount')}}: <span class="text-sm">{{item?.exam?.tests_count}}</span></div>
              <div class="text-xs">{{$t('resultPage.form.chances')}}: <span class="text-sm">{{item?.exam?.chances}}</span></div>
            </td>
            <td>
              <div class="text-xs"><span class="text-secondary">{{$t('content.startDate')}}: </span> {{item.created}}</div>
              <div class="text-xs"><span class="text-secondary">{{$t('content.endDate')}} :</span> {{item.ended}}</div>
            </td>
            <td>
              <n-button dashed circle>{{item?.result || 0}}</n-button>
            </td>
          </tr>
          </tbody>
        </n-table>
      </div>

      <UIPagination
          :page="store.resultParams.page"
          :per_page="store.resultParams.per_page"
          :total="store.totalResult"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.resultList.length===0 && !store.resultLoading" />
  </n-spin>
</template>