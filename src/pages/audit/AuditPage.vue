<script setup>
  import { UIPageContent } from '@components'
  import { useAuditStore } from '@stores'
  import { Filter, Table, Detail } from './ui'

  const route = useRoute()
  const store = useAuditStore()

  // Sahifa kontekstini QUERY dan oladi: `/audit?trigger_name=hr.departments`.
  // CRUD page'dagi [↺ Tarix] tugmasi shu havolani ochadi. `trigger_name` bo'lmasa
  // hech narsa so'ralmaydi — bu sahifa doim biror page nomidan ochiladi.
  const load = () => {
    const page = route.query.trigger_name
    if (!page) return

    const id = route.query.trigger_id ? Number(route.query.trigger_id) : null
    store.openFor(String(page), id)
    store._meta()
    store._index()
  }

  onMounted(load)
  watch(() => route.query.trigger_name, load)
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <Detail />
  </UIPageContent>
</template>
