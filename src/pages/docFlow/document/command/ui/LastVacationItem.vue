<script setup>
  import { useCommandStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const store = useCommandStore()
  const { t } = i18n.global
  const lastVacations = ref(null)

  const getLastVacation = (id) => {
    store.vacationId = id
    store.lastVacation((data) => {
      lastVacations.value = data.length > 0 ? data[0] : t('content.no-data')
    })
  }

  defineExpose({
    getLastVacation
  })
</script>

<template>
  <div class="col-span-12">
    <template v-if="lastVacations?.type">
      <n-collapse-transition v-show="Boolean(lastVacations)">
        <div
          class="mb-4 flex flex-wrap justify-center gap-x-[20px] text-secondary border border-gray-300 px-2 py-1 rounded-lg border-dashed"
        >
          <div>
            <div class="font-medium">{{ lastVacations.period_from }}</div>
            <div class="text-xs">{{ $t('documentPage.command.form.period_from') }}</div>
          </div>
          <div>
            <div class="font-medium">{{ lastVacations?.period_to }}</div>
            <div class="text-xs">{{ $t('documentPage.command.form.period_to') }}</div>
          </div>
          <div>
            <div class="font-medium">{{ lastVacations?.from }}</div>
            <div class="text-xs">{{ $t('documentPage.command.form.from') }}</div>
          </div>
          <div>
            <div class="font-medium">{{ lastVacations?.to }}</div>
            <div class="text-xs">{{ $t('documentPage.command.form.to') }}</div>
          </div>
          <div>
            <div class="font-medium text-warning">{{ lastVacations?.type?.name }}</div>
            <div class="text-xs">{{ $t('content.type') }}</div>
          </div>
          <div>
            <div class="font-medium text-primary">{{ lastVacations?.all_day }}</div>
            <div class="text-xs">{{ $t('documentPage.command.form.all_day') }}</div>
          </div>
          <div>
            <div
              class="font-medium"
              :class="[lastVacations?.rest_day >= 0 ? 'text-success' : 'text-danger']"
            >
              {{ lastVacations?.rest_day }}
            </div>
            <div class="text-xs">{{ $t('documentPage.command.form.rest_day') }}</div>
          </div>
        </div>
      </n-collapse-transition>
    </template>
    <template v-if="typeof lastVacations === 'string'">
      <div class="text-center mb-4 text-warning">{{ lastVacations }}</div>
    </template>
  </div>
</template>
