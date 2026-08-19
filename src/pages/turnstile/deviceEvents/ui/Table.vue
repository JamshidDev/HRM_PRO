<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useAccountStore, useDeviceEventStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { Copy16Regular, Delete16Regular } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'

  const { t } = i18n.global
  const store = useDeviceEventStore()
  const accStore = useAccountStore()
  const message = useMessage()

  const onCopy = async (value) => {
    if (value == null) return
    try {
      await navigator.clipboard.writeText(String(value))
      message.success(t('content.copied'))
    } catch {
      message.error(t('content.error'))
    }
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const columns = computed(() => [
    { key: 'door', title: t('deviceEvent.door'), minWidth: 200 },
    { key: 'person', title: t('deviceEvent.person'), minWidth: 260 },
    { key: 'person_id', title: t('deviceEvent.personId'), width: 150 },
    { key: 'event_time', title: t('content.date'), width: 160 }
  ])

  // Qurilmadan o'chirish — yozuv amali, sinxron ruxsati bilan bir xil.
  // O'chirilgan shaxsning hodisalari `fixed` bo'lib ro'yxatdan tushadi.
  const canRemove = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileHikCentralSync)
  )

  const actions = computed(() => [
    {
      // `ActionTypes.delete` — UITableActionsMenu shu kalitda tasdiq oynasini
      // o'zi chiqaradi (amal qaytarib bo'lmaydi: HCP kartochkasi o'chadi).
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete16Regular),
      visible: canRemove.value,
      disabled: (row) => Boolean(row?.resolution),
      action: (row) => store._removePerson(row.id)
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :delete-warning="$t('deviceEvent.deleteWarning')"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="turnstile-device-events-v5"
    @change-page="changePage"
  >
    <template #cell-door="{ row }">
      <div class="leading-tight">
        <p class="text-xs font-bold">{{ row?.door_name || '-' }}</p>
        <span class="text-[11px] text-secondary">{{ row?.access_level?.name || '-' }}</span>
      </div>
    </template>

    <!-- HCP'dagi shaxs. Rasm — karta bo'yicha topilgan HRM xodimining surati
         (MinIO havolasi); topilmasa UIUser o'zining fallback avatarini beradi. -->
    <template #cell-person="{ row }">
      <UIUser :short="false" :data="{ photo: row?.matched_worker?.photo }">
        <template #name>
          <n-ellipsis class="w-full text-sm text-textColor2 leading-[1.2]">
            {{ row?.person_name || '-' }}
          </n-ellipsis>
        </template>
        <template #position>
          <span class="text-xs text-textColor3">
            {{ $t('deviceEvent.card') }}: {{ row?.card_no || '-' }}
          </span>
        </template>
      </UIUser>
    </template>

    <!-- HCP generatsiya qilgan personId — qurilmada xodim aynan shu bo'yicha topiladi,
         shuning uchun nusxalash tugmasi bilan. -->
    <template #cell-person_id="{ row }">
      <div class="flex items-center gap-1">
        <span class="font-mono text-xs font-bold text-primary">
          {{ row?.hik_central_person_id ?? '-' }}
        </span>
        <n-icon
          v-if="row?.hik_central_person_id != null"
          size="14"
          class="cursor-pointer text-textColor1 transition-opacity hover:opacity-60"
          @click.stop="onCopy(row.hik_central_person_id)"
        >
          <Copy16Regular />
        </n-icon>
      </div>
    </template>

    <template #cell-event_time="{ row }">
      <span class="text-xs font-medium">{{ Utils.timeHHMMWithMonth(row?.event_time) }}</span>
    </template>
  </UITable>
</template>
