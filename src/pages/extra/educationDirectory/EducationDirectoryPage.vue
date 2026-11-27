<script setup>
  import { UIPageContent, UIPageFilter } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()
  import { useEducationReadPermission } from './readPermission.js'
  const readPermission = useEducationReadPermission()

  import Tabs from './ui/Tabs.vue'

  import {
    useLanguageAdminStore,
    useUniversityAdminStore,
    useSpecialityStore
  } from '@/store/modules/index.js'
  const store = useLanguageAdminStore()
  const universityStore = useUniversityAdminStore()
  const specialtyStore = useSpecialityStore()

  // «Qo'shish» faqat joriy bob uchun yozish ruxsati bo'lsa ko'rinadi.
  const WRITE = {
    1: accStore.pn.universitiesWrite,
    2: accStore.pn.specialitiesWrite,
    3: accStore.pn.languagesWrite
  }
  const canAdd = computed(() => accStore.checkPermission(WRITE[store.activeTab]))

  const onAdd = () => {
    if (store.activeTab === 3) {
      if (!accStore.checkAction(accStore.pn.languagesWrite)) return
      addLanguage()
    } else if (store.activeTab === 1) {
      if (!accStore.checkAction(accStore.pn.universitiesWrite)) return
      addUniversity()
    } else if (store.activeTab === 2) {
      if (!accStore.checkAction(accStore.pn.specialitiesWrite)) return
      addSpecialty()
    }
  }

  const onSearch = () => {
    if (store.activeTab === 3) {
      if (!accStore.checkAction(readPermission(3))) return
      store.params.search = universityStore.params.search
      store.params.page = 1
      store._index()
    } else if (store.activeTab === 1) {
      if (!accStore.checkAction(readPermission(1))) return
      universityStore.params.page = 1
      universityStore._index()
    } else if (store.activeTab === 2) {
      if (!accStore.checkAction(readPermission(2))) return
      specialtyStore.params.search = universityStore.params.search
      specialtyStore.params.page = 1
      specialtyStore._index()
    }
  }

  const addLanguage = () => {
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }

  const addUniversity = () => {
    universityStore.resetForm()
    universityStore.visibleType = true
    universityStore.visible = true
  }

  const addSpecialty = () => {
    specialtyStore.resetForm()
    specialtyStore.visibleType = true
    specialtyStore.visible = true
  }
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      v-model:search="universityStore.params.search"
      @onSearch="onSearch"
      @onAdd="onAdd"
      :show-add-button="canAdd"
      :show-filter-button="false"
    />
    <Tabs />
  </UIPageContent>
</template>
