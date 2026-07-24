<script setup>
  import { ChevronRight16Filled } from '@vicons/fluent'
  import TopBar from './ui/shared/TopBar.vue'
  import GeneralInfoIcon from '@/assets/icons/menuIcon.svg'
  import CareerIcon from '@/assets/icons/positionIcon.svg'
  import RelativeIcon from '@/assets/icons/usersIcon.svg'
  import MedIcon from '@/assets/icons/medicalExaminationIcon.svg'
  import VacationIcon from '@/assets/icons/calendarIcon.svg'
  import IncentiveIcon from '@/assets/icons/awardIcon.svg'
  import DisciplinaryIcon from '@/assets/icons/punishmentIcon.svg'
  import ExamIcon from '@/assets/icons/examIcon.svg'
  import JshirIcon from "@/assets/icons/jshirIcon.svg"
  import GeneralInfo from './ui/GeneralInfo.vue'
  import CareerInfo from './ui/CareerInfo.vue'
  import RelativeInfo from './ui/RelativeInfo.vue'
  import MainInfo from './ui/MainInfo.vue'
  import MedList from './ui/MedList.vue'
  import VacationView from './ui/VacationView.vue'
  import IncentiveInfo from './ui/IncentiveInfo.vue'
  import DisciplinaryInfo from './ui/DisciplinaryInfo.vue'
  import ExamInfo from './ui/ExamInfo.vue'
  import i18n from '@/i18n/index.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import Edocument from './ui/Edocument.vue'

  const store = useComponentStore()
  const masked = ref(true)
  const activeTab = ref(1)
  const previewPanelRef = ref(null)
  const { t } = i18n.global

  watch(activeTab, () => {
    previewPanelRef.value?.scrollTo({ top: 0 })
  })

  const tabList = computed(() => [
    { name: t('workerView.tabs.general'), id: 1, icon: GeneralInfoIcon },
    { name: t('workerView.tabs.career'), id: 2, icon: CareerIcon },
    { name: t('workerView.tabs.relative'), id: 3, icon: RelativeIcon },
    { name: t('workerView.tabs.med'), id: 4, icon: MedIcon },
    { name: t('workerView.tabs.vacation'), id: 5, icon: VacationIcon },
    { name: t('workerView.tabs.incentive'), id: 6, icon: IncentiveIcon },
    { name: t('workerView.tabs.punishment'), id: 7, icon: DisciplinaryIcon },
    { name: t('workerView.tabs.exams'), id: 8, icon: ExamIcon },
    { name: t('workerView.tabs.e_documents'), id: 9, icon: JshirIcon }
  ])

  const openPreview = (id) => {
    store.previewVisible = true
    activeTab.value = 1
    store._workerPreview(id)
    nextTick(() => previewPanelRef.value?.scrollTo({ top: 0 }))
  }

  const onDownload = () => {
    store._workerResume(Utils.combineFullName(store.workerPreview?.worker))
  }

  defineExpose({
    openPreview
  })
</script>

<template>
  <n-modal v-model:show="store.previewVisible" draggable style="width: 100%; height: 96vh">
    <div
      class="ui-preview-window w-full h-full grid grid-cols-12 max-w-[1400px] bg-surface-ground rounded-3xl overflow-hidden"
    >
      <n-spin :show="store.previewLoading" class="preview-spin col-span-12 overflow-hidden">
        <div
          class="preview-content flex flex-col w-full h-full px-4 pt-4"
          :class="[store.panelVisible && 'preview-panel-active']"
          @scroll="store.panelVisible = false"
        >
          <div class="shrink-0 bg-surface-section -mx-4 -mt-4 px-4 pt-4 rounded-t-3xl">
            <TopBar
              v-model:masked="masked"
              :title="$t('workerView.header.title')"
              :resume-loading="store.resumeLoading"
              @close="store.previewVisible = false"
              @download="onDownload"
            />
          </div>

          <MainInfo v-model:masked="masked" class="shrink-0 mb-4" />

          <div class="preview-body flex w-full flex-1 min-h-0 gap-4">
            <div
              class="preview-menu self-start max-h-full bg-surface-section rounded-3xl p-1 z-10 overflow-y-auto"
            >
              <div class="sidebar-title-box bg-primary/10 text-primary text-md font-semibold rounded-t-3xl px-1 text-center py-2 mb-2">
                {{ $t('workerView.sidebar.title') }}
              </div>
              <template v-if="store.workerPreview">
                <div
                  v-for="item in tabList"
                  :key="item.id"
                  class="flex items-center gap-3 px-2 py-2 mb-1 rounded-xl cursor-pointer transition-colors"
                  :class="activeTab === item.id ? 'bg-primary text-white font-semibold' : 'text-textColor2 hover:bg-surface-ground'"
                  @click="
                    () => {
                      activeTab = item.id
                      store.panelVisible = false
                    }
                  "
                >
                  <span
                    class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    :class="activeTab === item.id ? 'bg-white/20' : ''"
                  >
                    <n-icon size="16" :color="activeTab === item.id ? '#ffffff' : undefined">
                      <component :is="item.icon" />
                    </n-icon>
                  </span>
                  <span class="text-sm font-medium truncate">{{ item.name }}</span>
                </div>
              </template>
            </div>

            <div
              ref="previewPanelRef"
              class="preview-panel overflow-x-hidden overflow-y-auto relative flex-1 pb-4"
              @scroll="store.panelVisible = false"
            >
              <Transition name="tab-fade" mode="out-in">
                <div :key="activeTab">
                  <GeneralInfo v-if="activeTab === tabList[0].id" />
                  <CareerInfo v-else-if="activeTab === tabList[1].id" />
                  <RelativeInfo v-else-if="activeTab === tabList[2].id" />
                  <MedList v-else-if="activeTab === tabList[3].id" />
                  <VacationView v-else-if="activeTab === tabList[4].id" />
                  <IncentiveInfo v-else-if="activeTab === tabList[5].id" />
                  <DisciplinaryInfo v-else-if="activeTab === tabList[6].id" />
                  <ExamInfo v-else-if="activeTab === tabList[7].id" />
                  <Edocument  v-else-if="activeTab === tabList[8].id"/>
                </div>
              </Transition>
            </div>
          </div>
          <div @click="() => (store.panelVisible = false)" class="preview-overall"></div>
        </div>
      </n-spin>
    </div>
  </n-modal>
</template>

<style lang="scss">
.sidebar-title-box {
  background-color: #EFF8FF;
}
  .tab-fade-enter-active,
  .tab-fade-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }
  .tab-fade-enter-from,
  .tab-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }

  .ui-preview-window,
  .preview-spin {
    background-color: #eff8ff;
  }
  [data-theme='dark'] {
    .ui-preview-window,
    .preview-spin {
      background-color: #0f172a;
    }
    .sidebar-title-box {
      background-color: #1a2131;
    }
  }

  .ui-preview-window {
    .preview-content {
      position: relative;
    }
    .preview-menu {
      width: 260px;
      flex-shrink: 0;
      transition: all 0.3s ease-out;
    }
  }

  @media only screen and (max-width: 769px) {
    .ui-preview-window {
      .preview-content {
        overflow-y: auto;
      }
      .preview-body {
        flex: none;
        min-height: 0;
      }
      .preview-menu {
        width: 260px;
        position: absolute;
        left: -270px;
        bottom: 0;
        top: 0;
      }
      .preview-overall {
        display: none;
      }
    }

    .preview-panel-active {
      .preview-menu {
        left: 0;
      }
      .preview-overall {
        display: flex;
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        top: 0;
        right: 0;
        z-index: 9;
        background: rgba(2, 11, 28, 0.32);
      }
    }
  }
</style>
