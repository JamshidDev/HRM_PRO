<script setup>
  import { UIDeleteConfirm } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { MoreVertical24Filled } from '@vicons/fluent'

  defineProps({
    deleteWarning: { type: String, default: null },
    options: { type: Array, required: true }
  })

  const emits = defineEmits(['select'])

  const visible = ref(false)
  // Delete tasdig'i ochilganda tanlangan (key, option) shu yerda saqlanadi —
  // "Ha" tugmasi @click event yuboradi, shuning uchun original tanlovni
  // shu yerdan qayta emit qilamiz (aks holda option=undefined -> parent .action crash).
  const pending = ref(null)

  const onSelect = (key, option) => {
    if (key === Utils.ActionTypes.delete) {
      pending.value = { key, option }
      visible.value = true
    } else {
      emits('select', key, option)
    }
  }

  const onDelete = () => {
    visible.value = false
    const selected = pending.value
    pending.value = null
    if (selected) {
      emits('select', selected.key, selected.option)
    }
  }
</script>

<template>
  <n-dropdown trigger="click" :options="options" @select="(key, option) => onSelect(key, option)">
    <n-button tertiary circle size="small" @click.stop>
      <template #icon>
        <n-icon><MoreVertical24Filled /></n-icon>
      </template>
    </n-button>
  </n-dropdown>

  <UIDeleteConfirm v-model:visible="visible" :warning="deleteWarning" @confirm="onDelete" />
</template>
