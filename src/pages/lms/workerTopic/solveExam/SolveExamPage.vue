<script setup>
import {useRoute, useRouter} from 'vue-router';
import {UIModal} from "@/components/index.js";
import {useExamAttemptStore} from "@/store/modules";
import QuestionCard from './ui/Question.vue'
import Utils from "@/utils/Utils.js";
import VueCountdown from '@chenfengyuan/vue-countdown'
import {Flag20Filled, ShieldError16Filled, ArrowStepBack16Regular, DocumentRibbon20Regular} from "@vicons/fluent";
import dayjs from "dayjs";
import {AppPaths} from "@/utils/index.js";

const store = useExamAttemptStore()
const router = useRouter()
const route = useRoute()
onMounted(() => {
  store.elementId = route.params.exam_id
  store._config_localstorage()
  store._continue_attempt()
})


const leftTime = computed(()=>{
  const endTime = dayjs(store.worker_detail.created).add(store.exam_detail.minute, 'minutes')
  const diff = endTime.diff(dayjs(), 'seconds')
  return diff>0 ? diff : 0;
})

const countDown = ref(null)

const endWarningVisible = ref(false)

const endAttempt = ()=>{
  // countDown.value?.pause()
  countDown.value?.abort()
  store._finish_attempt()
}

const goBack = ()=>{
  router.push(Utils.routeLmsPathMaker(AppPaths.Exam))
}

onUnmounted(()=>{
  store.result=null
})

</script>
<template>
  <div class="h-full">
    <UIModal
        :title="store?.result ? $t('examPage.result') : $t('content.warning')"
        :width="500"
        v-model:visible="endWarningVisible"
    >
      <n-spin :show="store.finishLoading">
        <div class="flex flex-col gap-3" v-if="!store.result">
          <p>{{$t('solveExamPage.endWarning')}}</p>
          <n-alert type="warning" v-if="store.questions.findIndex(i=>!i.result)!==-1">
            <p>{{$t('solveExamPage.notAnswered', {n: (()=>{
                let k = 0;
                for(let i of store.questions){
                  k+=!i.result
                }
                return k
              })()})}}</p>
          </n-alert>
          <n-space justify="end">
            <n-button @click="endAttempt" type="primary">{{$t('content.yes')}}</n-button>
            <n-button @click="endWarningVisible=false" type="warning">{{$t('content.no')}}</n-button>
          </n-space>
        </div>
        <div
            v-else
            class="flex items-center flex-col gap-2"
        >
          <n-button size="large" circle type="info" dashed>
            <template #icon>
              <n-icon :component="DocumentRibbon20Regular" />
            </template>
          </n-button>
          <h3 class="text-xl font-bold">{{$t('examPage.endSub', {n: store.result.result})}}</h3>
          <p class="text-primary">{{$t('examPage.endHead')}}</p>
        </div>
      </n-spin>
    </UIModal>
    <n-spin :show="store.loading" class="h-full">
      <div v-if="store.exam_detail && store.exam_token" class="h-full flex flex-col-reverse sm:flex-row gap-3">
        <div class="flex flex-col gap-3 flex-grow overflow-y-auto p-3 scroll-smooth question__section lg:mx-10 xl:mx-20">
          <div class="shrink-0 flex gap-3 flex-wrap">
            <div class="shrink-0 flex items-center justify-center basis-[200px] grow md:grow-0">
              <img :src="store.worker_detail.user.photo" alt="img" class="h-[200px] object-contain rounded-md">
<!--              <img src="https://media.npr.org/assets/img/2017/09/12/macaca_nigra_self-portrait-fd5e770d3e129efe4b0ed6c19271ed29afc807dc.jpg?s=1100&c=50&f=jpeg" alt="img" class="h-[200px] object-contain rounded-md">-->
            </div>
            <n-table class="flex-grow shrink-0 basis-[230px]" size="small">
              <tr>
                <th>{{ $t('solveExamPage.exam') }}</th>
                <td>{{ store.exam_detail.name }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.startedAt') }}</th>
                <td>{{ Utils.timeWithMonth(store.worker_detail.created) }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.firstName') }}</th>
                <td>{{ store.worker_detail.user.first_name }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.lastName') }}</th>
                <td>{{ store.worker_detail.user.last_name }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.middleName') }}</th>
                <td>{{ store.worker_detail.user.middle_name }}</td>
              </tr>
              <template v-if="store.result">
                <tr>
                  <th>{{ $t('examPage.result') }}</th>
                  <td>{{ store.result.result }}</td>
                </tr>
                <tr>
                  <th>{{ $t('examPage.endTime') }}</th>
                  <td>{{ Utils.timeWithMonth(store.result.ended) }}</td>
                </tr>
              </template>
            </n-table>

            <n-table class="flex-grow shrink-0 basis-[230px]" size="small">
              <tr>
                <th>{{ $t('solveExamPage.variant') }}</th>
                <td>{{ store.exam_detail.variant }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.totalTime') }}</th>
                <td>{{ Utils.timeWithMonth(store.exam_detail.minute) }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.deadline') }}</th>
                <td>{{ Utils.timeWithMonth(store.exam_detail.deadline) }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.attempts') }}</th>
                <td>{{ store.exam_detail.chances }}</td>
              </tr>
              <tr>
                <th>{{ $t('solveExamPage.questions') }}</th>
                <td>{{ store.questions.length }}</td>
              </tr>
            </n-table>

          </div>
          <QuestionCard
              v-for="(question, idx) in store.questions"
              :id="`question-${idx+1}`" :key="idx" :question="question"
              class="shrink-0"
          />
        </div>
        <div
            class="bg-surface-section flex shrink-0 grow-1 justify-between sm:flex-col basis-auto md:basis-[300px] xl:basis-[400px] p-3">
          <div class="flex justify-between items-center">
            <vue-countdown
                ref="countDown"
                v-slot="{ hours, minutes, seconds }"
                :time="leftTime * 1000"
                :transform="(v)=>{
                  Object.entries(v).map(([key, val])=>{
                    v[key] = val < 10 ? `0${val}` : val;
                  })
                  return v
                }"
                :on-end="endAttempt"
            >
              <div class="text-xl font-bold flex">
                <p class="py-1 px-2 drop-shadow-lg border-surface-line border rounded-md">
                  {{ hours }}
                </p>
                <p class="py-1 px-2">
                  :
                </p>
                <p class="py-1 px-2 drop-shadow-lg border-surface-line border rounded-md">
                  {{ minutes }}
                </p>
                <p class="py-1 px-2">
                  :
                </p>
                <p class="py-1 px-2 drop-shadow-lg border-surface-line border rounded-md">
                  {{ seconds }}
                </p>
              </div>
            </vue-countdown>
          </div>
          <n-divider class="!hidden sm:!block"/>
          <div
              class="flex-grow gap-2 grid-cols-[repeat(auto-fill,minmax(30px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(40px,1fr))] grid-rows-[repeat(auto-fill,30px)] md:grid-rows-[repeat(auto-fill,40px)] hidden sm:grid">
            <a v-for="(question, idx) in store.questions"
               :key="idx"
               :href="`#question-${idx+1}`"
               class="text-lg flex justify-center items-center bg-surface-section border border-secondary drop-shadow-lg rounded-lg"
               :class="{'!bg-primary text-white': !!question.result}"
            >
              {{ idx + 1 }}
            </a>
          </div>
          <div>
            <n-button
                @click="endWarningVisible=true"
                class="md:!h-14 md:!text-xl"
                block
                size="large"
                tertiary
                type="primary"
                :loading="store.finishLoading"
                v-if="!store.result"
            >
                {{  $t('content.finish') }}
                <template #icon>
                  <n-icon :component="Flag20Filled"/>
                </template>
            </n-button>
            <n-button
                @click="goBack()"
                class="md:!h-14 md:!text-xl"
                block
                size="large"
                tertiary
                type="success"
                v-else
            >
              {{$t('content.return')}}
              <template #icon>
                <n-icon :component="ArrowStepBack16Regular" />
              </template>
            </n-button>
          </div>
        </div>
      </div>
      <div v-else-if="!store.loading" class="h-full w-full flex justify-center items-center">
        <div class="bg-surface-section rounded-md p-3 flex flex-col items-center gap-3 border border-secondary">
          <n-icon class="text-red-700" :component="ShieldError16Filled" :size="100" />
          <p class="text-xl font-bold text-center">{{$t('solveExamPage.notAllowed')}}</p>
          <n-button type="primary" @click="router.back()">
            {{$t('content.return')}}
            <template #icon>
              <n-icon :component="ArrowStepBack16Regular" />
            </template>
          </n-button>
        </div>
      </div>
    </n-spin>
  </div>
</template>
<style lang="scss" scoped>
.question__section {

  &::-webkit-scrollbar {
    width: 8px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 5px;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
</style>