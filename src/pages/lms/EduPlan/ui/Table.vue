<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMore, UIBadge} from "@/components/index.js"
import {useEduPlanStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import MenuButton from "@/components/buttons/MenuButton.vue"

const store = useEduPlanStore()

const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.subjects = v.subjects.map(i=>i.id)
  store.payload.specialization_id = v.specialization.id
  store.payload.hours = v.hours
  store.payload.start_date = new Date(v.start_date).getTime()
  store.subjects = v.subjects
  store.specializations = [v.specialization]

  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}


const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }else if (v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }
}

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
          class="mt-5"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('eduPlanPage.form.learning_center')}}</th>
          <th class="min-w-[200px]">{{$t('eduPlanPage.form.specialization')}}</th>
          <th class="!text-center max-w-[130px] w-[130px]">{{$t('eduPlanPage.form.start_date')}}</th>
          <th class="max-w-[70px] w-[70px] !text-center">{{$t('eduPlanPage.form.hours')}}</th>
          <th class="min-w-[200px] text-center!">{{$t('eduPlanPage.form.subjects')}}</th>
          <th class="min-w-[60px] w-[60px] !text-center">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.learning_center.name}}</td>
          <td>{{item.specialization.name}}</td>
          <td>
            <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.start_date)" />
          </td>
          <td class="!text-center">
            <n-button circle>
              {{item.hours}}
            </n-button>
          </td>
          <td class="text-center!">
            <UIMore :height="100" :width="200" :data="item.subjects">
              <template #content="{data}">
                <p>{{data.name}}</p>
              </template>
            </UIMore>
          </td>
          <td>
            <MenuButton
                :data="item"
                :show-edit="true"
                :loading="item.id === store.elementId && store.deleteLoading"
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