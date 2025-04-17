<script setup>
import SliceContainer from "./ui/SliceContainer.vue"
import SectionPanel from "./ui/SectionPanel.vue"
import OrganizationSection from "./ui/OrganizationSection.vue"
import DepartmentSection from "./ui/DepartmentSection.vue"
import PositionSection from "./ui/PositionSection.vue"
import WorkerSection from "./ui/WorkerSection.vue"
import {useReportStore} from "@/store/modules/index.js"

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

const store = useReportStore()



onMounted(()=>{
  store.getOrganization()
  store.activePanels.push(store.cols[0])
  store.barList = store.cols.filter((item, idx)=>idx>0)
})

</script>

<template>
<div class="p-2">

  <SliceContainer>
    <splitpanes
        class="w-full">
      <template
          v-for="(panel, idx) in store.cols" :key="panel.id"
      >
        <pane

            min-size="10"
            v-if="store.isActivePanel(panel.id)"
        >

          <SectionPanel
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
        </pane>
      </template>

    </splitpanes>
  </SliceContainer>
</div>
</template>
