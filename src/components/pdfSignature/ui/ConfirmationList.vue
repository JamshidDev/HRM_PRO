<script setup>

import {HandRight16Filled, Handshake20Filled} from "@vicons/fluent"
import {UIUser} from "@/components/index.js"
import {usePdfViewerStore} from "@/store/modules/index.js"
const store = usePdfViewerStore()
</script>

<template>
  <template v-for="(item, idx) in store.confirmations" :key="idx">
    <div class="w-full rounded-xl bg-white mb-1 shadow p-1 relative border border-gray-300">
      <div :class="idx%2 === 1? 'border-danger' : 'border-success'"  class="w-[24px] shadow cursor-pointer border rounded-full absolute bottom-[4px] right-[4px] flex justify-center items-center">
        <template v-if="idx%2 === 1">
          <n-icon size="20" class="text-danger">
            <HandRight16Filled/>
          </n-icon>
        </template>
        <template v-else>
          <n-icon size="20" class="text-success">
            <Handshake20Filled/>
          </n-icon>
        </template>

      </div>
      <UIUser
          :short="false"
          :data="{
                           photo:item.worker.photo,
                           lastName:item.worker.last_name,
                           firstName:item.worker.first_name,
                           middleName:item.worker.middle_name,
                           position:item.position || $t('content.no-data')
                      }"
      />
    </div>
  </template>
</template>

<style scoped>

</style>