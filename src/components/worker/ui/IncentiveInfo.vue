<script setup>
  import { QuestionCircle20Regular, People20Regular, Money20Filled, BookOpen20Filled, Heart20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import Utils from '../../../utils/Utils.js'
  import AwardIcon from '@/assets/icons/awardIcon.svg'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'
  import CalendarIcon from '@/assets/icons/calendarIcon.svg'

  const store = useComponentStore()

  // TODO: backend'da rag'batlantirish kategoriyasi (moddiy/davlat/ma'naviy) uchun
  // alohida maydon yo'q — "gift" nomiga qarab taxminiy icon/rang/kategoriya tanlanmoqda.
  const GIFT_META = [
    {
      match: /pul mukofot/i,
      icon: Money20Filled,
      color: '#16a34a',
      categoryKey: 'workerView.incentive.categoryMaterial'
    },
    {
      match: /faxriy yorliq/i,
      icon: BookOpen20Filled,
      color: '#a16207',
      categoryKey: 'workerView.incentive.categoryState'
    },
    {
      match: /minnatdorchilik/i,
      icon: Heart20Filled,
      color: '#2563eb',
      categoryKey: 'workerView.incentive.categoryMoral'
    }
  ]
  const DEFAULT_GIFT_META = { icon: Money20Filled, color: '#6b7280', categoryKey: null }

  const giftMeta = (name) => GIFT_META.find((v) => v.match.test(name || '')) || DEFAULT_GIFT_META
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.incentive')" :icon="AwardIcon">
      <template #title-suffix>
        <span
          v-if="store.workerPreview?.worker?.incentives?.length"
          class="text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-3 py-1"
        >
          {{ $t('workerView.incentive.count', { count: store.workerPreview?.worker?.incentives?.length }) }}
        </span>
      </template>

      <div v-if="store.workerPreview?.worker?.incentives?.length" class="flex flex-col">
        <div
          v-for="(item, idx) in store.workerPreview?.worker?.incentives"
          :key="idx"
          class="py-4"
          :class="idx !== 0 ? 'border-t border-surface-line' : 'pt-0'"
        >
          <div class="flex items-center gap-2 flex-wrap mb-3">
            <span
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :style="{ backgroundColor: giftMeta(item.gift).color }"
            >
              <n-icon size="18" class="text-white">
                <component :is="giftMeta(item.gift).icon" />
              </n-icon>
            </span>
            <span class="font-semibold text-textColor0">{{ item.gift }}</span>
            <span
              v-if="giftMeta(item.gift).categoryKey"
              class="text-xs font-semibold rounded-full px-3 py-1"
              :style="{ backgroundColor: giftMeta(item.gift).color + '1A', color: giftMeta(item.gift).color }"
            >
              {{ $t(giftMeta(item.gift).categoryKey) }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><QuestionCircle20Regular /></n-icon>
                {{ $t('incentive.form.reason') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item.reason }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><DepartmentIcon /></n-icon>
                {{ $t('content.organization') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item.organization?.name }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><People20Regular /></n-icon>
                {{ $t('incentive.form.who') }}
              </div>
              <div class="font-semibold text-textColor0">{{ item.by_whom }}</div>
            </div>
            <div class="bg-surface-ground-soft rounded-3xl px-4 py-3">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14"><CalendarIcon /></n-icon>
                {{ $t('content.date') }}
              </div>
              <div class="font-semibold text-textColor0">{{ Utils.timeOnlyDate(item.date) }}</div>
            </div>
          </div>
        </div>
      </div>
      <span v-else class="w-full text-center text-sm inline-block text-textColor3">
        {{ $t('content.no-data') }}
      </span>
    </SectionHeader>
  </div>
</template>
