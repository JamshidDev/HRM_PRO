<script setup>
  import { onMounted } from 'vue'
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import { Eye24Regular } from '@vicons/fluent'
  import Table from './ui/Table.vue'
  import StoryForm from './ui/StoryForm.vue'
  import StoryPreview from './ui/StoryPreview.vue'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const formRef = ref(null)

  // Yon paneldagi preview `xl` dan tor ekranlarda yashiriladi — o'sha holatda
  // footer tugmasi orqali xuddi shu komponent modal ichida ochiladi.
  const showPreviewModal = ref(false)

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    store._openCreate()
  }

  const onSave = async () => {
    if (store.visibleType) await store._create()
    else await store._update()
    window.$Toast?.success(t('mobileStoryPage.saved'))
  }

  // Modal × / ESC bilan yopilganda ham forma va lokal preview URL'lar tozalanadi.
  watch(
    () => store.visible,
    (v) => {
      if (!v) {
        showPreviewModal.value = false
        store.resetForm()
      }
    }
  )

  onMounted(() => {
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    />
    <Table />

    <UIModal
      v-model:visible="store.visible"
      :title="store.visibleType ? $t('mobileStoryPage.createTitle') : $t('mobileStoryPage.updateTitle')"
      width="min(1240px, calc(100vw - 32px))"
      height="min(94vh, 940px)"
    >
      <StoryForm ref="formRef" @save="onSave" />

      <template #footer>
        <div class="flex justify-end gap-2 px-4 pb-2">
          <n-button ghost class="xl:hidden" @click="showPreviewModal = true">
            <template #icon>
              <n-icon :component="Eye24Regular" />
            </template>
            {{ $t('mobileStoryPage.form.preview') }}
          </n-button>
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading || store.slideUploading"
            @click="formRef?.submit()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>

    <!-- Tor ekranlarda preview shu modal orqali ochiladi -->
    <UIModal
      v-model:visible="showPreviewModal"
      :title="$t('mobileStoryPage.form.preview')"
      :width="380"
      :persistent="false"
    >
      <StoryPreview />
    </UIModal>
  </UIPageContent>
</template>

<style scoped></style>
