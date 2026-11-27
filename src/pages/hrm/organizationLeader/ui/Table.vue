<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useOrganizationLeaderStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import { Delete20Regular, Edit32Regular } from '@vicons/fluent'
  import { Mask } from 'maska'

  const { t } = i18n.global

  const accStore = useAccountStore()

  // Ichki raqam (5 xona) yoki to'liq raqam (9 xona) — formadagi niqob bilan bir xil
  const mask = new Mask({ mask: ['##-###-##-##', '##-###'] })
  const store = useOrganizationLeaderStore()

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
    store.elementId = row.id
    store.editRow = row
    store.visibleType = false
    store.payload.phones = row.phone?.length ? [...row.phone] : ['']
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrLeadersWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Loyihadagi umumiy nusxalash (Nomzodlar, koordinatalar bilan bir xil): `Utils.copyToClipboard` + toast
  const copyText = (text) =>
    Utils.copyToClipboard(String(text), () => $Toast.success(t('content.copied')))

  // Hamma ustun qat'iy kenglikda — bo'sh joy proporsional bo'linadi (ustunlar orasida katta bo'shliq qolmaydi)
  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      width: 300,
      minWidth: 220,
      maxWidth: 520
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      width: 280
    },
    {
      key: 'phone',
      title: t('content.phone'),
      width: 200
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-leaders"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-organization-leader-v2"
    @change-page="changePage"
  >
    <!-- Xodim: rasm + ism, ostida qisqa lavozim (kulrang, kesilsa — tooltip) -->
    <template #cell-worker="{ row }">
      <UIUser
        :data="{
          photo: row?.worker_position?.worker?.photo,
          lastName: row?.worker_position?.worker?.last_name,
          firstName: row?.worker_position?.worker?.first_name,
          middleName: row?.worker_position?.worker?.middle_name,
          position: row?.worker_position?.post_short_name || row?.worker_position?.post_name
        }"
      />
    </template>

    <!-- Telefonlar: oddiy matn + nusxalash, har raqam alohida qatorda -->
    <template #cell-phone="{ row }">
      <div v-if="row.phone?.length" class="flex flex-col gap-0.5">
        <div v-for="(p, idx) in row.phone" :key="idx" class="flex items-center gap-1">
          <span class="whitespace-nowrap tabular-nums">{{ mask.masked(p) }}</span>
          <n-icon
            size="14"
            class="cursor-pointer text-primary shrink-0"
            :title="$t('content.copy')"
            @click.stop="copyText(p)"
          >
            <CopyIcon />
          </n-icon>
        </div>
      </div>
    </template>
  </UITable>
</template>
