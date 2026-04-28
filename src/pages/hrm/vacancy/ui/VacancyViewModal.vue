<script setup>
  import { UIModal, UIBadge, UIUser } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import ApplicationDetailModal from './ApplicationDetailModal.vue'
  import Utils from '@/utils/Utils.js'
  import numeral from 'numeral'
  import {
    BuildingMultiple20Regular,
    People20Regular,
    CalendarLtr20Regular,
    Money20Regular,
    Star20Regular,
    Book20Regular,
    Briefcase20Regular,
    DocumentBulletList20Regular,
    Attach16Regular
  } from '@vicons/fluent'

  const store = useVacancyStore()
  const v = computed(() => store.viewData)

  const LEVELS = [
    { step: 1, key: 'one',   label: "Ariza topshirish etapi" },
    { step: 2, key: 'two',   label: "Hujjatlarni baholash" },
    { step: 3, key: 'three', label: "Suhbat" },
    { step: 4, key: 'four',  label: "Tibbiy ko'rik" },
    { step: 5, key: 'five',  label: "Onlayn test" },
    { step: 6, key: 'six',   label: "Tugatilgan" },
  ]

  // backend level value → step index
  const levelToStep = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6 }

  const currentStep = computed(() => {
    if (!v.value?.level) return 1
    return levelToStep[v.value.level] ?? 1
  })

  const getStatusType = (statusId) => {
    if (statusId === 2) return Utils.colorTypes.success
    if (statusId === 3) return Utils.colorTypes.error
    return Utils.colorTypes.warning
  }

  const getStatusLabel = (statusId) => {
    if (statusId === 2) return 'Qabul qilindi'
    if (statusId === 3) return 'Rad etildi'
    return 'Kutilmoqda'
  }

  const openFile = (url) => window.open(url, '_blank')
</script>

<template>
  <UIModal
    v-model:visible="store.viewVisible"
    :width="1100"
    height="88vh"
  >
    <template #header-title>
      <div class="flex items-center gap-2" v-if="v">
        <span class="font-semibold">{{ v.position?.name }}</span>
        <span class="text-textColor3 font-normal text-sm">— {{ v.department?.name }}</span>
      </div>
    </template>

    <div v-if="v" class="flex flex-col gap-5" style="max-height: calc(88vh - 80px); overflow-y: auto">

      <!-- Vacancy info + Steps -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Info card -->
        <div class="rounded-xl border border-surface-line bg-surface-50 p-4 flex flex-col gap-3">
          <div class="flex items-center gap-2 pb-2 border-b border-surface-line">
            <n-icon size="18" class="text-primary"><BuildingMultiple20Regular /></n-icon>
            <span class="font-semibold text-textColor0">{{ $t('content.organization') }}</span>
          </div>
          <p class="text-sm text-textColor2">{{ v.organization?.name }}</p>

          <div class="grid grid-cols-2 gap-3 mt-1">
            <div class="info-chip">
              <n-icon size="15" class="text-textColor3"><People20Regular /></n-icon>
              <span class="text-xs text-textColor3">{{ $t('vacancy.form.rate') }}</span>
              <span class="text-sm font-semibold text-textColor0 ml-auto">{{ v.rate }}</span>
            </div>
            <div class="info-chip">
              <n-icon size="15" class="text-textColor3"><CalendarLtr20Regular /></n-icon>
              <span class="text-xs text-textColor3">{{ $t('vacancy.form.to') }}</span>
              <span class="text-sm font-semibold text-textColor0 ml-auto">{{ Utils.timeOnlyDate(v.to) }}</span>
            </div>
            <div class="info-chip">
              <n-icon size="15" class="text-textColor3"><Money20Regular /></n-icon>
              <span class="text-xs text-textColor3">{{ $t('departmentPositionPage.form.salary') }}</span>
              <span class="text-sm font-semibold text-textColor0 ml-auto">
                {{ numeral(v.salary).format('0,0') }} <span class="text-xs font-normal">{{ $t('content.sum') }}</span>
              </span>
            </div>
            <div class="info-chip">
              <n-icon size="15" class="text-textColor3"><Star20Regular /></n-icon>
              <span class="text-xs text-textColor3">{{ $t('vacancy.form.short_experience') }}</span>
              <span class="text-sm font-semibold text-textColor0 ml-auto">{{ v.experience }}</span>
            </div>
            <div class="info-chip">
              <n-icon size="15" class="text-textColor3"><Book20Regular /></n-icon>
              <span class="text-xs text-textColor3">{{ $t('medWorker.form.education') }}</span>
              <span class="text-sm font-semibold text-textColor0 ml-auto">{{ v.education?.name }}</span>
            </div>
            <div class="info-chip">
              <n-icon size="15" class="text-textColor3"><Briefcase20Regular /></n-icon>
              <span class="text-xs text-textColor3">{{ $t('vacancy.form.work_type') }}</span>
              <span class="text-sm font-semibold text-textColor0 ml-auto">{{ v.work_type?.name }}</span>
            </div>
          </div>
        </div>

        <!-- Status steps card -->
        <div class="rounded-xl border border-surface-line bg-surface-50 p-4 flex flex-col gap-4">
          <div class="flex items-center gap-2 pb-2 border-b border-surface-line">
            <n-icon size="18" class="text-primary"><DocumentBulletList20Regular /></n-icon>
            <span class="font-semibold text-textColor0">{{ $t('vacancy.vacancyLevel') }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <div
              v-for="(lvl, idx) in LEVELS"
              :key="lvl.step"
              class="flex items-center gap-3"
            >
              <!-- Step circle -->
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
                :class="
                  lvl.step < currentStep ? 'bg-success text-white' :
                  lvl.step === currentStep ? 'bg-primary text-white ring-4 ring-primary/20' :
                  'bg-surface-line text-textColor3'
                "
              >
                <n-icon v-if="lvl.step < currentStep" size="14">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                </n-icon>
                <span v-else>{{ lvl.step }}</span>
              </div>
              <!-- Connector -->
              <div class="flex-1 flex items-center gap-2">
                <span
                  class="text-sm"
                  :class="
                    lvl.step <= currentStep ? 'text-textColor0 font-medium' : 'text-textColor3'
                  "
                >{{ lvl.label }}</span>
              </div>
              <!-- Active dot -->
              <div
                v-if="lvl.step === currentStep"
                class="w-2 h-2 rounded-full bg-primary animate-pulse"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications list -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-textColor0">{{ $t('vacancy.applications') }}</span>
          <n-button
            size="small"
            type="primary"
            secondary
            @click="store.openApplicationsTab(v)"
          >
            {{ $t('vacancy.allApplications') }}
          </n-button>
        </div>

        <n-spin :show="false">
          <div v-if="store.viewApplications.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div
              v-for="app in store.viewApplications"
              :key="app.id"
              class="app-card"
            >
              <div class="flex items-start gap-3">
                <UIUser
                  :short="false"
                  :data="{
                    photo: app.user?.photo,
                    lastName: app.user?.last_name,
                    firstName: app.user?.first_name,
                    middleName: app.user?.middle_name,
                    position: app.user?.current_region?.name
                  }"
                />
              </div>

              <div class="flex items-center justify-between mt-3 pt-2 border-t border-surface-line">
                <div class="flex items-center gap-1.5">
                  <UIBadge
                    class="!w-auto"
                    :show-icon="false"
                    :label="getStatusLabel(app.status?.id)"
                    :type="getStatusType(app.status?.id)"
                  />
                  <div class="flex gap-1 ml-1">
                    <n-button
                      v-for="file in app.files"
                      :key="file.id"
                      size="tiny"
                      secondary
                      @click="openFile(file.file)"
                    >
                      <template #icon><n-icon :component="Attach16Regular" /></template>
                    </n-button>
                  </div>
                </div>
                <n-button size="tiny" type="primary" @click="store.openDetailModal(app)">
                  {{ $t('content.more') }}
                </n-button>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-textColor3 py-8 text-sm">
            {{ $t('content.noData') }}
          </div>
        </n-spin>
      </div>

    </div>

    <ApplicationDetailModal />
  </UIModal>
</template>

<style scoped>
.info-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: white;
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 8px;
}

.app-card {
  padding: 12px;
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 10px;
  background: white;
  transition: box-shadow 0.2s;
}

.app-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}
</style>
