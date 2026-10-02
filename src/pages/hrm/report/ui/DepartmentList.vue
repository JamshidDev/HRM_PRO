<script setup>
  import {
    useReport2Store,
    useDepartmentStore,
    useComponentStore,
    useDepartmentPositionStore
  } from '@/store/modules/index.js'
  import { Delete20Regular, Edit32Regular, AddCircle24Regular } from '@vicons/fluent'
  import { UITableActionsMenu } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import PositionCard from './PositionCard.vue'
  import WorkerCard from './WorkerCard.vue'
  import Indicator from './Indicator.vue'
  import { ChevronRight20Regular } from '@vicons/fluent'

  const store = useReport2Store()
  const dpStore = useDepartmentStore()
  const componentStore = useComponentStore()
  const pnStore = useDepartmentPositionStore()

  const { t } = i18n.global

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    }
  })

  const onDelete = (v) => {
    store.department.selectedId = null
    store.department.elementId = v.id
    store._deleteDepartment()
  }

  const onEdit = (v) => {
    dpStore.elementId = v.id
    dpStore.visibleType = false
    store.department.visible = true
    dpStore.payload.name = v.name
    dpStore.payload.name_ru = v.name_ru
    dpStore.payload.name_en = v.name_en
    dpStore.payload.comment = v.comment
    dpStore.payload.level = v.level.id
    dpStore.showParent = Boolean(v.parent_id)
    dpStore.payload.parent_id = v.parent_id
    dpStore._level()
    componentStore._departments()
  }

  const onAddPosition = (v) => {
    store.position.visible = true
    store.position.visibleType = true
    store.resetPositionPayload()
    store.positionPayload.department_id = v.id
    componentStore.departmentList = [v]
    componentStore._departments()
  }

  const addPositionKey = 'addPosition'

  // Qator amallari — UITable dagi kabi bitta ⋮ menyuda. O'chirish tasdig'ini
  // UITableActionsMenu o'zi so'raydi.
  const actions = computed(() => [
    {
      label: t('report.addPosition'),
      key: addPositionKey,
      icon: UIHelper.renderIcon(AddCircle24Regular)
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular)
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular)
    }
  ])

  const onAction = (key) => {
    if (key === addPositionKey) onAddPosition(props.data)
    else if (key === Utils.ActionTypes.edit) onEdit(props.data)
    else if (key === Utils.ActionTypes.delete) onDelete(props.data)
  }

  const isSelected = computed(() => props.data.id === store.department.selectedId)
</script>

<template>
  <div class="border-b border-table-border/60">
    <div
      @click="store.onChangeRadio(data)"
      class="flex items-center gap-3 min-h-[44px] pl-1 pr-2 rounded-lg cursor-pointer transition-colors"
      :class="[isSelected ? 'bg-fig-chip-brand' : 'hover:bg-fig-bg-secondary']"
    >
      <!-- n-radio o'rniga chevron: radio ichidagi <label> bosilganda brauzer
           input'ga ikkinchi click yuborardi va qator ochilib-yopilib qolardi. -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <n-icon
          size="16"
          class="shrink-0 transition-transform"
          :class="[isSelected ? 'rotate-90 text-primary' : 'text-fig-text-tertiary']"
        >
          <ChevronRight20Regular />
        </n-icon>
        <span :class="[isSelected && 'font-semibold']">{{ data.name }}</span>
      </div>
      <div class="flex items-center gap-3 shrink-0" @click.stop>
        <Indicator :data="data" />
        <UITableActionsMenu :options="actions" @select="onAction" />
      </div>
    </div>
    <n-collapse-transition :show="isSelected">
      <div class="py-3">
        <PositionCard v-if="store.byPosition" />
        <WorkerCard v-else />
      </div>
    </n-collapse-transition>
  </div>
</template>
