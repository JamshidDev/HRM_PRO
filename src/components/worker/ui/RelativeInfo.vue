<script setup>
  import { PeopleSearch24Regular } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'
  import HouseIcon from '@/assets/icons/houseIcon.svg'
  import LocationIcon from '@/assets/icons/locationIcon.svg'
  import CalendarIcon from '@/assets/icons/calendarIcon.svg'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.relative')" :icon="PeopleSearch24Regular">
      <div v-if="store.workerPreview?.worker?.relatives?.length" class="flex flex-col gap-4">
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.relatives"
          :key="idx"
          class="bg-surface-section p-4"
          :class="idx !== store.workerPreview?.worker?.relatives?.length - 1 ? 'border-b border-surface-line' : ''"
        >
          <div class="flex items-center gap-2 flex-wrap mb-3">
            <span class="font-bold text-lg text-textColor0">{{ Utils.combineFullName(item) }}</span>
            <span class="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
              {{ item?.relative?.name }}
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><CalendarIcon /></n-icon>
                {{ $t('relativePage.form.birthday') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item?.birthday || '—' }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><LocationIcon /></n-icon>
                {{ $t('relativePage.form.birthdayPlace') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item?.birth_place || '—' }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><DepartmentIcon /></n-icon>
                {{ $t('relativePage.form.post_name') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item?.post_name || '—' }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><HouseIcon /></n-icon>
                {{ $t('createWorkerPage.form.address') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item?.address || '—' }}</div>
            </div>
          </div>
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>
  </div>
</template>
