<script setup>
  // «Hujjatlar holati» — 4 ta karta (buyruqlar, shartnomalar, qo'shimcha kelishuvlar, arizalar).
  import ApiService from '@/service/ApiService.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/AppPaths.js'
  import Utils from '@/utils/Utils.js'
  import { useRouter } from 'vue-router'
  import { formatCount } from './utils.js'

  const router = useRouter()
  const store = useDashboardStore()

  const loading = ref(false)
  const data = ref(null)
  // Oxirgi so'rov javobi eski javobni bosib ketmasin.
  let requestId = 0

  const cards = [
    {
      key: 'commands',
      titleKey: 'dashboardPage.documents.commands',
      path: Utils.routeHrmPathMaker(AppPaths.Command)
    },
    {
      key: 'contracts',
      titleKey: 'dashboardPage.documents.contracts',
      path: Utils.routeHrmPathMaker(AppPaths.Contract)
    },
    {
      key: 'contract_additional',
      titleKey: 'dashboardPage.documents.contract_additional',
      path: Utils.routeHrmPathMaker(AppPaths.AdContract)
    },
    {
      key: 'worker_applications',
      titleKey: 'dashboardPage.documents.worker_applications',
      path: Utils.routeHrmPathMaker(AppPaths.Application)
    }
  ]

  const statuses = [
    {
      key: 'process',
      id: 1,
      labelKey: 'dashboardPage.documents.process',
      dotClass: 'bg-fig-brand'
    },
    {
      key: 'approved',
      id: 3,
      labelKey: 'dashboardPage.documents.approved',
      dotClass: 'bg-fig-green'
    },
    {
      key: 'rejected',
      id: 4,
      labelKey: 'dashboardPage.documents.rejected',
      dotClass: 'bg-fig-red'
    },
    {
      key: 'problem',
      id: 7,
      labelKey: 'dashboardPage.documents.problem',
      dotClass: 'bg-fig-amber'
    }
  ]

  const load = () => {
    const id = ++requestId
    loading.value = true
    const params = store.appendParams({})
    ApiService.dashboardService
      ._documents({ params })
      .then((res) => {
        if (id === requestId) data.value = res.data?.data || null
      })
      .catch(() => {
        if (id === requestId) data.value = null
      })
      .finally(() => {
        if (id === requestId) loading.value = false
      })
  }

  // Korxona filtri o'zgarganda qayta yuklanadi (oy tanlagichiga bog'liq emas).
  watch(() => store.params.organizations, load, { immediate: true, deep: true })

  // worker_applications.problem null bo'ladi — chertilmaydi va «–» ko'rsatiladi.
  const isClickable = (cardKey, statusKey) => {
    if (loading.value) return false
    if (cardKey === 'worker_applications' && statusKey === 'problem') return false
    return true
  }

  const getDisplayValue = (cardKey, statusKey) => {
    if (cardKey === 'worker_applications' && statusKey === 'problem') return '–'
    const val = data.value?.[cardKey]?.[statusKey]
    if (val === null || val === undefined) return '–'
    return formatCount(val)
  }

  const onRowClick = (card, status) => {
    if (!isClickable(card.key, status.key)) return
    router.push({
      path: card.path,
      query: { confirmation: status.id }
    })
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Sarlavha -->
    <p class="text-[16px] leading-6 font-semibold text-fig-text-primary">
      {{ $t('dashboardPage.documents.title') }}
    </p>

    <!-- 4 ta karta: 1 col mobile, 2 md, 4 xl -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.key"
        class="flex flex-col gap-2.5 rounded-2xl bg-fig-block shadow-card p-4 transition-colors"
      >
        <!-- Karta sarlavhasi -->
        <div class="flex items-center justify-between border-b border-fig-bg-disable pb-2">
          <p class="truncate text-[15px] leading-5 font-semibold text-fig-text-primary">
            {{ $t(card.titleKey) }}
          </p>
        </div>

        <!-- 4 ta holat qatori -->
        <div class="flex flex-col gap-1">
          <div
            v-for="status in statuses"
            :key="status.key"
            :class="[
              'flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors',
              isClickable(card.key, status.key)
                ? 'cursor-pointer hover:bg-fig-bg-secondary'
                : 'cursor-default'
            ]"
            @click="isClickable(card.key, status.key) && onRowClick(card, status)"
          >
            <div class="flex min-w-0 items-center gap-2">
              <span class="size-2 shrink-0 rounded-full" :class="status.dotClass" />
              <span class="truncate text-[13px] leading-5 text-fig-text-secondary">
                {{ $t(status.labelKey) }}
              </span>
            </div>

            <div class="shrink-0">
              <n-skeleton v-if="loading" width="32px" height="16px" round />
              <span
                v-else
                class="text-[14px] leading-5 font-semibold tabular-nums text-fig-text-primary"
              >
                {{ getDisplayValue(card.key, status.key) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
