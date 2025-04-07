<script setup>
import { UIModal } from '@/components/index.js'

const visible = ref(true)

const props = defineProps({
  src: {
    type: String,
    required: true
  }
})


onMounted(() => {
  if(!window.ViewerInstance){
    window.ViewerInstance = new DjVu.Viewer()
  }
  window.ViewerInstance.render(
      document.querySelector(".djvu_viewer")
  )
  window.ViewerInstance.loadDocumentByUrl(props.src);

})
</script>

<template>
  <UIModal
      :width="1300"
      title=""
      v-model:visible="visible"
      @update:visible="$emit('close')"
  >
    <div class="h-[90vh] djvu_viewer">

    </div>
  </UIModal>
</template>

<style scoped>

</style>
