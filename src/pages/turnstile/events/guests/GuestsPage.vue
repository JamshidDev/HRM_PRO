<script setup>
  import { UIModal, UIPageContent, UITable, UITablePagination, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useGuestStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import editRefreshIcon from '@/assets/icons/editRefreshIcon.svg'
  import trash from '@/assets/icons/trash.svg'
  import { AddCircle24Regular, History20Regular, Search16Regular } from '@vicons/fluent'
  import GuestForm from './GuestForm.vue'
  import GuestEvents from './GuestEvents.vue'

  const { t } = i18n.global
  const store = useGuestStore()
  const accStore = useAccountStore()

  const canWrite = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileHikCentralEventsWrite)
  )

  let timer = null
  const onSearch = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      store.params.page = 1
      store._index()
    }, 400)
  }
  const onDate = (v) => {
    store.params.date = v
    store.params.page = 1
    store._index()
  }
  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // JSHSHIR to'liq ko'rinmaydi: 3123******0123.
  const maskPin = (p) => (p ? `${p.slice(0, 4)}******${p.slice(-4)}` : '')
  const userOf = (row) => ({
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name,
    position: maskPin(row.pin)
  })

  const columns = computed(() => [
    { key: 'name', title: t('guestPage.fullName'), minWidth: 260 },
    { key: 'organization', title: t('content.organization'), minWidth: 200 },
    { key: 'work', title: t('guestPage.workTime'), width: 140, align: 'center' },
    { key: 'came', title: t('guestPage.cameAt'), width: 150, align: 'center' },
    { key: 'left', title: t('guestPage.leftAt'), width: 150, align: 'center' },
    { key: 'last', title: t('guestPage.lastEvent'), width: 190 }
  ])

  const actions = computed(() => [
    {
      label: t('guestPage.events'),
      key: 'events',
      icon: UIHelper.renderIcon(History20Regular),
      action: (row) => store.openEvents(row)
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(editRefreshIcon),
      disabled: !canWrite.value,
      action: (row) => store.openEdit(row)
    },
    {
      label: t('guestPage.detach'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(trash),
      disabled: !canWrite.value,
      action: (row) => store._delete(row.id)
    }
  ])

  const lastEventText = (row) =>
    row.last_event
      ? `${Utils.dateTimeShortLabel(row.last_event.at)} · ${
          row.last_event.direction ? t('guestPage.in') : t('guestPage.out')
        }`
      : '—'

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralEventsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <n-input
        v-model:value="store.params.search"
        clearable
        class="w-[280px]!"
        :placeholder="$t('guestPage.searchPlaceholder')"
        @update:value="onSearch"
      >
        <template #prefix>
          <n-icon :component="Search16Regular" />
        </template>
      </n-input>
      <n-date-picker
        class="w-[160px]"
        type="date"
        format="dd.MM.yyyy"
        value-format="yyyy-MM-dd"
        :formatted-value="store.params.date"
        @update:formatted-value="onDate"
      />
      <div class="flex-1"></div>
      <n-button v-if="canWrite" type="primary" class="rounded-lg!" @click="store.openCreate()">
        <template #icon>
          <n-icon :component="AddCircle24Regular" />
        </template>
        {{ $t('guestPage.attach') }}
      </n-button>
    </div>

    <UITable
      :columns="columns"
      :actions="actions"
      :actions-title="$t('content.action')"
      :data="store.list"
      :loading="store.loading"
      :page="store.params.page"
      :per-page="store.params.per_page"
      :total="store.total"
      @change-page="changePage"
    >
      <template #cell-name="{ row }">
        <UIUser :data="userOf(row)" :short="false" :avatar-clickable="false" />
      </template>
      <template #cell-organization="{ row }">
        <span class="text-sm">{{ row.organization?.name }}</span>
      </template>
      <template #cell-work="{ row }">
        <span class="text-sm font-medium">{{ row.work_start }}–{{ row.work_end }}</span>
      </template>
      <template #cell-came="{ row }">
        <div v-if="row.day.first_in" class="flex flex-col items-center gap-0.5">
          <span class="text-sm font-semibold">{{ row.day.first_in }}</span>
          <span
            v-if="row.day.late_minutes"
            class="rounded-full px-2 py-0.5 text-[11px] font-medium bg-fig-chip-amber text-fig-chip-amber-text"
          >
            {{ $t('guestPage.lateMin', { n: row.day.late_minutes }) }}
          </span>
        </div>
        <span
          v-else
          class="rounded-full px-2 py-0.5 text-[11px] font-medium bg-fig-red-50 text-fig-text-red"
        >
          {{ $t('guestPage.notCame') }}
        </span>
      </template>
      <template #cell-left="{ row }">
        <div v-if="row.day.last_out" class="flex flex-col items-center gap-0.5">
          <span class="text-sm font-semibold">{{ row.day.last_out }}</span>
          <span
            v-if="row.day.early_minutes"
            class="rounded-full px-2 py-0.5 text-[11px] font-medium bg-fig-chip-amber text-fig-chip-amber-text"
          >
            {{ $t('guestPage.earlyMin', { n: row.day.early_minutes }) }}
          </span>
        </div>
        <span v-else class="text-sm text-fig-text-tertiary">—</span>
      </template>
      <template #cell-last="{ row }">
        <span class="text-sm">{{ lastEventText(row) }}</span>
      </template>

      <template #footer>
        <UITablePagination
          :page="store.params.page"
          :per-page="store.params.per_page"
          :total="store.total"
          @change-page="changePage"
        />
      </template>
    </UITable>

    <UIModal
      v-model:visible="store.visible"
      :width="440"
      :title="store.editId ? $t('guestPage.editTitle') : $t('guestPage.attachTitle')"
    >
      <GuestForm />
    </UIModal>
    <UIModal
      v-model:visible="store.eventsVisible"
      :width="640"
      :title="$t('guestPage.eventsTitle')"
    >
      <GuestEvents />
    </UIModal>
  </UIPageContent>
</template>
