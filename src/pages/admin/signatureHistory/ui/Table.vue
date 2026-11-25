<script setup>
  import { Eye24Regular } from '@vicons/fluent'
  import { UIChip, UITable } from '@/components/index.js'
  import { useSignatureHistoryStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import {
    documentLabel,
    fullName,
    keyTypeLabel,
    keyTypeStyle,
    methodLabel,
    methodTone,
    shortUserAgent
  } from './helpers.js'

  const { t } = i18n.global
  const store = useSignatureHistoryStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onView = (row) => store._show(row.id)

  const columns = computed(() => [
    { key: 'signer', title: t('signatureHistory.table.signer'), minWidth: 260 },
    { key: 'document', title: t('signatureHistory.table.document'), width: 190 },
    { key: 'method', title: t('signatureHistory.table.method'), width: 210, align: 'center' },
    { key: 'key_type', title: t('signatureHistory.table.keyType'), width: 120, align: 'center' },
    { key: 'ip_address', title: t('signatureHistory.table.ip'), width: 130, align: 'center' },
    { key: 'user_agent', title: t('signatureHistory.table.device'), width: 150 },
    {
      key: 'signing_time',
      title: t('signatureHistory.table.signingTime'),
      width: 120,
      align: 'center'
    }
  ])

  const actions = computed(() => [
    {
      label: t('signatureHistory.table.details'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye24Regular),
      action: onView
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
    storage-key="admin-signature-history"
    @change-page="changePage"
    @row-click="onView"
  >
    <template #cell-signer="{ row }">
      <div class="flex flex-col leading-tight py-1">
        <span class="font-medium">{{ fullName(row.user?.worker) || row.user?.phone || '—' }}</span>
        <span v-if="row.user?.worker?.pin" class="text-xs text-gray-500">
          {{ $t('signatureHistory.table.pin') }}: {{ row.user.worker.pin }}
        </span>
        <span v-if="row.user?.organization?.name" class="text-xs text-gray-500 truncate">
          {{ row.user.organization.name }}
        </span>
      </div>
    </template>

    <template #cell-document="{ row }">
      <div class="flex flex-col leading-tight">
        <span>{{ documentLabel(row.document_model) }}</span>
        <span v-if="row.document_id" class="text-xs text-gray-500">№{{ row.document_id }}</span>
      </div>
    </template>

    <template #cell-method="{ row }">
      <div class="flex justify-center">
        <UIChip :tone="methodTone(row.method)" compact>{{ methodLabel(row.method) }}</UIChip>
      </div>
    </template>

    <template #cell-key_type="{ row }">
      <div class="flex justify-center">
        <UIChip
          v-if="keyTypeStyle(row.key_type)"
          :tone="keyTypeStyle(row.key_type).tone"
          :icon="keyTypeStyle(row.key_type).icon"
          compact
        >
          {{ keyTypeLabel(row.key_type) }}
        </UIChip>
        <span v-else>—</span>
      </div>
    </template>

    <template #cell-ip_address="{ row }">
      <div class="w-full text-center font-medium">{{ row.ip_address || '—' }}</div>
    </template>

    <template #cell-user_agent="{ row }">
      <n-tooltip v-if="row.user_agent" :style="{ maxWidth: '420px' }">
        <template #trigger>
          <span class="text-sm truncate cursor-help">{{ shortUserAgent(row.user_agent) }}</span>
        </template>
        <span class="break-all">{{ row.user_agent }}</span>
      </n-tooltip>
      <span v-else>—</span>
    </template>

    <template #cell-signing_time="{ row }">
      <div
        v-if="row.signing_time || row.created_at"
        class="w-full flex flex-col items-center leading-tight"
      >
        <span>{{ Utils.dateTimeLabel(row.signing_time || row.created_at).split(' ')[0] }}</span>
        <span class="text-xs text-gray-500">
          {{ Utils.dateTimeLabel(row.signing_time || row.created_at).split(' ')[1] }}
        </span>
      </div>
      <span v-else>—</span>
    </template>
  </UITable>
</template>
