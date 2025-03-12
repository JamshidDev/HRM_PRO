<script setup>
import {onMounted, ref, computed} from 'vue';
import {VueDraggable} from 'vue-draggable-plus';
import {LineHorizontal320Filled} from "@vicons/fluent";
import {vOnClickOutside} from "@vueuse/components"
import {useTimesheetWorkerStore} from "@/store/modules/index.js";
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import {Dismiss12Regular} from '@vicons/fluent'
import dayjs from "dayjs";

const store = useTimesheetWorkerStore()

const data = ref([]);
const loading = ref(true);
const isDragging = ref(false);
const start = ref(null);
const end = ref(null);
const selectedCells = ref([]);
onMounted(() => {
  setTimeout(() => {
    data.value = new Array(12).fill(0).map(() => ({
      name: 'Bob Toxtayev',
      days: new Array(31).fill(0).map((_, idx) => ({
        day: idx + 1,
        hours: Math.floor(Math.random() * 9),
      }))
    }));
    loading.value = false;
  }, 1000);
});

const len = computed(() => data.value?.[0]?.days?.length || 30);

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

</script>

<template>
  <UIPageContent>
    <div class="flex justify-between my-2 items-center">
      <div>
        <n-button tertiary v-if="!store.loading">
          {{dayjs().month(store.month).year(store.year).format("YYYY MMMM")}}
        </n-button>
      </div>
      <div class="flex gap-2">
        <n-button dashed v-if="!store.loading">
          {{store.department}}
        </n-button>
        <n-button type="error" @click="store.visible = false">
          <template #icon>
            <n-icon :component="Dismiss12Regular" />
          </template>
        </n-button>
      </div>
    </div>
    <n-spin :show="store.loading">
      <div class="relative">
        <VueDraggable
            v-model="data"
            :animation="150"
            :onStart="resetSelection"
            handle=".handle"
            target=".sort-target"
        >
          <table
              v-on-click-outside="resetSelection"
              class="w-full rounded-md border border-gray-800"
              @mouseleave="handleMouseLeave">
            <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th v-for="idx in len" :key="idx">{{ idx }}</th>
              <th>Total</th>
            </tr>
            </thead>
            <tbody class="sort-target">
            <tr v-for="(item, row) in data" :key="row">
              <td class="cursor-move">
                <n-icon :component="LineHorizontal320Filled" class="handle"/>
              </td>
              <td>{{ item.name }}</td>
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
              >
                {{ day.hours }}
              </td>
              <td>{{ Math.floor(Math.random() * 30) }}</td>
            </tr>
            </tbody>
          </table>
        </VueDraggable>
      </div>
    </n-spin>
  </UIPageContent>
</template>

<style>

th, td {
  min-width: 30px;
  height: 30px;
  border: 1px solid black;
  text-align: center;
  text-wrap: nowrap;
}

td {
  user-select: none;
}

.selected {
  border: 1px solid blueviolet;
  background: #dca2d9;
}

.start {
  background: #4a5cba;
}
</style>