<script setup>
import {Delete20Filled, Edit20Filled, ErrorCircle20Filled} from '@vicons/fluent'
  import { useReport2Store } from '@/store/modules/index.js'
  import WorkerCard from './WorkerCard.vue'
  import Indicator from './Indicator.vue'
  import IndicatorTitle from '@/pages/hrm/report/ui/IndicatorTitle.vue'
  import { useAccountStore} from '@/store/modules/index.js'
import {VueDraggable} from "vue-draggable-plus"

const accStore = useAccountStore()
const store = useReport2Store()

  const onEdit = (item) => {
    if (!accStore.checkAction(accStore.pn.hrReportWrite)) return
    store.onEdit(item)

  }

  const onDelete = (v) => {
    store.isDpDelete = false
     store.position.elementId = v.id
     store.department.deleteVisible = true
  }

const onDraggleEnd = (v) =>{
  const data = [
    {
      id: v.data.id,
      sort: v.newIndex,
    }
  ]
  store._positionOrderable(data)
}
</script>

<template>
  <div
    @click.stop
    class="w-full min-h-[60px] relative py-2 border-l-[3px] border-success bg-success/5"
  >
    <n-spin size="small" class="h-full" :show="store.position.loading">
      <div class="flex justify-between px-2">
        <span class="text-success mb-2 font-semibold"> {{ $t('report.form.position') }}</span>
        <div class="w-[200px] flex justify-end gap-2"><IndicatorTitle class="!w-[160px]" /></div>
      </div>
      <VueDraggable :disabled="Boolean(store.position.selectedId)" v-model="store.position.list" @end="onDraggleEnd">
        <template v-for="(item, idx) in store.position.list" :key="idx">
          <div class="bg-surface-section" :class="[store.position.selectedId? 'cursor-no-drop' : 'cursor-move']">
            <div
                @click.stop="store.onChangePosRadio(item)"
                :class="[!(item?.id === store.position.selectedId) && 'hover:bg-success/10']"
                class="flex items-center gap-4 border-b border-success border-dashed py-2 bg-success/4 pl-2"
            >
              <div class="w-[calc(100%-260px)] text-wrap flex items-center">
                <span class="inline-block font-semibold w-[30px]">{{ idx + 1 }}</span>
                <n-radio :checked="item?.id === store.position.selectedId">
                  <div class="flex items-center gap-2">
                    <n-icon v-if="item?.status?.id === 1" size="18" class="text-warning" >
                      <ErrorCircle20Filled/>
                    </n-icon>
                    {{ item?.position?.name }}
                  </div>
                </n-radio>
              </div>
              <div class="w-[260px] justify-end flex items-center h-full gap-2 pr-2">
                <n-tooltip placement="top" trigger="hover">
                  <template #trigger>
                    <n-button
                        @click.stop="onEdit(item)"
                        size="tiny"
                        type="primary"
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
                        @click.stop ="onDelete(item)"
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
                <Indicator class="!w-[160px]" :data="item" />
              </div>
            </div>
            <div class="w-full">
              <n-collapse-transition :show="item.id === store.position.selectedId">
                <WorkerCard class="mt-2 !ml-1" :bg-full="true" />
              </n-collapse-transition>
            </div>
          </div>
        </template>
      </VueDraggable>

      <template v-if="store.position.list.length === 0 && !store.position.loading">
        <span class="w-full text-center inline-block text-danger">{{ $t('content.no-data') }}</span>
      </template>
    </n-spin>
  </div>
</template>
