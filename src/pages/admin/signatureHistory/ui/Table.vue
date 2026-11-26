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

  // Hamma ustun qat'iy kenglikda — bo'sh joy proporsional taqsimlanadi (bitta moslashuvchan
  // ustun butun bo'sh joyni olib, «Imzolovchi» juda cho'zilib ketardi).
  const columns = computed(() => [
    // Profilda (own) imzolovchi doim o'zi — ustun kerak emas.
    ...(store.scope === 'own'
      ? []
      : [
          {
            key: 'signer',
            title: t('signatureHistory.table.signer'),
            width: 280,
            minWidth: 200,
            maxWidth: 480
          }
        ]),
    { key: 'document', title: t('signatureHistory.table.document'), width: 170 },
    { key: 'method', title: t('signatureHistory.table.method'), width: 200 },
    { key: 'key_type', title: t('signatureHistory.table.keyType'), width: 130 },
    { key: 'device', title: t('signatureHistory.table.device'), width: 170 },
    { key: 'signing_time', title: t('signatureHistory.table.signingTime'), width: 150 }
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
    storage-key="admin-signature-history-v3"
    @change-page="changePage"
    @row-click="onView"
  >
    <template #cell-signer="{ row }">
      <div class="flex flex-col leading-tight py-1">
        <span class="font-medium">{{ fullName(row.user?.worker) || row.user?.phone }}</span>
        <span v-if="row.user?.organization?.name" class="text-xs text-textColor3 truncate">
          {{ row.user.organization.name }}
        </span>
      </div>
    </template>

    <template #cell-document="{ row }">
      <div class="flex flex-col leading-tight">
        <span>{{ documentLabel(row.document_model) }}</span>
        <span v-if="row.document_id" class="text-xs text-textColor3">№{{ row.document_id }}</span>
      </div>
    </template>

    <template #cell-method="{ row }">
      <UIChip :tone="methodTone(row.method)">{{ methodLabel(row.method) }}</UIChip>
    </template>

    <template #cell-key_type="{ row }">
      <UIChip v-if="row.key_type" :tone="keyTypeStyle(row.key_type)?.tone || 'neutral'">
        {{ keyTypeLabel(row.key_type) }}
      </UIChip>
    </template>

    <template #cell-device="{ row }">
      <div class="flex flex-col leading-tight min-w-0">
        <span>{{ row.ip_address }}</span>
        <n-tooltip v-if="row.user_agent" :style="{ maxWidth: '420px' }">
          <template #trigger>
            <span class="text-xs text-textColor3 truncate cursor-help">
              {{ shortUserAgent(row.user_agent) }}
            </span>
          </template>
          <span class="break-all">{{ row.user_agent }}</span>
        </n-tooltip>
      </div>
    </template>

    <template #cell-signing_time="{ row }">
      <span class="whitespace-nowrap">{{ Utils.dateTimeShortLabel(row.signing_time || row.created_at) }}</span>
    </template>
  </UITable>
</template>
