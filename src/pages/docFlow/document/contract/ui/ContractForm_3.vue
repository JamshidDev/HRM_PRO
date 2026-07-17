<script setup>
  import { useComponentStore, useContractStore } from '@/store/modules/index.js'
  import { NAvatar } from 'naive-ui'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { DismissCircle28Filled, Drag24Filled, DrawText24Regular } from '@vicons/fluent'
  import { UIUser } from '@/components/index.js'
  import { VueDraggable } from 'vue-draggable-plus'

  const store = useContractStore()
  const componentStore = useComponentStore()
  const confirmationList = ref([])
  const financeList = ref([])

  const showVacationDay = computed(() => {
    return ![2].includes(store.payload.type)
  })

  const onChange = (v) => {
    // Tur o'zgarganda oldingi tur-maxsus maydonlarni tozalaymiz (eski qiymat qolmasin).
    store.payload.competition_decision_date = null
    store.payload.competition_decision_number = null
    store.payload.work_day = null
    store.payload.week_days = null
    store.payload.start_time = null
    store.payload.end_time = null
    if (v === 6) {
      store.payload.temporary_worker_id = null
      const id = store.payload.organization_id[0].id
      store._vacationWorkers(id)
    }
  }

  const renderLabel = (option) => {
    return [
      h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center px-2'
        },
        [
          h(NAvatar, {
            class: '',
            src: option.photo || Utils.noAvailableImage,
            'fallback-src': Utils.noAvailableImage
          }),
          h('div', { class: 'flex flex-col' }, [
            h(
              'div',
              { class: 'text-xs font-medium text-gray-500 leading-[1.2]' },
              `${option.last_name}.${option.last_name[0]}.${option.middle_name[0]}`
            ),
            h('div', { class: 'text-xs text-primary leading-[1.2]' }, option.position)
          ])
        ]
      )
    ]
  }
  const renderValue = ({ option }) => {
    return [
      h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        },
        `${option?.last_name} ${option?.first_name} ${option?.middle_name}`
      )
    ]
  }
  const onChangeDraggle = () => {
    store.payload.confirmations = store.sortableConfirmations.map((v) => v.id)
  }
  const onChangeConfirmation = () => {
    fillSortableConfirmations()
    syncConfirmationEv()
  }
  const syncConfirmationEv = () => {
    if (store.payload.finance_id === store.payload.director_id) store.payload.finance_id = null
    const ids = [store.payload.finance_id, store.payload.director_id]
    financeList.value = componentStore.confirmationList.filter(
      (v) => v.id !== store.payload.director_id
    )
    confirmationList.value = componentStore.confirmationList.filter((v) => !ids.includes(v.id))

    onRemoveEv(store.payload.finance_id)
    onRemoveEv(store.payload.director_id)
  }
  const fillSortableConfirmations = () => {
    store.sortableConfirmations = confirmationList.value
      .filter((v) => store.payload.confirmations.includes(v.id))
      .map((v) => ({
        id: v.id,
        data: {
          firstName: v.first_name,
          lastName: v.last_name,
          middleName: v.middle_name,
          photo: v.photo,
          position: v?.position || ''
        }
      }))
  }
  const onRemoveEv = (id) => {
    store.sortableConfirmations = store.sortableConfirmations.filter((v) => v.id !== id)
    store.payload.confirmations = store.payload.confirmations.filter((v) => v !== id)
  }

  onMounted(() => {
    syncConfirmationEv()
  })
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div
      v-if="showVacationDay"
      class="col-span-12 pt-4 flex justify-center gap-2 items-center relative"
    >
      <n-divider dashed title-placement="left" class="w-full">
        <div class="flex items-center gap-3">
          <n-switch v-model:value="store.payload.command_status" />
          <span class="text-primary font-medium">{{ $t(`documentPage.form.command_status`) }}</span>
        </div>
      </n-divider>
    </div>
    <div
      v-if="store.payload.command_status"
      class="col-span-12 border border-dashed p-2 bg-surface-ground rounded-xl border-surface-line"
    >
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t(`documentPage.form.command_type`)" path="command_type">
            <n-select
              :disabled="!Boolean(store.payload.type)"
              v-model:value="store.payload.command_type"
              filterable
              :options="componentStore.commandTypeList"
              label-field="name"
              value-field="id"
              :loading="componentStore.commandTypeLoading"
              @update:value="onChange"
              clearable
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-3">
          <n-form-item
            :label="$t(`documentPage.command.form.command_number`)"
            path="command_number"
          >
            <n-input class="w-full" type="text" v-model:value="store.payload.command_number" />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-3">
          <n-form-item :label="$t(`documentPage.command.form.command_date`)" path="command_date">
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.command_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div v-if="store.payload.command_type === 6" class="col-span-12">
          <n-form-item
            :label="$t(`applicationPage.form.temporarily_absent`)"
            path="temporary_worker_id"
          >
            <n-select
              v-model:value="store.payload.temporary_worker_id"
              :options="store.vacationWorkers"
              :loading="store.vacationLoading"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              value-field="id"
              label-field="id"
            />
          </n-form-item>
        </div>

        <!-- Tanlov asosida (4) — komissiya qarori sanasi + raqami -->
        <template v-if="store.payload.command_type === 4">
          <div class="col-span-12 md:col-span-6">
            <n-form-item
              :label="$t(`documentPage.command.form.competition_decision_date`)"
              path="competition_decision_date"
            >
              <n-date-picker
                class="w-full"
                v-model:value="store.payload.competition_decision_date"
                type="date"
                :format="useAppSetting.datePicketFormat"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 md:col-span-6">
            <n-form-item
              :label="$t(`documentPage.command.form.competition_decision_number`)"
              path="competition_decision_number"
            >
              <n-input
                class="w-full"
                v-model:value="store.payload.competition_decision_number"
                placeholder="13-TK"
              />
            </n-form-item>
          </div>
        </template>

        <!-- To'liqsiz ish kuni (9) / haftasi (10) — kun rejimi + ish vaqti -->
        <template
          v-if="store.payload.command_type === 9 || store.payload.command_type === 10"
        >
          <div class="col-span-12 md:col-span-4">
            <n-form-item
              v-if="store.payload.command_type === 9"
              :label="$t(`documentPage.command.form.work_day_mode`)"
              path="work_day"
            >
              <n-input
                class="w-full"
                v-model:value="store.payload.work_day"
                placeholder="5 kunlik ish kuni"
              />
            </n-form-item>
            <n-form-item
              v-else
              :label="$t(`documentPage.command.form.week_days`)"
              path="week_days"
            >
              <n-input
                class="w-full"
                v-model:value="store.payload.week_days"
                placeholder="Dushanba–Payshanba"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 md:col-span-4">
            <n-form-item
              :label="$t(`documentPage.command.form.start_time`)"
              path="start_time"
            >
              <n-time-picker
                class="w-full"
                v-model:formatted-value="store.payload.start_time"
                format="HH:mm"
                value-format="HH:mm"
              />
            </n-form-item>
          </div>
          <div class="col-span-12 md:col-span-4">
            <n-form-item
              :label="$t(`documentPage.command.form.end_time`)"
              path="end_time"
            >
              <n-time-picker
                class="w-full"
                v-model:formatted-value="store.payload.end_time"
                format="HH:mm"
                value-format="HH:mm"
              />
            </n-form-item>
          </div>
        </template>

        <div class="col-span-12">
          <n-form-item :label="$t(`documentPage.command.form.finance_id`)">
            <n-select
              :disabled="!store.payload.director_id"
              value-field="id"
              label-field="last_name"
              v-model:value="store.payload.finance_id"
              :options="financeList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderLabel"
              :render-tag="renderValue"
              @update:value="syncConfirmationEv"
              clearable
            />
          </n-form-item>
        </div>
        <div class="col-span-12">
          <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="director_id">
            <n-select
              size="large"
              value-field="id"
              multiple
              v-model:value="store.payload.confirmations"
              :options="confirmationList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderLabel"
              :render-tag="renderValue"
              :max-tag-count="1"
              @update:value="onChangeConfirmation"
            />
          </n-form-item>
        </div>
        <template v-if="store.sortableConfirmations?.length">
          <div class="col-span-12 pb-2 px-2 flex justify-between">
            <span class="text-secondary">{{
              $t('documentPage.command.form.viewDescription')
            }}</span>
            <n-checkbox v-model:checked="store.oneByOne">
              {{
                $t(
                  store.oneByOne
                    ? 'documentPage.command.form.viewOneByOne'
                    : 'documentPage.command.form.viewSameTime'
                )
              }}
            </n-checkbox>
          </div>
          <div class="col-span-12">
            <VueDraggable v-model="store.sortableConfirmations" @end="onChangeDraggle">
              <div
                v-for="(item, index) in store.sortableConfirmations"
                :key="item.id"
                class="sort-target flex items-center gap-2 px-2 py-1 bg-surface-section border border-surface-line rounded-xl mb-1"
              >
                <div class="handle">
                  <n-icon
                    size="24"
                    class="text-secondary cursor-move scale-100 hover:scale-[1.2] mx-2"
                  >
                    <Drag24Filled />
                  </n-icon>
                </div>

                <div class="w-[calc(100%-60px)] select-none">
                  <UIUser class="!w-full" :data="item.data" :hide-tooltip="true" :short="false" />
                </div>
                <template v-if="store.oneByOne">
                  <n-button type="primary" secondary :icon-placement="'right'" size="small">
                    <template #icon>
                      <DrawText24Regular />
                    </template>
                    <span class="font-bold text-lg">{{ index + 1 }}</span>
                  </n-button>
                </template>
                <n-button @click="onRemoveEv(item.id)" type="error" circle secondary>
                  <template #icon>
                    <DismissCircle28Filled />
                  </template>
                </n-button>
              </div>
            </VueDraggable>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
