<script setup>
import { useComponentStore, useVacationScheduleStore } from '@stores'
import {useAppSetting, Utils, validationRules} from "@utils"
import UIHelper from "@utils/UIHelper.js"
import { DocumentSync20Regular } from "@vicons/fluent"
import {SuperSelect, UIPageFilter, UIPagination, UISelect, UIUser} from "@components"

const formRef = ref(null)


const store = useVacationScheduleStore()
const componentStore = useComponentStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      const data = {
        year:store.payload.year,
        director_id:store.payload.director_id,
        trade_union_id:store.payload.trade_union_id,
        creator_id:store.payload.creator_id,
        date:Utils.timeToZone(store.payload.date),
        worker_position_ids:store.worker.list.map(v => ({
          id:v.id,
          table_number:v.table_number,
          all_days:v.all_days,
          period_from:Utils.timeToZone(v.period_from),
          period_to:Utils.timeToZone(v.period_to),
          plan_date:Utils.timeToZone(v.plan_date),
        }))
      }
      store._create(data)
    }
  })
}

const fetchConfirmations = () =>{
  if(componentStore.confirmationList?.length) return
  componentStore._confirmations()
}

const onChangePage = ({page, per_page}) => {
  store.worker.params.page = page
  store.worker.params.per_page = per_page
  store._fetchWorkers()
}

const checkYearOfDate = (ts) =>{
  const year = new Date(ts).getFullYear()
  return year !== Number(store.payload.year)
}

const onChangeDate = (ts, index) =>{
  const date = new Date(ts)
  store.worker.list[index].period_to =ts? new Date(ts).setFullYear(date.getFullYear() + 1) : null
}



const filterEventWorker = () =>{
  store.worker.params.page = 1
  store._fetchWorkers()
}

const onChangeStructure = (v) =>{
  store.worker.params.organizations = v
  store._fetchDepartment()
  filterEventWorker()
}

const onChangeDepartment = (v) =>{
  filterEventWorker()
}

const onChangeYear = (v)=>{
  store.worker.params.year = v
  store.worker.params.page = 1
  filterEventWorker()
}

const onSearchCreator = (v) => {
  store.creator.params.page = 1
  store.creator.params.search = v
  store._fetchCreator()
}

const onScrollCreator = () => {
  store.creator.params.page += 1
  store._fetchCreator(true)
}

const onSearchDepartment = (v) => {
  store.department.params.page = 1
  store.department.params.search = v
  store._fetchDepartment()
}

const onScrollDepartment = () => {
  store.department.params.page += 1
  store._fetchDepartment(true)
}

const onDefaultEv = (v)=>{
  store.worker.params.organizations = v
  store._fetchDepartment()
}

onMounted(()=>{
  fetchConfirmations()
  store._fetchWorkers()
  if (componentStore.structureList.length === 0) {
    componentStore._structures()
  }
  store._fetchCreator()
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
      class="grid grid-cols-12 gap-x-4"
  >
    <div class="col-span-12 grid grid-cols-12 gap-x-4 bg-surface-ground p-2 !pb-0 border border-surface-line rounded-xl mb-4 border-dashed">
      <n-form-item
          class="col-span-2"
          :label="$t(`vacationSchedule.form.to_date`)"
          path="date"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.date"
            type="date"
            :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item
          class="col-span-1"
          :label="$t(`content.year`)"
          path="year"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            :options="Utils.yearList"
            v-model:value="store.payload.year"
            value-field="id"
            label-field="name"
            @update:value="onChangeYear"
        />
      </n-form-item>
      <n-form-item
          class="col-span-3"
          :label="$t(`documentPage.command.form.director_id`)" path="director_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            value-field="id"
            label-field="last_name"
            v-model:value="store.payload.director_id"
            :options="componentStore.confirmationList"
            :loading="componentStore.confirmationLoading"
            :render-label="UIHelper.avatarRender.label"
            :render-tag="UIHelper.avatarRender.value"
        />
      </n-form-item>
      <n-form-item
          class="col-span-3"
          :label="$t(`vacationSchedule.form.tradeUnion`)"
          path="trade_union_id"
          :rule-path="validationRules.rulesNames.requiredNumberField">
        <n-select
            value-field="id"
            label-field="last_name"
            v-model:value="store.payload.trade_union_id"
            :options="componentStore.confirmationList"
            :loading="componentStore.confirmationLoading"
            :render-label="UIHelper.avatarRender.label"
            :render-tag="UIHelper.avatarRender.value"
        />
      </n-form-item>
      <n-form-item
          class="col-span-3"
          :label="$t(`content.worker`)"
          path="creator_id"
          :rule-path="validationRules.rulesNames.requiredNumberField">
<!--        <n-select-->
<!--            value-field="id"-->
<!--            label-field="last_name"-->
<!--            v-model:value="store.payload.creator_id"-->
<!--            :options="componentStore.confirmationList"-->
<!--            :loading="componentStore.confirmationLoading"-->
<!--            :render-label="UIHelper.avatarRender.label"-->
<!--            :render-tag="UIHelper.avatarRender.value"-->
<!--        />-->
        <SuperSelect
            :max-tag-count="1"
            :options="store.creator.list"
            :loading="store.creator.loading"
            :total-count="store.creator.total"
            :per-page="store.creator.params.per_page"
            v-model:value="store.payload.creator_id"
            v-model:search="store.creator.params.search"
            value-field="id"
            @onSearch="onSearchCreator"
            @onScrollEv="onScrollCreator"
        />
      </n-form-item>
    </div>

    <UIPageFilter
        class="col-span-12"
        :show-add-button="false"
        :show-filter-button="false"
        v-model:search="store.worker.params.search"
        :search-loading="store.worker.loading"
        @onSearch="filterEventWorker"
    >
      <template #filterAction>
        <n-button type="primary" @click="store._fetchAutoGenerate()" :loading="store.worker.loading">
          <template #icon>
            <n-icon>
              <DocumentSync20Regular/>
            </n-icon>
          </template>
          {{$t('vacationSchedule.autoGenerate')}}
        </n-button>
        <div class="w-[260px]">
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.worker.params.organizations"
              @defaultValue="onDefaultEv"
              @updateModel="onChangeStructure"
              :checkedVal="store.structureCheck2"
              @updateCheck="(v) => (store.structureCheck2 = v)"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              :loading="componentStore.structureLoading"
              @onSubmit="filterEventWorker"
              :multiple="false"
          />
        </div>
        <div class="w-[300px]">
          <SuperSelect
              :clearable="true"
              :placeholder="'content.department'"
              multiple
              :disabled="store.worker.params.organizations.length === 0"
              :max-tag-count="1"
              :options="store.department.list"
              :loading="store.department.loading"
              :total-count="store.department.total"
              :per-page="store.department.params.per_page"
              v-model:value="store.worker.params.departments"
              v-model:search="store.department.params.search"
              value-field="id"
              @update:value="onChangeDepartment"
              @onSearch="onSearchDepartment"
              @onScrollEv="onScrollDepartment"
          />
        </div>

      </template>
    </UIPageFilter>

    <n-spin class="col-span-12 mt-2" :show="store.worker.loading">
      <div class="relative border border-surface-line rounded-lg h-[calc(100vh-340px)] overflow-y-auto mb-4">
        <div class="grid grid-cols-12 border-b border-surface-line gap-1  py-2 text-xs font-semibold text-secondary sticky top-0 left-0 right-0 w-full bg-surface-section z-10">
          <div class="col-span-2 pl-2 line-clamp-1">
              {{$t('content.worker')}}
          </div>
          <div class="col-span-2 pl-2 line-clamp-1">
            {{$t('vacationSchedule.form.table_number')}}
          </div>
          <div class="col-span-2 pl-2 line-clamp-1">
            {{$t('vacationSchedule.form.period_from')}}
          </div>
          <div class="col-span-2 pl-2 line-clamp-1">
            {{$t('vacationSchedule.form.period_to')}}
          </div>
          <div class="col-span-2 pl-2 line-clamp-1">
            {{$t('vacationSchedule.form.plan_date')}}
          </div>
          <div class="col-span-2 pl-2 line-clamp-1">
            {{$t('vacationSchedule.form.all_days')}}
          </div>
        </div>
        <template v-for="(item, idx) in store.worker.list" :key="item">
          <div class="grid mx-2 grid-cols-12 gap-1 border border-surface-line bg-surface-ground/80 px-2 py-2 mb-4 rounded-2xl">
            <div class="col-span-2 flex gap-2 items-center">
              <div class="text-secondary text-xs font-semibold flex-shrink-0">
                {{(store.worker.params.page - 1)*store.worker.params.per_page + 1 + idx}}
              </div>
              <UIUser
                  :data="{
                  photo: item?.worker.photo,
                  firstName: item?.worker.first_name,
                  middleName: item?.worker.middle_name,
                  lastName: item?.worker.last_name,
                  position: item?.position?.name
                }"
              />
            </div>
            <n-form-item
                class="col-span-2"
                :label="$t(`vacationSchedule.form.table_number`)"
                :show-feedback="false"
                :show-label="false"
            >
              <n-input
                  class="w-full"
                  type="text"
                  v-model:value="item.table_number"
              />
            </n-form-item>
            <n-form-item
                class="col-span-2"
                :label="$t(`vacationSchedule.form.period_from`)"
                :show-feedback="false"
                :show-label="false"
            >
              <n-date-picker
                  class="w-full"
                  v-model:value="item.period_from"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                  @update:value="onChangeDate($event, idx)"
              />
            </n-form-item>
            <n-form-item
                class="col-span-2"
                :label="$t(`vacationSchedule.form.period_to`)"
                :show-feedback="false"
                :show-label="false"
            >
              <n-date-picker
                  class="w-full"
                  v-model:value="item.period_to"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
              />
            </n-form-item>
            <n-form-item
                class="col-span-2"
                :label="$t(`vacationSchedule.form.plan_date`)"
                :show-feedback="false"
                :show-label="false"
            >
              <n-date-picker
                  class="w-full"
                  v-model:value="item.plan_date"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                  :is-date-disabled="checkYearOfDate"

              />
            </n-form-item>
            <n-form-item
                class="col-span-2"
                :label="$t(`vacationSchedule.form.all_days`)"
                :show-feedback="false"
                :show-label="false"
            >
              <n-input-number
                  class="w-full"
                  min="0"
                  max="100"
                  v-model:value="item.all_days"
              />
            </n-form-item>
          </div>

        </template>
      </div>
    </n-spin>



    <div class="col-span-12 flex justify-between">
      <div></div>
      <UIPagination
          :short="false"
          :show-size-picker="false"
          :page="store.worker.page"
          :per_page="store.worker.per_page"
          :total="store.worker.total"
          @change-page="onChangePage"
      />
    </div>
    <div class="grid grid-cols-2 gap-2 col-span-12">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
