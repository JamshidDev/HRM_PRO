<script setup>
  import { UIModal } from '@/components/index.js'
  import { useKpiStore } from '@stores'

  const store = useKpiStore()

  const fullName = computed(() => {
    const w = store.showWorker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })
</script>

<template>
  <!-- Katta va BALANDLIGI QAT'IY modal: ko'rsatkichlar tashqi tizimdan kelganda
       joy allaqachon tayyor bo'lsin — kontent qo'shilganda modal "sakramaydi".
       `height` berilgani uchun UIModal ichki qismni flex + skroll qilib beradi. -->
  <UIModal
    v-model:visible="store.showVisible"
    :title="fullName"
    width="1200px"
    height="700px"
    :persistent="false"
  >
    <n-spin :show="store.showLoading" class="h-full">
      <!-- Hozircha BO'SH — KPI ma'lumotlari integratsiya ulangach shu yerga chiziladi. -->
      <div class="kpi-show"></div>
    </n-spin>
  </UIModal>
</template>

<style scoped>
  .kpi-show {
    height: 100%;
    min-height: 600px;
  }
</style>
