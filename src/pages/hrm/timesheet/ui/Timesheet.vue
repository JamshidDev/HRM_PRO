<script setup>
import {onMounted, ref} from 'vue';
import {VueDraggable} from 'vue-draggable-plus';
import {
  AddCircle28Regular,
  Broom16Filled,
  Delete20Filled,
  Dismiss12Regular,
  Info16Filled,
  LineHorizontal320Filled,
  ArrowMoveInward20Filled
} from "@vicons/fluent";
import {useComponentStore, useTimesheetWorkerStore} from "@/store/modules/index.js";
import {UIPagination} from "@/components/index.js";
import {vScroll} from '@vueuse/components'
import dayjs from "dayjs";
import {NAvatar, NTooltip} from 'naive-ui'
import {useDebounceFn} from "@vueuse/core";
import Utils from "@/utils/Utils.js";
import MiniTimesheetInfoTable from './MiniTimesheetInfoTable.vue'

const store = useTimesheetWorkerStore()
const compStore = useComponentStore()
const isDragging = ref(false);
const form = ref(null)
const isAddUserVisible = ref(false)
const addUserSelect = ref(null)

const onAdd = () => {
  isAddUserVisible.value = true
  setTimeout(() => {
    addUserSelect.value?.focus()
  }, 200)
}

onMounted(() => {
  if (compStore.timesheetTypes.length === 0) {
    compStore._timesheetEnums()
  }
  store.resetAll()
});

const isCellSelected = (row, col) => {
  if (!store.payload.start || !store.payload.end) return false;
  const rowStart = Math.min(store.payload.start.row, store.payload.end.row);
  const rowEnd = Math.max(store.payload.start.row, store.payload.end.row);
  const colStart = Math.min(store.payload.start.col, store.payload.end.col);
  const colEnd = Math.max(store.payload.start.col, store.payload.end.col);
  return row >= rowStart && row <= rowEnd && col >= colStart && col <= colEnd;
};

const canSelectRange = () => {
  if (!store.payload.isClearing && store.payload.status == null) {
    return false
  }
  if (store.payload.status != null && compStore.timesheetTypes?.[store.payload.status - 1]?.hours && store.payload.hours == null) {
    return false
  }
  if (store.payload.status2 != null && compStore.timesheetTypes?.[store.payload.status2 - 1]?.hours && store.payload.hours2 == null) {
    return false
  }

  return true
}

const handleMouseDown = (e) => {
  if (canSelectRange()) {
    isDragging.value = true;
    const {col, row} = e.currentTarget.dataset;
    const cell = {row: Number(row), col: Number(col)};

    store.resetSelection();
    store.payload.start = cell;
    store.payload.end = cell;
  }
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  const {col, row} = e.currentTarget.dataset;
  store.payload.end = {row: Number(row), col: Number(col)};

};

const handleMouseUp = () => {
  isDragging.value = false;
  form.value?.validate((error) => {
    if (!error) {
     store._create()
    }
  })

};

const handleMouseLeave = () => {
  isDragging.value = false;
  store.resetSelection()
};


const changePage = (v) => {
  store.resetSelection()
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const renderOption = ({node, option}) => {
  return [h(NTooltip, {
    delay: 300
  }, {
    trigger: () => node,
    default: () => `${option.name} (${option.key})`
  })]
}


const renderLabel = (option) => {
  return [
    h('div', {class: 'font-medium text-gray-500'}, `${option.name} (${option.key})`),
  ];
}


const renderWorkerLabel = (option) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center',
          onClick: () => {
            if (option.disabled) return
            console.log(option)
            isAddUserVisible.value = false
            store._prepend_workers(option)
          }
        }, [
          h(NAvatar,
              {
                class: '',
                src: option.worker.photo,
                'fallback-src': Utils.noAvailableImage,
              },),
          h('div', {class: 'flex flex-col'}, [
            h('div', {class: 'text-xs font-medium text-gray-500'}, `${option.worker.last_name}.${option.worker.first_name[0]}.${option.worker.middle_name[0]}`),
            h('div', {class: 'text-xs text-gray-400'}, option.post_name),
          ])
        ]
    ),
  ];
}
const searchPin = ref('')

const checkWorker = useDebounceFn(() => {
  if (searchPin.value.split('-').join('').length === 14) {
    store._check_pin(searchPin.value.split('-').join(''))
  }
}, 300)
</script>

<template>
  <div class="h-full flex flex-col  p-8">
    <div class="flex my-2 justify-between  items-center shrink-0 gap-2">
      <div class="flex gap-2">

        <n-button v-if="store?.month && store?.year" tertiary>
          {{ dayjs().month(store.month).year(store.year).format("YYYY MMMM") }}
        </n-button>
        <n-button v-if="store?.department" dashed>
          {{ store.department }}
        </n-button>
      </div>
      <div class="flex gap-2">
        <n-button
            type="primary"
            @click="onAdd"
        >
          <template #icon>
            <AddCircle28Regular/>
          </template>
          {{ $t(`timesheetPage.addNewWorker`) }}
        </n-button>
        <n-button
            :type="store.payload.isClearing ? 'primary' : 'tertiary'"
            @click="()=>{
              store.payload.isClearing=!store.payload.isClearing
              store.resetStatuses()
            }"
        >
          {{ $t('content.clear') }}
          <template #icon>
            <n-icon :component="Broom16Filled"/>
          </template>
        </n-button>
        <n-button type="error" @click="store.visible = false">
          {{ $t('content.close') }}
          <template #icon>
            <n-icon :component="Dismiss12Regular"/>
          </template>
        </n-button>
      </div>
    </div>
    <n-spin :show="store.loading || store.saveLoading" class="flex-grow">
      <div  class="rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
        <VueDraggable
            v-model="store.list"
            :animation="150"
            :onStart="store.resetSelection"
            handle=".handle"
            target=".sort-target"
        >
          <table
              class="
                relative 
                bg-surface-section 
                border-separate
                border-spacing-0  
                shadow-sm
                select-none
                w-full
              "

              @mouseleave="handleMouseLeave"
          >
            <thead class="bg-surface-ground">
            <tr>
              <th rowspan="3"></th>
              <th class="max-w-[200px] w-[200px]" rowspan="3">{{ $t('content.worker') }}</th>
              <th class="px-3" rowspan="3">{{ $t('timesheet.name') }}</th>
              <th v-if="store.days.length" :colspan="store.days.length" rowspan="1">
                {{ $t('timesheetPage.tableTitle') }}
              </th>
              <th class="sticky right-0" rowspan="3">
              </th>
            </tr>
            <tr>
              <th
                  v-for="day in store.days"
                  :key="day.day" :class="{'weekend': day.weekDay === 0 || day.weekDay === 6}"
                  rowspan="2"
              >
                <div class="flex flex-col">
                  <p>{{ day.day }}</p>
                  <span class="text-xs">
                        {{ dayjs().day(day.weekDay).format('ddd').substring(0, 2) }}
                      </span>
                </div>
              </th>
            </tr>
            </thead>
            <tbody class="sort-target">

            <!-- Fake placeholder row -->
            <tr v-if="isAddUserVisible">
              <td class="cursor-move w-[35px] min-w-[35px]">
                <div class="h-full w-full justify-center items-center flex">
                  <n-tooltip trigger="hover">
                    {{ $t('content.delete') }}
                    <template #trigger>
                      <n-button circle quaternary size="small" type="error" @click="isAddUserVisible=false">
                        <template #icon>
                          <n-icon :component="Delete20Filled"/>
                        </template>
                      </n-button>
                    </template>
                  </n-tooltip>
                </div>
              </td>
              <td>
                <n-popselect
                    :options="store.pinWorkers"
                    :render-label="renderWorkerLabel"
                    @update:value="console.log"
                >
                  <n-input
                      v-mask="`####-####-####-##`"
                      v-model:value="searchPin"
                      :loading="store.pinLoading"
                      :placeholder="$t(`timesheetPage.pin`)"
                      class="w-full"
                      type="text"
                      @update:value="checkWorker"
                  />
                </n-popselect>
              </td>
              <td></td>
              <td
                  v-for="(day, col) in store.days"
                  :key="col"
                  class="h-[40px] w-[45px] max-h-[40px] min-w-[45px]"
              >
                <div class="flex flex-col">
                  <div class="flex-grow border-b border-surface-line shrink-0">
                  </div>
                  <div class="flex-grow shrink-0">
                  </div>
                </div>
              </td>
              <td class="min-w-[50px] sticky right-0 bg-surface-section"></td>
            </tr>

            <!--     Workers row       -->
            <tr v-for="(item, row) in store.list" :key="row" class="timesheet_row">
              <!--      Row handle        -->
              <td class="cursor-move w-[35px] min-w-[35px]">
                <div class="h-full w-full justify-center items-center flex">

                  <n-button circle quaternary size="small">
                    <template #icon>
                      <n-icon :component="ArrowMoveInward20Filled" class="handle"/>
                    </template>
                  </n-button>

                </div>
              </td>

              <!--      Worker        -->
              <td class="max-w-[200px] w-[200px]">
                <div class="flex gap-1 items-center w-full">
                  <n-avatar
                      :fallback-src="Utils.noAvailableImage"
                      :src="item?.photo"
                      circle
                      lazy
                      size="large"
                  />
                  <div class="flex flex-col text-start" style="width: calc(100% - 50px)">
                    <span class="leading-2 text-sm text-textColor2 truncate w-full ">{{ item.name }}</span>
                    <n-tooltip :disabled="!item?.position" animated trigger="hover">
                      {{ item?.position }}
                      <template #trigger>
                        <span
                            class="leading-1  text-xs text-textColor1 truncate w-full">{{ item?.position || '' }}</span>
                      </template>
                    </n-tooltip>
                  </div>
                </div>
              </td>

              <td>{{ item.table }}</td>
              <!--   Days section  -->
              <td
                  v-for="(day, col) in store.days"
                  :key="col"
                  :class="{
                        'timesheet_day-selected': isCellSelected(row, col),
                        'timesheet_day-ignore': isCellSelected(row, col) && !store.payload.isClearing && item.days[day.day]
                      }"
                  :data-col="col"
                  :data-row="row"
                  class="h-[40px] w-[45px] max-h-[40px] min-w-[45px] text-center timesheet_day"
                  @mousedown="handleMouseDown"
                  @mousemove="handleMouseMove"
                  @mouseup="handleMouseUp"
              >
                <div class="flex flex-col">
                  <div class="flex-grow border-b border-surface-line shrink-0">
                    <p v-if="item.days[day.day]?.length">
                      {{
                        item.days[day.day]?.length > 1 ? item.days[day.day].map(i => i.status).join('/') : item.days[day.day][0].status
                      }}</p>
                  </div>
                  <div class="flex-grow shrink-0">
                    <p v-if="item.days[day.day]?.length" class="font-bold">
                      {{
                        item.days[day.day]?.filter(i => i?.hours).length > 1 ? item.days[day.day].map(i => i?.hours).join('/') : (item.days[day.day][0].hours || '&nbsp;')
                      }}</p>
                  </div>
                </div>
              </td>
              <td class="w-[50px] min-w-[50px] h-full sticky right-0 bg-surface-section group">
                <div 
                  :class="{'border-b': row!=0}"
                class="drop-shadow-none bg-surface-section right-0 top-0 bottom-0 left-0 absolute rounded-l-none group-hover:shadow-sm group-hover:rounded-l-full group-hover:-left-[180px] transition-all border-x border-surface-line overflow-hidden">
                  <MiniTimesheetInfoTable
                    :halfDays="item.halfMonth.days"
                    :halfHours="item.halfMonth.hours"
                    :allDays="item.allMonth.days"
                    :allHours="item.allMonth.hours"
                  />
                </div>
                <div
                    :class="{'border-b': row!=0}"
                    class="absolute top-0 left-0 right-0 bottom-0 transition-all z-10 group-hover:opacity-0 bg-surface-section  border-surface-line flex items-center justify-center">
                  <n-button
                      circle
                      dashed
                      type="primary"
                  >
                    <template #icon>
                      <n-icon :component="Info16Filled"/>
                    </template>
                  </n-button>
                </div>
              </td>
            </tr>

            </tbody>
          </table>
        </VueDraggable>
      </div>
      </div>
     
      <n-form ref="form" class="flex gap-2 fixed bottom-8 right-8 left-8">
        <n-grid :cols="8" :x-gap="10">
          <n-form-item-gi :show-feedback="false" :show-label="false" :span="3">
            <n-select
                v-model:value="store.payload.status"
                :disabled="store.payload.isClearing"
                :loading="compStore.timesheetEnumsLoading"
                :options="compStore.timesheetTypes"
                :render-label="renderLabel"
                :render-option="renderOption"
                label-field="name"
                value-field="id"
                @update-value="(_,v)=>{
                      if(!v?.hours) store.payload.hours=null
                    }"
            />
          </n-form-item-gi>
          <n-form-item-gi :show-feedback="false" :show-label="false" :span="1">
            <n-input-number
                v-model:value="store.payload.hours"
                :disabled="!(store.payload.status && compStore.timesheetTypes[store.payload.status-1]?.hours)"
                :min="0"
                :placeholder="$t('timesheetPage.hours')"
            />
          </n-form-item-gi>
          <n-divider/>
          <n-form-item-gi :show-feedback="false" :show-label="false" :span="3">
            <n-select
                v-model:value="store.payload.status2"
                :disabled="store.payload.isClearing || !store.payload.status"
                :loading="compStore.timesheetEnumsLoading"
                :options="compStore.timesheetTypes"
                :render-label="renderLabel"
                :render-option="renderOption"
                clearable
                label-field="name"
                value-field="id"
                @update-value="(_,v)=>{
                      if(!v?.hours) store.payload.hours2=null
                    }"
            />
          </n-form-item-gi>
          <n-form-item-gi :show-feedback="false" :show-label="false" :span="1">
            <n-input-number
                v-model:value="store.payload.hours2"
                :disabled="!(store.payload.status2 && compStore.timesheetTypes[store.payload.status2-1]?.hours)"
                :min="0"
                :placeholder="$t('timesheetPage.hours')"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </n-spin>
  </div>
</template>
<style lang="scss" scoped>
thead{
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  overflow: hidden;
}
tr{
  &:first-child{
    th{
      border-top: 1px solid var(--surface-line);
      &:first-child {
        border-top-left-radius: 10px;
      }
      &:last-child {
        border-top-right-radius: 10px;
        border-right: 1px solid var(--surface-line);
        background-color: var(--surface-ground);
      }
    }
  }
  &:first-child, &:nth-child(2){
    th{
      border-left: 1px solid var(--surface-line);
      border-bottom: 1px solid var(--surface-line);
    }
  }
}
tr{
  td{
    border: 1px solid var(--surface-line);
  }
}
.timesheet_day{
  &-selected{
    border: 1px solid var(--primary-color);
  }
  &-ignore{
    border: 1px solid var(--secondary-color);
  }
}


th, td {
  font-size: 14px;
  white-space: nowrap;
}

.weekend {
  background: rgba(var(--danger-color), 0.2);
  font-weight: bold;
  color: var(--danger-color);
}

</style>
