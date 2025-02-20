<script setup>
import {useRoute} from "vue-router";
import {UIModal, UIPageContent} from "@/components/index.js";
import {useExamAttemptStore} from "@/store/modules";
import {Warning20Filled} from "@vicons/fluent";
import QuestionList from './ui/QuestionList.vue'

const store = useExamAttemptStore()

const route = useRoute()
onMounted(()=>{
  store.elementId = route.params.exam_id
  store._start_attempt()
})

</script>
<template>
  <n-spin :show="store.loading">
    <div class="h-full flex flex-col sm:flex-row">
      <div class="flex-grow overflow-y-auto ">
        <QuestionList />
      </div>
      <n-divider vertical />
      <div class="flex shrink-0 grow-1 flex-col basis-[200px] md:basis-[300px] xl:basis-[400px]">
        <div class="flex-grow grid gap-2 grid-cols-[repeat(auto-fill,30px)] grid-rows-[repeat(auto-fill,30px)]">
          <n-anchor-link v-for="(question, idx) in store.questions" :key="idx" :href="`#question-${idx}`">
            {{idx+1}}
          </n-anchor-link>
        </div>
      </div>
    </div>

  </n-spin>
  <UIModal
      :width="400"
      v-model:visible="store.visible"
  >
    <n-alert type="warning">
      {{$t('solveExamPage.alreadyStarted')}}
    </n-alert>
    <div>
      <n-button>{{$t('content.continue')}}</n-button>
      <n-popover trigger="hover">
        {{$t('solveExamPage.restartWarning')}}
        <template #trigger>
          <n-button>
            {{$t('content.restart')}}
            <template #icon>
              <n-icon :component="Warning20Filled" />
            </template>
          </n-button>
        </template>
      </n-popover>
    </div>
  </UIModal>
</template>