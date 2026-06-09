<script setup>
  import { UIBadge, UIUser } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import ApplicationDetailModal from './ApplicationDetailModal.vue'
  import ApplicationActionModal from './ApplicationActionModal.vue'
  import ApplicationUploadModal from './ApplicationUploadModal.vue'
  import ApplicationMeetModal from './ApplicationMeetModal.vue'
  import ApplicationExamModal from './ApplicationExamModal.vue'
  import Utils from '@/utils/Utils.js'
  import numeral from 'numeral'
  import {
    People20Regular,
    CalendarLtr20Regular,
    Money20Regular,
    Star20Regular,
    Book20Regular,
    Briefcase20Regular,
    Attach16Regular,
    Location20Regular,
    DocumentText20Regular,
    Certificate20Regular,
    BuildingMultiple20Regular,
    CheckmarkCircle20Regular,
    Checkmark16Regular,
    ArrowRight20Regular,
    ClipboardTask20Regular,
    Attach20Regular,
    Video20Regular,
    LinkSquare20Regular,
    DocumentCheckmark20Regular,
    DocumentDismiss20Regular,
    BookSearch20Regular,
    Dismiss16Regular,
    Eye20Regular,
    Warning20Regular,
  } from '@vicons/fluent'

  const store = useVacancyStore()
  const v = computed(() => store.viewData)

  const EDUCATION_LEVELS = { 1: "O'rta", 2: "O'rta maxsus", 3: 'Oliy', 4: 'Magistr' }

  const t = i18n.global.t.bind(i18n.global)

  const LEVELS = computed(() => [
    { step: 1, label: t('vacancy.levels.one') },
    { step: 2, label: t('vacancy.levels.two') },
    { step: 3, label: t('vacancy.levels.three') },
    { step: 4, label: t('vacancy.levels.four') },
    { step: 5, label: t('vacancy.levels.five') },
    { step: 6, label: t('vacancy.levels.six') },
  ])

  const currentStep = computed(() => v.value?.vacancy_status?.id ?? 1)

  // Keyingi bosqich confirm modal
  const nextStepConfirm = ref(false)

  // Tanlangan bosqich (highlight uchun)
  const selectedStep = ref(null)
  const activeStep = computed(() => selectedStep.value ?? currentStep.value)

  // vacancyData o'zgarganda yoki bosqich o'zganda selectedStep reset
  watch(() => store.viewData?.id, () => {
    selectedStep.value = null
    openBlocks.position_obligations = false
    openBlocks.qualification_requirements = false
    openBlocks.working_conditions = false
    openBlocks.specialties = false
  })

  watch(() => store.viewData?.vacancy_status?.id, () => {
    selectedStep.value = null
  })

  const selectStep = (step) => {
    if (step > currentStep.value) return
    selectedStep.value = step
  }

  const LEVEL_NAMES = computed(() => ({
    'messages.vacancy.levels.one':   t('vacancy.levels.one'),
    'messages.vacancy.levels.two':   t('vacancy.levels.two'),
    'messages.vacancy.levels.three': t('vacancy.levels.three'),
    'messages.vacancy.levels.four':  t('vacancy.levels.four'),
    'messages.vacancy.levels.five':  t('vacancy.levels.five'),
    'messages.vacancy.levels.six':   t('vacancy.levels.six'),
  }))
  const vacancyStatusName = computed(() =>
    LEVEL_NAMES.value[v.value?.vacancy_status?.name] || v.value?.vacancy_status?.name || '—'
  )

  const getStatusType = (statusId) => {
    if (statusId === 2) return Utils.colorTypes.success
    if (statusId === 3) return Utils.colorTypes.error
    return Utils.colorTypes.warning
  }
  const openFile = (url) => window.open(url, '_blank')

  // Tanlangan / joriy levelga mos ariza statusi
  const getLevelStatus = (app) =>
    app.statuses?.find(s => s.type?.id === activeStep.value) || null

  const FILE_BASE = 'https://hrm-api.railway.uz/hrm-s3/hrm/'

  const getFileTypeName = (id) =>
    store.fileTypes.find(ft => ft.id === id)?.name || `Fayl ${id}`

  const hasDetailContent = (app) => {
    if (activeStep.value === 5) return true   // exam qatori har doim ko'rinadi
    const d = getLevelStatus(app)?.details
    if (!d) return false
    if (!Array.isArray(d) && d?.number) return true
    if (Array.isArray(d) && d.length > 0) return true
    if (d?.zoom) return true
    if (d?.files?.length) return true
    if (d?.exams) return true
    return false
  }

  const openBlocks = reactive({
    position_obligations: false,
    qualification_requirements: false,
    working_conditions: false,
    specialties: false,
  })
  const toggleBlock = (key) => { openBlocks[key] = !openBlocks[key] }

  const onConfirmNextStep = async () => {
    await store._changeStatus()
    nextStepConfirm.value = false
  }
</script>

<template>
  <div v-if="v" class="flex flex-col gap-4">
    <!-- Main card -->
    <n-spin :show="store.viewLoading">
      <div class="rounded-xl border border-surface-line bg-surface-section overflow-hidden">
        <!-- ── 1. Tashkilot sarlavhasi ── -->
        <div class="card-header">
          <div class="card-header-icon">
            <n-icon size="20" color="white"><BuildingMultiple20Regular /></n-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-textColor0 leading-tight truncate">{{ v.organization?.name }}</p>
            <p class="text-xs text-textColor3 mt-0.5 truncate">{{ v.department?.name }} · {{ v.position?.name }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <UIBadge
              v-if="v.phd_status"
              class="!w-auto"
              :show-icon="false"
              :label="$t('vacancy.phdRequired')"
              :type="Utils.colorTypes.info"
            />
            <UIBadge
              class="!w-auto"
              :show-icon="false"
              :label="vacancyStatusName"
              :type="v?.vacancy_status?.id === 6 ? Utils.colorTypes.success : Utils.colorTypes.warning"
            />
            <n-button
              size="small"
              type="error"
              secondary
              @click="store.finishConfirmVisible = true"
            >
              <template #icon><n-icon><Warning20Regular /></n-icon></template>
              {{ $t('vacancy.finishBtn') }}
            </n-button>
          </div>
        </div>

        <!-- ── 2. Asosiy ma'lumotlar — chip qator ── -->
        <div class="px-5 py-4 border-b border-surface-line bg-surface-section">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="stat-box">
              <div class="stat-icon"><n-icon size="15"><People20Regular /></n-icon></div>
              <span class="stat-label">{{ $t('vacancy.form.rate') }}</span>
              <span class="stat-val">{{ v.rate }}</span>
            </div>

            <div class="stat-box">
              <div class="stat-icon"><n-icon size="15"><CalendarLtr20Regular /></n-icon></div>
              <span class="stat-label">{{ $t('vacancy.form.to') }}</span>
              <span class="stat-val">{{ Utils.timeOnlyDate(v.to) }}</span>
            </div>

            <div class="stat-box">
              <div class="stat-icon"><n-icon size="15"><Money20Regular /></n-icon></div>
              <span class="stat-label">{{ $t('departmentPositionPage.form.salary') }}</span>
              <span class="stat-val">
                {{ v.salary_status ? numeral(v.salary).format('0,0') : '—' }}
                <span v-if="v.salary_status" class="text-xs font-normal text-textColor3"> {{ $t('content.sum') }}</span>
              </span>
            </div>

            <div class="stat-box">
              <div class="stat-icon"><n-icon size="15"><Star20Regular /></n-icon></div>
              <span class="stat-label">{{ $t('vacancy.form.short_experience') }}</span>
              <span class="stat-val">{{ v.experience == 0 ? $t('vacancy.noExperience') : v.experience + ' yil' }}</span>
            </div>

            <div class="stat-box">
              <div class="stat-icon"><n-icon size="15"><Book20Regular /></n-icon></div>
              <span class="stat-label">{{ $t('medWorker.form.education') }}</span>
              <span class="stat-val">{{ v.education?.name }}</span>
            </div>

            <div class="stat-box">
              <div class="stat-icon"><n-icon size="15"><Briefcase20Regular /></n-icon></div>
              <span class="stat-label">{{ $t('vacancy.form.work_type') }}</span>
              <span class="stat-val">{{ v.work_type?.name }}</span>
            </div>
          </div>
        </div>

        <!-- ── 3. Manzil ── -->
        <div v-if="v.address || v.city" class="flex items-center gap-2 px-5 py-3 border-b border-surface-line bg-surface-ground text-sm text-textColor2">
          <n-icon size="15" class="text-textColor3 shrink-0"><Location20Regular /></n-icon>
          <span v-if="v.city?.region?.name">{{ v.city.region.name }}<span v-if="v.city?.name">, {{ v.city.name }}</span></span>
          <span v-if="v.address" class="text-textColor3">·</span>
          <span v-if="v.address">{{ v.address }}</span>
        </div>

        <!-- ── 4. Matn bloklari ── -->
        <div
          v-if="v.position_obligations || v.qualification_requirements || v.working_conditions || v.specialties"
          class="collapse-grid"
        >
          <div v-if="v.position_obligations" class="collapse-block">
            <button class="collapse-header" @click="toggleBlock('position_obligations')">
              <div class="flex items-center gap-2">
                <n-icon size="14" class="text-textColor3"><DocumentText20Regular /></n-icon>
                <span>{{ $t('vacancy.form.position_obligations') }}</span>
              </div>
              <n-icon size="16" class="collapse-icon" :class="{ 'collapse-icon--open': openBlocks.position_obligations }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </n-icon>
            </button>
            <div v-show="openBlocks.position_obligations" class="collapse-body" v-html="v.position_obligations"></div>
          </div>

          <div v-if="v.qualification_requirements" class="collapse-block">
            <button class="collapse-header" @click="toggleBlock('qualification_requirements')">
              <div class="flex items-center gap-2">
                <n-icon size="14" class="text-textColor3"><Certificate20Regular /></n-icon>
                <span>{{ $t('vacancy.form.qualification_requirements') }}</span>
              </div>
              <n-icon size="16" class="collapse-icon" :class="{ 'collapse-icon--open': openBlocks.qualification_requirements }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </n-icon>
            </button>
            <div v-show="openBlocks.qualification_requirements" class="collapse-body" v-html="v.qualification_requirements"></div>
          </div>

          <div v-if="v.working_conditions" class="collapse-block">
            <button class="collapse-header" @click="toggleBlock('working_conditions')">
              <div class="flex items-center gap-2">
                <n-icon size="14" class="text-textColor3"><Briefcase20Regular /></n-icon>
                <span>{{ $t('vacancy.form.working_conditions') }}</span>
              </div>
              <n-icon size="16" class="collapse-icon" :class="{ 'collapse-icon--open': openBlocks.working_conditions }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </n-icon>
            </button>
            <div v-show="openBlocks.working_conditions" class="collapse-body" v-html="v.working_conditions"></div>
          </div>

          <div v-if="v.specialties" class="collapse-block">
            <button class="collapse-header" @click="toggleBlock('specialties')">
              <div class="flex items-center gap-2">
                <n-icon size="14" class="text-textColor3"><CheckmarkCircle20Regular /></n-icon>
                <span>{{ $t('vacancy.form.specialties') }}</span>
              </div>
              <n-icon size="16" class="collapse-icon" :class="{ 'collapse-icon--open': openBlocks.specialties }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </n-icon>
            </button>
            <div v-show="openBlocks.specialties" class="collapse-body" v-html="v.specialties"></div>
          </div>
        </div>

        <!-- ── 5. Arrow progress ── -->
        <div class="px-5 py-4 border-b border-surface-line">
          <p class="text-xs font-medium text-textColor3 mb-3">{{ $t('vacancy.vacancyLevel') }}</p>
          <div class="flex items-center gap-3">
            <div class="arrow-steps flex-1">
              <div
                v-for="(lvl, idx) in LEVELS"
                :key="lvl.step"
                class="arrow-step"
                :class="{
                  'arrow-step--done': lvl.step <= currentStep && lvl.step !== activeStep,
                  'arrow-step--active': lvl.step === activeStep,
                  'arrow-step--disabled': lvl.step > currentStep,
                  'arrow-step--first': idx === 0,
                  'arrow-step--last': idx === LEVELS.length - 1,
                }"
                @click="selectStep(lvl.step)"
              >
                <span class="step-num">
                  <n-icon v-if="lvl.step === activeStep" size="12"><Checkmark16Regular /></n-icon>
                  <template v-else>{{ lvl.step }}</template>
                </span>
                <span class="step-label">{{ lvl.label }}</span>
              </div>
            </div>

            <!-- Keyingi bosqich button -->
            <div
              v-if="currentStep < LEVELS.length"
              class="next-step-btn"
              :class="{ 'next-step-btn--loading': store.changeStatusLoading }"
              @click="!store.changeStatusLoading && (nextStepConfirm = true)"
            >
              <n-spin v-if="store.changeStatusLoading" :size="14" />
              <n-icon v-else size="15"><ArrowRight20Regular /></n-icon>
              <span>{{ LEVELS[currentStep]?.label }}{{ $t('vacancy.nextStepGo') }}</span>
            </div>

          </div>
        </div>

        <!-- ── 6. Arizalar ── -->
        <div class="px-5 py-4" v-if="!store.viewLoading">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-1 h-4 rounded-full bg-primary"></div>
            <span class="font-semibold text-textColor0">{{ $t('vacancy.applications') }}</span>
            <span class="text-xs text-textColor3">({{ store.viewApplications.length }} ta)</span>
          </div>

          <div v-if="store.viewApplications.length > 0" class="flex flex-col gap-2">
            <div
              v-for="app in store.viewApplications"
              :key="app.id"
              class="app-card"
            >
              <!-- Yuqori qism: avatar + ism + status + amal -->
              <div class="flex items-center gap-2 px-3 py-2">
                <UIUser
                  :short="false"
                  class="flex-1 min-w-0"
                  :data="{
                    photo: app.user?.photo,
                    lastName: app.user?.last_name,
                    firstName: app.user?.first_name,
                    middleName: app.user?.middle_name,
                  }"
                  :hide-tooltip="true"
                >
                  <template #name>
                    <span class="app-user-name" @click="store.openDetailModal(app)">
                      {{ app.user?.last_name }} {{ app.user?.first_name }} {{ app.user?.middle_name }}
                    </span>
                  </template>
                  <template #position>
                    <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                      <n-button
                        size="tiny"
                        :type="getStatusType(app.status?.id)"
                        dashed
                      >
                        {{ app.status?.name }}
                      </n-button>
                      <n-popover
                        v-if="app.files?.length"
                        trigger="click"
                        placement="bottom-start"
                        :show-arrow="false"
                      >
                        <template #trigger>
                          <n-button size="tiny" secondary>
                            <template #icon><n-icon><Attach16Regular /></n-icon></template>
                            {{ app.files.length }} {{ $t('vacancy.docsLabel') }}
                          </n-button>
                        </template>
                        <div class="flex flex-col gap-0.5" style="min-width: 180px">
                          <div
                            v-for="file in app.files"
                            :key="file.id"
                            class="file-popup-item"
                            @click="openFile(file.file)"
                          >
                            <n-icon size="12" class="shrink-0 text-primary"><Attach16Regular /></n-icon>
                            <span class="truncate flex-1">{{ file.file_type?.name || $t('content.file') }}</span>
                          </div>
                        </div>
                      </n-popover>
                      <template v-if="activeStep === 6">
                        <n-button
                          size="tiny"
                          type="success"
                          secondary
                          :loading="store.acceptingDirectAppId === app.id"
                          @click="store.openAcceptConfirm(app)"
                        >
                          {{ $t('vacancy.acceptBtn') }}
                        </n-button>
                      </template>
                      <n-button
                        size="tiny"
                        type="error"
                        secondary
                        @click="store.openRejectConfirm(app)"
                      >
                        {{ $t('vacancy.rejectBtn') }}
                      </n-button>
                    </div>
                  </template>
                </UIUser>
                <div class="flex items-center gap-2 shrink-0">
                  <n-button v-if="activeStep === 3" size="tiny" secondary @click="store.openMeetModal(app)">
                    <template #icon><n-icon><Video20Regular /></n-icon></template>
                    {{ $t('vacancy.zoom') }}
                  </n-button>
                  <n-button size="tiny" secondary @click="store.openUploadModal(app, activeStep)">
                    <template #icon><n-icon><Attach20Regular /></n-icon></template>
                    {{ $t('vacancy.uploadDocBtn') }}
                  </n-button>
                  <n-button v-if="activeStep !== 1" size="tiny" type="primary" @click="store.openActionModal(app, activeStep)">
                    <template #icon><n-icon><ClipboardTask20Regular /></n-icon></template>
                    {{ $t('vacancy.evaluateBtn') }}
                  </n-button>
                </div>
              </div>

              <!-- Pastki qism: ma'lumotlar -->
              <div class="app-info-row">
                <div class="app-info-item">
                  <span class="aii-label">{{ $t('vacancy.pin') }}</span>
                  <span class="aii-val font-mono">{{ app.user?.pin || '—' }}</span>
                </div>
                <div class="app-info-item">
                  <span class="aii-label">{{ $t('content.birthday') }}</span>
                  <span class="aii-val">{{ app.user?.birthday ? Utils.timeOnlyDate(app.user.birthday) : '—' }}</span>
                </div>
                <div class="app-info-item">
                  <span class="aii-label">{{ $t('vacancy.gender') }}</span>
                  <span class="aii-val">{{ app.user?.sex !== undefined ? (app.user.sex ? $t('enum.man') : $t('enum.woman')) : '—' }}</span>
                </div>
                <div class="app-info-item">
                  <span class="aii-label">{{ $t('medWorker.form.education') }}</span>
                  <span class="aii-val">{{ app.user?.education ? (EDUCATION_LEVELS[app.user.education] || app.user.education) : '—' }}</span>
                </div>
                <div class="app-info-item">
                  <span class="aii-label">{{ $t('content.date') }}</span>
                  <span class="aii-val">{{ Utils.timeOnlyDate(app.created_at) }}</span>
                </div>
                <!-- Joriy level statusi -->
                <div class="app-info-item">
                  <span class="aii-label">{{ $t('vacancy.applicationStatusLabel') }}</span>
                  <UIBadge
                    v-if="getLevelStatus(app)"
                    class="!w-auto mt-0.5"
                    :show-icon="false"
                    :label="getLevelStatus(app).status?.name"
                    :type="getStatusType(getLevelStatus(app).status?.id)"
                  />
                  <span v-else class="aii-val text-textColor3">—</span>
                </div>
              </div>

              <!-- Details section -->
              <template v-if="getLevelStatus(app) || activeStep === 5">
                <div class="app-details-section">
                  <!-- Ma'lumot yo'q -->
                  <div v-if="!hasDetailContent(app)" class="app-details-empty">
                    {{ $t('content.no-data') }}
                  </div>

                  <!-- Level 1: raqam + sana -->
                  <div
                    v-if="!Array.isArray(getLevelStatus(app)?.details) && getLevelStatus(app)?.details?.number"
                    class="app-details-row"
                  >
                    <span class="app-details-label">{{ $t('vacancy.applicationNumber') }}</span>
                    <div class="app-details-content">
                      <span class="font-mono text-xs text-textColor1">№ {{ getLevelStatus(app).details.number }}</span>
                      <span v-if="getLevelStatus(app).details.created" class="text-xs text-textColor3">
                        · {{ Utils.timeOnlyDate(getLevelStatus(app).details.created) }}
                      </span>
                    </div>
                  </div>

                  <!-- Level 2: fayl holatlari (array) -->
                  <div
                    v-if="Array.isArray(getLevelStatus(app)?.details) && getLevelStatus(app).details.length"
                    class="app-details-row"
                  >
                    <span class="app-details-label">{{ $t('vacancy.docsLabel') }}</span>
                    <div class="app-details-content app-details-content--wrap">
                      <div
                        v-for="d in getLevelStatus(app).details" :key="d.file_type" class="app-file-chip"
                        :class="d.status === 2 ? 'app-file-chip--yes' : 'app-file-chip--no'"
                      >
                        <n-icon size="11">
                          <DocumentCheckmark20Regular v-if="d.status === 2" />
                          <DocumentDismiss20Regular v-else />
                        </n-icon>
                        <span>{{ getFileTypeName(d.file_type) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Level 3: Zoom -->
                  <div v-if="getLevelStatus(app)?.details?.zoom" class="app-details-row">
                    <span class="app-details-label">{{ $t('vacancy.zoom') }}</span>
                    <div class="app-details-content">
                      <span class="font-mono text-xs text-textColor2">ID: {{ getLevelStatus(app).details.zoom.meet_id }}</span>
                      <button class="app-zoom-btn" @click="openFile(getLevelStatus(app).details.zoom.join_url)">
                        <n-icon size="11"><LinkSquare20Regular /></n-icon>
                        {{ $t('vacancy.joinZoom') }}
                      </button>
                    </div>
                  </div>

                  <!-- Level 4/5: yuklangan fayllar -->
                  <div v-if="getLevelStatus(app)?.details?.files?.length" class="app-details-row">
                    <span class="app-details-label">{{ $t('vacancy.docsLabel') }}</span>
                    <div class="app-details-content app-details-content--wrap">
                      <button
                        v-for="(f, fi) in getLevelStatus(app).details.files"
                        :key="fi"
                        class="app-zoom-btn"
                        @click="openFile(FILE_BASE + f.file_path)"
                      >
                        <n-icon size="11"><Attach16Regular /></n-icon>
                        {{ f.file_name }}
                      </button>
                    </div>
                  </div>

                  <!-- Level 5: Onlayn test exam -->
                  <template v-if="activeStep === 5">
                    <div class="app-details-row">
                      <span class="app-details-label">{{ $t('vacancy.examLabel') }}</span>
                      <div class="app-details-content">
                        <template v-if="getLevelStatus(app)?.details?.exams">
                          <!-- Online: switch -->
                          <n-switch
                            v-if="!getLevelStatus(app).details.exams.exam_type"
                            :value="getLevelStatus(app).details.exams.status"
                            :loading="store.togglingExamAppId === app.id"
                            size="small"
                            @update:value="val => store._toggleExamStatus(app, getLevelStatus(app).details.exams, val)"
                          />
                          <span class="text-xs font-medium text-textColor1 flex-1">
                            {{ getLevelStatus(app).details.exams.exam_name }}
                            <span v-if="getLevelStatus(app).details.exams.exam_type" class="offline-badge ml-1">{{ $t('vacancy.offlineBadge') }}</span>
                          </span>
                          <n-button
                            size="tiny"
                            type="error"
                            secondary
                            :loading="store.detachingDirectAppId === app.id"
                            @click="store._detachExamDirect(app, getLevelStatus(app).details.exams.vacancy_application_exam)"
                          >
                            <template #icon><n-icon><Dismiss16Regular /></n-icon></template>
                            {{ $t('vacancy.removeBtn') }}
                          </n-button>
                        </template>
                        <template v-else>
                          <button class="app-zoom-btn" @click="store.openExamModal(app)">
                            <n-icon size="11"><BookSearch20Regular /></n-icon>
                            {{ $t('vacancy.exam.attachBtn') }}
                          </button>
                        </template>
                      </div>
                    </div>

                    <!-- Offline exam qo'shimcha ma'lumotlari -->
                    <template v-if="getLevelStatus(app)?.details?.exams?.exam_type">
                      <div class="app-details-row">
                        <span class="app-details-label">{{ $t('vacancy.resultLabel') }}</span>
                        <div class="app-details-content">
                          <span class="text-xs font-semibold text-textColor0">{{ getLevelStatus(app).details.exams.result }} {{ $t('vacancy.ballUnit') }}</span>
                        </div>
                      </div>
                      <div class="app-details-row">
                        <span class="app-details-label">{{ $t('vacancy.startLabel') }}</span>
                        <div class="app-details-content">
                          <span class="text-xs text-textColor2">{{ getLevelStatus(app).details.exams.created }}</span>
                        </div>
                      </div>
                      <div class="app-details-row">
                        <span class="app-details-label">{{ $t('vacancy.endLabel') }}</span>
                        <div class="app-details-content">
                          <span class="text-xs text-textColor2">{{ getLevelStatus(app).details.exams.ended }}</span>
                        </div>
                      </div>
                    </template>
                  </template>
                </div>
              </template>
            </div>
          </div>

          <div v-else class="text-center text-textColor3 py-8 text-sm">
            {{ $t('content.no-data') }}
          </div>
        </div>
      </div>
    </n-spin>

    <!-- Keyingi bosqich confirm -->
    <n-modal v-model:show="nextStepConfirm" :mask-closable="false" style="max-width: 400px">
      <div class="confirm-modal">
        <div class="confirm-icon">
          <n-icon size="22" color="white"><ArrowRight20Regular /></n-icon>
        </div>
        <div class="flex flex-col gap-1">
          <p class="confirm-title">{{ $t('vacancy.nextStep.title') }}</p>
          <p
            class="confirm-text"
            v-html="$t('vacancy.nextStep.text', {
              current: `<strong>${LEVELS.find(l => l.step === currentStep)?.label}</strong>`,
              next: `<strong>${LEVELS[currentStep]?.label}</strong>`
            })"
          />
        </div>
        <div class="confirm-actions">
          <n-button @click="nextStepConfirm = false">{{ $t('vacancy.cancelBtn') }}</n-button>
          <n-button
            type="primary"
            :loading="store.changeStatusLoading"
            @click="onConfirmNextStep"
          >
            {{ $t('vacancy.confirmBtn') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <ApplicationDetailModal />
    <ApplicationActionModal />
    <ApplicationUploadModal />
    <ApplicationMeetModal />
    <ApplicationExamModal />

    <!-- Rad qilish tasdiq modali -->
    <n-modal
      v-model:show="store.rejectConfirmVisible"
      :mask-closable="false"
      preset="card"
      :style="{ width: '420px' }"
      :title="$t('vacancy.rejectModal.title')"
      @update:show="show => !show && store.closeRejectConfirm()"
    >
      <div class="flex flex-col gap-4">
        <!-- Info blok -->
        <div class="reject-info-card">
          <div class="reject-info-icon">
            <n-icon size="18"><Warning20Regular /></n-icon>
          </div>
          <p class="reject-info-text" v-html="$t('vacancy.rejectModal.text')" />
        </div>

        <!-- Nomzod -->
        <div v-if="store.rejectConfirmApp?.user" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-50 border border-surface-line">
          <n-avatar
            :src="store.rejectConfirmApp.user.photo"
            :size="32"
            round
            object-fit="cover"
            class="shrink-0 border border-surface-line"
          />
          <span class="text-sm font-semibold text-textColor0 truncate">
            {{ store.rejectConfirmApp.user.last_name }}
            {{ store.rejectConfirmApp.user.first_name }}
            {{ store.rejectConfirmApp.user.middle_name }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 pt-1">
          <n-button @click="store.closeRejectConfirm()">{{ $t('vacancy.cancelBtn') }}</n-button>
          <n-button
            type="error"
            :loading="store.rejectingDirectAppId !== null"
            @click="store._rejectDirect()"
          >
            {{ $t('vacancy.rejectModal.confirmBtn') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Qabul qilish tasdiq modali -->
    <n-modal
      v-model:show="store.acceptConfirmVisible"
      :mask-closable="false"
      preset="card"
      :style="{ width: '420px' }"
      :title="$t('vacancy.acceptModal.title')"
      @update:show="show => !show && store.closeAcceptConfirm()"
    >
      <div class="flex flex-col gap-4">
        <!-- Info blok -->
        <div class="accept-info-card">
          <div class="accept-info-icon">
            <n-icon size="18"><CheckmarkCircle20Regular /></n-icon>
          </div>
          <p class="accept-info-text" v-html="$t('vacancy.acceptModal.text')" />
        </div>

        <!-- Nomzod -->
        <div v-if="store.acceptConfirmApp?.user" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-50 border border-surface-line">
          <n-avatar
            :src="store.acceptConfirmApp.user.photo"
            :size="32"
            round
            object-fit="cover"
            class="shrink-0 border border-surface-line"
          />
          <span class="text-sm font-semibold text-textColor0 truncate">
            {{ store.acceptConfirmApp.user.last_name }}
            {{ store.acceptConfirmApp.user.first_name }}
            {{ store.acceptConfirmApp.user.middle_name }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 pt-1">
          <n-button @click="store.closeAcceptConfirm()">{{ $t('vacancy.cancelBtn') }}</n-button>
          <n-button
            type="success"
            :loading="store.acceptingDirectAppId !== null"
            @click="store._acceptDirect()"
          >
            {{ $t('vacancy.acceptModal.confirmBtn') }}
          </n-button>
        </div>
      </div>
    </n-modal>

    <!-- Vakansiyani tugatish tasdiq modali -->
    <n-modal
      v-model:show="store.finishConfirmVisible"
      :mask-closable="false"
      preset="card"
      :style="{ width: '460px' }"
      :title="$t('vacancy.finishModal.title')"
      @update:show="show => !show && (store.finishConfirmVisible = false)"
    >
      <div class="flex flex-col gap-4">

        <!-- Asosiy info blok -->
        <div class="finish-info-card">
          <div class="finish-info-icon">
            <n-icon size="20"><Warning20Regular /></n-icon>
          </div>
          <div class="flex flex-col gap-1.5 min-w-0 flex-1">
            <p class="finish-info-text" v-html="$t('vacancy.finishModal.text')" />
            <p class="finish-warning-text">{{ $t('vacancy.finishModal.warningText') }}</p>
          </div>
        </div>

        <!-- Vakansiya nomi -->
        <div v-if="v" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-ground border border-surface-line">
          <div class="finish-vacancy-icon">
            <n-icon size="15"><BuildingMultiple20Regular /></n-icon>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-semibold text-textColor0 truncate">{{ v.position?.name }}</span>
            <span class="text-xs text-textColor3 truncate">{{ v.department?.name }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 pt-1">
          <n-button @click="store.finishConfirmVisible = false">{{ $t('vacancy.cancelBtn') }}</n-button>
          <n-button
            type="error"
            :loading="store.finishLoading"
            @click="store._finishVacancy()"
          >
            {{ $t('vacancy.finishModal.confirmBtn') }}
          </n-button>
        </div>

      </div>
    </n-modal>
  </div>
</template>

<style scoped>
/* ── Card header ── */
.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: var(--surface-section);
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
.card-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary-color, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Stat boxes ── */
.stat-box {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  background: var(--surface-section);
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 10px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.stat-box:hover {
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #3b82f6) 12%, transparent);
}
.stat-icon {
  color: var(--textColor3);
  line-height: 1;
}
.stat-label {
  font-size: 10px;
  color: var(--textColor3);
  line-height: 1.2;
}
.stat-val {
  font-size: 13px;
  font-weight: 600;
  color: var(--textColor0);
  line-height: 1.3;
}

/* ── Collapse blocks ── */
.collapse-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}

/* row 1: col1 | col2 */
.collapse-grid .collapse-block:nth-child(1),
.collapse-grid .collapse-block:nth-child(2) {
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
/* vertical divider between columns */
.collapse-grid .collapse-block:nth-child(odd) {
  border-right: 1px solid var(--surface-line, #e5e7eb);
}

.collapse-block {}

.collapse-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: var(--textColor0);
  transition: background 0.15s;
}
.collapse-header:hover {
  background: var(--surface-ground);
}

.collapse-icon {
  color: var(--textColor3);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.collapse-icon--open {
  transform: rotate(180deg);
}

.collapse-body {
  padding: 4px 20px 14px 20px;
  font-size: 13px;
  color: var(--textColor1);
  line-height: 1.6;
}

/* ── Arrow steps ── */
.arrow-steps {
  display: flex;
  width: 100%;
}
.arrow-step {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 8px 9px 20px;
  background: var(--surface-ground);
  color: var(--textColor3);
  font-size: 12px;
  margin-left: -1px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%);
  transition: background 0.2s, color 0.2s;
}
.arrow-step--first {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
  padding-left: 12px;
  border-radius: 6px 0 0 6px;
}
.arrow-step--last {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%);
  padding-right: 12px;
  border-radius: 0 6px 6px 0;
}
.arrow-step--done {
  background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section));
  color: var(--success-color);
  cursor: pointer;
}
.arrow-step--done:hover {
  background: color-mix(in srgb, var(--success-color) 25%, var(--surface-section));
}
.arrow-step--active {
  background: var(--primary-color, #3b82f6);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.arrow-step--active:hover {
  opacity: 0.88;
}
.arrow-step--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
.step-num {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}
.arrow-step--active .step-num { background: rgba(255,255,255,0.25); }
.arrow-step--done   .step-num {
  background: color-mix(in srgb, var(--success-color) 25%, var(--surface-section));
  color: var(--success-color);
}
.step-label {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Confirm modal ── */
.confirm-modal {
  background: linear-gradient(145deg, color-mix(in srgb, var(--primary-color) 4%, var(--surface-section)) 0%, var(--surface-section) 60%);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.confirm-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary-color, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.confirm-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--textColor0);
}
.confirm-text {
  font-size: 13px;
  color: var(--textColor2);
  line-height: 1.6;
}
.confirm-text strong {
  color: var(--textColor0);
  font-weight: 600;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}

/* ── Next step button ── */
.next-step-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  align-self: stretch;
  padding: 0 16px;
  background: var(--primary-color, #3b82f6);
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
  user-select: none;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color, #3b82f6) 35%, transparent);
}
.next-step-btn:hover {
  opacity: 0.9;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--primary-color, #3b82f6) 45%, transparent);
}
.next-step-btn:active {
  transform: scale(0.98);
}
.next-step-btn--loading {
  opacity: 0.65;
  cursor: not-allowed;
}

/* ── App card ── */
.app-card {
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-section);
  transition: border-color 0.15s;
}
.app-card:hover {
  border-color: color-mix(in srgb, var(--primary-color, #3b82f6) 40%, transparent);
}



/* UIUser override */
.app-card :deep(.n-avatar) {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
}
.app-card :deep(.ui__user-component) {
  gap: 8px;
  cursor: default;
}
.app-card :deep(.ui__user-component > div) {
  width: calc(100% - 46px);
}
.app-card :deep(.ui__user-component span.line-clamp-1) {
  -webkit-line-clamp: unset;
  overflow: visible;
  white-space: normal;
  word-break: break-word;
}

/* Info row — equal columns with dividers */
.app-info-row {
  display: flex;
  border-top: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-ground);
}
.app-info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 5px 10px;
  border-right: 1px solid var(--surface-line, #e5e7eb);
}
.app-info-item:last-child {
  border-right: none;
}
.aii-label {
  font-size: 9px;
  color: var(--textColor3);
  white-space: nowrap;
}
.aii-val {
  font-size: 11px;
  font-weight: 600;
  color: var(--textColor0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── File chip ── */

/* ── File popup item ── */
.file-popup-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  color: var(--textColor1);
  transition: background 0.12s;
}
.file-popup-item:hover {
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  color: var(--primary-color);
}

/* ── App card details section ── */
.app-details-section {
  border-top: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-ground);
  display: flex;
  flex-direction: column;
  gap: 0;
}
.app-details-empty {
  padding: 5px 10px;
  font-size: 10px;
  color: var(--textColor3);
  font-style: italic;
}
.app-details-row {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
.app-details-row:last-child {
  border-bottom: none;
}
/* ── Rad qilish modal ── */
.reject-info-card {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--warning-color) 10%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--warning-color) 25%, var(--surface-line));
  border-radius: 10px;
}
.reject-info-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--warning-color) 15%, var(--surface-section));
  color: var(--warning-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.reject-info-text {
  font-size: 13px;
  color: var(--warning-color);
  line-height: 1.6;
}

/* ── Qabul qilish modal ── */
.accept-info-card {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--success-color) 10%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--success-color) 25%, var(--surface-line));
  border-radius: 10px;
}
.accept-info-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section));
  color: var(--success-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.accept-info-text {
  font-size: 13px;
  color: var(--success-color);
  line-height: 1.6;
}

/* ── Vakansiyani tugatish modal ── */
.finish-info-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: color-mix(in srgb, var(--danger-color) 8%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--danger-color) 22%, var(--surface-line));
  border-radius: 10px;
}
.finish-info-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--danger-color) 15%, var(--surface-section));
  color: var(--danger-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.finish-info-text {
  font-size: 13px;
  color: var(--textColor1);
  line-height: 1.65;
}
.finish-info-text strong {
  color: var(--danger-color);
  font-weight: 700;
}
.finish-warning-text {
  font-size: 11px;
  font-weight: 600;
  color: var(--danger-color);
  opacity: 0.8;
}
.finish-vacancy-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--surface-line, #e5e7eb);
  color: var(--textColor2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.offline-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  color: var(--success-color);
  background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section));
  border-radius: 4px;
  padding: 1px 5px;
}
.app-details-label {
  flex-shrink: 0;
  width: 100px;
  padding: 5px 10px;
  font-size: 9px;
  font-weight: 600;
  color: var(--textColor3);
  border-right: 1px solid var(--surface-line, #e5e7eb);
  align-self: stretch;
  display: flex;
  align-items: center;
}
.app-details-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  padding: 5px 10px;
}
.app-details-content--wrap {
  flex-wrap: wrap;
}

/* ── App file chips (level 2) ── */
.app-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-section);
  color: var(--textColor2);
}
.app-file-chip--yes {
  color: var(--textColor1);
}
.app-file-chip--no {
  color: var(--textColor3);
}

/* ── App user name clickable ── */
.app-user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--textColor0);
  cursor: pointer;
  transition: color 0.15s;
}
.app-user-name:hover {
  color: var(--primary-color, #3b82f6);
  text-decoration: underline;
}

/* ── App zoom / file button ── */
.app-zoom-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-section);
  font-size: 11px;
  font-weight: 500;
  color: var(--textColor1);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.app-zoom-btn:hover {
  border-color: var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
}
.app-zoom-btn--danger:hover {
  border-color: color-mix(in srgb, var(--danger-color) 50%, transparent);
  color: var(--danger-color);
  background: color-mix(in srgb, var(--danger-color) 8%, var(--surface-section));
}
.app-zoom-btn--success:hover {
  border-color: color-mix(in srgb, var(--success-color) 50%, transparent);
  color: var(--success-color);
  background: color-mix(in srgb, var(--success-color) 8%, var(--surface-section));
}
.app-zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
