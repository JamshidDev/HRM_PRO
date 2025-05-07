<script setup>
import {useExportStore, useWorkerStore} from '@/store/modules';
import {onMounted} from 'vue';
import {VueDraggable} from 'vue-draggable-plus'
import {ArrowMove20Regular, DocumentTable16Regular} from '@vicons/fluent'

const store = useExportStore()
const workerStore = useWorkerStore()
const toggleItem = (v) => {
  if (store.payload.columns.find(i => i.column == v.column)) {
    store.payload.columns = store.payload.columns.filter(i => i.column != v.column);
  } else {
    store.payload.columns.push(v);
  }
}

const toggleAll = ()=>{
  if(!(store.payload.columns?.length === store.columns.length)){
    store.columns.forEach(i=>{
      if(!store.payload.columns.find(j=>j.column===i.column)){
        store.payload.columns.push(i)
      }
    })
  }else{
    store.payload.columns = []
  }
}

onMounted(() => {
  store.resetPayload()
  store._columns()
})

const onSubmit = () => {
  store._export_workers(workerStore._params())
}

</script>
<template>
  <n-spin :content-style="{width: '100%'}" :show="store.loading">
    <div class="flex flex-col md:flex-row w-full" style="height: calc(100vh - 120px);max-height: calc(100vh - 120px);">
      <div class="p-2 border-b md:border-b-0 md:border-r border-surface-line basis-auto md:basis-[70%] shrink-0 grow overflow-auto">
        <div class="w-full h-full overflow-auto">

        <VueDraggable v-if="store.payload.columns.length" data-id-attr="column" :animation="150"
                      v-model="store.payload.columns" target=".sort-target">
          <n-table :single-line="false" size="small" class="select-none">
            <thead>
            <tr class="sort-target">
              <th class="cursor-move" v-for="(header, idx) in store.payload.columns" :key="header.column">
                <div class="flex justify-between">
                  <p>{{ idx + 1 }}) {{ header.label }}</p>
                  <n-button class="cursor-move!" size="tiny" quaternary type="primary">
                    <template #icon>
                      <n-icon :component="ArrowMove20Regular"/>
                    </template>
                  </n-button>
                </div>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="i in 3" :key="i">
              <td v-for="header in store.payload.columns" :key="header.column">
                &nbsp;
              </td>
            </tr>
            </tbody>
          </n-table>
        </VueDraggable>
        </div>
      </div>
      <div class="p-2 shrink-0 md:h-full overflow-y-auto basis-auto">
        <ul class="flex md:block gap-2 flex-wrap w-full">
          <li
              class="rounded-lg transition-all hover:bg-blue-50 cursor-pointer flex gap-2 items-center p-1">
            <n-checkbox :checked="store.payload.columns?.length === store.columns.length" @update:checked="toggleAll"/>
            <p class="text-nowrap">{{ $t('exportPage.checkAll') }}</p>

          </li>
          <li v-for="(item, idx) in store.columns" @click="toggleItem(item)"
              class="rounded-lg transition-all hover:bg-blue-50 cursor-pointer flex gap-2 items-center p-1"
              :key="idx">

            <n-checkbox :checked="!!store.payload.columns.find(i => i.column == item.column)"/>
            <p class="text-nowrap">{{ item.label }}</p>

          </li>
        </ul>
      </div>
    </div>
    <n-space justify="end" class="mt-2">
      <n-button
          icon-placement="right"
          @click="onSubmit" type="primary" :loading="store.loading"
      >
        <template #icon>
          <n-icon :component="DocumentTable16Regular"/>
        </template>
        {{ $t('exportPage.exportAction') }}
      </n-button>
    </n-space>
  </n-spin>
</template>