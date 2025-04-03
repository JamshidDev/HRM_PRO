<script setup>
import {ArrowSyncCheckmark24Filled, Clock32Filled, Eye12Filled, PlayCircle28Regular} from "@vicons/fluent";
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


const startAttempt = (v) => {
  examStore.elementId = v.id
  examStore._start_attempt()
}
const show = ref(false)
</script>
<template>
  <div class="rounded-md overflow-hidden">
    <div
        :class="{'bg-surface-ground': show}"
        class="cursor-pointer transition-all hover:bg-surface-ground flex justify-between items-center  py-3 px-2"
        @click="show=!!exam.results?.length && !show"
    >
      <div
          class="flex gap-2 items-center w-full"
      >
        <n-button size="large" tertiary type="primary">
          {{ $t('examPage.nMinute', {n: exam.minute}) }}
          <template #icon>
            <n-icon :component="Clock32Filled"/>
          </template>
        </n-button>
        <div>
          <p class="font-bold text-lg">{{ exam.name }}</p>
          <div class="text-secondary flex gap-2 text-xs">
            <span>
              {{ $t('examPage.nVariant', {n: exam.variant}) }}
            </span>
            <span>
              {{ $t('examPage.deadline', {n: Utils.timeWithMonth(exam.deadline)}) }}
            </span>
            <span>
              {{ $t('examPage.nAttempts', {n: exam.chances}) }}
            </span>
            <span>
              {{ $t('examPage.nQuestions', {n: exam.questions_count}) }}
            </span>
          </div>
        </div>
      </div>
      <n-tooltip >
        {{$t('examPage.start')}}
        <template #trigger>
          <n-button
              tertiary
              type="success"
              :loading="examStore.loading && examStore.elementId===exam.id"
              :disabled="(exam.results.findIndex(i=>typeof i.result!='number')!==-1 && !examStore.exam_storage?.[exam.id]) || exam.results.length>=exam.chances"
              @click="startAttempt(exam)"
          >
            <template #icon>
              <n-icon :component="PlayCircle28Regular"/>
            </template>
          </n-button>
        </template>
      </n-tooltip>
    </div>
    <n-collapse-transition :show="show">
      <div class="px-3">
        <p class="text-lg my-2 font-medium">{{ $t('examPage.history') }}</p>
        <div class="flex flex-col gap-2">
          <div v-for="(item, idx) in exam.results" :key="idx"
               class="flex items-center justify-between p-2 bg-surface-ground rounded-md">
            <div class="flex gap-2 items-center">
              <n-button size="small" type="warning"><span class="min-w-[30px]">{{ item?.result || 0 }}</span></n-button>
              <div>
                <p class="text-xl font-semibold">
                  {{ item?.ended ? $t('examPage.finished') : $t('examPage.inProgress') }}</p>
                <p class="text-xs text-secondary">
                  {{ Utils.timeWithMonth(item.created) }} - {{ item.ended ? Utils.timeWithMonth(item.ended) : '...' }}
                </p>
              </div>
            </div>
            <div>
              <n-button v-if="item.result > -1" size="small" tertiary type="info">
                {{ $t('content.view') }}
                <template #icon>
                  <n-icon :component="Eye12Filled"/>
                </template>
              </n-button>
              <n-button
                  v-else
                  :disabled="!examStore.exam_storage?.[item.id]"
                  size="small"
                  tertiary
                  type="warning"
                  @click="goPush(item)"
              >
                {{ $t('content.continue') }}
                <template #icon>
                  <n-icon :component="ArrowSyncCheckmark24Filled"/>
                </template>
              </n-button>
            </div>

          </div>
        </div>
      </div>

      <!--      <n-table-->
      <!--          class="!rounded-t-none"-->
      <!--          v-if="exam.results?.length"-->
      <!--          :single-line="false"-->
      <!--          size="small"-->
      <!--      >-->
      <!--        <thead>-->
      <!--        <tr>-->
      <!--          <th>{{$t('content.number')}}</th>-->
      <!--          <th>{{$t('examPage.startTime')}}</th>-->
      <!--          <th>{{$t('examPage.endTime')}}</th>-->
      <!--          <th>{{$t('examPage.result')}}</th>-->
      <!--          <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>-->
      <!--        </tr>-->
      <!--        </thead>-->
      <!--        <tbody>-->
      <!--        <tr v-for="(item, idx) in exam.results" :key="idx">-->
      <!--          <td>{{idx+1}}</td>-->
      <!--          <td>{{Utils.timeWithMonth(item.created)}}</td>-->
      <!--          <td>{{item.ended && Utils.timeWithMonth(item.ended)}}</td>-->
      <!--          <td>{{item?.result && item?.result}}</td>-->
      <!--          <td class="!text-center">-->
      <!--            <n-button size="small" tertiary type="info" v-if="item.result">-->
      <!--              {{$t('content.view')}}-->
      <!--              <template #icon>-->
      <!--                <n-icon :component="Eye12Filled" />-->
      <!--              </template>-->
      <!--            </n-button>-->
      <!--            <n-button-->
      <!--                size="small"-->
      <!--                tertiary-->
      <!--                type="warning"-->
      <!--                v-else-->
      <!--                :disabled="!examStore.exam_storage?.[item.id]"-->
      <!--                @click="goPush(item)"-->
      <!--            >-->
      <!--              {{$t('content.continue')}}-->
      <!--              <template #icon>-->
      <!--                <n-icon :component="ArrowSyncCheckmark24Filled" />-->
      <!--              </template>-->
      <!--            </n-button>-->
      <!--          </td>-->
      <!--        </tr>-->
      <!--        </tbody>-->
      <!--      </n-table>-->
    </n-collapse-transition>
  </div>
  <!--    <n-collapse-item class="!mt-0 exam-collapse rounded-md border-surface-line border" :name="exam.id">-->
  <!--      <template #header>-->
  <!--        <div class="flex gap-2 items-center w-full p-2 transition-all hover:bg-surface-ground">-->
  <!--          <n-button type="primary" tertiary >-->
  <!--            {{$t('examPage.nMinute', {n: exam.minute})}}-->
  <!--            <template #icon>-->
  <!--              <n-icon :component="Clock32Filled"/>-->
  <!--            </template>-->
  <!--          </n-button>-->
  <!--          <div>-->
  <!--            <p class="font-bold text-lg">{{exam.name}}</p>-->
  <!--              <n-button-group >-->
  <!--                <n-button size="tiny" dashed type="tertiary">-->
  <!--                  {{$t('examPage.nVariant', {n: exam.variant})}}-->
  <!--                  <template #icon>-->
  <!--                    <n-icon :component="AppsList20Filled" />-->
  <!--                  </template>-->
  <!--                </n-button>-->

  <!--                <n-button size="tiny" dashed type="tertiary">-->
  <!--                  {{$t('examPage.deadline', {n: Utils.timeWithMonth(exam.deadline)})}}-->
  <!--                  <template #icon>-->
  <!--                    <n-icon :component="CalendarClock20Filled" />-->
  <!--                  </template>-->
  <!--                </n-button>-->
  <!--                <n-button size="tiny" dashed type="tertiary">-->
  <!--                  {{$t('examPage.nAttempts', {n: exam.chances})}}-->
  <!--                  <template #icon>-->
  <!--                    <n-icon :component="ArrowRepeatAll16Filled" />-->
  <!--                  </template>-->
  <!--                </n-button>-->
  <!--                <n-button size="tiny" dashed type="tertiary">-->
  <!--                  {{$t('examPage.nQuestions', {n: exam.questions_count})}}-->
  <!--                  <template #icon>-->
  <!--                    <n-icon :component="ClipboardBulletListLtr20Filled" />-->
  <!--                  </template>-->
  <!--                </n-button>-->
  <!--              </n-button-group>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--      </template>-->
  <!--    </n-collapse-item>-->

  <!--    <div class="p-2 rounded-md">-->
  <!--      <div class="flex justify-between">-->
  <!--        <n-button-->
  <!--            text-->
  <!--            type="warning"-->
  <!--        >-->
  <!--          <template #icon>-->
  <!--            <n-icon :component="HatGraduation12Filled"></n-icon>-->
  <!--          </template>-->
  <!--          {{ exam.name }}-->
  <!--        </n-button>-->
  <!--        <n-button-->
  <!--            type="primary"-->
  <!--            :loading="examStore.loading && examStore.elementId===exam.id"-->
  <!--            :disabled="exam.results.findIndex(i=>!i.result)!==-1 && !examStore.exam_storage?.[exam.id]"-->
  <!--            @click="startAttempt(exam)"-->
  <!--        >-->
  <!--          {{$t('examPage.start')}}-->
  <!--        </n-button>-->
  <!--      </div>-->
  <!--      <div>-->
  <!--        <p v-if="exam?.description" class="text-sm text-gray-500">{{ exam.description }}</p>-->
  <!--        <div class="flex gap-3 flex-wrap mt-2">-->
  <!--          <n-button-group>-->
  <!--            <n-button size="tiny"  ghost  type="primary">-->
  <!--              {{$t('examPage.variant', {n: exam.variant})}}-->
  <!--              <template #icon>-->
  <!--                <n-icon :component="AppsList20Filled" />-->
  <!--              </template>-->
  <!--            </n-button>-->
  <!--            <n-button size="tiny" ghost  type="warning">-->
  <!--              {{$t('examPage.totalTime', {n: exam.minute})}}-->
  <!--              <template #icon>-->
  <!--                <n-icon :component="DocumentBulletListClock20Filled" />-->
  <!--              </template>-->
  <!--            </n-button>-->
  <!--            <n-button size="tiny" ghost  type="error">-->
  <!--              {{$t('examPage.deadline', {n: Utils.timeWithMonth(exam.deadline)})}}-->
  <!--              <template #icon>-->
  <!--                <n-icon :component="CalendarClock20Filled" />-->
  <!--              </template>-->
  <!--            </n-button>-->
  <!--            <n-button size="tiny" ghost  type="info">-->
  <!--              {{$t('examPage.attempts', {n: exam.chances})}}-->
  <!--              <template #icon>-->
  <!--                <n-icon :component="ArrowRepeatAll16Filled" />-->
  <!--              </template>-->
  <!--            </n-button>-->
  <!--            <n-button size="tiny" ghost  type="success">-->
  <!--              {{$t('examPage.questions', {n: exam.questions_count})}}-->
  <!--              <template #icon>-->
  <!--                <n-icon :component="ClipboardBulletListLtr20Filled" />-->
  <!--              </template>-->
  <!--            </n-button>-->
  <!--          </n-button-group>-->
  <!--        </div>-->
  <!--      </div>-->
  <!--      <n-collapse-transition v-if="exam.results.length" class="mt-3 overflow-y-auto" :show="showHistory">-->
  <!--        <n-table-->
  <!--            :single-line="false"-->
  <!--            size="small"-->
  <!--        >-->
  <!--          <thead>-->
  <!--          <tr>-->
  <!--            <th>{{$t('content.number')}}</th>-->
  <!--            <th>{{$t('examPage.startTime')}}</th>-->
  <!--            <th>{{$t('examPage.endTime')}}</th>-->
  <!--            <th>{{$t('examPage.result')}}</th>-->
  <!--            <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>-->
  <!--          </tr>-->
  <!--          </thead>-->
  <!--          <tbody>-->
  <!--          <tr v-for="(item, idx) in exam.results" :key="idx">-->
  <!--            <td>{{idx+1}}</td>-->
  <!--            <td>{{Utils.timeWithMonth(item.created)}}</td>-->
  <!--            <td>{{item.ended && Utils.timeWithMonth(item.ended)}}</td>-->
  <!--            <td>{{item?.result && item?.result}}</td>-->
  <!--            <td class="!text-center">-->
  <!--              <n-button size="small" tertiary type="info" v-if="item.result">-->
  <!--                {{$t('content.view')}}-->
  <!--                <template #icon>-->
  <!--                  <n-icon :component="Eye12Filled" />-->
  <!--                </template>-->
  <!--              </n-button>-->
  <!--              <n-button-->
  <!--                  size="small"-->
  <!--                  tertiary-->
  <!--                  type="warning"-->
  <!--                  v-else-->
  <!--                  :disabled="!examStore.exam_storage?.[item.id]"-->
  <!--                  @click="goPush(item)"-->
  <!--              >-->
  <!--                {{$t('content.continue')}}-->
  <!--                <template #icon>-->
  <!--                  <n-icon :component="ArrowSyncCheckmark24Filled" />-->
  <!--                </template>-->
  <!--              </n-button>-->
  <!--            </td>-->
  <!--          </tr>-->
  <!--          </tbody>-->
  <!--        </n-table>-->
  <!--      </n-collapse-transition>-->
  <!--      <div class="flex justify-center mt-3" v-if="exam.results.length">-->
  <!--        <n-button size="small" quaternary @click="showHistory=!showHistory">-->
  <!--          <template #icon>-->
  <!--            <div class="transition-all" :class="{'rotate-180': showHistory}">-->
  <!--              <n-icon :component="ChevronDown12Filled"/>-->
  <!--            </div>-->
  <!--          </template>-->
  <!--        </n-button>-->
  <!--      </div>-->
  <!--    </div>-->
</template>
<style lang="scss">
.exam-collapse {
  .n-collapse-item__header {
    margin: 0 !important;
    padding: 0 !important;
  }
}

.exam {
  &__card {
    border: 1px solid var(--secondary-color);
    border-radius: 8px;
    padding: 12px;
  }
}
</style>