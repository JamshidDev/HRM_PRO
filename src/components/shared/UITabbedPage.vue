<script setup>
  import UISegmentTabs from '@/components/ui/UISegmentTabs.vue'

  /**
   * Bir nechta mavjud sahifani bitta pagega bob qilib yig'adi (dashboard uslubi).
   * Chaqiruvchi FAQAT ruxsati bor boblarni beradi — ruxsat tekshiruvi shu yerda emas,
   * chunki har sahifada slug boshqa.
   */
  const props = defineProps({
    tabs: {
      type: Array,
      required: true // [{ id, name, badge?, component }]
    }
  })

  const route = useRoute()
  const router = useRouter()

  /**
   * Faol bob URL'da (`?tab=`) saqlanadi — havola/bookmark/«orqaga» ishlashi uchun.
   * Query'da yo'q yoki ruxsati bo'lmagan bob ko'rsatilgan bo'lsa — birinchisiga tushadi.
   */
  const active = computed({
    get: () => {
      const fromUrl = route.query.tab
      return props.tabs.some((tab) => tab.id === fromUrl) ? fromUrl : props.tabs[0]?.id || null
    },
    set: (id) => router.push({ query: { ...route.query, tab: id } })
  })

  const activeComponent = computed(
    () => props.tabs.find((tab) => tab.id === active.value)?.component || null
  )
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex items-center gap-3 flex-wrap pl-4 pr-7 py-3">
      <UISegmentTabs :tabs="tabs" v-model="active" />
    </div>

    <!-- `key` — bob almashganda komponent qayta mount bo'ladi, ya'ni ichki
         sahifaning `onMounted` ro'yxatni qaytadan tortadi. -->
    <component :is="activeComponent" v-if="activeComponent" :key="active" />
  </div>
</template>
