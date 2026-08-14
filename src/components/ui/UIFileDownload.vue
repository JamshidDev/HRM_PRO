<script setup>
  import icons from '@/assets/icons'
  import Utils from '@/utils/Utils.js'

  /**
   * Figma jadvallaridagi "Fayl" katagi (node 2673:256433) — faqat yashil
   * `file-arrow-down` ikonkasi, matnsiz.
   */
  const props = defineProps({
    file: {
      type: String,
      default: null
    }
  })

  const onDownload = () => props.file && window.open(props.file, '_blank')
</script>

<template>
  <button
    v-if="file"
    type="button"
    class="file-download"
    :title="Utils.fileNameFromUrl(file)"
    @click.stop="onDownload"
  >
    <n-icon :size="24">
      <component :is="icons.figFileArrowDown" />
    </n-icon>
  </button>
</template>

<style lang="scss" scoped>
  .file-download {
    display: inline-flex;
    align-items: center;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--fig-icon-green);
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.75;
    }
  }
</style>
