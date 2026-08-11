<script setup>
  import dayjs from 'dayjs'
  import Utils from '@/utils/Utils.js'
  import { NoDataPicture, UIModal, UIPagination } from '@/components/index.js'
  import WarningCameraRecording from '@/pages/attestation/Camera/ui/WarningCameraRecording.vue'
  import {
    useExamAttemptStore,
    useWorkerExamStore,
    useExamVideoStore
  } from '@/store/modules/index.js'
  import { Clock20Filled, Eye16Filled } from '@vicons/fluent'
  import minuteIconUrl from '@/assets/icons/minute.svg?url'
  import finishIconUrl from '@/assets/icons/finish.svg?url'
  import questionIconUrl from '@/assets/icons/question.svg?url'
  import attemptIconUrl from '@/assets/icons/attempt.svg?url'

  const router = useRouter()
  const store = useWorkerExamStore()
  const examStore = useExamAttemptStore()
  const examVideoStore = useExamVideoStore()
  const selectedRowId = ref(null)
  const warningVisible = ref(false)

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onChangeCollapse = (id) => {
    selectedRowId.value = selectedRowId.value === id ? null : id
  }

  const existAttemptCount = (result, changes) => {
    if (result.length >= changes) return 0
    else return changes - result.length
  }

  const isCanContinue = (results) => {
    return results.filter((v) => !v.ended)?.length > 0
  }

  const isCanStart = (results, attempt) => {
    return attempt > results.length && !isCanContinue(results)
  }

  const isRunDevice = (results) => {
    const current = results.filter((v) => !v.ended)
    const id = current[0].id
    if (current.length > 0) {
      return !examStore.exam_storage?.[id]
    } else return false
  }

  const goStart = (v) => {
    examStore.elementId = v.id
    if (v.camera) {
      warningVisible.value = true
    } else {
      examStore._start_attempt()
    }
  }

  const goContinue = (v) => {
    const current = v.results.filter((v) => !v.ended)
    const id = current[0].id
    store.elementId = id
    router.push({
      name: 'solve_exam',
      params: {
        exam_id: id
      }
    })
  }

  // "30-iyun, 10:19" ko'rinishidagi sana — dayjs lokali sozlanmagan bo'lishi mumkinligi
  // uchun oy nomini Utils.getMonthNameById orqali (i18n'dan) olamiz.
  const formatAttemptDate = (date) => {
    const d = dayjs(date)
    if (!date || !d.isValid()) return date || ''
    return `${d.date()}-${Utils.getMonthNameById(d.month() + 1)}, ${d.format('HH:mm')}`
  }

  const viewExam = (v, data, ri) => {
    examStore.isCamera = data.camera
    examStore.visible = true
    examStore.elementId = v.id
    examStore.activeTab = 1
    examStore.viewMeta = {
      examName: data?.name,
      attemptNumber: ri + 1,
      attemptDate: formatAttemptDate(v?.created)
    }
  }

  const onContinueEv = async () => {
    warningVisible.value = false
    await examVideoStore.checkUserMediaDevice(() => {
      examStore._start_attempt()
    })
  }

  // ---- redizayn yordamchilari (faqat ko'rinish uchun) ----
  // Muddatgacha necha kun qolganini hisoblaydi (parse bo'lmasa null qaytaradi)
  const daysLeft = (deadline) => {
    if (!deadline) return null
    const diff = dayjs(deadline).startOf('day').diff(dayjs().startOf('day'), 'day')
    return Number.isNaN(diff) ? null : diff
  }

  // Karta yorlig'i: davom etayotgan urinish bormi, muddatgacha qolgan vaqt yoki tugaganmi
  const statusBadge = (item) => {
    if (isCanContinue(item.results)) {
      return {
        label: 'examPage.inProgress',
        cls: 'text-[var(--exam-badge-yellow-text)] bg-warning/10',
        icon: 'clock'
      }
    }
    if (isCanStart(item.results, item.chances)) {
      const d = daysLeft(item.deadline)
      if (d === null)
        return { label: 'content.start', cls: 'text-primary bg-primary/10', icon: 'clock' }
      if (d < 0)
        return { label: 'accessLevel.expired', cls: 'text-danger bg-danger/10', icon: 'clock' }
      if (d === 0) {
        return {
          label: 'accessLevel.expiresToday',
          cls: 'text-[var(--exam-badge-orange-text)] bg-[var(--exam-badge-orange-bg)]',
          icon: 'minute',
          iconColor: 'var(--exam-badge-orange-text)'
        }
      }
      return {
        label: 'accessLevel.daysLeft',
        params: { days: d },
        cls: 'text-[var(--exam-badge-orange-text)] bg-[var(--exam-badge-orange-bg)]',
        icon: 'minute',
        iconColor: 'var(--exam-badge-orange-text)'
      }
    }
    return {
      label: 'content.finished',
      cls: 'text-[var(--exam-badge-green-text)] bg-[var(--exam-badge-green-bg)]',
      icon: 'finish'
    }
  }

  // Ball foiziga qarab rang bandi (natija doirasi/grading-mezoni bilan izchil)
  const scoreBand = (item, result) => {
    const total = item?.tests_count || 0
    const percent = total ? (Number(result?.result) / total) * 100 : 0
    if (percent >= 86) return 'text-[var(--exam-badge-green-text)] bg-[var(--exam-badge-green-bg)]'
    if (percent >= 56) return 'text-[var(--exam-badge-orange-text)] bg-[var(--exam-badge-orange-bg)]'
    return 'text-danger bg-danger/10'
  }
</script>

<template>
  <div class="h-full">
    <n-spin
      :show="store.loading"
      class="topicCardList__spin h-full rounded-md min-h-[clamp(200px,calc(100vh-100%),600px)]"
    >
      <div
        v-if="store.list.length > 0"
        class="h-full bg-surface-section rounded-3xl p-1 flex flex-col gap-6 sm:gap-8"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start overflow-y-auto">
          <article
            v-for="(item, idx) in store.list"
            :key="idx"
            class="bg-surface-ground-soft rounded-3xl shadow-[0_1px_2px_rgba(16,26,43,0.05)] overflow-hidden flex flex-col"
          >
            <!-- asosiy qism -->
            <div class="p-4 flex flex-col gap-6 sm:gap-8 grow">
              <!-- 1-zona: nom + mavzu + holat yorlig'i -->
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-bold text-textColor0 leading-tight line-clamp-1">
                    {{ item?.name }}
                  </p>
                  <p
                    class="text-xs text-textColor1 leading-tight mt-1 line-clamp-1 flex items-center gap-1.5"
                  >
                    <span v-if="item.camera" class="relative flex size-2 shrink-0">
                      <span
                        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"
                      ></span>
                      <span class="relative inline-flex size-2 rounded-full bg-danger"></span>
                    </span>
                    <span class="truncate">
                      <template v-if="item.topic?.type?.name"
                        >{{ item.topic.type.name }} · </template
                      >{{ item?.topic?.name }}
                    </span>
                  </p>
                </div>
                <span
                  class="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                  :class="statusBadge(item).cls"
                >
                  <span
                    v-if="statusBadge(item).icon === 'minute'"
                    class="inline-block size-3 shrink-0"
                    :style="{
                      backgroundColor: statusBadge(item).iconColor,
                      WebkitMaskImage: `url(${minuteIconUrl})`,
                      maskImage: `url(${minuteIconUrl})`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center'
                    }"
                  ></span>
                  <img
                    v-else-if="statusBadge(item).icon === 'finish'"
                    :src="finishIconUrl"
                    alt=""
                    class="size-3 shrink-0"
                  />
                  <n-icon v-else :component="Clock20Filled" :size="12" />
                  {{ $t(statusBadge(item).label, statusBadge(item).params || {}) }}
                </span>
              </div>

              <!-- 2-zona: meta ma'lumotlar + asosiy amal -->
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-3 text-sm text-textColor1 min-w-0">
                  <span class="flex items-center gap-1.5 shrink-0">
                    <n-icon :component="Clock20Filled" :size="16" class="text-textColor3" />
                    {{ $t('examPage.totalMinute', { n: item.minute }) }}
                  </span>
                  <span class="flex items-center gap-1.5 shrink-0">
                    <img :src="questionIconUrl" alt="" class="w-4 h-4" />
                    {{ $t('examPage.nQuestions', { n: item.tests_count }) }}
                  </span>
                  <span class="flex items-center gap-1.5 shrink-0">
                    <img :src="attemptIconUrl" alt="" class="w-4 h-4" />
                    {{
                      $t('examPage.nAttempts', { n: existAttemptCount(item.results, item.chances) })
                    }}
                  </span>
                </div>

                <!-- 3-zona: asosiy amal -->
                <n-button
                  v-if="isCanContinue(item.results)"
                  :disabled="isRunDevice(item.results)"
                  @click="goContinue(item)"
                  type="success"
                  size="small"
                  class="shrink-0 !rounded-lg !h-auto !px-5 !py-2"
                >
                  {{ $t('content.continue') }}
                </n-button>
                <n-button
                  v-else-if="isCanStart(item.results, item.chances)"
                  @click="goStart(item)"
                  :loading="examStore.loading"
                  color="#1570EF"
                  text-color="#ffffff"
                  size="small"
                  class="shrink-0 !rounded-lg !h-auto !px-5 !py-2"
                >
                  {{ $t('content.start') }}
                </n-button>
                <n-button
                  v-else
                  @click="onChangeCollapse(item.id)"
                  size="small"
                  class="shrink-0 !rounded-lg !h-auto !px-5 !py-2 !border-none !bg-[var(--exam-result-btn-bg)] !text-[var(--exam-result-btn-text)]"
                >
                  {{ $t('examPage.viewResult') }}
                </n-button>
              </div>
            </div>

            <!-- urinishlar tarixi -->
            <n-collapse-transition :show="item.id === selectedRowId">
              <div class="border-t border-surface-line bg-surface-ground-soft px-3 py-1">
                <div class="flex flex-col divide-y divide-surface-line">
                  <div
                    v-for="(result, ri) in item.results"
                    :key="result.id"
                    class="flex items-center gap-3 px-2 py-1.5 transition-colors hover:bg-surface-section"
                  >
                    <!-- ball chipi -->
                    <div
                      class="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-base"
                      :class="result.ended ? scoreBand(item, result) : 'text-primary bg-primary/10'"
                    >
                      <template v-if="result.ended">{{ result.result }}</template>
                      <n-icon v-else :component="Clock20Filled" :size="20" />
                    </div>

                    <!-- urinish raqami -->
                    <div class="shrink-0 hidden sm:block text-textColor2 font-bold tabular-nums">
                      #{{ ri + 1 }}
                    </div>

                    <!-- vaqtlar -->
                    <div class="grow min-w-0 flex flex-col gap-1 sm:gap-0.5 text-xs">
                      <p class="flex flex-col sm:flex-row sm:gap-2 leading-tight">
                        <span class="text-textColor3 sm:w-[120px] shrink-0 whitespace-nowrap">{{
                          $t('examPage.startTime')
                        }}</span>
                        <span
                          class="text-textColor0 font-semibold tabular-nums whitespace-nowrap"
                          >{{ result.created }}</span
                        >
                      </p>
                      <p
                        v-if="result.ended"
                        class="flex flex-col sm:flex-row sm:gap-2 leading-tight"
                      >
                        <span class="text-textColor3 sm:w-[120px] shrink-0 whitespace-nowrap">{{
                          $t('examPage.endTime')
                        }}</span>
                        <span
                          class="text-textColor0 font-semibold tabular-nums whitespace-nowrap"
                          >{{ result.ended }}</span
                        >
                      </p>
                      <p v-else class="text-warning font-medium leading-tight">
                        {{ $t('examPage.inProgress') }}
                      </p>
                    </div>

                    <!-- amal -->
                    <div class="shrink-0">
                      <n-button
                        v-if="result.ended"
                        @click="viewExam(result, item, ri)"
                        type="primary"
                        ghost
                        size="small"
                        icon-placement="right"
                      >
                        {{ $t('content.view') }}
                        <template #icon>
                          <n-icon :component="Eye16Filled" />
                        </template>
                      </n-button>
                      <span v-else class="text-warning text-sm font-medium">
                        {{ $t('content.process') }}
                      </span>
                    </div>
                  </div>

                  <p
                    v-if="item.results.length === 0"
                    class="text-center py-4 text-textColor1 text-sm"
                  >
                    {{ $t('content.no-data') }}
                  </p>
                </div>
              </div>
            </n-collapse-transition>
          </article>
        </div>

        <div
          v-if="store.totalItems > 0 && !store.loading"
          class="bg-[var(--exam-pagination-bg)] rounded-b-3xl px-4 sm:px-6"
        >
          <UIPagination
            :page="store.params.page"
            :per_page="store.params.per_page"
            :total="store.totalItems"
            @change-page="changePage"
          />
        </div>
      </div>
      <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
    </n-spin>
    <UIModal
      v-model:visible="warningVisible"
      :width="400"
      :title="$t('cameraPage.warningRecording')"
    >
      <WarningCameraRecording @onContinueEv="onContinueEv" />
    </UIModal>
  </div>
</template>

<style scoped>
  /* Table.vue'dagi bilan bir xil muammo: n-spin o'z kontentini balandligi bo'lmagan
     div ichiga o'raydi, shu sababli ichkaridagi h-full hech qachon hal bo'lmaydi va
     pagination qatorlardan keyin osilib qolardi (konteyner tubiga emas). */
  .topicCardList__spin :deep(.n-spin-content) {
    height: 100%;
  }
</style>
