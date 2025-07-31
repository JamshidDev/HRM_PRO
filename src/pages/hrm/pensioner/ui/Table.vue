<script setup>
import {NoDataPicture,UIPagination, UIUser, UIMenuButton} from "@/components/index.js"
import {usePensionerStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = usePensionerStore()
const compStore = useComponentStore()
const accStore = useAccountStore()

const onEdit = (v)=>{
  console.log(v.passport)
  store.payload.first_name = v.first_name
  store.payload.last_name = v.last_name
  store.payload.middle_name = v.middle_name
  store.payload.sex = Number(v.sex)
  store.payload.experience = v.experience?.toString()
  store.payload.passport = v.passport
  store.payload.pin = v.pin?.toString()
  store.payload.address = v.address
  store.payload.position = v.position
  store.payload.year = new Date().setFullYear(v.year)
  store.payload.phone = v.phone
  store.payload.invalid = Number(v.invalid)
  store.payload.railway_title = Number(v.railway_title)
  store.payload.afghan = Number(v.afghan)
  store.payload.chernobyl =Number(v.chernobyl)

  store.visibleType = false
  store.elementId = v.id
  store.visible = true

}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(!accStore.checkAction(accStore.pn.hrVacationsWrite)) return
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
  }
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
          <th class="min-w-[40px] w-[40px]"></th>
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
          <td>{{item.position}}</td>
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
          <td>
             <UIMenuButton
                :data="item"
                 :show-edit="true"
                 @selectEv="onSelectEv"
             />
           </td>
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