<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { UIModal } from '@/components/index.js'
  import { useExamAttemptStore, useExamVideoStore } from '@/store/modules'
  import QuestionCard from './ui/Question.vue'
  import ExamTimer from './ui/ExamTimer.vue'
  import QuestionPalette from './ui/QuestionPalette.vue'
  import ExamInfoDrawer from './ui/ExamInfoDrawer.vue'
  import Utils from '@/utils/Utils.js'
  import CameraApp from '@/pages/attestation/Camera/CameraApp.vue'
  import {
    ChevronCircleLeft32Regular,
    ShieldError16Filled,
    ArrowStepBack16Regular,
    Info16Regular,
    Apps16Regular,
    Warning24Filled,
    Warning16Filled
  } from '@vicons/fluent'
  import dayjs from 'dayjs'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import { onBeforeRouteLeave } from 'vue-router'
  import i18n from '@/i18n/index.js'

  const t = i18n.global.t
  const store = useExamAttemptStore()
  const examVideoStore = useExamVideoStore()
  const router = useRouter()
  const route = useRoute()
  onMounted(() => {
    store.finishLoading = false
    store.result = null
    examVideoStore.workerExamId = null
    examVideoStore.isUnMounted = false
    store.elementId = route.params.exam_id
    store._config_localstorage()
    store._continue_attempt((data) => {
      examVideoStore.examId = data.examId
      examVideoStore.workerExamId = data.workerExamId
      examVideoStore._start()
    })
  })

  const leftTime = computed(() => {
    const endTime = dayjs(store.worker_detail.created).add(store.exam_detail.minute, 'minutes')
    const diff = endTime.diff(dayjs(), 'seconds')
    return diff > 0 ? diff : 0
  })

  const answeredCount = computed(() => store.questions.filter((q) => !!q.result).length)
  const notAnsweredCount = computed(() => store.questions.length - answeredCount.value)
  const progressPercent = computed(() =>
    store.questions.length ? Math.round((answeredCount.value / store.questions.length) * 100) : 0
  )

  const resultPercent = computed(() => {
    const total = store.questions.length
    const correct = Number(store.result?.result) || 0
    return total ? Math.round((correct / total) * 100) : 0
  })
  const scoreColor = computed(() => {
    const v = resultPercent.value
    if (v >= 86) return '#2dcb73'
    if (v >= 56) return '#FDC700'
    return '#E7000A'
  })

  const endWarningVisible = ref(false)
  const infoVisible = ref(false)
  const paletteVisible = ref(false)

  const endAttempt = () => {
    store.finishLoading = true
    store._finish_attempt(() => {
      if (examVideoStore.workerExamId) {
        examVideoStore.stopCanvasRender()
        examVideoStore._stopCameraAndFinishVideo(true, () => {
          store.finishLoading = false
        })
      } else {
        store.finishLoading = false
      }
    })
  }

  const backToList = () => {
    examVideoStore.isFinished = true
    router.push(Utils.routeAttestationPathMaker(AppPaths.Exam))
  }

  const goBack = () => {
    router.push(Utils.routeAttestationPathMaker(AppPaths.Exam))
  }

  const onChangeVisible = (v) => {
    if (!v && !store.result) return
    goBack()
  }

  onUnmounted(() => {
    store.result = null
  })
  onBeforeRouteLeave((to, from, next) => {
    if (!examVideoStore.workerExamId || examVideoStore.isFinished) {
      next()
      return
    }
    const answer = window.confirm(t('content.confirmExit'))
    if (answer) {
      examVideoStore.isUnMounted = true
      examVideoStore.stopCanvasRender()
      examVideoStore._stopCameraAndFinishVideo()
      next()
    } else {
      next(false)
    }
  })
</script>
<template>
  <div class="h-full">
    <UIModal
      :title="store?.result ? $t('examPage.result') : $t('content.warning')"
      :width="460"
      v-model:visible="endWarningVisible"
      @update:visible="onChangeVisible"
      :persistent="true"
    >
      <template #header><span></span></template>

      <n-spin :show="store.finishLoading">
        <!-- Yakunlashni tasdiqlash -->
        <div v-if="!store.result" class="flex flex-col items-center text-center gap-4 px-2 pb-1">
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-warning/10">
            <n-icon :component="Warning24Filled" :size="34" class="text-warning" />
          </div>
          <p class="text-base font-medium text-textColor0">
            {{ $t('solveExamPage.endWarning') }}
          </p>

          <div
            v-if="notAnsweredCount"
            class="w-full flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-left"
          >
            <n-icon :component="Warning16Filled" :size="18" class="shrink-0 mt-0.5 text-warning" />
            <p class="text-sm text-textColor1">
              {{ $t('solveExamPage.notAnswered', { n: notAnsweredCount }) }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 w-full mt-1">
            <n-button class="h-11!" size="large" @click="endWarningVisible = false">
              {{ $t('content.no') }}
            </n-button>
            <n-button class="h-11!" size="large" type="primary" @click="endAttempt">
              {{ $t('content.yes') }}
            </n-button>
          </div>
        </div>

        <!-- Natija -->
        <div v-else class="flex flex-col items-center gap-3 px-2 pb-1">
          <p class="text-lg font-semibold text-textColor0 text-center">
            {{ Utils.combineFullName(store.worker_detail?.user?.worker) }}
          </p>
          <n-progress
            type="circle"
            :percentage="resultPercent"
            :stroke-width="9"
            :color="scoreColor"
            style="width: 150px"
          >
            <div class="flex flex-col items-center">
              <span class="text-4xl font-bold leading-none" :style="{ color: scoreColor }">
                {{ store.result?.result || 0 }}
              </span>
              <span class="text-xs text-textColor3 mt-1">{{ $t('examPage.result') }}</span>
            </div>
          </n-progress>
          <p class="font-medium text-textColor1 text-center">
            {{
              $t('examPage.correctOfTotal', {
                correct: store.result?.result || 0,
                total: store.questions.length
              })
            }}
          </p>
          <div class="w-full rounded-lg bg-surface-ground px-3 py-2.5">
            <p class="text-xs font-medium text-textColor3 text-center mb-2">
              {{ $t('examPage.gradingScale') }}
            </p>
            <div
              class="flex items-center justify-center gap-x-4 gap-y-1.5 flex-wrap text-xs text-textColor2"
            >
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-danger"></span>0–55%
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-warning"></span>56–85%
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-success"></span>86–100%
              </span>
            </div>
          </div>
          <p class="text-danger text-center text-sm">{{ $t('examPage.endHead') }}</p>
          <n-button @click="backToList" class="w-full! h-11! mt-1" size="large" type="primary">
            {{ $t('content.backToList') }}
          </n-button>
        </div>
      </n-spin>
    </UIModal>

    <ExamInfoDrawer
      v-model:visible="infoVisible"
      :exam-detail="store.exam_detail"
      :worker-detail="store.worker_detail"
      :questions-count="store.questions.length"
    />

    <n-drawer v-model:show="paletteVisible" :width="280" placement="right">
      <n-drawer-content :title="$t('solveExamPage.palette')" closable>
        <QuestionPalette :questions="store.questions" root-selector=".question__section" />
      </n-drawer-content>
    </n-drawer>

    <n-spin :show="store.loading" class="h-full">
      <div v-if="store.exam_detail && store.exam_token" class="h-full flex flex-col">
        <!-- Header -->
        <div class="shrink-0 bg-surface-section border-b border-surface-line px-3 py-2 sm:px-5">
          <!-- Row 1: nomzod chip + amallar -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-2 min-w-0 grow">
              <img
                :src="store.worker_detail.user.worker.photo || useAppSetting.noAvailableImage"
                alt="img"
                class="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-surface-line"
              />
              <div class="min-w-0">
                <p
                  class="truncate font-semibold text-textColor0 leading-tight text-sm sm:text-base"
                >
                  {{ Utils.combineFullName(store.worker_detail?.user?.worker) }}
                </p>
                <p class="truncate text-xs text-textColor3 leading-tight">
                  {{ store.exam_detail.name }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <n-button quaternary circle @click="infoVisible = true">
                <template #icon>
                  <n-icon :component="Info16Regular" />
                </template>
              </n-button>

              <n-button class="lg:hidden!" quaternary circle @click="paletteVisible = true">
                <template #icon>
                  <n-icon :component="Apps16Regular" />
                </template>
              </n-button>

              <n-button
                v-if="!store.result"
                @click="endWarningVisible = true"
                type="primary"
                :loading="store.finishLoading"
              >
                {{ $t('content.finish') }}
              </n-button>
              <n-button v-else @click="goBack()" tertiary>
                {{ $t('content.return') }}
                <template #icon>
                  <n-icon :component="ChevronCircleLeft32Regular" />
                </template>
              </n-button>
            </div>
          </div>

          <!-- Row 2: timer + progress (imtihon davom etayotganda) -->
          <div v-if="!store.result" class="flex items-center gap-2 sm:gap-3 mt-2">
            <ExamTimer class="shrink-0" :time="leftTime * 1000" @end="endAttempt" />
            <n-progress
              class="grow"
              type="line"
              :percentage="progressPercent"
              :height="8"
              :border-radius="4"
              :show-indicator="false"
            />
            <span class="shrink-0 text-xs font-medium text-textColor3 whitespace-nowrap">
              {{
                $t('solveExamPage.answeredProgress', {
                  answered: answeredCount,
                  total: store.questions.length
                })
              }}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="grow min-h-0 flex gap-4 p-3 sm:px-5">
          <div class="grow overflow-y-auto scroll-smooth question__section -mx-1 px-1">
            <div class="mx-auto w-full max-w-3xl flex flex-col gap-3 py-1">
              <QuestionCard
                v-for="(question, idx) in store.questions"
                :id="`question-${idx + 1}`"
                :key="idx"
                :question="question"
                :number="idx + 1"
                class="shrink-0"
              />
            </div>
          </div>

          <aside
            class="hidden lg:flex shrink-0 basis-[300px] xl:basis-[340px] bg-surface-section border border-surface-line rounded-xl p-4"
          >
            <QuestionPalette
              class="w-full"
              :questions="store.questions"
              root-selector=".question__section"
            />
          </aside>
        </div>
      </div>

      <div v-else-if="!store.loading" class="h-full w-full flex justify-center items-center">
        <div
          class="bg-surface-section rounded-md p-3 flex flex-col items-center gap-3 border border-surface-line"
        >
          <n-icon class="text-danger" :component="ShieldError16Filled" :size="100" />
          <p class="text-xl font-bold text-center">{{ $t('solveExamPage.notAllowed') }}</p>
          <n-button type="primary" @click="router.back()">
            {{ $t('content.return') }}
            <template #icon>
              <n-icon :component="ArrowStepBack16Regular" />
            </template>
          </n-button>
        </div>
      </div>
    </n-spin>
    <CameraApp />
  </div>
</template>
<style lang="scss" scoped>
  .question__section {
    &::-webkit-scrollbar {
      width: 8px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 5px;
    }

    /* Handle on hover */
    &::-webkit-scrollbar-thumb:hover {
      background: var(--surface-text);
    }
  }
</style>
