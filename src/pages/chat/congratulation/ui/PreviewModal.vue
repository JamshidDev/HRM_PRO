<script setup>
import {useCongratulationStore} from "@stores"
import { UIModal} from "@components"

const store = useCongratulationStore()
</script>

<template>
  <UIModal
    :width="800"
    v-model:visible="store.visible"
    :title="$t('content.view')"
  >
    <div class="bg-surface-ground p-4 rounded-lg h-[300px] overflow-y-auto">
      <pre v-html="store.selectedContent"></pre>
    </div>
  </UIModal>
</template>

