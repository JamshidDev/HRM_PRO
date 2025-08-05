<script setup>
import {useCategoryQuestionStore} from "@/store/modules";
import {NoDataPicture, UIEditorViewer, UIMenuButton, UIPagination} from "@/components/index.js"
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

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

</script>
<template>
  <n-spin :show="store.loading">

     <div class="h-[calc(100vh-240px)] overflow-auto">
       <div
           v-for="(i, idx) in store.list"
           :key="i"
           class="border bg-surface-section group mb-3 rounded-lg border-surface-line p-2 shadow-blue-50 drop-shadow-xs relative"
       >
         <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100"
              :class="{'opacity-100': (i.id===store.elementId && store.deleteLoading)}">
           <n-spin size="small" v-if="i.id===store.elementId && store.deleteLoading"/>
           <UIMenuButton v-else :data="i" @select-ev="onClickAction" show-edit/>
         </div>
         <p class="font-medium">{{ (store.params.page - 1) * store.params.per_page + idx + 1}}</p>
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
     </div>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />


    <NoDataPicture class="mt-0!" v-if="store.list.length===0 && !store.loading"/>
  </n-spin>
</template>
<style lang="scss" scoped>

</style>