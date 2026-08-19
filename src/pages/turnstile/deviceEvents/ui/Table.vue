<script setup>
  import { UIBadge, UITable } from '@/components/index.js'
  import { useAccountStore, useDeviceEventStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { CheckmarkCircle16Regular, DismissCircle16Regular, Image16Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useDeviceEventStore()
  const accStore = useAccountStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'event_time', title: t('deviceEvent.time'), width: 160 },
    { key: 'door', title: t('deviceEvent.door'), minWidth: 200 },
    { key: 'person', title: t('deviceEvent.person'), minWidth: 220 },
    { key: 'matched', title: t('deviceEvent.matched'), minWidth: 240 },
    { key: 'reason', title: t('deviceEvent.reasonLabel'), width: 180 },
    { key: 'photo', title: t('deviceEvent.photo'), width: 80 },
    { key: 'status', title: t('deviceEvent.statusLabel'), width: 140 }
  ])

  // `fixed` — qurilmadan o'chirilib HRM orqali qayta qo'shilgan;
  // `ignored` — e'tiborsiz (mehmon, pudratchi). Ikkalasi ham qatorni ro'yxatdan
  // chiqaradi, chunki sukut bo'yicha faqat hal qilinmaganlar ko'rsatiladi.
  const canResolve = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileHikCentralEventsRead)
  )

  const actions = computed(() => [
    {
      label: t('deviceEvent.markFixed'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle16Regular),
      visible: canResolve.value,
      disabled: (row) => Boolean(row?.resolution),
      action: (row) => store._resolve(row.id, 'fixed', row?.matched_worker?.id ?? null)
    },
    {
      label: t('deviceEvent.markIgnored'),
      key: Utils.ActionTypes.close,
      icon: UIHelper.renderIcon(DismissCircle16Regular),
      visible: canResolve.value,
      disabled: (row) => Boolean(row?.resolution),
      action: (row) => store._resolve(row.id, 'ignored')
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-device-events"
    @change-page="changePage"
  >
    <template #cell-event_time="{ row }">
      <span class="text-xs font-medium">{{ Utils.timeHHMMWithMonth(row?.event_time) }}</span>
    </template>

    <template #cell-door="{ row }">
      <div class="leading-tight">
        <p class="text-xs font-medium">{{ row?.door_name || '-' }}</p>
        <span class="text-[11px] text-secondary">{{ row?.access_level?.name || '-' }}</span>
      </div>
    </template>

    <!-- HCP'dagi shaxs: ism + karta + personCode -->
    <template #cell-person="{ row }">
      <div class="leading-tight">
        <p class="text-xs font-medium">{{ row?.person_name || '-' }}</p>
        <span class="text-[11px] text-secondary">
          {{ $t('deviceEvent.card') }}: {{ row?.card_no || '-' }}
          <template v-if="row?.person_code"> · {{ row.person_code }}</template>
        </span>
      </div>
    </template>

    <!-- Karta raqami bo'yicha topilgan HRM xodimi — ma'sul xodimga taklif -->
    <template #cell-matched="{ row }">
      <div v-if="row?.matched_worker" class="leading-tight">
        <p class="text-xs font-medium">{{ row.matched_worker.full_name }}</p>
        <span class="text-[11px] text-secondary">ID: {{ row.matched_worker.id }}</span>
      </div>
      <span v-else class="text-[11px] text-secondary italic">
        {{ $t('deviceEvent.notMatched') }}
      </span>
    </template>

    <template #cell-reason="{ row }">
      <UIBadge
        :show-icon="false"
        :type="row?.reason === 1 ? Utils.colorTypes.warning : Utils.colorTypes.error"
        :label="row?.reason_name || '-'"
      />
    </template>

    <template #cell-photo="{ row }">
      <n-button v-if="row?.has_photo" size="tiny" secondary circle @click="store._photo(row.id)">
        <template #icon>
          <n-icon><Image16Regular /></n-icon>
        </template>
      </n-button>
      <span v-else class="text-[11px] text-secondary">-</span>
    </template>

    <template #cell-status="{ row }">
      <UIBadge
        v-if="row?.resolution"
        :show-icon="false"
        :type="row.resolution === 'fixed' ? Utils.colorTypes.success : Utils.colorTypes.secondary"
        :label="$t(`deviceEvent.resolution.${row.resolution}`)"
      />
      <UIBadge
        v-else
        :show-icon="false"
        :type="Utils.colorTypes.info"
        :label="$t('deviceEvent.resolved.no')"
      />
    </template>
  </UITable>
</template>
