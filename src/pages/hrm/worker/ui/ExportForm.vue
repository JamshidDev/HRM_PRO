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

onMounted(() => {
  store.resetPayload()
  store._columns()
})

const onSubmit = () => {
  store._export_workers(workerStore.params)
}

</script>
<template>
  <n-spin :show="store.loading">
    <div class="flex" style="height: calc(100vh - 120px);max-height: calc(100vh - 120px);">
      <div class="p-2 border-r border-surface-line basis-auto grow overflow-auto">
        <VueDraggable v-if="store.payload.columns.length" data-id-attr="column" :animation="150"
                      v-model="store.payload.columns" target=".sort-target">
          <n-table :single-line="false" size="small" class="select-none">
            <thead>
            <tr class="sort-target">
              <th class="cursor-move" v-for="(header, idx) in store.payload.columns" :key="header.column">
                <div class="flex justify-between">
                  <p>{{ idx + 1 }}) {{ header.label }}</p>
                  <n-button class="!cursor-move" size="tiny" quaternary type="primary">
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
      <div class="p-2 shrink-0 h-full overflow-auto">
        <ul>
          <li v-for="(item, idx) in store.columns" @click="toggleItem(item)"
              class="rounded-lg transition-all hover:bg-blue-50 cursor-pointer flex gap-2 items-center p-1"
              :key="idx">

            <n-checkbox :checked="!!store.payload.columns.find(i => i.column == item.column)"/>
            <p>{{ item.label }}</p>

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