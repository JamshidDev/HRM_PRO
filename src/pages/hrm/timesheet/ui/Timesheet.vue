<script setup>
import {onMounted, ref, computed} from 'vue';
import {VueDraggable} from 'vue-draggable-plus';
import {LineHorizontal320Filled, Add28Filled, AddCircle28Regular, Delete20Filled, ArrowMoveInward20Filled} from "@vicons/fluent";
import {useComponentStore, useTimesheetDepartmentStore, useTimesheetWorkerStore} from "@/store/modules/index.js";
import {UIPagination, UIUser} from "@/components/index.js";
import {Dismiss12Regular, Broom16Filled} from '@vicons/fluent'
import {vScroll} from '@vueuse/components'
import dayjs from "dayjs";
import {NAvatar, NTooltip} from 'naive-ui'
import {useDebounceFn} from "@vueuse/core";
import Utils from "@/utils/Utils.js";


const store = useTimesheetWorkerStore()
const compStore = useComponentStore()
const isDragging = ref(false);
const form = ref(null)
const isAddUserVisible=ref(false)
const addUserSelect = ref(null)

const onAdd = ()=>{
  isAddUserVisible.value = true
  setTimeout(()=>{
    addUserSelect.value?.focus()
  }, 200)
}

onMounted(() => {
  if(compStore.timesheetTypes.length === 0){
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

const canSelectRange = ()=>{
  if(!store.payload.isClearing && store.payload.status==null){
    return false
  }
  if(store.payload.status!=null && compStore.timesheetTypes?.[store.payload.status-1]?.hours && store.payload.hours==null){
    return false
  }
  if(store.payload.status2!=null && compStore.timesheetTypes?.[store.payload.status2-1]?.hours && store.payload.hours2==null){
    return false
  }

  return true
}

const handleMouseDown = (e) => {
  if(canSelectRange()){
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


const changePage = (v)=>{
  store.resetSelection()
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const renderOption = ({ node, option }) =>{
  return [h(NTooltip, {
    delay: 300
  }, {
    trigger: () => node,
    default: () => `${option.name} (${option.key})`
  })]
}


const renderLabel = (option)=>{
  return [
    h('div',{ class:'font-medium text-gray-500'},`${option.name} (${option.key})`),
  ];
}

const checkWorker = useDebounceFn((v)=>{
  store._check_pin(v)
}, 300)

const renderWorkerLabel = (option)=>{
  return [
    h(
        'div',
        {
          class:'flex gap-2 my-1 items-center'
        },[
          h(NAvatar,
              {
                class:'',
                src:option.worker.photo,
                'fallback-src':Utils.noAvailableImage,
              },),
          h('div',{ class:'flex flex-col'}, [
            h('div',{ class:'text-xs font-medium text-gray-500'},`${option.worker.last_name}.${option.worker.first_name[0]}.${option.worker.middle_name[0]}`),
            h('div',{ class:'text-xs text-gray-400'},option.post_name),
          ])
        ]
    ),
  ];
}

</script>

<template>
  <div class="h-full flex flex-col  p-8">
    <div class="flex my-2 justify-between  items-center shrink-0 gap-2">
      <div class="flex gap-2">
<!--        <n-button text>-->
<!--          -->
<!--        </n-button>-->
        <n-button tertiary v-if="store?.month && store?.year">
          {{dayjs().month(store.month).year(store.year).format("YYYY MMMM")}}
        </n-button>
        <n-button dashed v-if="store?.department">
          {{store.department}}
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
          {{$t(`timesheetPage.addNewWorker`)}}</n-button>
        <n-button
            :type="store.payload.isClearing ? 'primary' : 'tertiary'"
            @click="()=>{
              store.payload.isClearing=!store.payload.isClearing
              store.resetStatuses()
            }"
        >
          {{$t('content.clear')}}
          <template #icon>
            <n-icon :component="Broom16Filled" />
          </template>
        </n-button>
        <n-button type="error" @click="store.visible = false">
          {{$t('content.close')}}
          <template #icon>
            <n-icon :component="Dismiss12Regular" />
          </template>
        </n-button>
      </div>
    </div>
    <n-spin :show="store.loading || store.saveLoading" class="flex-grow">
      <div class="overflow-x-auto" v-scroll="[()=>{}, { behavior: 'smooth' }]">
          <VueDraggable
                v-model="store.list"
                :animation="150"
                :onStart="store.resetSelection"
                handle=".handle"
                target=".sort-target"
            >
              <table
                  class="relative"
                  @mouseleave="handleMouseLeave"
              >
                <thead>
                <tr>
                  <th rowspan="3"></th>
                  <th rowspan="3">{{$t('content.worker')}}</th>
                  <th rowspan="3" class="px-3">{{$t('timesheet.name')}}</th>
                  <th rowspan="1" v-if="store.days.length" :colspan="store.days.length">{{$t('timesheetPage.tableTitle')}}</th>
                  <th colspan="4" >{{$t('timesheetPage.worked')}}</th>
                </tr>
                <tr>
                  <th
                      rowspan="2"
                      v-for="day in store.days" :key="day.day"
                      :class="{'weekend': day.weekDay === 0 || day.weekDay === 6}"
                  >
                    <div class="flex flex-col">
                      <p>{{ day.day }}</p>
                      <span class="text-xs">
                        {{dayjs().day(day.weekDay).format('ddd').substring(0, 2)}}
                      </span>
                    </div>
                  </th>
                  <th colspan="2">
                    {{$t('timesheetPage.halfMonth')}}
                  </th>
                  <th colspan=2>
                    {{$t('timesheetPage.total')}}
                  </th>
                </tr>
                <tr>
                  <th>{{$t('date.day')}}</th>
                  <th>{{$t('date.hour')}}</th>
                  <th>{{$t('date.day')}}</th>
                  <th>{{$t('date.hour')}}</th>
                </tr>
<!--                <tr>-->
<!--                  <th></th>-->
<!--                  <th>Name</th>-->
<!--                  <th-->
<!--                      v-for="day in store.days"-->
<!--                      :key="day.day"-->
<!--                      :class="{'weekend': day.weekDay === 0 || day.weekDay === 6}"-->
<!--                  >{{   }}</th>-->
<!--                  <th class="sticky right-0 h-full">{{$t('timesheetPage.total')}}</th>-->
<!--                </tr>-->
                </thead>
                <tbody class="sort-target">
                <tr v-if="isAddUserVisible">
                  <td class="cursor-move w-[35px] min-w-[35px]">
                                        <div class="h-full w-full justify-center items-center flex">
                                          <n-tooltip trigger="hover">
                                            {{$t('content.delete')}}
                                            <template #trigger>
                                            <n-button size="small" quaternary type="error" circle @click="isAddUserVisible=false">
                                              <template #icon>
                                                <n-icon :component="Delete20Filled"/>
                                              </template>
                                            </n-button>
                                            </template>
                                          </n-tooltip>
                                        </div>
                  </td>
                  <td>
                    <n-select
                        :placeholder="$t('timesheetPage.pin')"
                        filterable
                        ref="addUserSelect"
                        show-on-focus
                        @search="checkWorker"
                        :loading="store.pinLoading"
                        :options="store.pinWorkers"
                        value-field="id"
                        @update-value="(_,v)=>{
                          isAddUserVisible=false
                          console.log(v)
                          store._prepend_workers(v)
                        }"
                        label-field="worker"
                        :render-label="renderWorkerLabel"
                        :filter="()=>true"
                    />
                  </td>
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
                  <td class="min-w-[50px] total"></td>
                  <td class="min-w-[50px] total"></td>
                  <td class="min-w-[50px] total"></td>
                  <td class="min-w-[50px] total"></td>
                </tr>
                <tr v-for="(item, row) in store.list" :key="row">
                  <td class="cursor-move w-[35px] min-w-[35px]">
                    <div class="h-full w-full justify-center items-center flex">

                          <n-button circle quaternary size="small">
                            <template #icon>
                              <n-icon :component="LineHorizontal320Filled" class="handle"/>
                            </template>
                          </n-button>

                    </div>
                  </td>
                  <td>
                      <UIUser
                          short
                        :data="{
                          fullName: item.name,
                          photo: item.photo,
                          position: item.position
                        }"
                          class="mx-auto"
                      />
                  </td>
                  <td>{{ item.table }}</td>
                  <td
                      v-for="(day, col) in store.days"
                      :key="col"
                      :class="{
                        selected: isCellSelected(row, col),
                        'selected-ignore': isCellSelected(row, col) && !store.payload.isClearing && item.days[day.day]
                      }"
                      :data-col="col"
                      :data-row="row"
                      @mousedown="handleMouseDown"
                      @mousemove="handleMouseMove"
                      @mouseup="handleMouseUp"
                      class="h-[40px] w-[45px] max-h-[40px] min-w-[45px]"
                  >
                    <div class="flex flex-col">
                      <div class="flex-grow border-b border-surface-line shrink-0">
                        <p v-if="item.days[day.day]?.length">{{item.days[day.day]?.length > 1 ? item.days[day.day].map(i=>i.status).join('/') : item.days[day.day][0].status}}</p>
                      </div>
                      <div class="flex-grow shrink-0">
                        <p class="font-bold" v-if="item.days[day.day]?.length">{{item.days[day.day]?.filter(i=>i?.hours).length > 1 ? item.days[day.day].map(i=>i?.hours).join('/') : (item.days[day.day][0].hours || '&nbsp;')}}</p>
                      </div>
                    </div>
                  </td>
                  <td class="min-w-[50px] total">{{item.halfMonth.days}}</td>
                  <td class="min-w-[50px] total">{{item.halfMonth.hours}}</td>
                  <td class="min-w-[50px] total">{{item.allMonth.days}}</td>
                  <td class="min-w-[50px] total">{{item.allMonth.hours}}</td>
                </tr>

                </tbody>
              </table>
            </VueDraggable>
      </div>
      <n-form ref="form" class="flex gap-2 fixed bottom-8 right-8 left-8">
          <n-grid :cols="8" :x-gap="10">
            <n-form-item-gi :span="3" :show-label="false" :show-feedback="false">
              <n-select
                  :loading="compStore.timesheetEnumsLoading"
                  :options="compStore.timesheetTypes"
                  v-model:value="store.payload.status"
                  :render-label="renderLabel"
                  label-field="name"
                  value-field="id"
                  :render-option="renderOption"
                  :disabled="store.payload.isClearing"
                  @update-value="(_,v)=>{
                      if(!v?.hours) store.payload.hours=null
                    }"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :show-label="false" :show-feedback="false">
              <n-input-number
                  :min="0"
                  :disabled="!(store.payload.status && compStore.timesheetTypes[store.payload.status-1]?.hours)"
                  v-model:value="store.payload.hours"
                  :placeholder="$t('timesheetPage.hours')"
              />
            </n-form-item-gi>
            <n-divider />
            <n-form-item-gi :span="3" :show-label="false" :show-feedback="false">
              <n-select
                  clearable
                  :loading="compStore.timesheetEnumsLoading"
                  :options="compStore.timesheetTypes"
                  v-model:value="store.payload.status2"
                  :render-label="renderLabel"
                  label-field="name"
                  value-field="id"
                  :render-option="renderOption"
                  :disabled="store.payload.isClearing || !store.payload.status"
                  @update-value="(_,v)=>{
                      if(!v?.hours) store.payload.hours2=null
                    }"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="1" :show-label="false" :show-feedback="false">
              <n-input-number
                  :min="0"
                  :disabled="!(store.payload.status2 && compStore.timesheetTypes[store.payload.status2-1]?.hours)"
                  v-model:value="store.payload.hours2"
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
<style scoped>
table {
  width: 100%;
  background: var(--surface-section);
  border: 1px solid var(--surface-line);
  border-collapse: separate;
  border-spacing: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  user-select: none;
}

th {
  background: var(--surface-ground);
  color: var(--textColor0);
  font-weight: 600;
  border-bottom: 1px solid var(--surface-line);
  border-right: 1px solid var(--surface-line);
  text-transform: uppercase;
}

td {
  text-align: center;
  outline: 1px solid var(--surface-line);
  transition: background 0.2s ease-in-out;
}

tr:hover td {
  background: var(--surface-ground);
}

.selected {
  background: rgba(99, 102, 241, 0.2); /* using a light primary tone */
  outline: 1px solid var(--primary-color);
  border: none;
}

.selected-ignore {
  background: transparent;
  opacity: 0.7;
  outline: 1px solid var(--textColor1);
}

.total {
  font-weight: 600;
  background: var(--surface-ground);
}

th, td {
  font-size: 14px;
  font-family: var(--public-sans);
  white-space: nowrap;
}

.weekend {
  background: rgba(255, 0, 0, 0.1); /* kept as rgba red for "weekend" styling */
  font-weight: bold;
  color: var(--danger-color);
}

</style>
