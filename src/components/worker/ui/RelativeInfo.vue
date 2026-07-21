<script setup>
  import {
    PeopleSearch24Regular,
    Briefcase20Filled,
    CalendarLtr24Regular,
    Location24Regular,
    Building20Regular
  } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import RelativeAvatar from './shared/RelativeAvatar.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.relative')" :icon="PeopleSearch24Regular">
      <div
        v-if="store.workerPreview?.worker?.relatives?.length"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.relatives"
          :key="idx"
          class="bg-surface-section border border-surface-line rounded-3xl p-4"
        >
          <RelativeAvatar
            :full-name="Utils.combineFullName(item)"
            :relation-name="item?.relative?.name"
            class="mb-3"
          />
          <div class="font-semibold text-textColor0 mb-3">{{ Utils.combineFullName(item) }}</div>
          <div class="flex flex-col gap-2">
            <div class="flex items-start justify-between gap-2">
              <span class="flex items-center gap-2 text-textColor3 text-sm">
                <n-icon size="16"><Briefcase20Filled /></n-icon>
                {{ $t('relativePage.form.post_name') }}
              </span>
              <span class="text-end font-medium text-textColor0">{{ item?.post_name }}</span>
            </div>
            <div class="flex items-start justify-between gap-2">
              <span class="flex items-center gap-2 text-textColor3 text-sm">
                <n-icon size="16"><CalendarLtr24Regular /></n-icon>
                {{ $t('relativePage.form.birthday') }}
              </span>
              <span class="text-end font-medium text-textColor0">{{ item?.birthday }}</span>
            </div>
            <div class="flex items-start justify-between gap-2">
              <span class="flex items-center gap-2 text-textColor3 text-sm">
                <n-icon size="16"><Location24Regular /></n-icon>
                {{ $t('relativePage.form.birthdayPlace') }}
              </span>
              <span class="text-end font-medium text-textColor0">{{ item?.birth_place }}</span>
            </div>
            <div class="flex items-start justify-between gap-2">
              <span class="flex items-center gap-2 text-textColor3 text-sm">
                <n-icon size="16"><Building20Regular /></n-icon>
                {{ $t('createWorkerPage.form.address') }}
              </span>
              <span class="text-end font-medium text-textColor0">{{ item?.address }}</span>
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
