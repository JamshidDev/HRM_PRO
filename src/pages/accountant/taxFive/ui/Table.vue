<script setup>
import {NoDataPicture, UIMenuButton, UIPagination, UIStatus, UIUser} from "@/components/index.js"
import {useTaxFiveStore} from "@/store/modules/index.js"
import Utils from "../../../../utils/Utils.js"
import {CheckmarkCircle24Filled, ErrorCircle24Filled} from "@vicons/fluent"

const store = useTaxFiveStore()

const onDownload = (url)=>{
  window.open(url, "_blank")
}

const onChange = (v) =>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  console.log(v)
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
          <th class="min-w-[100px] text-wrap!">{{$t('content.fullName')}}</th>
          <th class="min-w-[60px] w-[60px]">{{$t('content.status')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('content.organization')}}</th>
          <th class="w-[60px]">{{$t('content.year')}}</th>
          <th class="w-[60px]">{{$t('content.month')}}</th>

          <th class="w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('taxFive.form.total_income')}}</p>
              </template>
              {{$t('taxFive.form.total_income')}}
            </n-tooltip>
          </th>
          <th class="w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('taxFive.form.reported_income')}}</p>
              </template>
              {{$t('taxFive.form.reported_income')}}
            </n-tooltip>
            </th>
          <th class="w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('taxFive.form.income_type')}}</p>
              </template>
              {{$t('taxFive.form.income_type')}}
            </n-tooltip>
            </th>
          <th class="w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('taxFive.form.total_tax')}}</p>
              </template>
              {{$t('taxFive.form.total_tax')}}
            </n-tooltip>
            </th>
          <th class="w-[130px] max-w-[130px]">
            <n-tooltip
                trigger="hover"
            >
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('taxFive.form.reported_tax')}}</p>
              </template>
              {{$t('taxFive.form.reported_tax')}}
            </n-tooltip>
            </th>
          <th class="w-[40px]"></th>
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
          <td>{{item.organization?.name}}</td>
          <td>{{item.year}}</td>
          <td>{{Utils.getMonthNameById(item.month)}}</td>
          <td class="text-center">{{item.total_income}}</td>
          <td class="text-center">{{item.reported_income}}</td>
          <td class="text-center">
            <UIStatus
                :status="item.income_type"
            />
          </td>
          <td class="text-center">{{item.total_tax}}</td>
          <td class="text-center">{{item.reported_tax}}</td>
          <td>
            <UIMenuButton
                :show-view="true"
                @selectEv="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="onChange"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
