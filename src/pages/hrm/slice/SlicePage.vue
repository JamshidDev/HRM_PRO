<script setup>
import SliceContainer from "./ui/SliceContainer.vue"
import SectionPanel from "./ui/SectionPanel.vue"
import OrganizationSection from "./ui/OrganizationSection.vue"
import DepartmentSection from "./ui/DepartmentSection.vue"
import PositionSection from "./ui/PositionSection.vue"
import WorkerSection from "./ui/WorkerSection.vue"
import {useReportStore} from "@/store/modules/index.js"

const store = useReportStore()

onMounted(()=>{
  store.getOrganization()
})
</script>

<template>
<div class="p-2">
  <SliceContainer>
    <template v-for="panel in store.cols" :key="panel.id">
      <SectionPanel
          :class="[!store.showPanel(panel.id) && '!w-[0px] !border-none']"
          :data="panel"
      >
        <template v-if="panel.id === 1">
          <OrganizationSection/>
        </template>
        <template v-if="panel.id === 2">
          <DepartmentSection/>
        </template>
        <template v-if="panel.id === 3">
          <PositionSection/>
        </template>
        <template v-if="panel.id === 4">
          <WorkerSection/>
        </template>
      </SectionPanel>

    </template>

  </SliceContainer>
</div>
</template>
