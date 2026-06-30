<script setup>
  import { NoDataPicture, UIModal, UIPagination } from '@/components/index.js'
  import WarningCameraRecording from '@/pages/attestation/Camera/ui/WarningCameraRecording.vue'
  import {
    useExamAttemptStore,
    useWorkerExamStore,
    useExamVideoStore
  } from '@/store/modules/index.js'
  import {
    Clock20Filled,
    Eye16Filled,
    ArrowRight16Filled,
    ChevronDown16Filled,
    CalendarLtr16Regular,
    ArrowRepeatAll16Regular,
    QuestionCircle16Regular
  } from '@vicons/fluent'

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

  const viewExam = (v, data) => {
    examStore.isCamera = data.camera
    examStore.visible = true
    examStore.elementId = v.id
    examStore.activeTab = 1
  }

  const onContinueEv = async () => {
    warningVisible.value = false
    await examVideoStore.checkUserMediaDevice(() => {
      examStore._start_attempt()
    })
  }

  // ---- redizayn yordamchilari (faqat ko'rinish uchun) ----
  // Imtihon holati: davom etayotgan urinish bormi, boshlash mumkinmi yoki tugaganmi
  const examStatus = (item) => {
    if (isCanContinue(item.results)) {
      return { label: 'examPage.inProgress', cls: 'text-warning bg-warning/10' }
    }
    if (isCanStart(item.results, item.chances)) {
      return { label: 'content.start', cls: 'text-primary bg-primary/10' }
    }
    return { label: 'content.finished', cls: 'text-success bg-success/10' }
  }

  // Ball foiziga qarab rang bandi (natija doirasi/grading-mezoni bilan izchil)
  const scoreBand = (item, result) => {
    const total = item?.tests_count || 0
    const percent = total ? (Number(result?.result) / total) * 100 : 0
    if (percent >= 86) return 'text-success bg-success/10'
    if (percent >= 56) return 'text-warning bg-warning/10'
    return 'text-danger bg-danger/10'
  }
</script>

<template>
  <div>
    <n-spin :show="store.loading" class="h-full rounded-md min-h-[300px]">
      <div v-if="store.list.length > 0" class="flex flex-col gap-3">
        <article
          v-for="(item, idx) in store.list"
          :key="idx"
          class="bg-surface-section rounded-xl border border-surface-line shadow-[0_1px_2px_rgba(16,26,43,0.05)] overflow-hidden transition-colors hover:border-primary/40"
        >
          <!-- asosiy qator -->
          <div class="flex flex-col lg:flex-row lg:items-center gap-3 px-3 py-2.5">
            <!-- chap: raqam + nom + mavzu -->
            <div class="flex items-center gap-3 min-w-0 lg:flex-1">
              <span
                class="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center"
              >
                {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
              </span>
              <div class="min-w-0">
                <p class="font-semibold text-textColor0 leading-tight line-clamp-1">
                  {{ item?.name }}
                </p>
                <p
                  class="text-xs text-textColor2 leading-tight mt-0.5 line-clamp-1 flex items-center gap-1.5"
                >
                  <span v-if="item.camera" class="relative flex size-2 shrink-0">
                    <span
                      class="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"
                    ></span>
                    <span class="relative inline-flex size-2 rounded-full bg-danger"></span>
                  </span>
                  <span class="truncate">
                    <template v-if="item.topic?.type?.name">{{ item.topic.type.name }} · </template>{{ item?.topic?.name }}
                  </span>
                </p>
              </div>
            </div>

            <!-- o'rta: meta chiplar -->
            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-textColor0 bg-surface-ground border border-surface-line rounded-lg px-2.5 py-1"
              >
                <n-icon :component="Clock20Filled" class="text-textColor3" />
                {{ $t('examPage.totalMinute', { n: item.minute }) }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-textColor0 bg-surface-ground border border-surface-line rounded-lg px-2.5 py-1"
              >
                <n-icon :component="QuestionCircle16Regular" class="text-textColor3" />
                {{ $t('examPage.nQuestions', { n: item.tests_count }) }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-textColor2 bg-surface-ground border border-surface-line rounded-lg px-2.5 py-1"
              >
                <n-icon :component="CalendarLtr16Regular" class="text-textColor3" />
                {{ item.deadline }}
              </span>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-textColor2 bg-surface-ground border border-surface-line rounded-lg px-2.5 py-1"
                :class="[existAttemptCount(item.results, item.chances) === 0 && 'line-through opacity-50']"
              >
                <n-icon :component="ArrowRepeatAll16Regular" class="text-textColor3" />
                {{ $t('examPage.attemptsCount') }}:
                <b class="text-textColor0">{{ existAttemptCount(item.results, item.chances) }}</b>
              </span>
            </div>

            <!-- o'ng: holat + amallar -->
            <div class="flex items-center gap-2 shrink-0 lg:justify-end flex-wrap">
              <span
                class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full"
                :class="examStatus(item).cls"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {{ $t(examStatus(item).label) }}
              </span>

              <n-button
                quaternary
                size="small"
                :type="item.id === selectedRowId ? 'primary' : 'default'"
                @click="onChangeCollapse(item.id)"
                :disabled="item.results?.length === 0"
                icon-placement="right"
              >
                {{ $t('examPage.viewResult') }}
                <template #icon>
                  <n-icon
                    :component="ChevronDown16Filled"
                    class="transition-transform"
                    :class="item.id === selectedRowId ? 'rotate-180' : ''"
                  />
                </template>
              </n-button>

              <n-button
                v-if="isCanContinue(item.results)"
                :disabled="isRunDevice(item.results)"
                @click="goContinue(item)"
                type="success"
                size="small"
                icon-placement="right"
              >
                {{ $t('content.continue') }}
                <template #icon>
                  <n-icon :component="ArrowRight16Filled" />
                </template>
              </n-button>
              <n-button
                v-else-if="isCanStart(item.results, item.chances)"
                @click="goStart(item)"
                :loading="examStore.loading"
                type="primary"
                size="small"
                icon-placement="right"
              >
                {{ $t('content.start') }}
                <template #icon>
                  <n-icon :component="ArrowRight16Filled" />
                </template>
              </n-button>
            </div>
          </div>

          <!-- urinishlar tarixi -->
          <n-collapse-transition :show="item.id === selectedRowId">
            <div
              class="border-t border-dashed border-surface-line bg-primary/5 px-3 py-1"
            >
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
                  <div class="grow min-w-0 flex flex-col gap-0.5 text-xs">
                    <p class="flex gap-2 leading-tight">
                      <span class="text-textColor3 w-[120px] shrink-0 whitespace-nowrap">{{ $t('examPage.startTime') }}</span>
                      <span class="text-textColor0 font-semibold tabular-nums">{{ result.created }}</span>
                    </p>
                    <p v-if="result.ended" class="flex gap-2 leading-tight">
                      <span class="text-textColor3 w-[120px] shrink-0 whitespace-nowrap">{{ $t('examPage.endTime') }}</span>
                      <span class="text-textColor0 font-semibold tabular-nums">{{ result.ended }}</span>
                    </p>
                    <p v-else class="text-warning font-medium leading-tight">
                      {{ $t('examPage.inProgress') }}
                    </p>
                  </div>

                  <!-- amal -->
                  <div class="shrink-0">
                    <n-button
                      v-if="result.ended"
                      @click="viewExam(result, item)"
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
                  class="text-center py-4 text-textColor2 text-sm"
                >
                  {{ $t('content.no-data') }}
                </p>
              </div>
            </div>
          </n-collapse-transition>
        </article>
      </div>

      <UIPagination
        v-if="store.totalItems > 0 && !store.loading"
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
      <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
    </n-spin>
    <UIModal v-model:visible="warningVisible" :width="400" :title="$t('cameraPage.warningRecording')">
      <WarningCameraRecording @onContinueEv="onContinueEv" />
    </UIModal>
  </div>
</template>
