<script setup>
import {useCategoryQuestionStore} from "@/store/modules";
import {NoDataPicture, UIEditorViewer, UIMenuButton} from "@/components/index.js";
import {useRoute, useRouter} from "vue-router";

const store = useCategoryQuestionStore()

const handleLoad = () => {
  console.log("load")
  if (store.list.length < store.totalItems && !store.loading) {
    store.params.page++;
    store._index()
  }
}

const onClickAction = (v) => {
  if (v.key === 'edit') {
    store.visibleType = false
    store.visible = true
    store.elementId = v.data.id
    store._show()
  } else if (v.key === 'delete') {
    store.elementId = v.data.id
    store._delete()
  }
}

</script>
<template>
  <n-spin :show="store.loading && !store.list.length">
    <n-infinite-scroll v-if="store.list.length" style="max-height: calc(100vh - 180px);" :distance="20" @load="handleLoad">

      <div
          v-for="i in store.list"
          :key="i"
          class="border bg-surface-section group mb-3 rounded-lg border-surface-line p-2 shadow-blue-50 drop-shadow-xs relative"
      >
        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100"
             :class="{'opacity-100': (i.id===store.elementId && store.deleteLoading)}">
          <n-spin size="small" v-if="i.id===store.elementId && store.deleteLoading"/>
          <UIMenuButton v-else :data="i" @select-ev="onClickAction" show-edit/>
        </div>
        <UIEditorViewer :html="i.ques"></UIEditorViewer>
        <n-divider/>
        <template
            v-for="(option, idx) in i.options"
            :key="idx"
        >
          <div class="flex gap-2 p-2">
            <n-radio :checked="!!option.is_correct"/>
            <UIEditorViewer
                :html="option.text"
            />
          </div>
        </template>
      </div>

    </n-infinite-scroll>
    <NoDataPicture class="mt-0!" v-if="store.list.length===0 && !store.loading"/>
  </n-spin>
</template>
<style lang="scss" scoped>

</style>