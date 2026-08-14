<script setup>
  import { UITable, UIProfileSection, UIProfileEmpty } from '@/components/index.js'
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { useMilitaryStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useMilitaryStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.activeTab = 1
    store.visibleType = false
    store.elementId = v.id
    store.payload.name = v.name
    store.payload.status = v.status.id
    store.payload.number = v.number
    store.payload.speciality = v.speciality
    store.payload.commissariat = v.commissariat
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const columns = computed(() => [
    {
      key: 'name',
      title: t('militaryPage.form.name'),
      minWidth: 100
    },
    {
      key: 'status.name',
      title: t('militaryPage.form.status'),
      minWidth: 100
    },
    {
      key: 'number',
      title: t('militaryPage.form.number'),
      minWidth: 60
    },
    {
      key: 'speciality',
      title: t('militaryPage.form.speciality'),
      minWidth: 300
    },
    {
      key: 'commissariat',
      title: t('militaryPage.form.commissariat'),
      minWidth: 300
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
  <UIProfileSection :title="$t('militaryPage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <!-- Maketda harbiy guvohnoma holati yashil chip bilan ko'rsatiladi -->
      <template #cell-status.name="{ value }">
        <span v-if="value" class="military-status">{{ value }}</span>
      </template>
    </UITable>
  </UIProfileSection>
</template>

<style lang="scss" scoped>
  .military-status {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 6px;
    background: var(--fig-green-100);
    color: var(--fig-text-green);
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
  }
</style>
