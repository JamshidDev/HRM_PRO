<script setup>
import {
  useReport2Store,
  useDepartmentStore,
  useComponentStore,
  useDepartmentPositionStore
} from '@/store/modules/index.js'
  import { Delete20Filled, Edit20Filled, Add16Filled} from '@vicons/fluent'
  import PositionCard from './PositionCard.vue'
  import WorkerCard from './WorkerCard.vue'
  import Indicator from './Indicator.vue'
  import { AppFolder20Regular } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useReport2Store()
  const dpStore = useDepartmentStore()
  const componentStore = useComponentStore()
  const pnStore = useDepartmentPositionStore()

  defineProps({
    data: {
      type: Object,
      default: []
    }
  })

  const onDelete = (v) => {
    store.isDpDelete = true
    store.department.elementId = v.id
    store.department.deleteVisible = true

  }

  const onEdit = (v)=> {
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

  const openConfirm = () => {
    if (!accStore.checkAction(accStore.pn.hrReportWrite)) return
    store.confirmVisible = true
  }
</script>

<template>
  <div
    @click="store.onChangeRadio(data)"
    :class="[!(data.id === store.department.selectedId) && 'hover:bg-surface/3 rounded']"
    class="grid grid-cols-12 border-b border-dashed border-surface-line py-1 w-full"
  >
    <div class="col-span-12 flex items-center">
      <div class="flex w-[calc(100%-400px)]">
        <n-radio :checked="data.id === store.department.selectedId">
          {{ data.name }}
        </n-radio>
      </div>
      <div class="w-[460px] flex items-center justify-end h-full gap-2 pr-2">

        <n-tooltip placement="top" trigger="hover">
          <template #trigger>
            <n-button
                size="tiny"
                type="primary"
                @click.stop="onAddPosition(data)"
                ghost
            >
              <template #icon>
                <Add16Filled/>
              </template>
            </n-button>
          </template>
          <span>{{ $t('report.addPosition') }}</span>
        </n-tooltip>
        <n-tooltip placement="top" trigger="hover">
          <template #trigger>
            <n-button
                size="tiny"
                type="primary"
                @click.stop="onEdit(data)"
                ghost
            >
              <template #icon>
                <Edit20Filled/>
              </template>
            </n-button>
          </template>
          <span>{{ $t('content.edit') }}</span>
        </n-tooltip>
        <n-tooltip placement="top" trigger="hover">
          <template #trigger>
            <n-button
                @click.stop="onDelete(data)"
                size="tiny"
                type="error"
                ghost
            >
              <template #icon>
                <Delete20Filled/>
              </template>
            </n-button>
          </template>
          <span>{{ $t('content.delete') }}</span>
        </n-tooltip>


        <n-button
          @click.stop="openConfirm"
          :loading="store.optimizationLoading"
          v-if="data.id === store.department.selectedId"
          size="tiny"
          ghost
          type="warning"
          >{{ $t('report.form.optimization') }}
          <template #icon>
            <AppFolder20Regular />
          </template>
        </n-button>
        <Indicator class="!w-[160px]" :data="data" />
      </div>
    </div>
    <div class="col-span-12" :class="[data.id === store.department.selectedId && 'mt-6 mb-3']">
      <n-collapse-transition :show="data.id === store.department.selectedId">
          <PositionCard v-if="store.byPosition" />
          <WorkerCard v-else />
      </n-collapse-transition>
    </div>
  </div>
</template>
