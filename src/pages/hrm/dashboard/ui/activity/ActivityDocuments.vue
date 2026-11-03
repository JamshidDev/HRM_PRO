<script setup>
  // «Hujjatlar holati» — 4 ta hujjat turi × 3 holat (jarayonda, rad etilgan, muammoli).
  import {
    ChevronRight16Regular,
    ClipboardTask20Regular,
    DocumentAdd20Regular,
    DocumentBulletList20Regular,
    DocumentText20Regular
  } from '@vicons/fluent'
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
      title: 'dashboardPage.documents.commands',
      path: AppPaths.Command,
      icon: DocumentBulletList20Regular,
      chip: 'bg-fig-chip-brand text-fig-chip-brand-text'
    },
    {
      key: 'contracts',
      title: 'dashboardPage.documents.contracts',
      path: AppPaths.Contract,
      icon: DocumentText20Regular,
      chip: 'bg-fig-chip-green text-fig-chip-green-text'
    },
    {
      key: 'contract_additional',
      title: 'dashboardPage.documents.contract_additional',
      path: AppPaths.AdContract,
      icon: DocumentAdd20Regular,
      chip: 'bg-fig-chip-indigo text-fig-chip-indigo-text'
    },
    {
      key: 'worker_applications',
      title: 'dashboardPage.documents.worker_applications',
      path: AppPaths.Application,
      icon: ClipboardTask20Regular,
      chip: 'bg-fig-chip-pink text-fig-chip-pink-text'
    }
  ]

  const statuses = [
    {
      key: 'process',
      id: 1,
      label: 'dashboardPage.documents.process',
      tile: 'bg-fig-chip-amber',
      value: 'text-fig-chip-amber-text'
    },
    {
      key: 'rejected',
      id: 4,
      label: 'dashboardPage.documents.rejected',
      tile: 'bg-fig-bg-secondary',
      value: 'text-fig-text-secondary'
    },
    {
      key: 'problem',
      id: 7,
      label: 'dashboardPage.documents.problem',
      tile: 'bg-fig-red-50',
      value: 'text-fig-text-red'
    }
  ]

  const load = () => {
    const id = ++requestId
    loading.value = true
    ApiService.dashboardService
      ._documents({ params: store.appendParams({}) })
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

  // Qiymat yo'q (masalan, arizada «Muammoli») — 0.
  const countOf = (card, status) => Number(data.value?.[card.key]?.[status.key] ?? 0)

  const open = (card, status) => {
    if (loading.value || countOf(card, status) === 0) return
    router.push({
      path: Utils.routeHrmPathMaker(card.path),
      query: status ? { confirmation: status.id } : undefined
    })
  }
</script>

<template>
  <div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.key"
        class="flex flex-col gap-3 rounded-2xl bg-fig-block shadow-card p-3"
      >
        <!-- Sarlavha — bosilsa filtrsiz ro'yxat ochiladi. -->
        <button
          type="button"
          class="group flex min-h-9 items-center gap-2 rounded-xl px-1 text-left"
          @click="router.push(Utils.routeHrmPathMaker(card.path))"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full"
            :class="card.chip"
          >
            <n-icon size="18"><component :is="card.icon" /></n-icon>
          </span>
          <span
            class="min-w-0 flex-1 truncate text-[14px] leading-[18px] font-semibold text-fig-text-primary"
          >
            {{ $t(card.title) }}
          </span>
          <n-icon
            size="16"
            class="shrink-0 text-fig-text-tertiary transition-transform group-hover:translate-x-0.5"
          >
            <ChevronRight16Regular />
          </n-icon>
        </button>

        <!-- Holatlar: rangli plitkalar, son 0 bo'lsa bosilmaydi. -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="status in statuses"
            :key="status.key"
            type="button"
            :disabled="loading || countOf(card, status) === 0"
            class="flex min-h-[68px] min-w-0 flex-col justify-between gap-1 rounded-xl px-2.5 py-2 text-left transition enabled:cursor-pointer enabled:hover:brightness-95 disabled:cursor-default"
            :class="status.tile"
            @click="open(card, status)"
          >
            <span class="truncate text-[12px] leading-4 font-medium text-fig-text-secondary">
              {{ $t(status.label) }}
            </span>
            <n-skeleton v-if="loading" width="40px" height="22px" round />
            <span
              v-else
              class="text-[20px] leading-6 font-semibold tabular-nums"
              :class="countOf(card, status) === 0 ? 'text-fig-text-tertiary' : status.value"
            >
              {{ formatCount(countOf(card, status)) }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
