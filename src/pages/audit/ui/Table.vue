<script setup>
  import { Eye20Regular, Warning20Filled } from '@vicons/fluent'
  import { UIStatus, UITable, UIUser } from '@/components/index.js'
  import { useAuditStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAuditStore()

  // UIStatus rang va IKONANI `status.id` bo'yicha tanlaydi. Audit holatlari
  // uchun komponentga 10..13 ID'lari qo'shilgan (UIStatus.vue).
  const STATUS_ID = { create: 10, update: 11, delete: 12, restore: 13 }

  const statusOf = (s) => ({ id: STATUS_ID[s] ?? 9, name: t(`audit.status.${s}`) })

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Backend `created_at` ni "YYYY-MM-DD HH:MM:SS" ko'rinishida beradi.
  // Sana va vaqt ALOHIDA ustunlarda, sana `dd.MM.yyyy` formatida.
  const dateOf = (row) => {
    const [d] = String(row.created_at || '').split(' ')
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  const timeOf = (row) => {
    const [, tm] = String(row.created_at || '').split(' ')
    return tm || '—'
  }

  // Bitta hodisa bir necha jadvalga tegishi mumkin (bitta "Saqlash" —
  // `request_id` bilan guruhlangan), shuning uchun statuslar RO'YXAT.
  const statusesOf = (row) => [...new Set((row.changes || []).map((c) => c.status))]

  // Amallar ustunini UITable O'ZI qo'shadi (`__actions`, o'ngga qotirilgan) —
  // alohida ustun ta'riflanmaydi, `@action` hodisasi keladi.
  const actions = computed(() => [
    { key: 'view', label: t('audit.table.view'), icon: Eye20Regular }
  ])

  const onAction = (key, row) => {
    if (key === 'view') store.openDetail(row)
  }

  const columns = computed(() => [
    { key: 'status', title: t('audit.table.status'), width: 150, align: 'center' },
    { key: 'page', title: t('audit.table.page'), width: 170 },
    { key: 'user', title: t('audit.table.user'), minWidth: 320 },
    { key: 'created_date', title: t('content.date'), width: 120, align: 'center' },
    { key: 'created_time', title: t('audit.table.time'), width: 110, align: 'center' }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    :actions="actions"
    storage-key="audit-log"
    @change-page="changePage"
    @action="onAction"
  >
    <template #cell-status="{ row }">
      <div class="flex flex-wrap justify-center gap-1">
        <UIStatus v-for="s in statusesOf(row)" :key="s" :status="statusOf(s)" pill />
      </div>
    </template>

    <!-- Sahifa (trigger_name). Hozir filtr qulflangani uchun barcha qatorlarda
         bir xil; page filtri ochilganda ajratuvchi bo'ladi. -->
    <template #cell-page="{ row }">
      <div class="flex flex-col leading-tight">
        <span class="text-sm">{{ row.page?.title || '—' }}</span>
        <span class="text-xs opacity-50">{{ row.page?.key }}</span>
      </div>
    </template>

    <template #cell-user="{ row }">
      <!--
        `w-full min-w-0` MUHIM: UIUser ichidagi matn bloki
        `width: calc(100% - 50px)` ishlatadi, ya'ni komponent ildizi ANIQ
        kenglikka ega bo'lishi shart. Aks holda ildiz flex elementi sifatida
        kontentga qarab o'lchanadi va F.I.Sh / lavozim ustunga sig'may qoladi.
        UIUser ildizida `v-bind="$attrs"` bor, shuning uchun class tashqaridan
        beriladi — umumiy komponentga tegilmaydi.
      -->
      <div class="flex w-full min-w-0 items-center gap-1.5">
        <!-- Sudo: admin boshqa foydalanuvchi nomidan kirgan -->
        <n-tooltip v-if="row.impersonator" trigger="hover">
          <template #trigger>
            <n-icon class="shrink-0" size="16" color="#d03050"><Warning20Filled /></n-icon>
          </template>
          {{ $t('audit.table.impersonatedBy', { name: row.impersonator.full_name }) }}
        </n-tooltip>

        <!-- `short` (default) — F.I.Sh qisqartirilgan: "Raximov.J.S",
             to'liq ismi hover tooltipida ko'rinadi. -->
        <UIUser
          v-if="row.user"
          class="w-full min-w-0 flex-1"
          :data="{
            photo: row.user.photo,
            lastName: row.user.last_name,
            firstName: row.user.first_name,
            middleName: row.user.middle_name,
            position: row.role?.name
          }"
        />
        <!-- Tizim amali (cron / sinxronizatsiya) — foydalanuvchi yo'q -->
        <span v-else class="opacity-60">{{ $t('audit.detail.system') }}</span>
      </div>
    </template>

    <template #cell-created_date="{ row }">
      <span class="whitespace-nowrap">{{ dateOf(row) }}</span>
    </template>

    <template #cell-created_time="{ row }">
      <span class="whitespace-nowrap tabular-nums opacity-80">{{ timeOf(row) }}</span>
    </template>
  </UITable>
</template>
