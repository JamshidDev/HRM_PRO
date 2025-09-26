<script setup>
import {NoDataPicture, UIModal, UIPagination} from "@/components/index.js"
import WarningCameraRecording from "@/pages/attestation/Camera/ui/WarningCameraRecording.vue"
import {useExamAttemptStore, useWorkerExamStore, useExamVideoStore} from "@/store/modules/index.js"
import {
  SquareArrowForward48Regular,
  Clock20Filled,
  DismissCircle20Filled,
  Eye16Filled,
  ArrowRight16Filled,
} from "@vicons/fluent"
import {useAccountStore} from "@/store/modules/index.js"


const accStore = useAccountStore()
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
  return results.filter(v => !v.ended)?.length > 0
}

const isCanStart = (results, attempt) => {
  return (attempt > results.length && !isCanContinue(results))
}

const isRunDevice = (results) => {
  const current = results.filter(v => !v.ended)
  const id = current[0].id
  if (current.length > 0) {
    return !examStore.exam_storage?.[id]
  } else return false
}

const goStart = (v) => {
  examStore.elementId = v.id
  if(v.camera){
    warningVisible.value = true
  }else{
    examStore._start_attempt()
  }
}

const goContinue = (v) => {
  const current = v.results.filter(v => !v.ended)
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

const onContinueEv = async ()=>{
  warningVisible.value = false
  await examVideoStore.checkUserMediaDevice(()=>{
    examStore._start_attempt()
  })

}


</script>

<template>
  <div>
    <n-spin :show="store.loading" class="h-full rounded-md p-1 min-h-[300px]">
      <div v-if="store.list.length>0" class="w-full overflow-auto">
        <div class="w-full table md:min-w-[700px]">
          <template v-for="(item, idx) in store.list" :key="idx">
            <div
                class="flex flex-col md:flex-row bg-surface-section rounded-tl-lg
               rounded-tr-lg gap-2 px-2 pt-[10px] items-center
                w-full"
                :class="[item.id === selectedRowId && 'pb-[10px]']"
            >
              <div class="w-[40px] text-center text-sm">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
              </div>
              <div class="w-[100px]">
                <n-button class="w-[100px]!" type="primary" secondary>
                  <template #icon>
                    <n-icon size="22">
                      <Clock20Filled/>
                    </n-icon>
                  </template>
                  {{ $t('examPage.nMinute', {n: item.minute}) }}
                </n-button>
              </div>
              <div class="flex flex-col md:w-[calc(100%-840px)] md:min-w-[200px] w-full">
                <p class="leading-[1.2] font-semibold text-textColor0 line-clamp-1">
                  {{ item?.name }}</p>
                <p class="leading-[1.2] text-xs text-secondary line-clamp-1 flex items-center">

                <span v-if="item.camera" class="relative flex size-2 mx-1">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"></span>
                  <span class="relative inline-flex size-2 rounded-full bg-danger/40"></span>
                </span>

                  {{ item?.topic?.name }}
                </p>
              </div>
              <div class="flex flex-col text-xs text-secondary md:w-[260px] w-full">
                <p class="leading-[1.2] line-clamp-1 w-full"
                   :class="[existAttemptCount(item.results,item.chances) ===0 && 'line-through opacity-50']">
                  {{ $t('examPage.attemptsCount') }}: <span
                    class="font-semibold text-textColor0">{{ existAttemptCount(item.results, item.chances) }}</span></p>
                <p class="leading-[1.2] line-clamp-1">{{ $t('solveExamPage.deadline') }}: <span
                    class="font-semibold text-textColor0">{{ item.deadline }}</span></p>
              </div>
              <div class="hidden md:flex md:w-[200px] w-full md:justify-center">
                <n-button
                    secondary
                    :type="item.id === selectedRowId? 'error' : 'default'"
                    @click="onChangeCollapse(item.id)"
                    size="small"
                    :disabled="item.results?.length===0">
                  <template #icon>
                    <DismissCircle20Filled v-if="item.id === selectedRowId"/>
                    <SquareArrowForward48Regular v-else/>
                  </template>
                  {{ item.id === selectedRowId ? $t('content.close') : $t('examPage.viewResult') }}
                </n-button>
              </div>
              <div class="flex flex-col text-xs md:w-[260px] w-full text-secondary">
                <p class="leading-[1.2] line-clamp-1">{{ item.topic?.type?.name }}</p>
                <p class="leading-[1.2] line-clamp-1">{{ $t('solveExamPage.questions') }}: <span
                    class="font-semibold text-textColor0">{{ item.tests_count }}</span></p>
              </div>
              <div class="flex md:w-[120px]! w-full! md:justify-end">
                <n-button
                    class="w-full! md:w-auto! mt-4! md:mt-0!"
                    :disabled="isRunDevice(item.results)"
                    v-if="isCanContinue(item.results)"
                    @click="goContinue(item)"
                    type="success"
                    secondary
                    icon-placement="right"
                    size="small">
                  {{ $t('content.continue') }}
                  <template #icon>
                    <ArrowRight16Filled/>
                  </template>
                </n-button>
                <n-button
                    class="w-full! md:w-auto! mt-4! md:mt-0!"
                    v-else-if="isCanStart(item.results, item.chances)"
                    @click="goStart(item)"
                    :loading="examStore.loading"
                    type="primary"
                    size="small"
                    icon-placement="right"
                >
                  {{ $t('content.start') }}
                  <template #icon>
                    <ArrowRight16Filled/>
                  </template>
                </n-button>
                <n-button
                    class="w-full! md:w-auto! mt-4! md:mt-0!"
                    v-else secondary
                    size="small"
                >
                  {{ $t('content.finished') }}
                </n-button>
              </div>
            </div>
            <div class="mb-2 rounded-bl-lg rounded-br-lg py-1 transition-all bg-surface-section">
              <n-collapse-transition class="w-full px-6 bg-surface-section" :show="item.id === selectedRowId">
                <div class="grid grid-cols-12 bg-primary/10 w-full rounded-lg py-2 px-4">
                  <template v-for="result in item.results" :key="result.id">
                    <div class="col-span-12 flex items-center my-2 pb-1 border-b border-primary/60 border-dashed">
                      <n-button class="w-[60px]!" type="primary" secondary size="small">
                        <template v-if="result.ended">
                          {{ result.result }}
                        </template>

                        <n-icon size="20" v-else class="text-primary">
                          <Clock20Filled/>
                        </n-icon>
                      </n-button>
                      <div class="flex flex-col pl-4 w-[calc(100%-180px)]">
                        <p class="leading-[1.2] text-xs text-primary font-semibold"><span
                            class="text-secondary w-[120px] inline-block">{{ $t('examPage.startTime') }}:</span>
                          {{ result.created }}</p>
                        <p v-if="result.ended" class="leading-[1.2] text-xs text-primary font-semibold"><span
                            class="text-secondary w-[120px] inline-block">{{ $t('examPage.endTime') }}:</span>
                          {{ result.ended }}</p>
                        <p v-else class="text-warning leading-[1.2] text-xs">{{ $t('examPage.inProgress') }}</p>
                      </div>
                      <div class="w-[120px] flex justify-end items-center">
                        <n-button
                            @click="viewExam(result, item)"
                            v-if="result.ended"
                            type="primary" ghost round size="tiny">{{ $t('content.view') }}
                          <template #icon>
                            <Eye16Filled/>
                          </template>
                        </n-button>
                        <span v-else class="text-warning">{{ $t('content.process') }}</span>
                      </div>


                    </div>
                  </template>
                  <template v-if="item.results.length===0">
                    <p class="col-span-12 text-center py-4! text-secondary">{{ $t('content.no-data') }}</p>
                  </template>
                </div>
              </n-collapse-transition>
            </div>
          </template>
        </div>


      </div>
      <UIPagination
          v-if="store.totalItems>0 && !store.loading"
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
      />
      <NoDataPicture v-if="store.list.length===0 && !store.loading"/>

    </n-spin>
    <UIModal v-model:visible="warningVisible" :width="400" :title="$t('cameraPage.warningRecording')">
      <WarningCameraRecording @onContinueEv="onContinueEv"/>
    </UIModal>
  </div>

</template>