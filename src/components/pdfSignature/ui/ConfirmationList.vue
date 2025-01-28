<script setup>
import {UIUser, UIStatus} from "@/components/index.js"
import {usePdfViewerStore} from "@/store/modules/index.js"
const store = usePdfViewerStore()
</script>

<template>
  <template v-for="(item, idx) in store.confirmations" :key="idx">
    <div class="w-full rounded-xl bg-white mb-1 shadow p-1 relative border border-gray-300 h-[60px]">
      <div class="cursor-pointer absolute bottom-[1px] right-[2px] flex justify-center items-center">
        <UIStatus :status="item.status.name" />

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