<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import {useMonthReportStore} from "@/store/modules/index.js"
import {CheckmarkCircle24Filled, ErrorCircle24Filled} from "@vicons/fluent"

const store = useMonthReportStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onShow = (v) => {
  store.visible = true
  store.elementId = v.pin
  store.showPrams.year = store.params.year
  store.showPrams.month = store.params.month
  store._show()

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
          <th class="min-w-[200px]">{{$t('content.fullName')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('content.status')}}</th>
          <th class="min-w-[100px]">{{$t('content.organization')}}</th>
          <th class="min-w-[200px]">{{$t('monthReport.form.salary')}}</th>
          <th class="w-[130px] max-w-[130px] text-wrap!">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">
                  {{$t('monthReport.form.totalOne')}}
                </p>
              </template>
              {{$t('monthReport.form.totalOne')}}
            </n-tooltip>
          </th>
          <th class="min-w-[50px] w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">
                  {{$t('monthReport.form.totalTwo')}}
                </p>
              </template>
              {{$t('monthReport.form.totalTwo')}}
            </n-tooltip>
          </th>
          <th class="min-w-[50px] w-[100px] text-wrap!">{{$t('monthReport.form.totalThree')}}</th>
          <th class="min-w-[50px] w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">
                  {{$t('monthReport.form.totalFour')}}
                </p>
              </template>
              {{$t('monthReport.form.totalFour')}}
            </n-tooltip>
          </th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                v-if="item.worker"
                :short="false"
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.pin,
                  }"
            />
            <template v-else>
              <UIUser
                  :short="false"
                  :data="{
                    photo:'',
                    firstName:'',
                    middleName:'',
                    lastName:'',
                    position:'',
                  }"
              >
                <template #name>
                 <p class="truncate text-nowrap"> {{item.full_name}}</p>
                </template>
                <template #position>
                 <span class="text-xs text-textColor3"> {{item?.pin}}</span>
                </template>

              </UIUser>
            </template>
          </td>
          <td class="text-center">
              <n-icon size="26" :class="[item.worker? 'text-success' : 'text-danger']">
                <CheckmarkCircle24Filled v-if="item.worker"/>
                <ErrorCircle24Filled v-else/>
              </n-icon>
          </td>
          <td>{{item.organization.name}}</td>
          <td>{{item.main_salary}}</td>
          <td>{{item.total_one}}</td>
          <td>{{item.total_two}}</td>
          <td>
            <span @click="onShow(item)" class="text-primary cursor-pointer">{{item.total_three}}</span>
          </td>
          <td>{{item.total_four}}</td>
          <td><UIMenuButton/></td>
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