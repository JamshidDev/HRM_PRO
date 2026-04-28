<script setup>
  import { UIModal } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { Attach16Regular } from '@vicons/fluent'

  const store = useVacancyStore()

  const educationLevels = {
    1: "O'rta",
    2: "O'rta maxsus",
    3: 'Oliy',
    4: 'Magistr'
  }

  const user = computed(() => store.selectedApplication?.user)
  const application = computed(() => store.selectedApplication)

  const openFile = (url) => {
    window.open(url, '_blank')
  }
</script>

<template>
  <UIModal
    :width="950"
    :visible="store.applicationViewVisible"
    @update:visible="store.closeApplicationView"
    :title="$t('content.view')"
  >
    <div v-if="user" class="application-view">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <n-avatar
            :src="user.photo"
            :size="56"
            round
            object-fit="cover"
            class="user-avatar"
          />

          <div class="user-details">
            <h2 class="user-name">{{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}</h2>

            <!-- Info Row -->
            <div class="info-row">
              <span class="info-item">
                <span class="info-label">{{ $t('workerProfile.tabs.education') }}:</span>
                <span class="info-value">{{ educationLevels[user.education] || '-' }}</span>
              </span>
              <span class="info-divider">|</span>
              <span class="info-item">
                <span class="info-label">JSHSHIR:</span>
                <span class="info-value">{{ user.pin }}</span>
              </span>
            </div>
          </div>

          <!-- Files in Header -->
          <div class="header-files" v-if="application?.files?.length">
            <span
              v-for="(file, idx) in application.files"
              :key="file.id"
              class="header-file-item"
              @click="openFile(file.file)"
            >
              <n-icon :component="Attach16Regular" size="14" />
              <span>{{ $t('content.file') }} {{ idx + 1 }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="info-grid">
        <!-- Personal Info Card -->
        <div class="section-wrapper full-row">
          <h4 class="section-title">{{ $t('workerView.general.name') }}</h4>
          <div class="info-card no-icon">
            <div class="personal-grid">
              <div class="personal-item">
                <span class="item-label">{{ $t('content.birthday') }}</span>
                <span class="item-value">{{ Utils.timeOnlyDate(user.birthday) }}</span>
              </div>
              <div class="personal-item">
                <span class="item-label">{{ $t('vacancy.gender') }}</span>
                <span class="item-value">{{ user.sex ? $t('enum.man') : $t('enum.woman') }}</span>
              </div>
              <div class="personal-item">
                <span class="item-label">{{ $t('workerView.general.nationality') }}</span>
                <span class="item-value">{{ user.nationality?.name || '-' }}</span>
              </div>
              <div class="personal-item">
                <span class="item-label">{{ $t('vacancy.birthPlace') }}</span>
                <span class="item-value">{{ user.region?.name }}, {{ user.city?.name }}</span>
              </div>
              <div class="personal-item">
                <span class="item-label">{{ $t('vacancy.livePlace') }}</span>
                <span class="item-value">{{ user.current_region?.name }}, {{ user.current_city?.name }}</span>
              </div>
              <div class="personal-item" v-if="user.address">
                <span class="item-label">{{ $t('workerView.general.address') }}</span>
                <span class="item-value">{{ user.address }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Education Card -->
        <div class="section-wrapper full-row" v-if="user.educations?.length">
          <h4 class="section-title">{{ $t('workerProfile.tabs.education') }}</h4>
          <div class="info-card no-icon">
            <div class="education-list">
              <div v-for="edu in user.educations" :key="edu.id" class="education-item">
                <span class="education-period">
                  {{ Utils.timeOnlyDate(edu.from) }} - {{ Utils.timeOnlyDate(edu.to) }}
                </span>
                <span class="education-name">{{ edu.university }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Career Card -->
        <div class="section-wrapper full-row" v-if="user.careers?.length">
          <h4 class="section-title">{{ $t('workerProfile.tabs.career') }}</h4>
          <div class="info-card no-icon">
            <div class="career-list">
              <div v-for="career in user.careers" :key="career.id" class="career-item">
                <span class="career-period">
                  {{ Utils.timeOnlyDate(career.from) }} - {{ Utils.timeOnlyDate(career.to) }}
                </span>
                <span class="career-position">{{ career.position }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Application Info -->
        <div class="section-wrapper full-row">
          <h4 class="section-title">{{ $t('vacancy.applicationInfo') }}</h4>
          <div class="info-card no-icon">
            <div class="personal-grid">
              <div class="personal-item">
                <span class="item-label">{{ $t('content.date') }}</span>
                <span class="item-value">{{ Utils.timeOnlyDate(application?.created_at) }}</span>
              </div>
              <div class="personal-item">
                <span class="item-label">{{ $t('content.position') }}</span>
                <span class="item-value">{{ store.selectedVacancy?.position?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </UIModal>
</template>

<style scoped>
.application-view {
  padding: 0;
}

/* Header Section */
.header-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-avatar {
  flex-shrink: 0;
  border: 2px solid #e2e8f0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.info-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #94a3b8;
}

.info-value {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
}

.info-divider {
  color: #cbd5e1;
  font-size: 12px;
}

/* Header Files */
.header-files {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.header-file-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #3b82f6;
  cursor: pointer;
  transition: background 0.2s;
}

.header-file-item:hover {
  background: #f1f5f9;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 10px 0;
}

.section-wrapper {
  display: flex;
  flex-direction: column;
}

.section-wrapper .info-card {
  flex: 1;
}

.section-wrapper.full-row {
  grid-column: span 2;
}

/* Info Cards */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  gap: 12px;
}



.info-card.no-icon {
  display: block;
}


/* Personal Grid */
.personal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px 12px;
}

.personal-item {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.item-label {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.2;
}

.item-value {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
  line-height: 1.2;
}

/* Education List */
.education-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.education-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.2;
}

.education-period {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.education-name {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
}

/* Career List */
.career-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.career-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  line-height: 1.2;
}

.career-period {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.career-position {
  font-size: 13px;
  color: #334155;
  font-weight: 500;
}


@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-divider {
    display: none;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-wrapper.full-row {
    grid-column: span 1;
  }

  .personal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
