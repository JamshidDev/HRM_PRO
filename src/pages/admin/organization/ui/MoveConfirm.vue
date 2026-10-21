<script setup>
  // Drag & drop tasdig'i (o'ng panel ichida): daraxt faqat "Tasdiqlash" bosilgandan
  // keyin o'zgaradi. Boshqa otaga ko'chirishda ixtiyoriy izoh so'raladi.
  import { ArrowDown16Regular } from '@vicons/fluent'
  import { UIFigField } from '@/components/index.js'
  import { useOrganizationStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useOrganizationStore()

  const move = computed(() => store.move)
  const isReparent = computed(() => move.value.parentId !== move.value.fromParentId)
  const parentLabel = (name) => name || t('organizationPage.history.root')
  const positionLabel = computed(() =>
    move.value.position == null
      ? t('organizationPage.move.end')
      : t('organizationPage.move.position', { n: move.value.position + 1 })
  )
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-sm leading-5 text-textColor1">
      {{ t(isReparent ? 'organizationPage.move.confirmMove' : 'organizationPage.move.confirmReorder', { name: move.name }) }}
    </div>

    <div v-if="isReparent" class="flex flex-col items-stretch gap-2">
      <UIFigField :label="t('organizationPage.move.from')" :value="parentLabel(move.fromParentName)" />
      <n-icon size="16" class="self-center text-primary"><ArrowDown16Regular /></n-icon>
      <UIFigField :label="t('organizationPage.move.to')" :value="parentLabel(move.parentName)" />
    </div>
    <div v-else class="grid grid-cols-2 gap-3">
      <UIFigField :label="t('organizationPage.panel.parent')" :value="parentLabel(move.parentName)" />
      <UIFigField :label="t('organizationPage.move.newPosition')" :value="positionLabel" />
    </div>

    <n-input
      v-if="isReparent"
      v-model:value="store.move.comment"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 4 }"
      :maxlength="2000"
      :placeholder="t('organizationPage.moveComment')"
    />

    <div class="grid grid-cols-2 gap-2 pt-1">
      <n-button @click="store.backToView()">{{ t('content.cancel') }}</n-button>
      <n-button type="primary" :loading="move.loading" @click="store._move()">
        {{ t('organizationPage.move.confirm') }}
      </n-button>
    </div>
  </div>
</template>
