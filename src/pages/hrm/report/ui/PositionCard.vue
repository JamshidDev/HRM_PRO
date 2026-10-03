<script setup>
  import { Delete20Regular, Edit32Regular, ChevronRight20Regular } from '@vicons/fluent'
  import { UITableActionsMenu } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'
  import { useReport2Store } from '@/store/modules/index.js'
  import WorkerCard from './WorkerCard.vue'
  import Indicator from './Indicator.vue'
  import IndicatorTitle from '@/pages/hrm/report/ui/IndicatorTitle.vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { useReportActions } from '../useReportActions.js'

  const store = useReport2Store()
  const { editPosition, deletePosition } = useReportActions()
  const { t } = i18n.global

  const actions = [
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
  ]

  const onAction = (key, item) => {
    if (key === Utils.ActionTypes.edit) editPosition(item)
    else if (key === Utils.ActionTypes.delete) deletePosition(item)
  }

  const onDraggleEnd = (v) => {
    const data = [
      {
        id: v.data.id,
        sort: v.newIndex
      }
    ]
    store._positionOrderable(data)
  }
</script>

<template>
  <div
    @click.stop
    class="w-full rounded-xl border border-table-border bg-surface-section overflow-hidden"
  >
    <n-spin size="small" class="h-full" :show="store.position.loading">
      <div
        class="flex items-center gap-3 h-[40px] pl-3 pr-2"
        style="background: var(--table-header)"
      >
        <span class="flex-1 text-xs font-semibold text-fig-chip-green-text">
          {{ $t('report.form.position') }}
        </span>
        <IndicatorTitle />
        <div class="w-7 shrink-0"></div>
      </div>
      <VueDraggable
        :disabled="Boolean(store.position.selectedId)"
        v-model="store.position.list"
        @end="onDraggleEnd"
      >
        <template v-for="(item, idx) in store.position.list" :key="idx">
          <div
            class="border-b border-table-border/60 last:border-b-0"
            :class="[store.position.selectedId ? 'cursor-no-drop' : 'cursor-move']"
          >
            <div
              @click.stop="store.onChangePosRadio(item)"
              class="flex items-center gap-3 min-h-[44px] pl-3 pr-2 transition-colors"
              :class="[
                item?.id === store.position.selectedId
                  ? 'bg-fig-chip-green'
                  : 'hover:bg-fig-bg-secondary'
              ]"
            >
              <span class="w-6 shrink-0 text-xs font-semibold text-fig-text-tertiary tabular-nums">
                {{ idx + 1 }}
              </span>
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <n-icon
                  size="16"
                  class="shrink-0 transition-transform"
                  :class="[
                    item?.id === store.position.selectedId
                      ? 'rotate-90 text-fig-chip-green-text'
                      : 'text-fig-text-tertiary'
                  ]"
                >
                  <ChevronRight20Regular />
                </n-icon>
                <span :class="[item?.id === store.position.selectedId && 'font-semibold']">
                  {{ item?.position?.name }}
                </span>
              </div>
              <div class="flex items-center gap-3 shrink-0" @click.stop>
                <Indicator :data="item" />
                <UITableActionsMenu :options="actions" @select="(key) => onAction(key, item)" />
              </div>
            </div>
            <n-collapse-transition :show="item.id === store.position.selectedId">
              <div class="p-2">
                <WorkerCard />
              </div>
            </n-collapse-transition>
          </div>
        </template>
      </VueDraggable>

      <template v-if="store.position.list.length === 0 && !store.position.loading">
        <span class="w-full py-4 text-center inline-block text-xs text-fig-text-tertiary">
          {{ $t('content.no-data') }}
        </span>
      </template>
    </n-spin>
  </div>
</template>
