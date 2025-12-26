<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useEventStore } from '@/store/modules/index.js'
  import { UIPagination, NoDataPicture, UIStatus } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { ArrowSync24Filled } from '@vicons/fluent'
  const t = i18n.global.t
  const formRef = ref(null)
  const store = useEventStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.jobLoading = true
        store._createJob()
      }
    })
  }

  const onChange = (v) => {
    store.jobParams.page = v.page
    store.jobParams.per_page = v.per_page
    store._indexJob()
  }

  const statuses = {
    1: {
      id: 1,
      name: t('content.process')
    },
    2: {
      id: 2,
      name: t('content.error')
    },
    3: {
      id: 3,
      name: t('content.success')
    }
  }

  onMounted(() => {
    let today = new Date().setHours(0, 0, 0, 0)
    store.jobPayload.f_date = new Date(today).getTime()
  })
</script>

<template>
  <n-spin :show="false">
    <div>
      <n-form
        ref="formRef"
        :model="store.jobPayload"
        :rules="validationRules.common"
        class="flex flex-col"
      >
        <div class="border border-surface-line rounded-lg border-dashed px-4 bg-surface-ground/40">
          <h2 class="mt-4 mb-2 text-secondary">{{ $t('hcEvent.syncText') }}</h2>
          <n-form-item
            path="f_date"
            :rule-path="validationRules.rulesNames.requiredNumberField"
            :show-label="false"
            :label="$t(`content.deadline`)"
          >
            <div class="flex justify-between gap-4 w-full">
              <div class="flex gap-4">
                <n-date-picker
                  class="w-[220px]!"
                  v-model:value="store.jobPayload.f_date"
                  type="datetime"
                  update-value-on-close
                  :actions="null"
                  clearable
                />
                <n-button :loading="store.jobLoading" type="primary" @click="onSubmit">
                  {{ $t('content.send') }}
                </n-button>
              </div>
              <n-button :loading="store.jobLoading" @click="store._indexJob">
                {{ $t('content.refresh') }}
                <template #icon>
                  <ArrowSync24Filled />
                </template>
              </n-button>
            </div>
          </n-form-item>
        </div>
        <div>
          <n-spin :show="store.jobLoading" style="min-height: 200px">
            <div class="w-full overflow-x-auto" v-if="store.jobList.length > 0">
              <div style="height: calc(100vh - 500px)" class="overflow-y-auto">
                <n-table class="mt-5 w-full table-fixed" :single-line="false" size="small">
                  <thead>
                    <tr>
                      <th class="text-center! w-[30px] min-w-[30px] grow-0">
                        {{ $t('content.number') }}
                      </th>
                      <th class="max-w-[65px]">{{ $t('content.status') }}</th>
                      <th class="w-[80px]">{{ $t('content.added') }}</th>
                      <th class="w-[80px]">{{ $t('content.general') }}</th>
                      <th class="w-[160px]">{{ $t('content.from') }}</th>
                      <th class="w-[160px]">{{ $t('content.to') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in store.jobList" :key="idx">
                      <td class="w-[20px] max-w-[20px]">
                        <span class="text-center text-[12px] text-gray-600 block">{{
                          (store.jobParams.page - 1) * store.jobParams.per_page + idx + 1
                        }}</span>
                      </td>
                      <td>
                        <UIStatus :status="statuses[item.status]" />
                      </td>
                      <td>{{ item.inserted }}</td>
                      <td>{{ item.size }}</td>
                      <td>{{ item.from_time }}</td>
                      <td>{{ item.end_time }}</td>
                    </tr>
                  </tbody>
                </n-table>
              </div>

              <UIPagination
                :page="store.jobParams.page"
                :per_page="store.jobParams.per_page"
                :total="store.jobItems"
                @change-page="onChange"
              />
            </div>
            <NoDataPicture v-if="store.jobList.length === 0 && !store.jobLoading" />
          </n-spin>
        </div>
      </n-form>
    </div>
  </n-spin>
</template>
