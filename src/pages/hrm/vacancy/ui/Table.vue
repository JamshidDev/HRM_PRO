<script setup>
import {NoDataPicture,UIPagination, UIMenuButton, UIBadge} from "@/components/index.js"
import {useVacancyStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import numeral from 'numeral';
const store = useVacancyStore()
const compStore = useComponentStore()
const accStore = useAccountStore()

const onDelete = (v)=>{
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  store.elementId = v.data.id
  if(Utils.ActionTypes.edit === v.key){
    store._show()
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
          <th class="min-w-[200px]">{{$t('vacancy.form.department_position_id')}}</th>
          <th class="min-w-[40px] w-[80px] max-w-[80px]">
            <p class="line-clamp-1 truncate">{{$t('vacancy.form.rate')}}</p>
          </th>
          <th class="min-w-[100px] w-[120px] max-w-[120px]">
            <p class="line-clamp-1 truncate">{{$t('vacancy.form.to')}}</p>

          </th>
          <th class="min-w-[100px] w-[120px]">{{$t('departmentPositionPage.form.salary')}}</th>
          <th class="min-w-[60px] w-[80px]">{{$t('vacancy.form.short_experience')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('medWorker.form.education')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('vacancy.form.work_type')}}</th>
          <th class="min-w-[60px] w-[80px]">{{$t('vacancy.form.switch')}}</th>
           <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <p class="line-clamp-2 text-textColor2 leading-[1]">
                {{item.position.name}}
              </p>
              <p class="line-clamp-1 text-textColor3 text-xs leading-[1]">{{item.department.name}}</p>
            </div>
          </td>
          <td>
           <div class="flex justify-center">
             <n-button class="mx-auto" bordered dashed circle size="small" type="primary">
               {{item.rate}}
             </n-button>
           </div>
          </td>
          <td>
            <UIBadge :type="Utils.colorTypes.secondary" :show-icon="false" :label="Utils.timeOnlyDate(item.to)" />
          </td>
          <td>
            {{numeral(item.salary).format('0,0.0')}} <span class="text-textColor3 text-xs">{{$t('content.sum')}}</span>
          </td>
          <td>
            {{item.experience}}
          </td>
          <td>
            {{item.education?.name}}
          </td>
          <td>
            {{item.work_type?.name}}
          </td>
          <td>
            <div class="flex justify-center">
              <n-switch :loading="store.switchLoading" v-model:value="item.status" @update:value="store._changePublic($event, item)" />
            </div>
          </td>
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