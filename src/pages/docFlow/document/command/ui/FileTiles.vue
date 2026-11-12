<script setup>
  // Kvadrat plitkali fayl tanlash: «+» plitka (bosish/tashlash) va har fayl — alohida plitka.
  import { v4 as uuidv4 } from 'uuid'
  import { Add24Regular, DocumentPdf24Regular, Dismiss12Filled } from '@vicons/fluent'

  const props = defineProps({
    multiple: { type: Boolean, default: false },
    accept: { type: String, default: '' },
    max: { type: Number, default: 10 },
    label: { type: String, default: '' },
    hint: { type: String, default: '' }
  })

  const files = defineModel('files', { type: Array, default: () => [] })
  const inputRef = ref(null)
  const dragging = ref(false)

  // Rasm plitkasi uchun ko'rinish (object URL), yopilganda bo'shatiladi.
  const previews = new Map()
  const previewOf = (item) => {
    if (!item.file?.type?.startsWith('image/')) return null
    if (!previews.has(item.id)) previews.set(item.id, URL.createObjectURL(item.file))
    return previews.get(item.id)
  }
  onBeforeUnmount(() => previews.forEach((url) => URL.revokeObjectURL(url)))

  const canAdd = computed(() =>
    props.multiple ? files.value.length < props.max : !files.value.length
  )

  const add = (list) => {
    const picked = Array.from(list || [])
    if (!picked.length) return
    const rows = picked.map((file) => ({ id: uuidv4(), name: file.name, file }))
    files.value = props.multiple ? [...files.value, ...rows] : [rows[0]]
  }

  const onPick = (e) => {
    add(e.target.files)
    e.target.value = ''
  }

  const onDrop = (e) => {
    dragging.value = false
    add(e.dataTransfer?.files)
  }

  const remove = (item) => {
    const url = previews.get(item.id)
    if (url) URL.revokeObjectURL(url)
    previews.delete(item.id)
    files.value = files.value.filter((x) => x.id !== item.id)
  }

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
</script>

<template>
  <div class="file-tiles flex flex-wrap gap-2">
    <div
      v-for="item in files"
      :key="item.id"
      class="file-tile group relative flex flex-col overflow-hidden rounded-xl border border-surface-line bg-surface-section"
      :title="item.name"
    >
      <div class="flex flex-1 items-center justify-center overflow-hidden bg-surface-ground">
        <img
          v-if="previewOf(item)"
          :src="previewOf(item)"
          :alt="item.name"
          class="h-full w-full object-cover"
        />
        <span
          v-else
          class="flex h-8 w-8 items-center justify-center rounded-md bg-fig-red-50 text-fig-text-red"
        >
          <n-icon size="18"><DocumentPdf24Regular /></n-icon>
        </span>
      </div>
      <div class="px-1.5 py-1">
        <div class="truncate text-[11px] font-medium leading-4 text-textColor1">
          {{ item.name }}
        </div>
        <div class="text-[10px] leading-3 text-fig-text-secondary">
          {{ formatSize(item.file?.size) }}
        </div>
      </div>
      <button
        type="button"
        class="file-tile__remove absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-fig-text-red text-white shadow"
        :aria-label="$t('content.delete')"
        @click.stop="remove(item)"
      >
        <n-icon size="10"><Dismiss12Filled /></n-icon>
      </button>
    </div>

    <button
      v-if="canAdd"
      type="button"
      class="file-tile file-tile--add flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-1.5 text-center transition-colors"
      :class="
        dragging
          ? 'border-primary bg-fig-chip-brand'
          : 'border-surface-line bg-surface-ground hover:border-primary'
      "
      @click="inputRef?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span
        class="flex h-7 w-7 items-center justify-center rounded-full bg-fig-chip-brand text-primary"
      >
        <n-icon size="16"><Add24Regular /></n-icon>
      </span>
      <span class="text-[11px] font-medium leading-4 text-textColor1">{{
        label || $t('content.attachFile')
      }}</span>
      <span v-if="hint" class="text-[10px] leading-3 text-fig-text-secondary">{{ hint }}</span>
    </button>

    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      @change="onPick"
    />
  </div>
</template>

<style scoped>
  .file-tile {
    width: 104px;
    height: 104px;
  }
  .file-tile__remove {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .file-tile:hover .file-tile__remove,
  .file-tile__remove:focus-visible {
    opacity: 1;
  }
  @media (hover: none) {
    .file-tile__remove {
      opacity: 1;
    }
  }
</style>
