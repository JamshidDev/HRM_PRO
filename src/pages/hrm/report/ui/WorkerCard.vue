<script setup>
  import { useReport2Store, useAccountStore } from '@/store/modules/index.js'
  import Utils from '../../../../utils/Utils.js'
  import Indicator from '@/pages/hrm/report/ui/Indicator.vue'
  import IndicatorTitle from '@/pages/hrm/report/ui/IndicatorTitle.vue'
  import { UIUser } from '@/components/index.js'
  import { AppPaths } from '@utils'
  import router from '@/router/index.js'

  const store = useReport2Store()
  const accStore = useAccountStore()

  const goPush = (v) => {
    router.push({
      path: `${AppPaths.Hrm}${AppPaths.WorkerProfile}`,
      query: { id: v.worker.uuid }
    })
  }

  const onView = (v) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    goPush(v)
  }
</script>

<template>
  <div
    @click.stop
    class="w-full rounded-xl border border-table-border bg-surface-section overflow-hidden"
  >
    <n-spin size="small" class="h-full" :show="store.workerLoading">
      <div
        class="flex items-center gap-3 h-[40px] pl-3 pr-2"
        style="background: var(--table-header)"
      >
        <span class="flex-1 text-xs font-semibold text-fig-chip-amber-text">
          {{ $t('report.form.workers') }}
        </span>
        <IndicatorTitle :is-worker="true" />
      </div>

      <template v-for="(item, idx) in store.workerList" :key="idx">
        <div
          class="flex items-center gap-3 min-h-[52px] pl-3 pr-2 border-b border-table-border/60 last:border-b-0 cursor-pointer transition-colors hover:bg-fig-bg-secondary"
          @click="onView(item)"
        >
          <span class="w-6 shrink-0 text-xs font-semibold text-fig-text-tertiary tabular-nums">
            {{ idx + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <UIUser
              :hide-tooltip="true"
              :short="false"
              :data="{
                photo: item.worker.photo,
                position: item.position_date + item.post_name,
                lastName: item.worker.last_name,
                firstName: item.worker.first_name,
                middleName: item.worker.middle_name
              }"
            >
              <template #name>
                <div class="flex items-center gap-2">
                  <span>{{ Utils.combineFullName(item.worker) }}</span>
                  <n-tag v-if="item.type" size="small" round :bordered="false" type="warning">
                    {{ item.type?.name }}
                  </n-tag>
                </div>
              </template>
              <template #position>
                <div class="flex gap-2 items-center">
                  <n-tag size="small" round :bordered="false" type="info">
                    {{ item.position_date }}
                  </n-tag>
                  <span class="text-secondary text-xs">{{ item.post_name }}</span>
                </div>
              </template>
            </UIUser>
          </div>
          <Indicator :is-worker="true" :data="item" />
        </div>
      </template>
      <template v-if="store.workerList.length === 0 && !store.workerLoading">
        <span class="w-full py-4 text-center inline-block text-xs text-fig-text-tertiary">
          {{ $t('content.no-data') }}
        </span>
      </template>
    </n-spin>
  </div>
</template>
