<script setup>
import {useCategoryQuestionStore} from "@/store/modules";
import {NoDataPicture, UIEditorViewer, UIMenuButton} from "@/components/index.js";
import {useRoute, useRouter} from "vue-router";

const store = useCategoryQuestionStore()
const route = useRoute()
const router = useRouter()
const handleLoad = () => {
  if (store.list.length < store.totalItems && !store.loading) {
    store.params.page++;
    store._index()
  }
}

const onClickAction = (v)=>{
  if(v.key==='edit'){
    router.push({
      name: "edit_question",
      params: {
        category_id: route.params.category_id,
        question_id: v.data.id,
      }
    })
  }else if(v.key==='delete'){
    store.elementId = v.data.id
    store._delete()
  }
}

</script>
<template>
  <n-infinite-scroll :distance="10" class="questions-list" @load="handleLoad">
    <div class="questions-list">
      <div
          v-for="i in store.list"
          :key="i"
          class="border bg-surface-section group mb-3 rounded-lg overflow-hidden border-surface-line p-2 shadow-blue-50 drop-shadow-sm relative"
      >
        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100" :class="{'opacity-100': (i.id===store.elementId && store.deleteLoading)}">
          <n-spin size="small" v-if="i.id===store.elementId && store.deleteLoading" />
          <UIMenuButton v-else :data="i" @select-ev="onClickAction" show-edit />
        </div>
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
      <NoDataPicture v-if="store.list.length===0 && !store.loading" />
    </div>
  </n-infinite-scroll>
</template>
<style lang="scss" scoped>
.questions-list {
  max-height: calc(100vh - 170px);
  height: calc(100vh - 170px);
}
</style>