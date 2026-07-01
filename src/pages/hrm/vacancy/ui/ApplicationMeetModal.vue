<script setup>
  import { UIModal } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import { Video20Regular, Clock20Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const store = useVacancyStore()

  const user = computed(() => store.meetModalApp?.user)

  const canSubmit = computed(() =>
    store.meetForm.meet_date_and_time !== null && store.meetForm.duration > 0
  )

  const t = i18n.global.t.bind(i18n.global)
  const DURATIONS = computed(() => [
    { label: t('vacancy.meet.dur30'), value: 30 },
    { label: t('vacancy.meet.dur45'), value: 45 },
    { label: t('vacancy.meet.dur60'), value: 60 },
    { label: t('vacancy.meet.dur90'), value: 90 },
    { label: t('vacancy.meet.dur120'), value: 120 },
  ])
</script>

<template>
  <UIModal
    :width="460"
    v-model:visible="store.meetModalVisible"
    :title="$t('vacancy.meet.title')"
    @update:visible="v => !v && store.closeMeetModal()"
  >
    <div class="flex flex-col gap-4">

      <!-- Ariza egasi -->
      <div v-if="user" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-50 border border-surface-line">
        <n-avatar :src="user.photo || Utils.noAvailableImage" :fallback-src="Utils.noAvailableImage" :size="32" round object-fit="cover" class="shrink-0 border border-surface-line" />
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-textColor0 leading-tight truncate">
            {{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}
          </span>
          <span class="meet-level-badge mt-1">{{ $t('vacancy.meet.badge') }}</span>
        </div>
      </div>

      <!-- Sana va vaqt -->
      <div>
        <p class="meet-label mb-1.5">{{ $t('vacancy.meet.dateTime') }} <span class="text-error">*</span></p>
        <n-date-picker
          v-model:value="store.meetForm.meet_date_and_time"
          type="datetime"
          update-value-on-close
          :actions="null"
          :placeholder="$t('vacancy.meet.dateTimePlaceholder')"
          style="width: 100%"
          :is-date-disabled="(ts) => ts < Date.now() - 86400000"
        />
      </div>

      <!-- Davomiyligi -->
      <div>
        <p class="meet-label mb-1.5">{{ $t('vacancy.meet.duration') }} <span class="text-error">*</span></p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="d in DURATIONS"
            :key="d.value"
            class="dur-btn"
            :class="store.meetForm.duration === d.value ? 'dur-btn--active' : ''"
            @click="store.meetForm.duration = d.value"
          >
            <n-icon size="13"><Clock20Regular /></n-icon>
            {{ d.label }}
          </button>
        </div>
      </div>

      <!-- Imtiyoz -->
      <div class="flex items-center justify-between px-3 py-2.5 rounded-lg border border-surface-line bg-surface-50">
        <div class="flex flex-col gap-0.5">
          <span class="text-sm font-medium text-textColor0">{{ $t('vacancy.meet.privileged') }}</span>
          <span class="text-xs text-textColor3">{{ $t('vacancy.meet.privilegedHint') }}</span>
        </div>
        <n-switch v-model:value="store.meetForm.privilege" />
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-2 pt-1">
        <n-button @click="store.closeMeetModal()">{{ $t('vacancy.cancelBtn') }}</n-button>
        <n-button
          type="primary"
          :disabled="!canSubmit"
          :loading="store.meetLoading"
          @click="store._createMeet()"
        >
          {{ $t('vacancy.saveBtn') }}
        </n-button>
      </div>

    </div>
  </UIModal>
</template>

<style scoped>
.meet-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--textColor2);
}

.meet-level-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--primary-color, #3b82f6);
  background: color-mix(in srgb, var(--primary-color, #3b82f6) 12%, transparent);
  border-radius: 5px;
  padding: 1px 7px;
}

/* Duration buttons */
.dur-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--surface-line, #e5e7eb);
  background: var(--surface-section);
  font-size: 12px;
  font-weight: 500;
  color: var(--textColor2);
  cursor: pointer;
  transition: all 0.15s;
}
.dur-btn:hover {
  border-color: var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
  background: color-mix(in srgb, var(--primary-color) 8%, var(--surface-section));
}
.dur-btn--active {
  border-color: var(--primary-color, #3b82f6);
  background: var(--primary-color, #3b82f6);
  color: white;
  font-weight: 600;
}
</style>
