<script setup>
import {useRoute, useRouter} from 'vue-router';
import {UIModal} from "@/components/index.js";
import {useExamAttemptStore} from "@/store/modules";
import QuestionCard from './ui/Question.vue'
import Utils from "@/utils/Utils.js";
import {AppPaths} from "@/utils/index.js";
import VueCountdown from '@chenfengyuan/vue-countdown'
import {Flag20Filled} from "@vicons/fluent";

const store = useExamAttemptStore()
const router = useRouter()
const route = useRoute()
onMounted(() => {
  store.elementId = route.params.exam_id
  store._config_localstorage()
  store._attempt()
})


const goBack = () => {
  router.push(Utils.routeLmsPathMaker(AppPaths.Exam))
}

const continueAttempt = () => {
  store.continueVisible = false
  store.isNewAttempt = false
  store._attempt()
}

const restartAttempt = () => {
  store.isNewAttempt = true
  store._attempt()
}

</script>
<template>
  <div class="h-full">
    <n-spin :show="store.loading" class="h-full">
      <div class="h-full flex flex-col sm:flex-row gap-3">
        <div class="flex flex-col gap-3 flex-grow overflow-y-auto p-3 scroll-smooth question__section">
          <div class="shrink-0 bg-surface-section flex p-3 gap-3 flex-wrap">
            <div class="shrink-0 flex justify-center items-center flex-grow">
              <img :src="store.worker_detail.user.photo" alt="img" class="h-[200px] object-contain rounded-md">
            </div>
            <n-table class="flex-grow-[2] shrink-0 basis-[230px]" size="small">
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
            </n-table>

            <n-table class="flex-grow-[2] shrink-0 basis-[230px]" size="small">
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
            class="bg-surface-section flex shrink-0 grow-1 flex-col basis-[200px] md:basis-[300px] xl:basis-[400px] p-3">
          <div class="flex justify-between items-center">
            <vue-countdown
                v-slot="{ days, hours, minutes, seconds }"
                :time="60 * 60 * 1000"
                :transform="(v)=>{
                  Object.entries(v).map(([key, val])=>{
                    v[key] = val < 10 ? `0${val}` : val;
                  })
                  return v
                }"
            >
              <div class="text-xl font-bold flex">
                <p class="py-1 px-2 drop-shadow-lg border-secondary border rounded-md">
                  {{ hours }}
                </p>
                <p class="py-1 px-2">
                  :
                </p>
                <p class="py-1 px-2 drop-shadow-lg border-secondary border rounded-md">
                  {{ minutes }}
                </p>
                <p class="py-1 px-2">
                  :
                </p>
                <p class="py-1 px-2 drop-shadow-lg border-secondary border rounded-md">
                  {{ seconds }}
                </p>
              </div>
            </vue-countdown>
          </div>
          <n-divider/>
          <div
              class="flex-grow grid gap-2 grid-cols-[repeat(auto-fill,minmax(40px,1fr))] grid-rows-[repeat(auto-fill,40px)]">
            <a v-for="(question, idx) in store.questions"
               :key="idx" :class="{'bg-primary text-white': !!question.result}"
               :href="`#question-${idx+1}`" class="text-lg flex justify-center items-center bg-surface-section border border-secondary drop-shadow-lg rounded-lg">
              {{ idx + 1 }}
            </a>
          </div>
          <div>
            <n-button block size="large" type="primary">
              {{ $t('content.finish') }}
              <template #icon>
                <n-icon :component="Flag20Filled"/>
              </template>
            </n-button>
          </div>
        </div>
      </div>
    </n-spin>
        <UIModal
            :width="500"
            v-model:visible="store.continueVisible"
            :title="$t('content.warning')"
            @update:visible="goBack"
            @click:close="goBack"
            persistent
        >
          <n-alert type="warning">
            {{$t('solveExamPage.alreadyStarted')}}
          </n-alert>
          <div class="flex items-center gap-3 justify-end mt-3">
            <n-button @click="continueAttempt" type="primary">{{$t('content.yes')}}</n-button>
            <n-button type="warning">
              {{$t('content.restart')}}
              <template #icon>
                <n-icon :component="Warning20Filled" />
              </template>
            </n-button>
          </div>
        </UIModal>
    <UIModal
        v-model:visible="store.notPermittedVisible"
        :title="$t('content.error')"
        :width="500"
        persistent
        @click:close="goBack"
        @update:visible="goBack"
    >
      <n-alert type="error">
        {{ $t('solveExamPage.notAllowed') }}
      </n-alert>
      <div class="flex items-center gap-3 justify-end mt-3">
        <n-button type="primary" @click="goBack">{{ $t('content.return') }}</n-button>
      </div>
    </UIModal>

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