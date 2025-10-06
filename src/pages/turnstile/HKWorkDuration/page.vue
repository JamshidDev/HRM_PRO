<script setup>
import {UIModal, UIPageContent} from "@/components/index.js"
import {Table, Filter, Preview} from "./ui/index.js"
import {useHKWorkDurationStore} from "@/store/modules/index.js"

const store = useHKWorkDurationStore()

</script>

<template>
<UIPageContent>
  <Filter/>
  <Table/>
  <UIModal
      v-model:visible="store.visible"
      :width="1000"
      :title="$t('turnstile.workDurationPage.calendarTitle')">
    <Preview/>
  </UIModal>
</UIPageContent>
</template>
