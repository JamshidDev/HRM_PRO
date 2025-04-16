<script setup>
import {ZoomIn16Filled, ZoomOut16Filled, FullScreenMaximize20Filled} from '@vicons/fluent'
import panzoom from '@panzoom/panzoom'

const panArea = ref(null)
const mouseArea = ref(null)
let panzoomInstance = null

const zoomIn = () => {
  panzoomInstance.zoomIn()
}

const zoomOut = () => {
  panzoomInstance.zoomOut()
}

const reset = () => {
  panzoomInstance.reset()
}

const areaWheelControl = (event) => {
  event.preventDefault()
  if(event.deltaY>0){
    zoomOut()
  }else{
    zoomIn()
  }

}

onMounted(() => {
  panzoomInstance = panzoom(panArea.value, {
    maxZoom: 10,
    minZoom: 0,
    smoothScroll: false,
  })

  mouseArea.value.addEventListener('wheel', areaWheelControl, { passive: false })
})

onBeforeUnmount(()=>{
  panzoomInstance.destroy()
  mouseArea.value.removeEventListener('wheel', areaWheelControl)
})

</script>

<template>
  <div ref="mouseArea" class="overflow-hidden w-full h-full relative">
    <div class="absolute bottom-2 right-2 z-10">
      <n-button-group >
        <n-button
            type="success"
            @click="zoomOut"

        >
          <template #icon>
            <n-icon :component="ZoomOut16Filled"/>
          </template>
        </n-button>
        <n-button
            type="info"
            @click="zoomIn"
        >
          <template #icon>
            <n-icon :component="ZoomIn16Filled"/>
          </template>
        </n-button>
        <n-button
            type="tertiary"
            @click="reset"
        >
          <template #icon>
            <n-icon :component="FullScreenMaximize20Filled"/>
          </template>
        </n-button>
      </n-button-group>

    </div>

    <div ref="panArea">
      <slot />
    </div>
  </div>

</template>
<style scoped>
[ref="panArea"] {
  cursor: grab;
}
</style>
