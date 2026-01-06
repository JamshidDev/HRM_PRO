<script setup>
  import { UIPageFilter } from '@/components/index.js'
  import { useTelegramUserStore } from '@/store/modules/index.js'
  const store = useTelegramUserStore()

  const onAdd = () => {
    store.resetForm()
    store.elementId = null
    store.visible = true
    store.visibleType = true
  }

  const onSearchEv = () => {
    store.params.page = 1
    store._index()
  }
</script>

<template>
  <UIPageFilter @onSearch="onSearchEv" @onAdd="onAdd"> </UIPageFilter>
</template>
