<script setup>
  import { UIModal, UIBadge } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import {
    Attach16Regular,
    DocumentCheckmark20Regular,
    DocumentDismiss20Regular,
    Video20Regular,
    LinkSquare20Regular,
    Document20Regular,
    Person20Regular,
    CalendarLtr20Regular,
    Location20Regular,
    Globe20Regular,
    Building20Regular,
    Briefcase20Regular,
    BookOpen20Regular,
    Home20Regular,
  } from '@vicons/fluent'

  const store = useVacancyStore()
  const t = i18n.global.t.bind(i18n.global)

  const user        = computed(() => store.detailUserData)
  const application = computed(() => store.selectedDetailApp)

  const EDUCATION_LEVELS = { 1: "O'rta", 2: "O'rta maxsus", 3: 'Oliy', 4: 'Magistr' }

  const LEVEL_NAMES = computed(() => ({
    'messages.vacancy.levels.one':   t('vacancy.levels.one'),
    'messages.vacancy.levels.two':   t('vacancy.levels.two'),
    'messages.vacancy.levels.three': t('vacancy.levels.three'),
    'messages.vacancy.levels.four':  t('vacancy.levels.four'),
    'messages.vacancy.levels.five':  t('vacancy.levels.five'),
    'messages.vacancy.levels.six':   t('vacancy.levels.six'),
  }))

  const LEVEL_STEPS = {
    'messages.vacancy.levels.one':   1,
    'messages.vacancy.levels.two':   2,
    'messages.vacancy.levels.three': 3,
    'messages.vacancy.levels.four':  4,
    'messages.vacancy.levels.five':  5,
    'messages.vacancy.levels.six':   6,
  }

  const getStatusType = (statusId) => {
    if (statusId === 2) return 'success'
    if (statusId === 3) return 'error'
    return 'warning'
  }

  const openFile = (url) => window.open(url, '_blank')

  const isArrayDetails = (details) => Array.isArray(details)
  const hasZoom        = (details) => !Array.isArray(details) && details?.zoom
  const hasFiles       = (details) => !Array.isArray(details) && details?.files?.length

  const FILE_BASE = 'https://hrm-api.railway.uz/hrm-s3/hrm/'

  const getFileTypeName = (fileTypeId) =>
    store.fileTypes.find(ft => ft.id === fileTypeId)?.name || `Fayl ${fileTypeId}`
</script>

<template>
  <UIModal
    :width="900"
    height="90vh"
    v-model:visible="store.detailVisible"
    :title="$t('content.view')"
  >
    <!-- Loading -->
    <div v-if="store.detailLoading" class="flex justify-center py-14">
      <n-spin :size="30" />
    </div>

    <div v-else-if="user" class="flex flex-col gap-3 pb-2">

      <!-- ══ HEADER ══ -->
      <div class="detail-header">
        <n-avatar
          :src="user.photo || Utils.noAvailableImage"
          :fallback-src="Utils.noAvailableImage"
          :size="52"
          round
          object-fit="cover"
          class="shrink-0 detail-avatar"
        />
        <div class="flex-1 min-w-0">
          <p class="text-base font-bold text-textColor0 leading-tight truncate">
            {{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}
          </p>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="pin-chip">
              <n-icon size="11"><Person20Regular /></n-icon>
              {{ user.pin }}
            </span>
            <span class="meta-dot">·</span>
            <span class="text-xs text-textColor2">{{ user.sex ? $t('enum.man') : $t('enum.woman') }}</span>
            <template v-if="user.nationality?.name">
              <span class="meta-dot">·</span>
              <span class="text-xs text-textColor2">{{ user.nationality.name }}</span>
            </template>
            <template v-if="user.birthday">
              <span class="meta-dot">·</span>
              <span class="text-xs text-textColor2">{{ Utils.timeOnlyDate(user.birthday) }}</span>
            </template>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <UIBadge
            class="!w-auto"
            :show-icon="false"
            :label="application?.status?.name"
            :type="getStatusType(application?.status?.id)"
          />
          <n-popover
            v-if="application?.files?.length"
            trigger="click"
            placement="bottom-end"
            :show-arrow="false"
          >
            <template #trigger>
              <div class="file-chip">
                <n-icon size="12"><Attach16Regular /></n-icon>
                {{ application.files.length }} {{ $t('vacancy.docsLabel') }}
              </div>
            </template>
            <div class="flex flex-col gap-0.5" style="min-width: 210px">
              <div
                v-for="file in application.files"
                :key="file.id"
                class="file-popup-item"
                @click="openFile(file.file)"
              >
                <n-icon size="12" class="text-primary shrink-0"><Attach16Regular /></n-icon>
                <span class="truncate flex-1">{{ file.file_type?.name || $t('content.file') }}</span>
              </div>
            </div>
          </n-popover>
        </div>
      </div>

      <!-- ══ 2 KOLONNA ══ -->
      <div class="two-col">

        <!-- Chap: Shaxsiy + Manzil -->
        <div class="flex flex-col gap-3">

          <!-- Shaxsiy ma'lumotlar -->
          <div class="section-card">
            <div class="section-header">
              <n-icon size="13" class="section-icon"><Person20Regular /></n-icon>
              {{ $t('workerView.general.name') }}
            </div>
            <div class="kv-list">
              <div class="kv-row" v-if="user.birthday">
                <span class="kv-label">
                  <n-icon size="11"><CalendarLtr20Regular /></n-icon>
                  {{ $t('content.birthday') }}
                </span>
                <span class="kv-val">{{ Utils.timeOnlyDate(user.birthday) }}</span>
              </div>
              <div class="kv-row">
                <span class="kv-label">
                  <n-icon size="11"><Person20Regular /></n-icon>
                  {{ $t('vacancy.gender') }}
                </span>
                <span class="kv-val">{{ user.sex ? $t('enum.man') : $t('enum.woman') }}</span>
              </div>
              <div class="kv-row" v-if="user.education">
                <span class="kv-label">
                  <n-icon size="11"><BookOpen20Regular /></n-icon>
                  {{ $t('medWorker.form.education') }}
                </span>
                <span class="kv-val">{{ EDUCATION_LEVELS[user.education] || user.education }}</span>
              </div>
              <div class="kv-row" v-if="user.nationality?.name">
                <span class="kv-label">
                  <n-icon size="11"><Globe20Regular /></n-icon>
                  {{ $t('workerView.general.nationality_id') }}
                </span>
                <span class="kv-val">{{ user.nationality.name }}</span>
              </div>
              <div class="kv-row" v-if="user.country?.name">
                <span class="kv-label">
                  <n-icon size="11"><Globe20Regular /></n-icon>
                  {{ $t('workerView.general.country') }}
                </span>
                <span class="kv-val">{{ user.country.name }}</span>
              </div>
            </div>
          </div>

          <!-- Manzil -->
          <div class="section-card" v-if="user.region?.name || user.current_region?.name || user.address">
            <div class="section-header">
              <n-icon size="13" class="section-icon"><Location20Regular /></n-icon>
              {{ $t('workerView.general.address') }}
            </div>
            <div class="kv-list">
              <div class="kv-row" v-if="user.region?.name || user.city?.name">
                <span class="kv-label">
                  <n-icon size="11"><Home20Regular /></n-icon>
                  {{ $t('vacancy.birthPlace') }}
                </span>
                <span class="kv-val">
                  {{ user.region?.name }}<span v-if="user.city?.name">, {{ user.city.name }}</span>
                </span>
              </div>
              <div class="kv-row" v-if="user.current_region?.name || user.current_city?.name">
                <span class="kv-label">
                  <n-icon size="11"><Location20Regular /></n-icon>
                  {{ $t('vacancy.livePlace') }}
                </span>
                <span class="kv-val">
                  {{ user.current_region?.name }}<span v-if="user.current_city?.name">, {{ user.current_city.name }}</span>
                </span>
              </div>
              <div class="kv-row" v-if="user.address">
                <span class="kv-label">
                  <n-icon size="11"><Building20Regular /></n-icon>
                  {{ $t('workerView.general.address') }}
                </span>
                <span class="kv-val">{{ user.address }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- O'ng: Ta'lim + Ish -->
        <div class="flex flex-col gap-3">

          <!-- Ta'lim tarixi -->
          <div class="section-card" v-if="user.educations?.length">
            <div class="section-header">
              <n-icon size="13" class="section-icon"><BookOpen20Regular /></n-icon>
              {{ $t('workerProfile.tabs.education') }}
            </div>
            <div class="timeline-list">
              <div v-for="edu in user.educations" :key="edu.id" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-body">
                  <span class="timeline-main">{{ edu.university }}</span>
                  <span class="timeline-date-chip">
                    {{ Utils.timeOnlyDate(edu.from) }} — {{ Utils.timeOnlyDate(edu.to) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Ish tajribasi -->
          <div class="section-card" v-if="user.careers?.length">
            <div class="section-header">
              <n-icon size="13" class="section-icon"><Briefcase20Regular /></n-icon>
              {{ $t('workerProfile.tabs.career') }}
            </div>
            <div class="timeline-list">
              <div v-for="career in user.careers" :key="career.id" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-body">
                  <span class="timeline-main">{{ career.position }}</span>
                  <span class="timeline-date-chip">
                    {{ Utils.timeOnlyDate(career.from) }} — {{ Utils.timeOnlyDate(career.to) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ══ Bosqichlar tarixi ══ -->
      <div class="section-card" v-if="application?.statuses?.length">
        <div class="section-header">
          <n-icon size="13" class="section-icon"><Document20Regular /></n-icon>
          {{ $t('vacancy.applicationInfo') }}
        </div>
        <div class="steps-list">
          <div
            v-for="s in application.statuses"
            :key="s.id"
            class="step-item"
          >
            <!-- Step header -->
            <div class="step-head">
              <div class="step-num">{{ LEVEL_STEPS[s.type?.name] || '—' }}</div>
              <span class="step-name">{{ LEVEL_NAMES[s.type?.name] || s.type?.name }}</span>
              <div class="step-meta">
                <span v-if="s.details?.number" class="step-number font-mono">№ {{ s.details.number }}</span>
                <span v-if="s.details?.created" class="step-date">{{ Utils.timeOnlyDate(s.details.created) }}</span>
              </div>
              <UIBadge
                class="!w-auto shrink-0"
                :show-icon="false"
                :label="s.status?.name"
                :type="getStatusType(s.status?.id)"
              />
            </div>

            <!-- Fayl holatlari -->
            <div v-if="isArrayDetails(s.details) && s.details.length" class="step-detail-box">
              <div v-for="d in s.details" :key="d.file_type" class="step-file-row">
                <n-icon size="12" :class="d.status === 2 ? 'text-success' : 'text-textColor3'">
                  <DocumentCheckmark20Regular v-if="d.status === 2" />
                  <DocumentDismiss20Regular v-else />
                </n-icon>
                <span class="step-file-name">{{ getFileTypeName(d.file_type) }}</span>
                <span class="step-file-badge" :class="d.status === 2 ? 'badge--yes' : 'badge--no'">
                  {{ d.status === 2 ? $t('vacancy.action.uploaded') : $t('vacancy.action.notUploaded') }}
                </span>
              </div>
            </div>

            <!-- Zoom -->
            <div v-if="hasZoom(s.details)" class="step-detail-box step-zoom">
              <div class="zoom-icon-wrap">
                <n-icon size="14"><Video20Regular /></n-icon>
              </div>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <span class="zoom-label">{{ $t('vacancy.zoomMeet') }}</span>
                <span class="zoom-id font-mono">ID: {{ s.details.zoom.meet_id }}</span>
              </div>
              <div class="flex gap-1.5">
                <n-button size="tiny" @click="openFile(s.details.zoom.join_url)">
                  <template #icon><n-icon><LinkSquare20Regular /></n-icon></template>
                  {{ $t('vacancy.joinZoom') }}
                </n-button>
                <n-button size="tiny" type="primary" @click="openFile(s.details.zoom.start_url)">
                  {{ $t('vacancy.zoomStart') }}
                </n-button>
              </div>
            </div>

            <!-- Yuklangan fayllar -->
            <div v-if="hasFiles(s.details)" class="step-detail-box step-files">
              <div
                v-for="(f, fi) in s.details.files"
                :key="fi"
                class="step-uploaded-file"
                @click="openFile(FILE_BASE + f.file_path)"
              >
                <n-icon size="12" class="text-primary shrink-0"><Document20Regular /></n-icon>
                <span class="truncate flex-1 text-xs text-textColor1">{{ f.file_name }}</span>
                <n-icon size="11" class="text-textColor3 shrink-0"><LinkSquare20Regular /></n-icon>
              </div>
            </div>

            <!-- Izoh -->
            <div v-if="s.message" class="step-message">
              <n-icon size="11" class="shrink-0 mt-0.5 text-textColor3"><Document20Regular /></n-icon>
              {{ s.message }}
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-else-if="!store.detailLoading" class="flex justify-center items-center py-14 text-textColor3 text-sm">
      {{ $t('content.no-data') }}
    </div>
  </UIModal>
</template>

<style scoped>
/* ══ Header ══ */
.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--primary-color) 5%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--surface-line));
}
.detail-avatar {
  border: 2px solid var(--surface-section);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.pin-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--surface-line));
  border-radius: 5px;
  padding: 1px 7px;
}
.meta-dot { color: var(--textColor3); font-size: 12px; }

/* ══ File chip ══ */
.file-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  border: 1px solid color-mix(in srgb, var(--primary-color) 20%, var(--surface-line));
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--primary-color);
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.file-chip:hover {
  background: color-mix(in srgb, var(--primary-color) 15%, var(--surface-section));
}
.file-popup-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 11px;
  color: var(--textColor1);
  transition: background 0.12s;
}
.file-popup-item:hover {
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  color: var(--primary-color);
}

/* ══ 2 kolonna ══ */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* ══ Section card ══ */
.section-card {
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
  font-size: 11px;
  font-weight: 600;
  color: var(--textColor1);
}
.section-icon { color: var(--primary-color, #3b82f6); flex-shrink: 0; }

/* ══ KV list ══ */
.kv-list { display: flex; flex-direction: column; }
.kv-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
.kv-row:last-child { border-bottom: none; }
.kv-label {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  width: 130px;
  font-size: 11px;
  color: var(--textColor3);
  line-height: 1.4;
}
.kv-val {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--textColor0);
  line-height: 1.4;
}

/* ══ Timeline ══ */
.timeline-list {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  gap: 0;
}
.timeline-item {
  display: flex;
  gap: 10px;
  padding-bottom: 12px;
  position: relative;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 10px;
  bottom: 0;
  width: 1px;
  background: var(--surface-line, #e5e7eb);
}
.timeline-item:last-child { padding-bottom: 0; }
.timeline-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--primary-color, #3b82f6);
  border: 2px solid var(--surface-section);
  box-shadow: 0 0 0 1.5px var(--primary-color, #3b82f6);
  margin-top: 3px;
  flex-shrink: 0;
}
.timeline-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.timeline-main {
  font-size: 12px;
  font-weight: 500;
  color: var(--textColor0);
  line-height: 1.35;
}
.timeline-date-chip {
  display: inline-block;
  font-size: 10px;
  color: var(--textColor3);
  background: var(--surface-ground);
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 4px;
  padding: 1px 6px;
  align-self: flex-start;
}

/* ══ Steps list ══ */
.steps-list { display: flex; flex-direction: column; }
.step-item {
  padding: 10px 14px;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
}
.step-item:last-child { border-bottom: none; }

.step-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary-color, #3b82f6);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step-name {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--textColor0);
}
.step-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.step-number { font-size: 11px; color: var(--textColor2); }
.step-date   { font-size: 11px; color: var(--textColor3); }

/* Step detail boxes */
.step-detail-box {
  margin-top: 8px;
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid var(--surface-line, #e5e7eb);
}

/* Fayl holatlari */
.step-file-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-section);
}
.step-file-row:last-child { border-bottom: none; }
.step-file-name { flex: 1; font-size: 11px; color: var(--textColor1); }
.step-file-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.badge--yes {
  background: color-mix(in srgb, var(--success-color) 15%, var(--surface-section));
  color: var(--success-color);
}
.badge--no {
  background: var(--surface-ground);
  color: var(--textColor3);
}

/* Zoom */
.step-zoom {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
  border-color: color-mix(in srgb, var(--primary-color) 20%, var(--surface-line));
}
.zoom-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--primary-color) 15%, var(--surface-section));
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.zoom-label { font-size: 11px; font-weight: 600; color: var(--primary-color); }
.zoom-id    { font-size: 10px; color: var(--primary-color); opacity: 0.75; }

/* Yuklangan fayllar */
.step-files { background: var(--surface-section); }
.step-uploaded-file {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border-bottom: 1px solid var(--surface-line, #e5e7eb);
  cursor: pointer;
  transition: background 0.12s;
}
.step-uploaded-file:last-child { border-bottom: none; }
.step-uploaded-file:hover {
  background: color-mix(in srgb, var(--primary-color) 6%, var(--surface-section));
}

/* Izoh */
.step-message {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  color: var(--textColor2);
  background: var(--surface-ground);
  border: 1px solid var(--surface-line, #e5e7eb);
  border-radius: 6px;
  padding: 5px 8px;
  line-height: 1.5;
}
</style>
