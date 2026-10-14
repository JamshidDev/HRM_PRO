<script setup>
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import { UIFigBlock, UIFigField } from '@/components/index.js'

  /** Figma "Lavozim ma'lumotlari" bloki (node 2789:71773) — faqat ko'rish; lavozim buyruq orqali o'zgaradi. */
  const props = defineProps({
    item: { type: Object, required: true }
  })

  const fields = computed(() => [
    {
      label: 'workerProfile.position.contractToDate',
      value: Utils.timeOnlyDate(props.item.contract?.contract_to_date)
    },
    {
      label: 'workerProfile.position.contractDate',
      value: Utils.timeOnlyDate(props.item.contract?.contract_date)
    },
    { label: 'workerProfile.position.contractNumber', value: props.item.contract?.number },
    {
      label: 'workerProfile.position.positionDate',
      value: Utils.timeOnlyDate(props.item.position_date)
    },
    { label: 'workerProfile.personal.positionGroup', value: props.item.group },
    { label: 'workerProfile.personal.positionRank', value: props.item.rank },
    { label: 'workerProfile.personal.positionRate', value: props.item.rate }
  ])
</script>

<template>
  <UIFigBlock :title="$t('workerProfile.position.title')" :icon="icons.figBriefcase">
    <div class="flex flex-col gap-4 w-full">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-semibold leading-[18px] text-fig-text-primary">
          {{ item.post_name }}
        </span>
        <span class="text-xs leading-4 text-fig-text-secondary">
          {{ $t('workerProfile.position.contractType') }} — {{ item.contract?.type?.name }}
        </span>
      </div>

      <div class="position-separator"></div>

      <div class="position-grid">
        <UIFigField
          v-for="field in fields"
          :key="field.label"
          variant="plain"
          :label="$t(field.label)"
          :value="field.value"
        />
      </div>
    </div>

  </UIFigBlock>
</template>

<style lang="scss" scoped>
  .position-separator {
    width: 100%;
    height: 1px;
    border-radius: 9999px;
    background: var(--fig-br-disable);
  }

  .position-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  @media (max-width: 976px) {
    .position-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .position-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
