<script setup>
  // Korxona tarixi: yaratildi / ko'chirildi / yopildi / qayta ochildi — asos va kim qilgani.
  import {
    AddCircle16Regular,
    ArrowSwap20Regular,
    LockClosed16Regular,
    LockOpen16Regular,
    Attach16Regular
  } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { useOrganizationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import dayjs from 'dayjs'

  const { t } = i18n.global
  const store = useOrganizationStore()

  const META = {
    created: { icon: AddCircle16Regular, cls: 'bg-fig-chip-green text-fig-chip-green-text' },
    moved: { icon: ArrowSwap20Regular, cls: 'bg-fig-chip-brand text-fig-chip-brand-text' },
    closed: { icon: LockClosed16Regular, cls: 'bg-fig-red-100 text-fig-text-red' },
    reopened: { icon: LockOpen16Regular, cls: 'bg-fig-chip-indigo text-fig-chip-indigo-text' }
  }
</script>

<template>
  <UIModal
    v-model:visible="store.history.visible"
    :width="560"
    :title="t('organizationPage.history.title')"
  >
    <div class="text-sm font-semibold text-textColor0 mb-3">{{ store.history.name }}</div>
    <n-spin :show="store.history.loading">
      <div v-if="store.history.list.length" class="flex flex-col gap-2">
        <div
          v-for="ev in store.history.list"
          :key="ev.id"
          class="flex gap-3 rounded-xl border border-surface-line bg-surface-section px-3 py-2.5"
        >
          <span
            class="size-8 shrink-0 rounded-full flex items-center justify-center"
            :class="META[ev.type]?.cls"
          >
            <n-icon size="16"><component :is="META[ev.type]?.icon" /></n-icon>
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-semibold text-textColor0">
                {{ t(`organizationPage.history.types.${ev.type}`) }}
              </span>
              <span class="text-xs tabular-nums text-textColor3">
                {{ dayjs(ev.created_at).format('DD.MM.YYYY HH:mm') }}
              </span>
            </div>
            <div v-if="ev.type === 'moved'" class="text-xs text-textColor2 mt-0.5">
              {{ ev.from_parent?.name || t('organizationPage.history.root') }} →
              {{ ev.to_parent?.name || t('organizationPage.history.root') }}
            </div>
            <div v-if="ev.user" class="text-xs text-textColor3 mt-0.5">{{ ev.user }}</div>
            <div
              v-if="ev.comment"
              class="mt-1.5 rounded-lg bg-surface-ground px-2.5 py-1.5 text-xs leading-5 text-textColor1 whitespace-pre-line break-words"
            >
              {{ ev.comment }}
            </div>
            <a
              v-if="ev.file"
              :href="ev.file"
              target="_blank"
              rel="noopener"
              class="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <n-icon size="14"><Attach16Regular /></n-icon>
              {{ ev.file_name || t('organizationPage.history.file') }}
            </a>
          </div>
        </div>
      </div>
      <n-empty v-else-if="!store.history.loading" :description="t('organizationPage.history.empty')" />
    </n-spin>
  </UIModal>
</template>
