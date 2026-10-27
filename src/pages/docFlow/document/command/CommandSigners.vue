<script setup>
  import { UISegmentTabs, UISignerList } from '@/components/index.js'
  import { useCommandFormStore } from './commandFormStore.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // Buyruq yaratishdagi kelishuvchilar marshruti: yuborish tartibi (parallel / tartibli) va
  // har bir kishining roli. Ro'yxatning o'zi — umumiy UISignerList («Kelishuvchilar» oynasi bilan bir xil).
  const store = useCommandFormStore()

  const mode = computed({
    get: () => (store.oneByOne ? 'sequential' : 'parallel'),
    set: (v) => (store.oneByOne = v === 'sequential')
  })
  const isSequential = computed(() => store.oneByOne)

  const onUpdate = (items) => {
    store.sortableConfirmations = items
    store.payload.confirmations = items.map((v) => v.id)
  }

  const modeTabs = computed(() => [
    { id: 'parallel', name: t('documentPage.command.form.route.parallel') },
    { id: 'sequential', name: t('documentPage.command.form.route.sequential') }
  ])
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Yuborish tartibi: almashtirgich va uning izohi -->
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
      <div class="text-xs text-textColor3 min-w-0 flex-1 basis-[260px] leading-snug">
        {{
          $t(
            isSequential
              ? 'documentPage.command.form.route.sequentialHint'
              : 'documentPage.command.form.route.parallelHint'
          )
        }}
      </div>
      <UISegmentTabs v-model="mode" :tabs="modeTabs" class="shrink-0" />
    </div>

    <UISignerList
      :items="store.sortableConfirmations"
      :sequential="isSequential"
      @update:items="onUpdate"
    />
  </div>
</template>
