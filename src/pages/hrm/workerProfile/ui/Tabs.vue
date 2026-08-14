<script setup>
  import PersonalTab from '../tabs/PersonalTab.vue'
  import CareerTab from '../tabs/CareerTab.vue'
  import EducationTab from '../tabs/EducationTab.vue'
  import RelativeTab from '../tabs/RelativeTab.vue'
  import OtherTab from '../tabs/OtherTab.vue'
  import { useWorkerProfileStore } from '@/store/modules/index.js'

  const store = useWorkerProfileStore()

  // Tartib store'dagi `tabs` bilan bir xil (Figma "Status Toggle")
  const panes = {
    1: PersonalTab,
    2: CareerTab,
    3: EducationTab,
    4: RelativeTab,
    5: OtherTab
  }
</script>

<template>
  <Transition name="profile-tab" mode="out-in">
    <component :is="panes[store.activeTab]" :key="store.activeTab" />
  </Transition>
</template>

<style lang="scss" scoped>
  .profile-tab-enter-active,
  .profile-tab-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .profile-tab-enter-from,
  .profile-tab-leave-to {
    opacity: 0;
    transform: translateY(6px);
  }
</style>
