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

  // Nogironlik amallari qator menyusida (jadval qoidasi: katakda tugma/bosiladigan chip yo'q, QA-25).
  // Har bir nogironlik yozuvi uchun alohida «tahrirlash» bandi — ro'yxatdagi eng ko'p yozuv soniga qarab.
  const maxDisabilities = computed(() =>
    Math.max(0, ...(store.list ?? []).map((row) => row.disabilities?.length ?? 0))
  )

  const disabilityActions = computed(() => [
    {
      label: t('relativePage.disability.addAction'),
      key: 'disability-add',
      icon: UIHelper.renderIcon(icons.figPlus),
      action: onAddDisability
    },
    ...Array.from({ length: maxDisabilities.value }, (_, i) => ({
      label: (row) =>
        t('relativePage.disability.editAction', {
          level: getLevelLabel(row.disabilities?.[i]?.level)
        }),
      key: `disability-edit-${i}`,
      icon: UIHelper.renderIcon(Edit32Regular),
      visible: (row) => Boolean(row.disabilities?.[i]),
      action: (row) => onEditDisability(row, row.disabilities[i])
    }))
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    ...disabilityActions.value,
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
      <!-- BACKEND: QA-25 — ko'chirilgan (migratsiya) qarindoshlarda `birthday` bo'sh, tug'ilgan yil esa
           `birth_place` matni ichida («1933-yil, Sirdaryo viloyati, …»). Ma'lumotni ajratib, yilni
           `birthday` ga yozish kerak — frontend ikkalasini ham kelganicha ko'rsatadi. -->
      <template #cell-birthday="{ row }">{{ Utils.timeOnlyDate(row.birthday) ?? '—' }}</template>

      <!-- Faqat qiymat: toifalar. Qo'shish/tahrirlash — qator menyusida -->
      <template #cell-disabilities="{ row }">
        <div v-if="row.disabilities?.length" class="flex flex-wrap items-center gap-1">
          <span v-for="disability in row.disabilities" :key="disability.id" class="relative-disability">
            {{ getLevelLabel(disability.level) }}
          </span>
        </div>
        <span v-else>—</span>
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
  }
</style>
