<script setup>
import {
  AppsList20Filled, ArrowRepeatAll16Filled,
  CalendarClock20Filled, ChevronDown12Filled, ClipboardBulletListLtr20Filled,
  DocumentBulletListClock20Filled,
  HatGraduation12Filled,
  Eye12Filled,
  ArrowSyncCheckmark24Filled
} from "@vicons/fluent";
import Utils from "@/utils/Utils.js";
import {useRouter} from "vue-router";
import {useExamAttemptStore} from "@/store/modules";

const router = useRouter()
const examStore = useExamAttemptStore()

defineProps({
  exam: {
    type: Object,
    required: true
  }
})

const showHistory = ref(false)

const goPush = (v) => {
  router.push({
    name: 'solve_exam',
    params: {
      exam_id: v.id
    }
  })
}


const startAttempt = (v)=>{
  examStore.elementId = v.id
  if(v.results.findIndex(i=>!i.result) !== -1){
    examStore.continueVisible = true
  }else{
    examStore._start_attempt(goPush)
  }
}

</script>
<template>
    <div class="bg-surface-section p-2 rounded-md">
      <div class="flex justify-between">
        <n-button
            text
            type="warning"
        >
          <template #icon>
            <n-icon :component="HatGraduation12Filled"></n-icon>
          </template>
          {{ exam.name }}
        </n-button>
        <n-button
            type="primary"
            :loading="examStore.loading && examStore.elementId===exam.id"
            :disabled="exam.results.findIndex(i=>!i.result)!==-1 && !examStore.exam_storage?.[exam.id]"
            @click="startAttempt(exam)"
        >
          {{$t('examPage.start')}}
        </n-button>
      </div>
      <div>
        <p v-if="exam?.description" class="text-sm text-gray-500">{{ exam.description }}</p>
        <div class="flex gap-3 flex-wrap mt-2">
          <n-button size="small" dashed type="primary">
            {{$t('examPage.variant', {n: exam.variant})}}
            <template #icon>
              <n-icon :component="AppsList20Filled" />
            </template>
          </n-button>
          <n-button size="small" dashed type="warning">
            {{$t('examPage.totalTime', {n: exam.minute})}}
            <template #icon>
              <n-icon :component="DocumentBulletListClock20Filled" />
            </template>
          </n-button>
          <n-button size="small" dashed type="error">
            {{$t('examPage.deadline', {n: Utils.timeWithMonth(exam.deadline)})}}
            <template #icon>
              <n-icon :component="CalendarClock20Filled" />
            </template>
          </n-button>
          <n-button size="small" dashed type="info">
            {{$t('examPage.attempts', {n: exam.chances})}}
            <template #icon>
              <n-icon :component="ArrowRepeatAll16Filled" />
            </template>
          </n-button>
          <n-button size="small" dashed type="success">
            {{$t('examPage.questions', {n: exam.questions_count})}}
            <template #icon>
              <n-icon :component="ClipboardBulletListLtr20Filled" />
            </template>
          </n-button>
        </div>
      </div>
      <n-collapse-transition v-if="exam.results.length" class="mt-3 overflow-y-auto" :show="showHistory">
        <n-table
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th>{{$t('content.number')}}</th>
            <th>{{$t('examPage.startTime')}}</th>
            <th>{{$t('examPage.endTime')}}</th>
            <th>{{$t('examPage.result')}}</th>
            <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in exam.results" :key="idx">
            <td>{{idx+1}}</td>
            <td>{{Utils.timeWithMonth(item.created)}}</td>
            <td>{{item.ended && Utils.timeWithMonth(item.ended)}}</td>
            <td>{{item?.result && item?.result}}</td>
            <td class="!text-center">
              <n-button size="small" tertiary type="info" v-if="item.result">
                {{$t('content.view')}}
                <template #icon>
                  <n-icon :component="Eye12Filled" />
                </template>
              </n-button>
              <n-button
                  size="small"
                  tertiary
                  type="warning"
                  v-else
                  :disabled="!examStore.exam_storage?.[item.id]"
                  @click="goPush(item)"
              >
                {{$t('content.continue')}}
                <template #icon>
                  <n-icon :component="ArrowSyncCheckmark24Filled" />
                </template>
              </n-button>

            </td>
          </tr>
          </tbody>
        </n-table>
      </n-collapse-transition>
      <div class="flex justify-center mt-3" v-if="exam.results.length">
        <n-button quaternary @click="showHistory=!showHistory">
          <template #icon>
            <div class="transition-all" :class="{'rotate-180': showHistory}">
              <n-icon :component="ChevronDown12Filled"/>
            </div>
          </template>
        </n-button>
      </div>
    </div>
</template>
<style scoped lang="scss">
.exam {
  &__card{
    border: 1px solid var(--secondary-color);
    border-radius: 8px;
    padding: 12px;
  }
}
</style>