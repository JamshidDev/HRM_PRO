<script setup>
  import { Settings24Regular, CalendarCheckmark20Filled, ArrowSort20Filled } from '@vicons/fluent'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()

  const oldCareerSortDirection = ref('desc')

  const sortedNewCareers = computed(() => {
    const list = [...(store.workerPreview?.worker?.new_careers ?? [])]
    return list.sort((a, b) => new Date(b.from) - new Date(a.from))
  })

  const sortedOldCareers = computed(() => {
    const list = [...(store.workerPreview?.worker?.old_careers ?? [])]
    return list.sort((a, b) => {
      const diff = new Date(a.from_date) - new Date(b.from_date)
      return oldCareerSortDirection.value === 'asc' ? diff : -diff
    })
  })

  const toggleOldCareerSort = () => {
    oldCareerSortDirection.value = oldCareerSortDirection.value === 'asc' ? 'desc' : 'asc'
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('oldCareerPage.systemTitle')" :icon="Settings24Regular">
      <div v-if="sortedNewCareers.length" class="flex flex-col gap-2">
        <div v-for="(item, idx) in sortedNewCareers" :key="idx" class="flex gap-3">
          <div class="flex-1 min-w-0 bg-surface-ground-soft rounded-3xl px-5 py-4">
            <div class="flex items-center gap-2 flex-wrap">
              <div class="text-base font-bold text-textColor0">
                {{ Utils.timeOnlyDate(item?.from) }} —
                {{ Utils.timeOnlyDate(item?.to) || $t('content.untilNow') }}
              </div>
              <UIBadge
                v-if="!item?.to"
                :label="$t('workerView.career.currentLabel')"
                :type="Utils.colorTypes.success"
                :show-icon="false"
                class="!w-auto"
              />
            </div>
            <div class="text-textColor2 mt-1">
              {{ item.full_position }}
            </div>
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>

    <SectionHeader :title="$t('oldCareerPage.title')" :icon="PositionIcon">
      <template v-if="store.workerPreview?.worker?.old_careers?.length" #trailing>
        <n-tooltip trigger="hover">
          <template #trigger>
            <div
              @click="toggleOldCareerSort"
              class="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer hover:bg-surface-ground"
            >
              <n-icon size="18" class="text-primary">
                <ArrowSort20Filled />
              </n-icon>
            </div>
          </template>
          {{ oldCareerSortDirection === 'asc' ? $t('oldCareerPage.sortNewestFirst') : $t('oldCareerPage.sortOldestFirst') }}
        </n-tooltip>
      </template>
      <div v-if="sortedOldCareers.length" class="flex flex-col">
        <div v-for="(item, idx) in sortedOldCareers" :key="item.id ?? idx" class="flex gap-3">
          <div class="w-14 shrink-0 flex flex-col items-center">
            <span class="flex-1 w-0.5" :class="idx === 0 ? 'bg-transparent' : 'bg-surface-line'"></span>
            <span
              class="w-14 h-14 rounded-full bg-surface-ground-soft border border-surface-line flex items-center justify-center shrink-0"
            >
              <span class="w-8 h-8 rounded-full bg-gray-soft flex items-center justify-center">
                <n-icon size="18" class="text-white">
                  <CalendarCheckmark20Filled />
                </n-icon>
              </span>
            </span>
            <span
              class="flex-1 w-0.5"
              :class="idx === sortedOldCareers.length - 1 ? 'bg-transparent' : 'bg-surface-line'"
            ></span>
          </div>
          <div class="flex-1 min-w-0 bg-surface-ground-soft rounded-3xl px-5 py-4 mb-2">
            <div class="text-base font-bold text-textColor0">
              {{ Utils.timeOnlyDate(item?.from_date) }} — {{ Utils.timeOnlyDate(item?.to_date) }}
            </div>
            <div class="text-textColor2 mt-1">{{ item.post_name }}</div>
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>
  </div>
</template>
