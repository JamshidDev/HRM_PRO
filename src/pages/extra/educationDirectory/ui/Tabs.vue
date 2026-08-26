<script setup>
  import { UISegmentTabs } from '@/components/index.js'
  import { useLanguageAdminStore } from '@/store/modules/admin/languageAdminStore.js'
  import LanguagePage from '../languages/LanguagePage.vue'
  import UniversityPage from '../university/UniversityPage.vue'
  import SpecialtyPage from '../speciality/SpecialityPage.vue'
  import { useSpecialityStore, useUniversityAdminStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useLanguageAdminStore()
  const universityStore = useUniversityAdminStore()
  const specialtyStore = useSpecialityStore()

  /**
   * Bob nomlari ATAYLAB store'dagi `tabList.name` dan olinmaydi: u kalitlar
   * (`othersPage.tabs.*`) ruxsatlar ro'yxati va eski admin sahifasi bilan
   * umumiy. Maketda bu sahifa uchun boshqa matn ("O'quv yurtlari") turadi, shu
   * bois faqat shu sahifaga tegishli kalitlar ishlatiladi.
   */
  const tabLabels = {
    1: 'educationDirectory.tabs.university',
    2: 'educationDirectory.tabs.speciality',
    3: 'educationDirectory.tabs.language'
  }

  const tabs = computed(() =>
    store.tabList.map((item) => ({ id: item.id, name: t(tabLabels[item.id] ?? item.name) }))
  )

  const pages = {
    1: UniversityPage,
    2: SpecialtyPage,
    3: LanguagePage
  }

  const activePage = computed(() => pages[store.activeTab] ?? UniversityPage)

  const onChange = (v) => {
    store.activeTab = v
    // Qidiruv maydoni uchta bob uchun bitta (universitet store'ida turadi) —
    // bob almashganda tanlangan bobning params'iga ko'chiriladi.
    if (v === 3) {
      store.params.search = universityStore.params.search
    } else if (v === 2) {
      specialtyStore.params.search = universityStore.params.search
    }
  }
</script>

<template>
  <div class="flex flex-1 flex-col gap-4 min-h-0">
    <UISegmentTabs
      variant="surface"
      :tabs="tabs"
      :model-value="store.activeTab"
      @update:model-value="onChange"
    />

    <!-- `KeepAlive`: avval n-tab-pane'lar bir marta mount bo'lib joyida qolardi
         va bob almashganda so'rov qaytarilmasdi. Oddiy `v-if` bu xatti-harakatni
         buzib, har almashishda `_index()` ni qaytadan chaqirardi. -->
    <div class="flex-1 min-h-0">
      <KeepAlive>
        <component :is="activePage" />
      </KeepAlive>
    </div>
  </div>
</template>
