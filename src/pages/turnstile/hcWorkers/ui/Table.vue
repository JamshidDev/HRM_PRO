<script setup>
  import { UIBadge, UITable, UIUser, UIChip } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useTurnstileHikCentralWorkerStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import {
    AddSquareMultiple20Regular,
    ArrowSync24Filled,
    Delete20Regular,
    Edit32Regular,
    ErrorCircle24Filled,
    Stethoscope20Regular,
    ErrorCircle12Filled
  } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import AccessLevelModal from './AccessLevelModal.vue'
  import DiagnoseModal from './DiagnoseModal.vue'

  const { t } = i18n.global

  const message = useMessage()
  const accStore = useAccountStore()
  const store = useTurnstileHikCentralWorkerStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
    store.elementId = row.id
    store.resetEditPayload()
    store.resetForm()

    const existPerson = Boolean(row.hcpPerson)
    const photoId = row?.hcpPerson?.photo?.id

    store.payload.end_time = row?.hcpPerson?.to ? new Date(row.hcpPerson.to).getTime() : null
    store.payload.access_level_ids = []
    store.editPayload.id = row?.hcpPerson?.id || undefined
    store.editPayload.worker_id = row?.hcpPerson?.id ? undefined : row.id

    store.payload.worker_id = row?.id

    store.editVisible = true
    store._access_levels()

    store._workerAccessLevels(row.id, (data) => {
      store.lockedAccessLevels = data.filter((level) => level.locked)
      store.payload.access_level_ids = data
        .filter((level) => !level.locked)
        .map((level) => level.access_level_id)
    })

    store._worker_photos(() => {
      if (!existPerson) return
      store.payload.photo_index = store.photos.findIndex((x) => x.id == photoId)
      store.payload.photo_id = photoId
    })
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersDelete)) return
    store.elementId = row.id
    store._delete()
  }

  // const checkDeviceExpiry = (date) => {
  //   const now = new Date()
  //   const expiryDate = new Date(date)
  //   if (now > expiryDate) return 'error'
  //   const oneMonthLater = new Date(now)
  //   oneMonthLater.setMonth(now.getMonth() + 1)
  //   if (expiryDate <= oneMonthLater) return 'warning'
  //   return 'primary'
  // }

  const onSelect = (row) => {
    store.accessLevelModalVisible = true
    store.moreAccessLevels = []
    store._workerAccessLevels(row.id)
    store.selectedWorker = row
  }

  const onRefreshAccessLevel = async (v) => {
    onRefresh(v)
  }

  // Guruh chipida «Yangilash» faqat yozish ruxsati bo'lsa ko'rinadi.
  const canRefresh = computed(() => accStore.checkPermission(accStore.pn.turnstileHikCentralWorkersWrite))

  const onRefresh = (v) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralWorkersWrite)) return
    store._onRefreshAcessLeves(v.id)
  }

  const onShowErrorEv = (worker_id, access_level_id) => {
    const params = {
      worker_id: worker_id || undefined,
      access_level_id: access_level_id || undefined
    }
    store._getErrors(params)
    store.errorVisible = true
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.fullName'),
      minWidth: 230
    },
    {
      key: 'access_levels',
      title: t('turnstile.hcWorkersPage.access_levels'),
      minWidth: 300
    },
    {
      key: 'hcpPerson.to',
      title: t('content.expiryDate'),
      width: 120
    },
    {
      key: 'hcpPerson.updated_at',
      title: t('content.updatedAt'),
      width: 120
    },
    {
      key: 'errorMessage',
      title: t('content.error'),
      width: 120
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    // Jadval kataklarida bosiladigan narsa yo'q — guruhlar (har birini yangilash, xatosi) oynada, xatolar ro'yxati shu yerdan.
    {
      label: t('turnstile.hcWorkersPage.access_levels'),
      key: 'accessLevels',
      icon: UIHelper.renderIcon(AddSquareMultiple20Regular),
      visible: (row) => Boolean(row?.hcpPerson?.access_levels?.length),
      action: onSelect
    },
    {
      label: t('content.error'),
      key: 'errors',
      icon: UIHelper.renderIcon(ErrorCircle24Filled),
      visible: (row) => Boolean(row?.errorMessage),
      action: (row) => onShowErrorEv(row.id)
    },
    {
      label: t('turnstile.diagnose.action'),
      key: 'diagnose',
      icon: UIHelper.renderIcon(Stethoscope20Regular),
      action: onDiagnose
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])

  // Diagnostika faqat O'QIYDI — yozish ruxsati shart emas.
  // ⚠️ `row.id` — XODIM id'si; diagnostika esa `worker_hik_centrals.id` ni
  // kutadi, u `hcpPerson.id` da. HCP'ga umuman qo'shilmagan xodimda
  // `hcpPerson` bo'lmaydi — o'shanda tekshiradigan narsa ham yo'q.
  const onDiagnose = (row) => {
    const hcId = row?.hcpPerson?.id
    if (!hcId) {
      message.warning(t('turnstile.diagnose.not_added'))
      return
    }
    store._diagnose(hcId)
  }
</script>

<template>
  <UITable
    permission-prefix="turnstile-hik-central-workers"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-hc-workers-v2"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.hcpPerson?.photo?.photo || row?.photo,
          lastName: row?.last_name,
          firstName: row?.first_name,
          middleName: row?.middle_name,
          position: row.post_name
        }"
      >
        <template #position>
          <div class="flex gap-1 text-xs text-secondary">
            <n-button
              class="!py-0 !h-[16px] !text-xs !select-all"
              secondary
              type="primary"
              size="tiny"
            >
              {{ row.card }}
            </n-button>

            <UIChip
              v-if="store.params.workerType === 'guest' && !row.organization"
              tone="error"
              :icon="ErrorCircle12Filled"
              compact
            >
              {{ $t('turnstile.hcWorkersPage.notWorking') }}
            </UIChip>
            <n-ellipsis tooltip>
              {{ store.params.workerType === 'guest' && row.organization ? `${row.organization.name} — ${row.post_name}` : row.post_name }}
            </n-ellipsis>
          </div>
        </template>
      </UIUser>
    </template>

    <template #cell-access_levels="{ row }">
      <div class="flex flex-wrap items-center gap-1.5" v-if="row.hcpPerson">
        <!-- Guruh chipi: nomi doim ko'rinadi (o'z kengligida). Oxirida ↻ «Yangilash» — joy egallamaydi, ustiga
             kelganda siljib ochiladi (faqat yozish ruxsati bo'lsa). Xato bo'lsa chapdagi ⓘ — xato tafsiloti.
             Xuddi shu amallar ⋮ menyu → «Guruhlar» oynasida ham bor. -->
        <UIChip
          v-for="level in row.hcpPerson.access_levels.slice(0, 3)"
          :key="level.id"
          :tone="level.type || 'default'"
          class="group"
        >
          <template v-if="level.type === 'error'" #icon>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-icon size="16" class="hcw-chip-action" @click.stop="onShowErrorEv(undefined, level.id)">
                  <ErrorCircle12Filled />
                </n-icon>
              </template>
              {{ $t('turnstile.hcWorkersPage.showError') }}
            </n-tooltip>
          </template>
          <span class="inline-flex min-w-0 items-center">
            <span class="truncate" :title="level.name">{{ level.name }}</span>
            <n-tooltip v-if="canRefresh" trigger="hover">
              <template #trigger>
                <span
                  class="hcw-chip-action hcw-chip-refresh"
                  role="button"
                  tabindex="0"
                  :aria-label="$t('content.refresh')"
                  @click.stop="onRefresh(level)"
                  @keydown.enter.stop="onRefresh(level)"
                >
                  <n-icon size="14"><ArrowSync24Filled /></n-icon>
                </span>
              </template>
              {{ $t('content.refresh') }}
            </n-tooltip>
          </span>
        </UIChip>
        <UIChip
          v-if="row.hcpPerson.access_levels.length > 3"
          class="cursor-pointer"
          @click="onSelect(row)"
        >
          +{{ row.hcpPerson.access_levels.length - 3 }}
        </UIChip>
      </div>
    </template>

    <template #[`cell-hcpPerson.to`]="{ row }">
      <UIBadge
        v-if="row?.hcpPerson?.to"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row?.hcpPerson?.to)"
      />
    </template>

    <template #[`cell-hcpPerson.updated_at`]="{ row }">
      {{ Utils.timeOnlyDate(row?.hcpPerson?.updated_at) }}
    </template>

    <template #cell-errorMessage="{ row }">
      <UIChip
        v-if="row.errorMessage"
        tone="error"
        :icon="ErrorCircle12Filled"
        class="cursor-pointer"
        @click="onShowErrorEv(row.id)"
      >
        {{ $t('content.error') }}
      </UIChip>
    </template>
  </UITable>

  <AccessLevelModal
    :visible="store.accessLevelModalVisible"
    @update:visible="(v) => (store.accessLevelModalVisible = v)"
    @refresh="onRefreshAccessLevel"
    :worker-name="`${store.selectedWorker?.first_name} ${store.selectedWorker?.last_name}`"
  />
  <DiagnoseModal />
</template>

<style scoped>
  /* Chip ichidagi bosiladigan belgilar (↻ yangilash, ⓘ xato): kursor + hover'da biroz kattalashadi. */
  .hcw-chip-action {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    transition:
      opacity 0.15s,
      transform 0.15s;
  }
  .hcw-chip-action:hover {
    transform: scale(1.15);
  }
  /* ↻ — yopiq holatda kengligi 0 (joy egallamaydi); chip ustiga kelganda o'ngga siljib ochiladi. */
  .hcw-chip-refresh {
    max-width: 0;
    margin-left: 0;
    overflow: hidden;
    opacity: 0;
    transition:
      max-width 0.22s ease,
      margin-left 0.22s ease,
      opacity 0.18s ease 0.04s,
      transform 0.15s;
  }
  :global(.group:hover .hcw-chip-refresh),
  .hcw-chip-refresh:focus-visible {
    max-width: 18px;
    margin-left: 4px;
    opacity: 1;
  }
</style>
