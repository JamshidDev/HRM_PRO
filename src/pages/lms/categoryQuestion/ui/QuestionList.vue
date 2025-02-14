<script setup>

import {useCategoryQuestionStore} from "@/store/modules";
import {UIEditorViewer, UIMenuButton} from "@/components/index.js";

const store = useCategoryQuestionStore()
const handleLoad = () => {
  if (store.list.length < store.totalItems && !store.loading) {
    store.params.page++;
    store._index()
  }
}

</script>
<template>
  <n-infinite-scroll class="questions-list" @load="handleLoad">
    <div class="questions-list">
      <div
          v-for="i in store.list"
          :key="i"
          class="border group mb-3 rounded-lg overflow-hidden border-secondary p-2 shadow-blue-50 drop-shadow-sm relative"
      >
        <UIMenuButton class="absolute top-3 right-3 opacity-0 group-hover:opacity-100" />
        <UIEditorViewer :html="i.ques"></UIEditorViewer>
        <n-divider/>
        <template
            v-for="(option, idx) in i.options"
            :key="idx"
        >
          <div class="flex gap-2 p-2">
            <n-radio :checked="!!option.is_correct"  />
            <UIEditorViewer
                :html="option.text"
            />
          </div>
        </template>
      </div>
      <div v-if="store.loading" class="flex justify-center">
        <n-spin size="medium"/>
      </div>
    </div>
  </n-infinite-scroll>
</template>
<style lang="scss" scoped>
.questions-list {
  max-height: calc(100vh - 170px);
  height: calc(100vh - 170px);
}
</style>