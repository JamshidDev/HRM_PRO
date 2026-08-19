<script setup>
  import { computed } from 'vue'
  import { useAccDashboardStore, useUploadReportStore } from '@/store/modules/index.js'

  const store = useAccDashboardStore()
  const uploadReportStore = useUploadReportStore()

  const totalOrgs = computed(() => store.reportStatus?.total_orgs ?? 0)
  const summary = computed(() => store.reportStatus?.summary ?? [])

  const percentOf = (uploaded) => {
    const total = totalOrgs.value
    return total > 0 ? Math.round((Number(uploaded || 0) / total) * 100) : 0
  }

  // Kartaga bosilsa — batafsil modal (dashboard davri bilan).
  const openDetail = () => {
    uploadReportStore.openReportStatus(store.params.year, store.params.month)
  }
</script>

<template>
  <div>
    <p class="mb-2 px-1 text-[14px] font-medium text-fig-text-tertiary">
      {{ $t('accDashboard.reportStatus.title') }}
    </p>

    <!-- Yuklanish skeletoni -->
    <div v-if="store.reportStatusLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <n-skeleton v-for="i in 4" :key="i" height="118px" :sharp="false" />
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="s in summary"
        :key="s.id"
        class="flex cursor-pointer flex-col gap-2 rounded-2xl bg-fig-block px-3 pt-2.5 pb-2 transition hover:ring-1 hover:ring-fig-br-disable"
        @click="openDetail"
      >
        <!-- Tur nomi + yuklagan / jami -->
        <div class="flex items-start justify-between gap-2">
          <p class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-medium text-fig-text-tertiary">
            {{ s.type }}
          </p>
          <p class="shrink-0 whitespace-nowrap">
            <span class="text-[20px] leading-[26px] font-semibold text-fig-text-primary">
              {{ s.uploaded_orgs }}
            </span>
            <span class="text-[12px] leading-4 text-fig-text-tertiary">
              {{ $t('accDashboard.reportStatus.ofTotal') }} {{ totalOrgs }}
            </span>
          </p>
        </div>

        <!-- Yuklanish foizi — bar + yonida aniq foiz label -->
        <div class="flex items-center gap-2">
          <n-progress
            class="min-w-0 flex-1"
            type="line"
            :percentage="percentOf(s.uploaded_orgs)"
            :height="8"
            :border-radius="8"
            color="#16a34a"
            rail-color="rgba(148,163,184,0.25)"
            :show-indicator="false"
          />
          <span class="shrink-0 text-[12px] font-semibold text-fig-text-primary tabular-nums">
            {{ percentOf(s.uploaded_orgs) }}%
          </span>
        </div>

        <!-- Yuklamagan / Tasdiqlagan -->
        <div class="mt-auto flex items-center justify-between rounded-xl bg-fig-bg-secondary px-3 py-1.5 text-[12px] leading-4">
          <span class="flex items-center gap-1.5 text-fig-text-tertiary">
            <span class="inline-block h-2 w-2 rounded-full bg-red-500"></span>
            {{ $t('accDashboard.reportStatus.notUploaded') }}:
            <span class="font-semibold text-fig-text-primary">{{ s.not_uploaded_orgs }}</span>
          </span>
          <span class="flex items-center gap-1.5 text-fig-text-tertiary">
            <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
            {{ $t('accDashboard.reportStatus.confirmed') }}:
            <span class="font-semibold text-fig-text-primary">{{ s.confirmed_orgs }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
