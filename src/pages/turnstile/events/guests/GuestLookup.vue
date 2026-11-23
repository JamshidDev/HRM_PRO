<script setup>
  import { Search16Regular, CheckmarkCircle16Filled, ErrorCircle16Filled } from '@vicons/fluent'
  import { useGuestStore } from '@/store/modules/index.js'

  // JSHSHIR bo'yicha HikCentral'dan qidirish: ism va ruxsat darajalari ko'rinadi, keyin ish vaqti bilan qo'shiladi.
  const store = useGuestStore()
  const workStart = ref('09:00')
  const workEnd = ref('18:00')

  const r = computed(() => store.lookupResult)
  const fullName = computed(() =>
    [r.value?.last_name, r.value?.first_name, r.value?.middle_name].filter(Boolean).join(' ')
  )
  const validPin = computed(() => /^\d{14}$/.test(store.lookupPin))
  const validTime = computed(
    () => workStart.value && workEnd.value && workEnd.value > workStart.value
  )

  const onPin = (v) => {
    store.lookupPin = v
    store.lookupResult = null
  }
</script>

<template>
  <div class="rounded-xl border border-surface-line p-3 flex flex-col gap-3">
    <p class="text-sm font-semibold text-textColor0">{{ $t('guestPage.addByPin') }}</p>
    <div class="flex flex-wrap items-center gap-2">
      <n-input
        class="w-[240px]!"
        :value="store.lookupPin"
        :maxlength="14"
        :allow-input="(v) => /^\d*$/.test(v)"
        :placeholder="$t('guestPage.pinPlaceholder')"
        @update:value="onPin"
        @keyup.enter="store._lookup()"
      >
        <template #prefix>
          <n-icon :component="Search16Regular" />
        </template>
      </n-input>
      <n-button
        type="primary"
        ghost
        :disabled="!validPin"
        :loading="store.lookupLoading"
        @click="store._lookup()"
      >
        {{ $t('guestPage.search') }}
      </n-button>
    </div>

    <div v-if="r && !r.found" class="rounded-lg bg-fig-red-50 px-3 py-2 text-sm text-fig-text-red">
      {{ r.message || $t('guestPage.pinRule') }}
    </div>

    <div v-if="r?.found" class="flex flex-col gap-3">
      <div class="rounded-lg bg-surface-ground-soft px-3 py-2">
        <p class="text-sm font-semibold text-textColor0">{{ fullName || '—' }}</p>
        <p class="text-xs text-fig-text-tertiary">{{ r.pin }}</p>
      </div>

      <div class="flex flex-col gap-1.5">
        <p class="text-xs text-fig-text-tertiary">{{ $t('guestPage.accessLevels') }}</p>
        <p v-if="r.access_levels === null" class="text-sm text-fig-text-secondary">
          {{ $t('guestPage.accessUnknown') }}
        </p>
        <p v-else-if="!r.access_levels.length" class="text-sm text-fig-text-red">
          {{ $t('guestPage.accessNone') }}
        </p>
        <div v-else class="flex flex-col gap-1.5">
          <div
            v-for="al in r.access_levels"
            :key="al.id"
            class="flex items-start gap-2 rounded-lg border border-surface-line px-3 py-2"
          >
            <n-icon
              size="16"
              class="mt-0.5 shrink-0"
              :class="al.ok ? 'text-fig-green' : 'text-fig-text-red'"
              :component="al.ok ? CheckmarkCircle16Filled : ErrorCircle16Filled"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium text-textColor0">{{ al.name }}</p>
              <p class="text-xs text-fig-text-tertiary truncate">
                {{ al.devices.join(', ') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-fig-text-tertiary">{{ $t('guestPage.workStart') }}</span>
          <n-time-picker
            class="w-[140px]"
            format="HH:mm"
            value-format="HH:mm"
            :formatted-value="workStart"
            @update:formatted-value="(v) => (workStart = v)"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-fig-text-tertiary">{{ $t('guestPage.workEnd') }}</span>
          <n-time-picker
            class="w-[140px]"
            format="HH:mm"
            value-format="HH:mm"
            :formatted-value="workEnd"
            @update:formatted-value="(v) => (workEnd = v)"
          />
        </div>
        <n-button
          type="primary"
          :disabled="!validTime"
          :loading="store.saveLoading"
          @click="store._attachFound(workStart, workEnd)"
        >
          {{ $t('content.add') }}
        </n-button>
        <span v-if="!validTime" class="text-xs text-fig-text-red">
          {{ $t('guestPage.endAfterStart') }}
        </span>
      </div>
    </div>
  </div>
</template>
