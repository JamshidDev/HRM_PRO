<script setup>
  import { ArrowCircleDownRight20Regular, ArrowCircleUpLeft20Regular } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import { UIPagination } from '@/components/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import TurnstileIcon from '@/assets/icons/turnstileIcon.svg'

  const store = useComponentStore()

  const list = ref([])
  const loading = ref(false)
  const totalItems = ref(0)
  const params = ref({ page: 1, per_page: 10 })

  const _index = () => {
    const workerId = store.workerPreview?.worker?.id
    if (!workerId) return
    loading.value = true
    $ApiService.eventService
      ._index({
        params: {
          worker_id: workerId,
          page: params.value.page,
          per_page: params.value.per_page
        }
      })
      .then((res) => {
        list.value = res.data.data.data
        totalItems.value = res.data.data.total
      })
      .finally(() => {
        loading.value = false
      })
  }

  const changePage = (v) => {
    params.value.page = v.page
    params.value.per_page = v.per_page
    _index()
  }

  onMounted(_index)
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('workerView.tabs.turnstile')" :icon="TurnstileIcon">
      <n-spin :show="loading" style="min-height: 120px">
        <div v-if="list.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-surface-line">
                <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                  {{ $t('content.date') }}
                </th>
                <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                  {{ $t('hcEvent.form.direction') }}
                </th>
                <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                  {{ $t('hcEvent.form.device') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in list"
                :key="idx"
                :class="idx !== list.length - 1 ? 'border-b border-surface-line' : ''"
              >
                <td class="align-top text-textColor2 whitespace-nowrap px-2 py-4">
                  {{ item?.event_date_and_time }}
                </td>
                <td class="align-top px-2 py-4">
                  <n-button :type="item.direction ? 'primary' : 'error'" secondary size="tiny">
                    <span>{{
                      $t(
                        item.direction
                          ? 'turnstile.workDurationPage.enter'
                          : 'turnstile.workDurationPage.exit'
                      )
                    }}</span>
                    <template #icon>
                      <n-icon size="17">
                        <ArrowCircleDownRight20Regular v-if="item.direction" />
                        <ArrowCircleUpLeft20Regular v-else />
                      </n-icon>
                    </template>
                  </n-button>
                </td>
                <td class="align-top text-textColor2 px-2 py-4">{{ item?.device }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <span v-else class="w-full text-center text-sm inline-block text-textColor3 py-6">
          {{ $t('content.no-data') }}
        </span>
      </n-spin>

      <UIPagination
        v-if="totalItems > params.per_page"
        :page="params.page"
        :per_page="params.per_page"
        :total="totalItems"
        @change-page="changePage"
      />
    </SectionHeader>
  </div>
</template>
