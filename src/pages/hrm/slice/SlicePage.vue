<script setup>
import SliceContainer from "./ui/SliceContainer.vue"
import SectionPanel from "./ui/SectionPanel.vue"
import OrganizationsPanel from "./ui/OrganizationPanel.vue"
import {useSliceStore} from "@/store/modules/index.js"

const store = useSliceStore()
</script>

<template>
<div class="p-2">
  <SliceContainer>
    <template v-for="panel in store.cols" :key="panel.id">
      <SectionPanel
          v-if="store.showPanel(panel.id)"
          :data="panel"
      >
        <template v-if="panel.id === 1">
          <OrganizationsPanel/>
        </template>
      </SectionPanel>

    </template>

  </SliceContainer>
</div>
</template>
