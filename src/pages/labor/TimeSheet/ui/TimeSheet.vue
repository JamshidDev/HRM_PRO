<script setup>
import {onMounted, ref, computed} from 'vue';
import {VueDraggable} from 'vue-draggable-plus';
import {LineHorizontal320Filled} from "@vicons/fluent";
import {vOnClickOutside} from "@vueuse/components"
import {useComponentStore, useTimesheetWorkerStore} from "@/store/modules/index.js";
import {UIPagination, UIUser} from "@/components/index.js";
import {Dismiss12Regular, Save20Filled} from '@vicons/fluent'
import dayjs from "dayjs";

const store = useTimesheetWorkerStore()
const compStore = useComponentStore()
const isDragging = ref(false);
const start = ref(null);
const end = ref(null);
const selectedCells = ref([]);
onMounted(() => {
  if(compStore.timesheetTypes.length === 0){
    compStore._timesheetEnums()
  }
});

const isCellSelected = (row, col) => {
  return selectedCells.value.some(cell => cell.row === row && cell.col === col);
};

const resetSelection = () => {
  selectedCells.value = [];
  start.value = null;  // Reset start
  end.value = null;    // Reset end
  console.log("reset")
};

const generator = (start, end) => {
  const res = [];
  const rowStart = Math.min(start.row, end.row);
  const rowEnd = Math.max(start.row, end.row);
  const colStart = Math.min(start.col, end.col);
  const colEnd = Math.max(start.col, end.col);

  for (let row = rowStart; row <= rowEnd; row++) {
    for (let col = colStart; col <= colEnd; col++) {
      res.push({row, col});
    }
  }
  return res;
};

const handleMouseDown = (e) => {
  isDragging.value = true;
  const {col, row} = e.target.dataset;
  const cell = {row: Number(row), col: Number(col)};

  resetSelection();
  selectedCells.value = [cell];

  start.value = cell;
  end.value = cell;
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  const {col, row} = e.target.dataset;
  end.value = {row: Number(row), col: Number(col)};

  selectedCells.value = generator(start.value, end.value);
};

const handleMouseUp = () => {
  isDragging.value = false;
  start.value = null;  // Reset start
  end.value = null;    // Reset end
};

const handleMouseLeave = () => {
  isDragging.value = false;
  start.value = null;  // Reset start
  end.value = null;    // Reset end
};


const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

</script>

<template>
  <div class="h-full flex flex-col  p-8">
    <div class="flex my-2 justify-between  items-center shrink-0 gap-2">
      <div class="flex gap-2">
        <n-button tertiary v-if="!store.loading">
          {{dayjs().month(store.month).year(store.year).format("YYYY MMMM")}}
        </n-button>
        <n-button dashed v-if="!store.loading">
          {{store.department}}
        </n-button>
      </div>
      <div class="flex gap-2">
        <n-form class="flex gap-2 max-w-[450px]">
          <n-grid :cols="4" :x-gap="10">
            <n-form-item-gi :span="3" :show-label="false" :show-feedback="false">
              <n-select
                  :loading="compStore.timesheetEnumsLoading"
                  :options="compStore.timesheetTypes"
                  v-model:value="store.payload.status"
                  label-field="name"
                  value-field="id"
              />

            </n-form-item-gi>
            <n-form-item-gi :span="1" :show-label="false" :show-feedback="false">
              <n-input-number
                  :min="0"

                  v-model:value="store.payload.hours"
                  :placeholder="$t('timeSheetPage.hours')"
              />
            </n-form-item-gi>
          </n-grid>
<!--          <n-button type="primary" >-->
<!--            {{$t('content.save')}}-->
<!--            <n-icon class="ml-2" :component="Save20Filled"/>-->
<!--          </n-button>-->
        </n-form>
        <n-button type="error" @click="store.visible = false">
          <template #icon>
            <n-icon :component="Dismiss12Regular" />
          </template>
        </n-button>
      </div>
    </div>
    <n-spin :show="store.loading" class="flex-grow ">
      <div class="overflow-x-auto">
          <VueDraggable
                v-model="store.list"
                :animation="150"
                :onStart="resetSelection"
                handle=".handle"
                target=".sort-target"

            >
              <table
                  class="relative"
                  @mouseleave="handleMouseLeave">
                <thead>
                <tr>
                  <th></th>
                  <th>{{$t('content.worker')}}</th>
                  <th
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
                  <th class="sticky right-[-1px]">{{$t('timeSheetPage.total')}}</th>
                </tr>
<!--                <tr>-->
<!--                  <th></th>-->
<!--                  <th>Name</th>-->
<!--                  <th-->
<!--                      v-for="day in store.days"-->
<!--                      :key="day.day"-->
<!--                      :class="{'weekend': day.weekDay === 0 || day.weekDay === 6}"-->
<!--                  >{{   }}</th>-->
<!--                  <th class="sticky right-0 h-full">{{$t('timeSheetPage.total')}}</th>-->
<!--                </tr>-->
                </thead>
                <tbody class="sort-target">
                <tr v-for="(item, row) in store.list" :key="row">
                  <td class="cursor-move w-[35px] min-w-[35px]">
                    <div class="h-full w-full justify-center items-center flex">
                      <n-icon :component="LineHorizontal320Filled" class="handle"/>
                    </div>
                  </td>
                  <td>
                      <UIUser
                          short
                        :roundAvatar="false"
                        :short="false"
                        :data="{
                          fullName: item.name,
                          photo: item.photo,
                          position: item.position
                        }"
                          class="mx-auto"
                      />
                  </td>
                  <td
                      v-for="(day, col) in item.days"
                      :key="col"
                      :class="{
                        start: start?.row === row && start?.col === col,
                        selected: isCellSelected(row, col)
                      }"
                      :data-col="col"
                      :data-row="row"
                      @mousedown="handleMouseDown"
                      @mousemove="handleMouseMove"
                      @mouseup="handleMouseUp"
                      class="h-[35px] w-[35px] max-h-[35px] min-w-[35px]"
                  >
                    {{ day?.hours}}
                  </td>
                  <td class="sticky right-0">{{ item.total }}</td>
                </tr>

                </tbody>
              </table>
            </VueDraggable>
      </div>
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
/* General Table Styling */
table {
  width: 100%;
  background: #fff;
  user-select: none;
  border: 1px solid #d1d5db;
  border-collapse: separate;
  border-spacing: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* Table Header */
th {
  background: #f3f4f6; /* Light gray background */
  color: #333; /* Dark text */
  font-weight: 600;
  border-bottom: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  text-transform: uppercase;
}

/* Table Rows */
td {
  text-align: center;
  outline: 1px solid #e5e7eb;
  transition: background 0.2s ease-in-out;
}


/* Hover Effect */
tr:hover td {
  background: #f9fafb;
}

/* Selected Cell */
.selected {
  background: #e0e7ff;
  outline: 1px solid #6366f1;
  border: none;
}

td:last-child {
  font-weight: 600;
  background: #f8fafc;
  outline: 1px solid #e5e7eb;
}

/* Make numbers more readable */
th, td {
  font-size: 14px;
  font-family: "Inter", sans-serif;
  white-space:  nowrap;
}

.weekend {
  background: rgba(255, 0, 0, 0.1); /* Light red background */
  font-weight: bold;
  color: red;
}
</style>
