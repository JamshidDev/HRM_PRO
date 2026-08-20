<script setup>
  import { ArrowLeft20Regular, LockClosed20Regular } from '@vicons/fluent'
  import { UIPageFilter } from '@/components/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAuditStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAuditStore()

  // Sana oralig'i — n-date-picker `daterange` [ms, ms] qaytaradi, backend esa
  // `YYYY-MM-DD` kutadi. IKKALA CHEKKA HAM INKLYUZIV (backend `date_to` ga
  // +1 kun qo'shib eksklyuziv chegara yasaydi).
  const dateValue = computed({
    get() {
      const { date_from, date_to } = store.params
      if (!date_from && !date_to) return null
      return [
        date_from ? new Date(`${date_from}T00:00:00`).getTime() : null,
        date_to ? new Date(`${date_to}T00:00:00`).getTime() : null
      ]
    },
    set(v) {
      if (!v) {
        store.params.date_from = null
        store.params.date_to = null
        return
      }
      store.params.date_from = toDateStr(v[0])
      store.params.date_to = toDateStr(v[1])
    }
  })

  const toDateStr = (ms) => {
    if (!ms) return null
    const d = new Date(ms)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  }

  // Faqat shu page'da REAL uchraydigan turlar (store `count > 0` bo'yicha
  // filtrlaydi), lekin SON ko'rsatilmaydi — dropdown'da ortiqcha.
  const statusOptions = computed(() =>
    store.statusList.map((s) => ({ label: s.label, value: s.value }))
  )

  const userOptions = computed(() =>
    store.userList.map((u) => ({
      label: u.full_name || `#${u.id}`,
      value: u.id
    }))
  )

  // CSV — backend `statuses`/`users` ni vergulli ro'yxat sifatida qabul qiladi.
  const statusValue = computed({
    get: () => (store.params.statuses ? store.params.statuses.split(',') : []),
    set: (v) => (store.params.statuses = v?.length ? v.join(',') : null)
  })

  const userValue = computed({
    get: () => (store.params.users ? store.params.users.split(',').map(Number) : []),
    set: (v) => (store.params.users = v?.length ? v.join(',') : null)
  })

  const filterEvent = () => {
    store.params.page = 1
    store._index()
  }

  // Audit sahifasi qaysi CRUD page'dan ochilganini `trigger_name` dan biladi.
  // Odatda `router.back()` yetarli, lekin sahifa to'g'ridan-to'g'ri havola bilan
  // ochilgan bo'lsa (brauzer tarixi bo'sh) shu xarita bo'yicha qaytamiz.
  const PAGE_ROUTES = {
    'hr.departments': Utils.routeHrmPathMaker(AppPaths.Department)
  }

  const router = useRouter()
  const onBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    const fallback = PAGE_ROUTES[store.params.trigger_name]
    router.push(fallback || '/')
  }
</script>

<template>
  <UIPageFilter
    :show-add-button="false"
    :show-search-input="false"
    :search-loading="store.loading"
    :filter-count="store.filterCount"
    @onClear="store.resetFilter"
    filter-placement="bottom-end"
    :popover-style="{
      width: '620px',
      maxWidth: 'calc(100vw - 32px)',
      minHeight: 'auto',
      padding: '0',
      borderRadius: '20px'
    }"
  >
    <!-- Qatordagi eng o'ng element — qo'shish tugmasi o'rnida ORQAGA tugmasi. -->
    <!-- Sarlavha filter qatorining O'ZIDA (chap chekka): qidiruv maydoni
         o'chirilgani uchun bu joy bo'sh turardi. Alohida qator ochilmaydi. -->
    <template #filterBefore>
      <div class="flex items-center gap-2 whitespace-nowrap">
        <!-- Orqaga — sarlavhadan OLDIN, yozuvi bilan. -->
        <n-button secondary size="small" @click="onBack">
          <template #icon>
            <n-icon><ArrowLeft20Regular /></n-icon>
          </template>
          {{ $t('content.back') }}
        </n-button>

        <span class="text-lg font-semibold">{{ $t('audit.name') }}</span>
        <n-tag v-if="store.pageTitle" size="small" round :bordered="false">
          {{ store.pageTitle }}
        </n-tag>
      </div>
    </template>

    <template #filterContent>
      <div class="audit-filter-panel grid grid-cols-12 gap-x-5 gap-y-4">
        <!--
          Sahifa filtri QULFLANGAN: foydalanuvchi qaysi CRUD page'dan kirgan
          bo'lsa, o'sha page tarixini ko'radi. Bu faqat qulaylik uchun emas —
          backend ham har so'rovda shu page permission'ini tekshiradi.
        -->
        <div class="col-span-12">
          <label>{{ $t('audit.filter.page') }}</label>
          <n-input :value="store.pageTitle || '—'" disabled>
            <template #suffix>
              <n-icon size="16"><LockClosed20Regular /></n-icon>
            </template>
          </n-input>
        </div>

        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('audit.filter.status') }}</label>
          <n-select
            v-model:value="statusValue"
            :options="statusOptions"
            multiple
            clearable
            :placeholder="$t('audit.filter.allStatuses')"
            @update:value="filterEvent"
          />
        </div>

        <div class="col-span-12 md:col-span-6">
          <label>{{ $t('audit.filter.user') }}</label>
          <n-select
            v-model:value="userValue"
            :options="userOptions"
            multiple
            clearable
            filterable
            :loading="store.metaLoading"
            :placeholder="$t('audit.filter.allUsers')"
            @update:value="filterEvent"
          />
        </div>

        <div class="col-span-12">
          <label>{{ $t('audit.filter.period') }}</label>
          <n-date-picker
            v-model:value="dateValue"
            type="daterange"
            clearable
            format="dd.MM.yyyy"
            :start-placeholder="$t('audit.filter.from')"
            :end-placeholder="$t('audit.filter.to')"
            @update:value="filterEvent"
          />
        </div>
      </div>
    </template>
  </UIPageFilter>
</template>

<style scoped>
  .audit-filter-panel label {
    display: block;
    margin-bottom: 6px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .audit-filter-panel :deep(.n-select),
  .audit-filter-panel :deep(.n-input),
  .audit-filter-panel :deep(.n-date-picker) {
    width: 100%;
    --n-height: 40px !important;
    --n-border-radius: 16px !important;
  }
</style>
