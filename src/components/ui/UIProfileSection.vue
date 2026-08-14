<script setup>
  import UIProfileButton from './UIProfileButton.vue'
  import icons from '@/assets/icons'

  /**
   * Figma "Info Section" (node 2673:256182) — jadvalli bo'limlar qolipi:
   * sarlavha + "Qo'shish" tugmasi, ostida jadval kartasi (orasi 10px).
   */
  defineProps({
    title: {
      type: String,
      default: ''
    },
    addable: {
      type: Boolean,
      default: true
    },
    addLabel: {
      type: String,
      default: ''
    },
    addDisabled: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['add'])
</script>

<template>
  <div class="flex flex-col gap-2.5 w-full">
    <div class="flex items-center gap-2 w-full">
      <span class="flex-1 min-w-0 text-base font-semibold leading-5 text-fig-text-primary">
        {{ title }}
      </span>
      <slot name="trailing" />
      <UIProfileButton
        v-if="addable"
        variant="brand"
        size="sm"
        :icon="icons.figPlus"
        :disabled="addDisabled"
        @click="emits('add')"
      >
        {{ addLabel || $t('content.add') }}
      </UIProfileButton>
    </div>

    <slot />
  </div>
</template>
