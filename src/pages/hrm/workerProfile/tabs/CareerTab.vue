<script setup>
  import { useRoute } from 'vue-router'
  import { Edit24Regular, Delete24Regular } from '@vicons/fluent'
  import {
    UITable,
    UIDrawer,
    UIModal,
    UIProfileSection,
    UIProfileEmpty
  } from '@/components/index.js'
  import { useOldCareerStore, useWorkerProfileStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import PositionBlock from '../ui/blocks/PositionBlock.vue'
  import createForm from '@/pages/hrm/oldCareer/ui/createForm.vue'
  import editFrom from '../ui/editFrom.vue'

  /** Figma "Ish faoliyati" bobi (node 2667:253173) */
  const { t } = i18n.global
  const route = useRoute()
  const store = useWorkerProfileStore()
  const careerStore = useOldCareerStore()

  // FXSH (shartnoma turi 2) — lavozim kartasi ko'rsatilmaydi, unda shtat yo'q
  const positions = computed(() =>
    (store.positionList ?? []).filter((v) => v.contract?.type?.id !== 2)
  )

  const systemColumns = computed(() => [
    { key: 'full_position', title: t('oldCareerPage.form.post_name'), minWidth: 260 },
    { key: 'from', title: t('oldCareerPage.form.from_date'), width: 160 },
    { key: 'to', title: t('oldCareerPage.form.to_date'), width: 160 }
  ])

  const careerColumns = computed(() => [
    { key: 'post_name', title: t('oldCareerPage.form.post_name'), minWidth: 260 },
    { key: 'experience', title: t('oldCareerPage.experienceMonth'), width: 120 },
    { key: 'experience_date', title: t('oldCareerPage.continuousExperience'), width: 170 },
    { key: 'period', title: t('oldCareerPage.period'), width: 220 }
  ])

  const onAdd = () => {
    careerStore.visibleType = true
    careerStore.resetForm()
    careerStore.visible = true
  }

  const onEdit = (row) => {
    careerStore.visibleType = false
    careerStore.elementId = row.id
    careerStore.payload.from_date = new Date(row.from_date).getTime()
    careerStore.payload.to_date = new Date(row.to_date).getTime()
    careerStore.payload.post_name = row.post_name
    careerStore.visible = true
  }

  const onDelete = (row) => {
    careerStore.elementId = row.id
    careerStore._delete()
  }

  const onDeleteSystem = (row) => {
    careerStore.elementId = row.id
    careerStore._delete_new_career()
  }

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit24Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete24Regular),
      action: onDelete
    }
  ])

  const systemActions = computed(() => [
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete24Regular),
      action: onDeleteSystem
    }
  ])

  onMounted(() => {
    careerStore.uuid = route.query.id
    careerStore._index()
    careerStore._newCareer()
  })
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <PositionBlock v-for="item in positions" :key="item.id" :item="item" />

    <UIProfileSection :title="$t('oldCareerPage.systemTitle')" :addable="false">
      <UITable
        auto-height
        :columns="systemColumns"
        :actions="systemActions"
        :data="careerStore.newCareers"
        :loading="careerStore.newCareerLoading"
        :per-page="careerStore.newCareers.length || 1"
      >
        <template #empty><UIProfileEmpty /></template>
        <template #cell-from="{ row }">{{ Utils.timeOnlyDate(row.from) }}</template>
        <template #cell-to="{ row }">{{ Utils.timeOnlyDate(row.to) }}</template>
      </UITable>
    </UIProfileSection>

    <UIProfileSection :title="$t('oldCareerPage.title')" @add="onAdd">
      <UITable
        auto-height
        :columns="careerColumns"
        :actions="actions"
        :data="careerStore.list"
        :loading="careerStore.loading"
        :per-page="careerStore.list.length || 1"
      >
        <template #empty><UIProfileEmpty /></template>
        <!-- Staj va uzluksiz ish staji xodim darajasidagi qiymatlar (maketda ham har qatorda bir xil) -->
        <template #cell-experience>{{ store.data?.work_experience ?? '—' }}</template>
        <template #cell-experience_date>
          {{ Utils.timeOnlyDate(store.data?.experience_date) ?? '—' }}
        </template>
        <template #cell-period="{ row }">
          {{ Utils.timeOnlyDate(row.from_date) }} - {{ Utils.timeOnlyDate(row.to_date) }}
        </template>
      </UITable>
    </UIProfileSection>

    <UIDrawer
      :visible="careerStore.visible"
      @update:visible="(v) => (careerStore.visible = v)"
      :title="
        careerStore.visibleType ? $t('oldCareerPage.createTitle') : $t('oldCareerPage.updateTitle')
      "
    >
      <template #content>
        <createForm />
      </template>
    </UIDrawer>

    <UIModal :title="$t('content.edit')" :width="1200" v-model:visible="store.editVisible">
      <editFrom />
    </UIModal>
  </div>
</template>
