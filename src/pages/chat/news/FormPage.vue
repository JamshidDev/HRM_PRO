<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNewsStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import { UIPageContent, UIBackButton } from '@/components/index.js'
  import Form from './ui/Form.vue'
  import NewsMobilePreview from './ui/NewsMobilePreview.vue'

  const route = useRoute()
  const router = useRouter()

  const isEditing = computed(() => route.params.id !== 'create')

  const store = useNewsStore()

  // Formada tanlangan til preview'ga uzatiladi
  const langIndex = ref(0)
  const showPreviewModal = ref(false)

  const goBack = () => {
    router.push(Utils.routeChatPathMaker(AppPaths.News))
  }

  onMounted(async () => {
    store.resetForm()
    store.instance = null
    if (isEditing.value) {
      const isAvailable = await store._show(route.params.id)
      if (!isAvailable) goBack()
    }
  })
</script>
<template>
  <UIPageContent>
    <n-spin :show="store.loading">
      <!-- Manfiy margin UIPageContent paddingini qoplaydi, shunda yopishgan panel
           ostidan skroll qilinayotgan kontentning chetlari ko'rinib qolmaydi. -->
      <div
        class="news-form-header sticky top-0 z-30 flex items-center gap-3 mb-4 -mx-1 md:-mx-4 px-1 md:px-4 py-3 border-b border-surface-line"
      >
        <UIBackButton @click="goBack" />
        <h1 class="text-xl font-bold text-textColor0">
          {{ isEditing ? $t('newsPage.edit') : $t('newsPage.create') }}
        </h1>
      </div>
      <div class="flex items-start gap-6">
        <Form
          v-model:lang-index="langIndex"
          class="flex-1 min-w-0"
          @preview="showPreviewModal = true"
          @cancel="goBack"
          @done="
            () => {
              goBack()
            }
          "
        />

        <!-- Past bo'yli ekranlarda telefon ramkasi viewport'ga sig'masligi mumkin —
             shunda panelning o'zi ichkaridan skroll bo'ladi. -->
        <NewsMobilePreview
          :lang-index="langIndex"
          class="hidden xl:block shrink-0 sticky top-[68px] max-h-[calc(100dvh-84px)] overflow-y-auto"
        />
      </div>
    </n-spin>

    <!-- Tor ekranlarda preview modal ichida ochiladi -->
    <n-modal
      v-model:show="showPreviewModal"
      :mask-closable="true"
      style="background: transparent; box-shadow: none; padding: 0"
    >
      <div class="bg-surface-section rounded-3xl p-4 max-h-[94vh] overflow-y-auto" @click.stop>
        <NewsMobilePreview :lang-index="langIndex" />
      </div>
    </n-modal>
  </UIPageContent>
</template>

<style lang="scss" scoped>
  // Yopishgan sarlavha ostidan kontent ko'rinmasligi uchun to'liq shaffofmas fon.
  .news-form-header {
    background: var(--surface-ground);
  }
</style>
