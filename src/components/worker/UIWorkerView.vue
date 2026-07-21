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

  const store = useComponentStore()
  const masked = ref(true)
  const activeTab = ref(1)
  const previewPanelRef = ref(null)
  const { t } = i18n.global

  watch(activeTab, () => {
    previewPanelRef.value?.scrollTo({ top: 0 })
  })

  // Derives a light tinted background from a tab's own icon color (same hue, low opacity)
  // so the active-state pill background never needs to be set by hand per tab.
  const withAlpha = (hex, alpha = '1A') => `${hex}${alpha}`

  const tabList = computed(() => [
    {
      name: t('workerView.tabs.general'),
      id: 1,
      icon: GeneralInfoIcon,
      color: '#2E90FA', // TODO: custom icon color
      count: null
    },
    {
      name: t('workerView.tabs.career'),
      id: 2,
      icon: CareerIcon,
      color: '#4F46E5', // TODO: custom icon color
      count: null
    },
    {
      name: t('workerView.tabs.relative'),
      id: 3,
      icon: RelativeIcon,
      color: '#DB2777', // TODO: custom icon color
      count: store.workerPreview?.worker?.relatives?.length ?? null
    },
    {
      name: t('workerView.tabs.med'),
      id: 4,
      icon: MedIcon,
      chipColor: '#16A34A', // TODO: custom icon chip background
      count: null
    },
    {
      name: t('workerView.tabs.vacation'),
      id: 5,
      icon: VacationIcon,
      color: '#F59E0B', // TODO: custom icon color
      count: null
    },
    {
      name: t('workerView.tabs.incentive'),
      id: 6,
      icon: IncentiveIcon,
      color: '#F97316', // TODO: custom icon color
      count: store.workerPreview?.worker?.incentives?.length ?? null
    },
    {
      name: t('workerView.tabs.punishment'),
      id: 7,
      icon: DisciplinaryIcon,
      color: '#DC2626', // TODO: custom icon color
      count: store.workerPreview?.worker?.disciplinary_actions?.length ?? null
    },
    {
      name: t('workerView.tabs.exams'),
      id: 8,
      icon: ExamIcon,
      chipColor: '#A3C42A', // TODO: custom icon chip background
      count: store.workerPreview?.worker?.exams?.length ?? null
    }
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
  <n-modal v-model:show="store.previewVisible" style="width: 100vw; height: 100vh">
    <div class="ui-preview-window w-full h-full grid grid-cols-12 overflow-hidden">
      <n-spin :show="store.previewLoading" class="preview-spin col-span-12 overflow-hidden">
        <div
          class="preview-content flex flex-col w-full h-full px-4 pt-4"
          :class="[store.panelVisible && 'preview-panel-active']"
        >
          <TopBar
            v-model:masked="masked"
            :title="$t('workerView.header.title')"
            :subtitle="$t('workerView.header.subtitle')"
            :resume-loading="store.resumeLoading"
            @close="store.previewVisible = false"
            @download="onDownload"
          />

          <MainInfo v-model:masked="masked" class="mb-4" />

          <div class="flex w-full flex-1 min-h-0 gap-4">
            <div class="preview-menu self-start bg-surface-section rounded-3xl p-4 z-10 overflow-y-auto">
              <div class="text-xs uppercase text-textColor3 font-semibold mb-3">
                {{ $t('workerView.sidebar.title') }}
              </div>
              <template v-if="store.workerPreview">
                <div
                  v-for="item in tabList"
                  :key="item.id"
                  class="flex items-center justify-between gap-2 px-3 py-2 mb-1 rounded-2xl cursor-pointer transition-colors"
                  :class="activeTab === item.id ? 'font-semibold' : 'text-textColor2 hover:bg-surface-ground'"
                  :style="
                    activeTab === item.id
                      ? {
                        backgroundColor: withAlpha(item.color || item.chipColor),
                        color: item.color || item.chipColor
                      }
                      : {}
                  "
                  @click="activeTab = item.id"
                >
                  <span class="flex items-center gap-2 min-w-0">
                    <span
                      v-if="item.chipColor"
                      class="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      :style="{ backgroundColor: item.chipColor }"
                    >
                      <n-icon size="14" class="text-white">
                        <component :is="item.icon" />
                      </n-icon>
                    </span>
                    <n-icon v-else size="18" class="shrink-0" :color="item.color">
                      <component :is="item.icon" />
                    </n-icon>
                    <span class="text-sm font-medium truncate">{{ item.name }}</span>
                  </span>
                  <span class="flex items-center gap-1.5 shrink-0">
                    <span
                      v-if="item.count !== null"
                      class="text-xs font-semibold rounded-full px-2 py-0.5"
                      :class="activeTab === item.id ? 'text-white' : 'bg-surface-ground text-textColor0'"
                      :style="activeTab === item.id ? { backgroundColor: item.color || item.chipColor } : {}"
                    >
                      {{ item.count }}
                    </span>
                  </span>
                </div>
              </template>
            </div>

            <div
              ref="previewPanelRef"
              class="preview-panel overflow-x-hidden overflow-y-auto relative flex-1 pb-4"
            >
              <GeneralInfo v-if="activeTab === tabList[0].id" />
              <CareerInfo v-if="activeTab === tabList[1].id" />
              <RelativeInfo v-if="activeTab === tabList[2].id" />
              <MedList v-if="activeTab === tabList[3].id" />
              <VacationView v-if="activeTab === tabList[4].id" />
              <IncentiveInfo v-if="activeTab === tabList[5].id" />
              <DisciplinaryInfo v-if="activeTab === tabList[6].id" />
              <ExamInfo v-if="activeTab === tabList[7].id" />
            </div>
          </div>
          <div @click="() => (store.panelVisible = false)" class="preview-overall"></div>
        </div>
      </n-spin>
    </div>
  </n-modal>
</template>

<style lang="scss">
  .ui-preview-window,
  .preview-spin {
    background-color: #eff8ff;
  }
  [data-theme='dark'] {
    .ui-preview-window,
    .preview-spin {
      background-color: #0f172a;
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
