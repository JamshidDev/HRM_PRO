<script setup>
  import { Edit16Regular } from '@vicons/fluent'
  import { UISignerList } from '@/components/index.js'
  import { useCommandFormStore } from './commandFormStore.js'

  // «Ma'lumotlar» tabida kelishuvchilar faqat ko'rinadi. Burchakdagi kichik qalam —
  // shu joyning o'zida tahrirlash (CommandFormBody muharrirni ochadi).
  defineProps({
    canEdit: { type: Boolean, default: false }
  })
  defineEmits(['edit'])

  const store = useCommandFormStore()
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span class="text-sm text-textColor1">{{ $t('documentPage.command.form.confirm') }}</span>
      <span
        v-if="store.sortableConfirmations.length"
        class="text-[11px] font-medium rounded-full px-2 py-0.5 bg-fig-chip-brand text-fig-chip-brand-text"
      >
        {{
          $t(
            store.oneByOne
              ? 'documentPage.command.form.route.sequential'
              : 'documentPage.command.form.route.parallel'
          )
        }}
      </span>
      <!-- O'ng burchakda. `ml-auto` o'ramda — n-button o'z margin'ini ustun qo'yadi. -->
      <div v-if="canEdit" class="ml-auto">
        <n-button
          size="small"
          circle
          secondary
          type="primary"
          :title="$t('documentPage.command.dataTab.signers.change')"
          :aria-label="$t('documentPage.command.dataTab.signers.change')"
          @click="$emit('edit')"
        >
          <template #icon>
            <n-icon><Edit16Regular /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <UISignerList
      v-if="store.sortableConfirmations.length"
      :items="store.sortableConfirmations"
      :sequential="store.oneByOne"
      readonly
    />
    <div
      v-else
      class="text-xs text-textColor3 rounded-xl border border-dashed border-surface-line px-3 py-3 text-center"
    >
      {{ $t('documentPage.command.dataTab.signers.empty') }}
    </div>
  </div>
</template>
