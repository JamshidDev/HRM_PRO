<script setup>
import {useComponentStore, useTurnstileOrganizationStore} from "@/store/modules/index.js";
import {Save16Regular} from "@vicons/fluent";

const componentStore = useComponentStore()
const store = useTurnstileOrganizationStore()
const toggleItem = (v) => {
  if (store.payload.terminals.find(i => i === v)){
    store.payload.terminals = store.payload.terminals.filter(i => i !== v)
  } else {
    store.payload.terminals.push(v)
  }
}
</script>
<template>
  <n-spin :show="store.instanceLoading" class="h-full">
    <div class="h-full flex flex-col gap-2">
      <div
          class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 overflow-auto basis-auto grow grid-rows-[repeat(auto-fill,45px)] p-1">
        <div v-for="(item, idx) in componentStore.turnstileTerminalList"
             :key="idx"
             class="rounded-lg px-2 hover:bg-blue-50 transition-all cursor-pointer flex gap-3 items-center bg-surface-section border-surface-line border"
             @click="toggleItem(item.id)"
        >

            <n-checkbox  :checked="(()=>!!store.payload.terminals.find(i=>i===item.id))()"/>
            <div>
              <p class="font-bold text-textColor0">{{ item.name }}</p>
              <p class="text-xs text-textColor2">{{item.building.name}}</p>
            </div>

        </div>
      </div>
      <div class="shrink-0 flex justify-end gap-3">
        <n-button
            class="md:hidden"
            type="error"
            @click="store.payload.organization_id=[]"
        >
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
            :disabled="store.payload.organization_id.length === 0"
            type="primary"
            icon-placement="right"
            @click="store._create()"
            :loading="store.saveLoading"
        >
          <template #icon>
            <n-icon>
              <Save16Regular/>
            </n-icon>
          </template>
          {{ $t('content.save') }}
        </n-button>
      </div>

    </div>
  </n-spin>

</template>