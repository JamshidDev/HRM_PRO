<script setup>
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { UITable, UIProfileSection, UIProfileEmpty } from '@/components/index.js'
  import { usePartyStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = usePartyStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    store.payload.party = v.party.id
    store.payload.from_date = new Date(v?.from_date).getTime()
    store.payload.to_date = v?.to_date ? new Date(v?.to_date).getTime() : null
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  // Ustunlar Figma "Partiyaviylik" jadvalidan (node 2813:76002)
  const columns = computed(() => [
    { key: 'party.name', title: t('partyPage.form.party'), minWidth: 200 },
    { key: 'period', title: t('oldCareerPage.period'), width: 240 }
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
  <UIProfileSection :title="$t('partyPage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-period="{ row }">
        {{ Utils.timeOnlyDate(row.from_date) }} - {{ Utils.timeOnlyDate(row.to_date) }}
      </template>
    </UITable>
  </UIProfileSection>
</template>
