<script setup>
  import { UIDayPicker, UIUser } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { useGuestStore } from '@/store/modules/index.js'
  import { ArrowCircleDownRight20Regular, ArrowCircleUpLeft20Regular } from '@vicons/fluent'

  const store = useGuestStore()

  const guestUser = computed(() => ({
    lastName: store.eventsGuest?.last_name,
    firstName: store.eventsGuest?.first_name,
    middleName: store.eventsGuest?.middle_name,
    position: `${store.eventsGuest?.work_start ?? ''}–${store.eventsGuest?.work_end ?? ''}`
  }))

  const onRange = (v) => {
    store.eventsRange = v
    store._events()
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <UIUser :data="guestUser" :short="false" :avatar-clickable="false" />
      <UIDayPicker
        class="w-[260px]"
        :value="store.eventsRange"
        mode="period"
        @update:value="onRange"
      />
    </div>
    <n-spin :show="store.eventsLoading">
      <div class="max-h-[420px] overflow-y-auto flex flex-col gap-1.5 min-h-[120px]">
        <div
          v-for="e in store.events"
          :key="e.id"
          class="flex items-center gap-3 rounded-lg border border-surface-line px-3 py-2"
        >
          <n-icon
            size="20"
            :class="e.direction ? 'text-fig-green' : 'text-fig-text-red'"
            :component="e.direction ? ArrowCircleDownRight20Regular : ArrowCircleUpLeft20Regular"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">
              {{ Utils.dateTimeShortLabel(e.event_date_and_time) }} ·
              {{ e.direction ? $t('guestPage.in') : $t('guestPage.out') }}
            </p>
            <p class="text-xs text-fig-text-tertiary truncate">
              {{ [e.device, e.door].filter(Boolean).join(' · ') }}
            </p>
          </div>
        </div>
        <p
          v-if="!store.eventsLoading && !store.events.length"
          class="py-8 text-center text-sm text-fig-text-tertiary"
        >
          {{ $t('guestPage.noEvents') }}
        </p>
      </div>
    </n-spin>
  </div>
</template>
