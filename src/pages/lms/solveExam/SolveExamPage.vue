<script setup>
import { useRoute, useRouter } from 'vue-router';
import {UIModal, UIPageContent} from "@/components/index.js";
import {useExamAttemptStore} from "@/store/modules";
import {Warning20Filled} from "@vicons/fluent";
import QuestionList from './ui/QuestionList.vue'
import ContinueModal from './ui/Continue.vue'
import NotPermittedModal from './ui/NotPermitted.vue'
import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";

const store = useExamAttemptStore()
const router = useRouter()
const route = useRoute()
onMounted(()=>{
  store.elementId = route.params.exam_id
  store._config_localstorage()
  store._start_attempt()
})

const goBack = ()=>{
  router.push(Utils.routeLmsPathMaker(AppPaths.Exam))
}

</script>
<template>
  <div>

    <n-spin :show="store.loading">
      <div class="h-full flex flex-col sm:flex-row">
        <div class="flex-grow overflow-y-auto ">
          <QuestionList />
        </div>
        <n-divider vertical />
        <div class="flex shrink-0 grow-1 flex-col basis-[200px] md:basis-[300px] xl:basis-[400px]">
          <div class="flex-grow grid gap-2 grid-cols-[repeat(auto-fill,30px)] grid-rows-[repeat(auto-fill,30px)]">
            <a v-for="(question, idx) in store.questions" :key="idx" :href="`#question-${idx}`">
              {{idx+1}}
            </a>
          </div>
        </div>
      </div>
    </n-spin>
    <UIModal
        :width="400"
        v-model:visible="store.continueVisible"
        title="Ogohlantirish"
        @update:visible="goBack"
    >
      <ContinueModal />
    </UIModal>
    <UIModal
        :width="400"
        v-model:visible="store.notPermittedVisible"
        title="Xatolik"
        @update:visible="goBack"
    >
      <NotPermittedModal />
    </UIModal>
    
  </div>
</template>