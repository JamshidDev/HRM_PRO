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
      <div class="flex items-center gap-3 mb-4">
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
          @done="
            () => {
              goBack()
            }
          "
        />

        <NewsMobilePreview :lang-index="langIndex" class="hidden xl:block shrink-0 sticky top-4" />
      </div>
    </n-spin>

    <!-- Tor ekranlarda preview modal ichida ochiladi -->
    <n-modal
      v-model:show="showPreviewModal"
      :mask-closable="true"
      style="background: transparent; box-shadow: none; padding: 0"
    >
      <div class="bg-surface-section rounded-3xl p-4" @click.stop>
        <NewsMobilePreview :lang-index="langIndex" />
      </div>
    </n-modal>
  </UIPageContent>
</template>
