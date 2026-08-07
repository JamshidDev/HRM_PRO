<script setup>
  import { computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNewsStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import { UIPageContent, UIPageTitle } from '@/components/index.js'
  import Form from './ui/Form.vue'

  const route = useRoute()
  const router = useRouter()

  const isEditing = computed(() => route.params.id !== 'create')

  const store = useNewsStore()

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
      <UIPageTitle
        :title="isEditing ? $t('newsPage.edit') : $t('newsPage.create')"
        :subtitle="isEditing ? $t('newsPage.editSubtitle') : $t('newsPage.createSubtitle')"
      />
      <Form
        @done="
          () => {
            goBack()
          }
        "
      />
    </n-spin>
  </UIPageContent>
</template>
