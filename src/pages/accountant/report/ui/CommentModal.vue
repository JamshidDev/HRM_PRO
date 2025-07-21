<script setup>
import {UIModal} from "@/components/index.js"
import {useUploadReportStore} from "@/store/modules/index.js"
import {Warning20Filled} from "@vicons/fluent"


const store = useUploadReportStore()
</script>

<template>
  <UIModal
      :width="600"
      :visible="store.commentVisible"
      @update:visible="(v)=>store.commentVisible = v"
      :title="$t('uploadReport.form.comment')"
  >
    <div class="flex flex-col  text-danger rounded-b-lg p-2 overflow-auto h-[calc(100vh-200px)]">
      <template v-for="(item,idx) in store.commentContent?.toString()?.split('.')" :key="idx">
        <span v-if="item" class="w-full p-2 bg-danger/2 mb-2 rounded-2xl flex gap-2 items-center">
          <n-icon size="20">
            <Warning20Filled/>
          </n-icon>
          {{item}}</span>
      </template>
    </div>
  </UIModal>
</template>
