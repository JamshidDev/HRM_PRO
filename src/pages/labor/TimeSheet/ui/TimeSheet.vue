<script setup lang="ts">
import { onMounted, ref } from "vue";
import {TabulatorFull, Tabulator} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css";

const tableRef = ref<HTMLDivElement>(null);
const tableInstance = ref<TabulatorFull>(null);

const columns = [
  { title: "Name", field: "name",  },
  { title: "Age", field: "age" },
  { title: "Country", field: "country" },
  { title: "Action", field: "action" }
];

const data = [
  { id: 1, name: "Alice", age: 25, country: "USA", action: "Delete" },
  { id: 2, name: "Bob", age: 30, country: "UK", action: "Delete" },
  { id: 3, name: "Charlie", age: 28, country: "Canada", action: "Delete" }
];

const initSelectionTable = ()=>{
  if (tableRef.value) {
    if(tableInstance.value){
      tableInstance.value.destroy()
    }
    tableInstance.value = new TabulatorFull(tableRef.value, {
      selectableRange:true,
      selectableRangeColumns:false,
      selectableRangeRows:false,
      selectableRows: false,
      data,
      columns: columns,
      layout: "fitColumns",
      selectableRangeClearCells:true,
      resizableColumnFit: true,
      columnDefaults:{
        headerSort:false,
        resizable:"header",
      },
      height: "500px",
      reactiveData: true,
    });
    tableInstance.value.on('rangeChanged', (range)=>{
      // console.log(range.getCells())

    })
  }
}

const initUnSelectableTable = ()=>{
  if (tableRef.value) {
    if(tableInstance.value){
      tableInstance.value.destroy()
    }
    tableInstance.value = new TabulatorFull(tableRef.value, {
      data,
      columns: columns,
      layout: "fitColumns",
      selectableRangeClearCells:true,
      resizableColumnFit: true,
      columnDefaults:{
        headerSort:false,
        resizable:"header",
      },
      movableRows: true,
      rowHeader:{
        headerSort:false,
        resizable: false,
        minWidth:40,
        width:50,
        rowHandle:true,
        formatter:"handle",
      },
      height: "500px",
      reactiveData: true,
    });
    tableInstance.value.on('rangeChanged', (range)=>{
      // console.log(range.getCells())

    })
  }
}

onMounted(() => {
  initSelectionTable()
});
const tab = ref(1)
const changeMode = (v: number)=>{
  if(v==1){
    initUnSelectableTable()
  }else{
    initSelectionTable()
  }
}
</script>

<template>
  <n-tabs  animated v-model:value="tab" @update-value="changeMode">
    <n-tab-pane :name="1" tab="Select">

    </n-tab-pane>
    <n-tab-pane :name="2" tab="Drag">

    </n-tab-pane>
  </n-tabs>
  <div>
    <div ref="tableRef"></div>
  </div>
</template>

<style>
.tabulator-row .tabulator-cell {
  cursor: pointer;
}
</style>
