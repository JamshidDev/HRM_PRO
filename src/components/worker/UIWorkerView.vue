<script setup>
  import {
    VideoPersonSparkle28Regular,
    PersonAccounts24Regular,
    PeopleSearch24Regular,
    Doctor20Regular,
    WeatherSunnyLow24Regular,
    NotepadPerson24Regular,
    QuizNew48Regular
  } from '@vicons/fluent'
  import TopBar from './ui/shared/TopBar.vue'
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
  const { t } = i18n.global

  const tabList = computed(() => [
    {
      name: t('workerView.tabs.general'),
      id: 1,
      icon: VideoPersonSparkle28Regular,
      color: 'text-blue-500',
      count: null
    },
    {
      name: t('workerView.tabs.career'),
      id: 2,
      icon: PersonAccounts24Regular,
      color: 'text-indigo-500',
      count: null
    },
    {
      name: t('workerView.tabs.relative'),
      id: 3,
      icon: PeopleSearch24Regular,
      color: 'text-rose-500',
      count: store.workerPreview?.worker?.relatives?.length ?? null
    },
    {
      name: t('workerView.tabs.med'),
      id: 4,
      icon: Doctor20Regular,
      color: 'text-emerald-500',
      count: null
    },
    {
      name: t('workerView.tabs.vacation'),
      id: 5,
      icon: WeatherSunnyLow24Regular,
      color: 'text-sky-500',
      count: null
    },
    {
      name: t('workerView.tabs.incentive'),
      id: 6,
      icon: NotepadPerson24Regular,
      color: 'text-amber-500',
      count: store.workerPreview?.worker?.incentives?.length ?? null
    },
    {
      name: t('workerView.tabs.punishment'),
      id: 7,
      icon: NotepadPerson24Regular,
      color: 'text-red-500',
      count: null
    },
    {
      name: t('workerView.tabs.exams'),
      id: 8,
      icon: QuizNew48Regular,
      color: 'text-teal-500',
      count: store.workerPreview?.worker?.exams?.length ?? null
    }
  ])

  const openPreview = (id) => {
    store.previewVisible = true
    activeTab.value = 1
    store._workerPreview(id)
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
    <div class="ui-preview-window w-full h-full grid grid-cols-12 bg-[#EFF8FF] overflow-hidden">
      <n-spin :show="store.previewLoading" class="col-span-12 bg-[#EFF8FF] overflow-hidden">
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
            <div class="preview-menu h-full bg-surface-section rounded-lg p-4 z-10 overflow-y-auto">
              <div class="text-xs uppercase text-textColor3 font-semibold mb-3">
                {{ $t('workerView.sidebar.title') }}
              </div>
              <template v-if="store.workerPreview">
                <div
                  v-for="item in tabList"
                  :key="item.id"
                  class="flex items-center justify-between gap-2 px-3 py-2 mb-1 rounded-md cursor-pointer transition-colors"
                  :class="
                    activeTab === item.id
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-textColor2 hover:bg-surface-ground'
                  "
                  @click="activeTab = item.id"
                >
                  <span class="flex items-center gap-2 min-w-0">
                    <n-icon size="18" class="shrink-0" :class="item.color">
                      <component :is="item.icon" />
                    </n-icon>
                    <span class="text-sm font-medium truncate">{{ item.name }}</span>
                  </span>
                  <span
                    v-if="item.count !== null"
                    class="text-xs bg-surface-ground text-textColor3 rounded-full px-2 py-0.5 shrink-0"
                  >
                    {{ item.count }}
                  </span>
                </div>
              </template>
            </div>

            <div class="preview-panel overflow-x-hidden overflow-y-auto relative flex-1 pb-4">
              <n-tabs animated v-model:value="activeTab" class="hidden-tab-header" type="segment">
                <n-tab-pane v-for="item in tabList" :name="item.id" :key="item.id">
                  <template v-if="tabList[0].id === item.id">
                    <GeneralInfo />
                  </template>
                  <template v-if="tabList[1].id === item.id">
                    <CareerInfo />
                  </template>
                  <template v-if="tabList[2].id === item.id">
                    <RelativeInfo />
                  </template>
                  <template v-if="tabList[3].id === item.id">
                    <MedList />
                  </template>
                  <template v-if="tabList[4].id === item.id">
                    <VacationView />
                  </template>
                  <template v-if="tabList[5].id === item.id">
                    <IncentiveInfo />
                  </template>
                  <template v-if="tabList[6].id === item.id">
                    <DisciplinaryInfo />
                  </template>
                  <template v-if="tabList[7].id === item.id">
                    <ExamInfo />
                  </template>
                </n-tab-pane>
              </n-tabs>
            </div>
          </div>
          <div @click="() => (store.panelVisible = false)" class="preview-overall"></div>
        </div>
      </n-spin>
    </div>
  </n-modal>
</template>

<style lang="scss">
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
