<script setup>
import {NoDataPicture,UIPagination, UIUser, UIMenuButton} from "@/components/index.js"
import {useMedPensionerStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"

const store = useMedPensionerStore()
const compStore = useComponentStore()
const accStore = useAccountStore()

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
          <th class="min-w-[280px]">{{$t('confirmationPage.table.worker')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('content.position')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('content.organization')}}</th>
          <th class="min-w-[100px] w-[140px]">{{$t('pensioner.form.pin')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('pensioner.form.passport')}}</th>
          <th class="min-w-[100px] max-w-[240px]">{{$t('pensioner.form.address')}}</th>
          <th class="min-w-[100px] max-w-[120px] !text-wrap">
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('pensioner.form.experience')}}</p>
              </template>
              {{$t('pensioner.form.experience')}}
            </n-tooltip>
          </th>
          <th class="min-w-[100px] w-[100px] !text-wrap">{{$t('pensioner.form.year')}}</th>
          <th class="min-w-[100px] w-[100px] !text-wrap">{{$t('pensioner.form.phone')}}</th>
          <th class="min-w-[100px] max-w-[100px] !text-wrap">
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('pensioner.form.invalid')}}</p>
              </template>
              {{$t('pensioner.form.invalid')}}
            </n-tooltip>
          </th>
          <th class="min-w-[100px] max-w-[100px] !text-wrap">
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate"> {{$t('pensioner.form.railway_title')}}</p>
              </template>
              {{$t('pensioner.form.railway_title')}}
            </n-tooltip>
          </th>
          <th class="min-w-[100px] max-w-[100px] !text-wrap">
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate"> {{$t('pensioner.form.afghan')}}</p>
              </template>
              {{$t('pensioner.form.afghan')}}
            </n-tooltip>
          </th>
          <th class="min-w-[100px] max-w-[100px] !text-wrap">
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate">{{$t('pensioner.form.chernobyl')}}</p>
              </template>
              {{$t('pensioner.form.chernobyl')}}
            </n-tooltip>
          </th>
<!--          <th class="min-w-[40px] w-[40px]"></th>-->
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :hide-tooltip="true"
                  :short="false"
                  :data="{
                    photo:null,
                    firstName:item?.first_name,
                    middleName:item?.middle_name,
                    lastName:item?.last_name,
                    position:item?.phone,
                  }"
              />
            </div>
          </td>
          <td>
            <div class="leading-[1.2]">
              {{item.position}}
            </div>
          </td>
          <td>
            <div class="leading-[1.2] text-sm">
              {{item.organization?.name}}
            </div>
          </td>
          <td>{{item.pin}}</td>
          <td>{{item.passport}}</td>
          <td>
            <n-tooltip trigger="hover">
              <template #trigger>
                <p class="text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate max-w-[140px]">{{item.address}}</p>
              </template>
              {{item.address}}
            </n-tooltip>
          </td>
          <td>{{item.experience}} {{$t('content.year')}}</td>
          <td>{{item.year}}</td>
          <td>{{item.phone}}</td>
          <td>{{item.invalid===1? $t('content.yes') : $t('content.no')}}</td>
          <td>{{item.railway_title===1? $t('content.yes') : $t('content.no')}}</td>
          <td>{{item.afghan===1? $t('content.yes') : $t('content.no')}}</td>
          <td>{{item.chernobyl===1? $t('content.yes') : $t('content.no')}}</td>
<!--          <td>-->
<!--            <UIMenuButton-->
<!--                :data="item"-->
<!--                :show-edit="true"-->
<!--            />-->
<!--          </td>-->
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>