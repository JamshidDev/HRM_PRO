<script setup>
import QuestionList from './ui/QuestionList.vue'
import {useRoute, useRouter} from "vue-router";
import {useCategoryQuestionStore} from "@/store/modules";
import {UIPageContent, UIPageFilter} from "@/components/index.js";
import {AppPaths} from "@/utils/index.js";
import {UIModal} from "@/components/index.js"
import QuestionForm from './ui/QuestionForm.vue'
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const route = useRoute()
const router = useRouter()
const store = useCategoryQuestionStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.examCategoriesRead)) return
  store.resetData()
  store.category_id = route.params.category_id
  store._index()
})

const onSearch = ()=>{
  if(!accStore.checkAction(accStore.pn.examCategoriesRead)) return
  store.resetData()
  store.params.page = 1
  store._index()
}

const onAdd=()=>{
  if(!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
  store.visibleType = true
  store.visible = true
}

const goBack = ()=>{
  router.push(`${AppPaths.Attestation}${AppPaths.Category}`)
}

</script>
<template>
  <UIPageContent>
    <UIPageFilter
        v-model:search="store.params.search"
        @onSearch="onSearch"
        :show-filter-button="false"
        @on-add="onAdd"
        :show-search-input="false"
    >
      <template #filterAction>
        <n-button type="error" @click="goBack">
          {{$t('content.goToList')}}
        </n-button>
      </template>
      <template #filterSearch>
        <div class="flex flex-col">
          <p class="font-semibold inline-block text-textColor2">{{$t('questionPage.title')}}</p>
          <span class="text-xs text-primary">{{$t('content.total', {n: store.totalItems})}}</span>
        </div>
      </template>

    </UIPageFilter>
    <QuestionList class="mt-3" />
    <UIModal
        :width="1300"
        :title="store.visibleType ? $t('categoryPage.addQuestion') : $t('categoryPage.editQuestion')"
        v-model:visible="store.visible"
    >
      <QuestionForm />
    </UIModal>
  </UIPageContent>
</template>