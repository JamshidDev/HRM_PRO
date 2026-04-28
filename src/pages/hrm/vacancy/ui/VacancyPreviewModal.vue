<script setup>
  import { UIModal } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import numeral from 'numeral'
  import i18n from '@/i18n/index.js'
  import {
    Wallet24Regular,
    Location24Regular,
    Clock16Regular,
    Briefcase20Regular,
    Certificate20Regular,
    BoxToolbox20Regular,
    ClipboardTaskListLtr20Regular,
    Briefcase24Regular,
    RibbonStar20Regular,
    FlowchartCircle24Regular,
    PersonAccounts24Regular,
    Call28Regular,
    Globe24Regular,
  } from '@vicons/fluent'

  const store = useVacancyStore()
  const t = i18n.global.t.bind(i18n.global)
  const v = computed(() => store.previewData)

  const daysLeft = computed(() => {
    if (!v.value?.to) return null
    return Math.ceil((new Date(v.value.to) - new Date()) / (1000 * 60 * 60 * 24))
  })
</script>

<template>
  <UIModal
    :width="920"
    height="88vh"
    v-model:visible="store.previewVisible"
    :title="v ? `${v.position?.name} — ${v.department?.name}` : ''"
    @update:visible="show => !show && store.closePreviewModal()"
  >
    <!-- Loading -->
    <div v-if="store.previewLoading" class="flex justify-center items-center py-20">
      <n-spin :size="30" />
    </div>

    <div v-else-if="v" class="flex gap-5 min-h-0">

      <!-- ══ CHAP SIDEBAR ══ -->
      <div class="sidebar-wrap">

        <!-- Tashkilot info -->
        <p class="sidebar-org-text">
          {{ v.organization?.name }},
          {{ v.department?.name }},
          {{ v.position?.name }}
        </p>

        <div class="sidebar-divider" />

        <!-- Kontaktlar -->
        <div class="contact-row">
          <n-icon size="18" class="contact-icon shrink-0"><Call28Regular /></n-icon>
          <span class="contact-val">{{ v.phone || $t('content.emptyData') }}</span>
        </div>
        <div class="contact-row">
          <n-icon size="18" class="contact-icon shrink-0"><Location24Regular /></n-icon>
          <span class="contact-val">{{ v.address || $t('content.emptyData') }}</span>
        </div>
        <div class="contact-row">
          <n-icon size="18" class="contact-icon shrink-0"><Globe24Regular /></n-icon>
          <span class="contact-val">{{ v.site || $t('content.emptyData') }}</span>
        </div>

      </div>

      <!-- ══ O'NG KONTENT ══ -->
      <div class="content-wrap">

        <!-- Sarlavha -->
        <div class="mb-4">
          <h2 class="text-lg font-bold text-textColor0 leading-tight">{{ v.position?.name }}</h2>
          <div class="flex items-center gap-1.5 mt-1">
            <n-icon size="14" class="text-primary"><Location24Regular /></n-icon>
            <span class="text-xs text-textColor2">{{ v.department?.name }}</span>
          </div>
        </div>

        <!-- Info grid -->
        <div class="info-grid mb-5">
          <div class="info-row">
            <n-icon size="17" class="text-primary shrink-0"><Wallet24Regular /></n-icon>
            <span class="info-text">
              {{ v.salary_status ? numeral(v.salary).format('0,0') + ' ' + $t('content.sum') : $t('vacancy.salaryNegotiable') }}
            </span>
          </div>
          <div class="info-row">
            <n-icon size="17" class="text-primary shrink-0"><Location24Regular /></n-icon>
            <span class="info-text">{{ v.address || v.city?.name || $t('content.emptyData') }}</span>
          </div>
          <div class="info-row">
            <n-icon size="17" class="text-primary shrink-0"><Clock16Regular /></n-icon>
            <span class="info-text">{{ v.work_type?.name || $t('content.emptyData') }}</span>
          </div>
          <div class="info-row">
            <n-icon size="17" class="text-primary shrink-0"><Briefcase20Regular /></n-icon>
            <span class="info-text">
              {{ v.experience ? $t('vacancy.minExp', { n: v.experience }) : $t('vacancy.noExperience') }}
            </span>
          </div>
          <div class="info-row">
            <n-icon size="17" class="text-primary shrink-0"><Certificate20Regular /></n-icon>
            <span class="info-text">{{ $t('medWorker.form.education') }}: {{ v.education?.name || $t('content.emptyData') }}</span>
          </div>
          <div class="info-row">
            <n-icon size="17" class="text-primary shrink-0"><BoxToolbox20Regular /></n-icon>
            <span class="info-text">{{ v.phd_status ? $t('vacancy.phdRequired') : $t('vacancy.phdNotRequired') }}</span>
          </div>
        </div>

        <!-- Stat kartochkalar — 2 kolonna -->
        <div class="stat-row mb-5">
          <!-- Nomzodlar soni -->
          <div class="stat-card stat-card--success">
            <div class="stat-icon stat-icon--success">
              <n-icon size="22"><PersonAccounts24Regular /></n-icon>
            </div>
            <div class="flex flex-col">
              <span class="stat-label">{{ $t('vacancy.candidatesCount') }}</span>
              <span class="stat-val">{{ v.applications?.length ?? 0 }}</span>
            </div>
          </div>

          <!-- Qolgan kun -->
          <div
            class="stat-card"
            :class="daysLeft !== null && daysLeft <= 5 ? 'stat-card--danger' : 'stat-card--warning'"
          >
            <div
              class="stat-icon"
              :class="daysLeft !== null && daysLeft <= 5 ? 'stat-icon--danger' : 'stat-icon--warning'"
            >
              <n-icon size="22"><Clock16Regular /></n-icon>
            </div>
            <div class="flex flex-col">
              <span class="stat-label">{{ $t('vacancy.daysLeftFull') }}</span>
              <span
                class="stat-val"
                :class="[
                  daysLeft !== null && daysLeft <= 5 ? 'stat-val--danger' : '',
                  daysLeft !== null && daysLeft <= 0 ? 'stat-val--text' : ''
                ]"
              >
                <template v-if="daysLeft === null">—</template>
                <template v-else-if="daysLeft <= 0">{{ $t('vacancy.expired') }}</template>
                <template v-else>{{ daysLeft }} {{ $t('content.day') }}</template>
              </span>
            </div>
          </div>
        </div>

        <!-- Matn bo'limlari -->
        <div class="sections-list">

          <div v-if="v.qualification_requirements" class="text-section">
            <h3 class="section-title">
              <n-icon size="17"><ClipboardTaskListLtr20Regular /></n-icon>
              {{ $t('vacancy.form.qualification_requirements') }}
            </h3>
            <div class="section-body" v-html="v.qualification_requirements" />
          </div>

          <div v-if="v.position_obligations" class="text-section">
            <h3 class="section-title">
              <n-icon size="17"><Briefcase24Regular /></n-icon>
              {{ $t('vacancy.form.position_obligations') }}
            </h3>
            <div class="section-body" v-html="v.position_obligations" />
          </div>

          <div v-if="v.working_conditions" class="text-section">
            <h3 class="section-title">
              <n-icon size="17"><RibbonStar20Regular /></n-icon>
              {{ $t('vacancy.form.working_conditions') }}
            </h3>
            <div class="section-body" v-html="v.working_conditions" />
          </div>

          <div v-if="v.specialties" class="text-section">
            <h3 class="section-title">
              <n-icon size="17"><FlowchartCircle24Regular /></n-icon>
              {{ $t('vacancy.form.specialties') }}
            </h3>
            <div class="section-body" v-html="v.specialties" />
          </div>

        </div>
      </div>

    </div>
  </UIModal>
</template>

<style scoped>
/* ══ Sidebar ══ */
.sidebar-wrap {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  border-radius: 14px;
  padding: 16px;
  align-self: flex-start;
}

.sidebar-org-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--textColor1);
  line-height: 1.5;
}

.sidebar-divider {
  height: 1px;
  background: color-mix(in srgb, var(--primary-color) 15%, transparent);
  margin: 14px 0;
}

.contact-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--primary-color) 12%, transparent);
}
.contact-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.contact-icon {
  color: var(--primary-color);
  margin-top: 1px;
  opacity: 0.85;
}
.contact-val {
  font-size: 13px;
  font-weight: 500;
  color: var(--textColor2);
  line-height: 1.5;
  word-break: break-word;
}

/* ══ Content ══ */
.content-wrap {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding-right: 2px;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.info-text {
  font-size: 13px;
  color: var(--textColor2);
  font-weight: 500;
}

/* ══ Stat kartochkalar ══ */
.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-section);
}
.stat-card--success {
  border-color: color-mix(in srgb, var(--success-color) 25%, var(--surface-line));
  background: color-mix(in srgb, var(--success-color) 5%, var(--surface-section));
}
.stat-card--warning {
  border-color: color-mix(in srgb, var(--warning-color) 25%, var(--surface-line));
  background: color-mix(in srgb, var(--warning-color) 5%, var(--surface-section));
}
.stat-card--danger {
  border-color: color-mix(in srgb, var(--danger-color) 25%, var(--surface-line));
  background: color-mix(in srgb, var(--danger-color) 5%, var(--surface-section));
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon--success { background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section)); color: var(--success-color); }
.stat-icon--warning { background: color-mix(in srgb, var(--warning-color) 15%, var(--surface-section)); color: var(--warning-color); }
.stat-icon--danger  { background: color-mix(in srgb, var(--danger-color)  15%, var(--surface-section)); color: var(--danger-color); }

.stat-label {
  font-size: 12px;
  color: var(--textColor3);
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 3px;
}
.stat-val {
  font-size: 28px;
  font-weight: 800;
  color: var(--textColor0);
  line-height: 1.1;
}
.stat-val--danger { color: var(--danger-color); }
.stat-val--text   { font-size: 14px; font-weight: 700; line-height: 1.5; }

/* ══ Matn bo'limlari ══ */
.sections-list { display: flex; flex-direction: column; }
.text-section {
  padding-bottom: 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
.text-section:last-child { border-bottom: none; }

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
  margin-top: 16px;
}
.section-body {
  font-size: 13px;
  color: var(--textColor1);
  line-height: 1.6;
  text-indent: 0;
}
.section-body :deep(p) {
  margin: 0 0 6px 0;
  line-height: 1.6;
  text-indent: 20px;
}
.section-body :deep(ul),
.section-body :deep(ol) {
  margin: 0 0 6px 0;
  padding-left: 20px;
  line-height: 1.6;
}
.section-body :deep(li) {
  margin-bottom: 3px;
  line-height: 1.6;
}
.section-body :deep(strong) {
  font-weight: 600;
  color: var(--textColor0);
}
.section-body :deep(br) {
  line-height: 1.6;
}
</style>
