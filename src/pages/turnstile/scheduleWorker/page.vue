<script setup>
  import { useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIPageContent } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import { getMonthOfRage } from '@utils'
  import { ArrowLeft20Filled } from '@vicons/fluent'
  import Table from './ui/Table.vue'
  import Filter from './ui/Filter.vue'
  import ReplaceModal from './ui/ReplaceModal.vue'

  const store = useScheduleGroupWorkerStore()
  const route = useRoute()
  const router = useRouter()

  // Setup'da (bolalar mount bo'lishidan oldin) to'ldiriladi: oylar paneli (Filter.vue)
  // birinchi render'dayoq tanlangan oyni ko'rsatsin.
  store.params.group = Number(route.params.groupId)
  store.params.startDate = route.query.start
  store.params.endDate = route.query.end
  store.params.search = null
  store.params.page = 1
  store.monthsList = getMonthOfRage(store.params.startDate, store.params.endDate)
  store.selectedDate = store.monthsList[0]?.id ?? null

  const backTo = computed(() => ({
    path: Utils.routeTurnstilePathMaker(AppPaths.ShiftType),
    query: route.query.type ? { type: route.query.type } : {}
  }))

  onMounted(() => {
    // Sana oralig'isiz (qo'lda yozilgan/eski havola) oy aniqlanmaydi — so'rov yubormaymiz,
    // jadval «Ma'lumot yo'q» ko'rsatadi.
    if (!store.selectedDate) {
      store.list = []
      return
    }
    store._dayOfMonth(() => {
      store._index()
    })
  })
</script>

<template>
  <UIPageContent>
    <div class="flex items-center gap-3 min-w-0">
      <n-button size="small" secondary @click="router.push(backTo)">
        <template #icon>
          <ArrowLeft20Filled />
        </template>
        {{ $t('content.back') }}
      </n-button>
      <n-breadcrumb class="min-w-0">
        <n-breadcrumb-item>
          <router-link :to="backTo">{{ $t('shiftType.name') }}</router-link>
        </n-breadcrumb-item>
        <n-breadcrumb-item :clickable="false">
          {{ route.query.name || $t('shiftType.form.groupWorkers') }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>
    <Filter />
    <Table />
    <ReplaceModal />
  </UIPageContent>
</template>
