<script setup>
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { UITable, UIProfileSection, UIProfileEmpty } from '@/components/index.js'
  import { useRelativeStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useRelativeStore()

  const levelLabels = {
    1: t('relativePage.disability.level1'),
    2: t('relativePage.disability.level2'),
    3: t('relativePage.disability.level3')
  }

  const getLevelLabel = (level) => levelLabels[level] || level

  const fullNameOf = (row) =>
    [row.last_name, row.first_name, row.middle_name].filter(Boolean).join(' ')

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    store.payload.relative = v.relative.id
    store.payload.pin = v.pin != null ? String(v.pin) : null
    store.payload.last_name = v.last_name
    store.payload.first_name = v.first_name
    store.payload.middle_name = v.middle_name
    store.payload.birthday = v.birthday ? new Date(v.birthday).getTime() : null
    store.payload.birth_place = v.birth_place
    store.payload.address = v.address
    store.payload.post_name = v.post_name
    store.payload.died = v.died ?? false
    store.payload.sort = v.sort
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onAddDisability = (item) => {
    store.resetDisabilityForm()
    store.disabilityPayload.worker_relative_id = item.id
    store.disabilityVisibleType = true
    store.disabilityVisible = true
  }

  const onEditDisability = (item, disability) => {
    store.resetDisabilityForm()
    store.disabilityElementId = disability.id
    store.disabilityPayload.worker_relative_id = item.id
    store.disabilityPayload.number = disability.number
    store.disabilityPayload.level = disability.level
    store.disabilityPayload.from = disability.from ? new Date(disability.from).getTime() : null
    store.disabilityPayload.to = disability.to ? new Date(disability.to).getTime() : null
    store.disabilityPayload.comment = disability.comment
    store.disabilityPayload.is_lifelong = !disability.to
    store.disabilityVisibleType = false
    store.disabilityVisible = true
  }

  // Ustunlar Figma "Yaqin qarindosh ma'lumotlari" jadvalidan (node 2672:255073)
  const columns = computed(() => [
    { key: 'relative.name', title: t('relativePage.form.relative'), width: 140 },
    { key: 'fullName', title: t('content.fullName'), minWidth: 160 },
    { key: 'post_name', title: t('relativePage.form.post_name'), minWidth: 160 },
    { key: 'birthday', title: t('relativePage.form.birthday'), width: 130 },
    { key: 'birth_place', title: t('relativePage.form.birthdayPlace'), minWidth: 160 },
    { key: 'disabilities', title: t('relativePage.form.disability'), width: 160 }
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
  <UIProfileSection :title="$t('relativePage.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.list"
      :loading="store.loading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-fullName="{ row }">{{ fullNameOf(row) }}</template>
      <template #cell-birthday="{ row }">{{ Utils.timeOnlyDate(row.birthday) }}</template>

      <!-- Maketda nogironlik katagida mavjud toifalar va "Qo'shish" havolasi turadi -->
      <template #cell-disabilities="{ row }">
        <div class="flex flex-wrap items-center gap-1">
          <span
            v-for="disability in row.disabilities"
            :key="disability.id"
            class="relative-disability"
            @click.stop="onEditDisability(row, disability)"
          >
            {{ getLevelLabel(disability.level) }}
          </span>
          <button type="button" class="relative-add" @click.stop="onAddDisability(row)">
            <n-icon :size="16">
              <component :is="icons.figPlus" />
            </n-icon>
            {{ $t('content.add') }}
          </button>
        </div>
      </template>
    </UITable>
  </UIProfileSection>
</template>

<style lang="scss" scoped>
  .relative-disability {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 6px;
    background: var(--fig-blue-100);
    color: var(--fig-text-brand);
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    cursor: pointer;
  }

  .relative-add {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--fig-text-brand);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
</style>
