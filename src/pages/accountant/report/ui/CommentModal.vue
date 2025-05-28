<script setup>
import {UIModal} from "@/components/index.js"
import {useUploadReportStore} from "@/store/modules/index.js"


const store = useUploadReportStore()
</script>

<template>
  <UIModal
      :width="600"
      :visible="store.commentVisible"
      @update:visible="(v)=>store.commentVisible = v"
      :title="$t('uploadReport.form.comment')"
  >
    <div class="bg-danger/3  text-danger rounded-b-lg p-2 overflow-auto h-[calc(100vh-200px)]">
      <pre class="text-wrap">
        {{store.commentContent}}
      </pre>
    </div>
  </UIModal>
</template>
