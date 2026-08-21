<script setup>
  import { useComponentStore, useContractStore } from '@/store/modules/index.js'
  import { NAvatar } from 'naive-ui'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { DrawText24Regular } from '@vicons/fluent'
  import { UIUser, UIFigBlock, UIFigField } from '@/components/index.js'
  import icons from '@/assets/icons'
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
  <div v-if="showVacationDay" class="flex flex-col gap-4 w-full">
    <UIFigBlock :title="$t('contractPage.step.stepThree')" :icon="icons.figFileArrowDown">
      <!-- Buyruq yaratish tugmasi maketdagi blok sarlavhasining o'ng chetida -->
      <template #trailing>
        <div
          class="command-switch"
          @click="store.payload.command_status = !store.payload.command_status"
        >
          <n-switch v-model:value="store.payload.command_status" size="small" @click.stop />
          <span>{{ $t('documentPage.form.command_status') }}</span>
        </div>
      </template>

      <div v-if="store.payload.command_status" class="fig-grid">
        <UIFigField
          editing
          class="fig-grid__wide"
          :label="$t('documentPage.form.command_type')"
          path="command_type"
        >
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
        </UIFigField>

        <UIFigField
          editing
          :label="$t('documentPage.command.form.command_number')"
          path="command_number"
        >
          <n-input class="w-full" type="text" v-model:value="store.payload.command_number" />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('documentPage.command.form.command_date')"
          path="command_date"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.payload.command_date"
            type="date"
            :format="useAppSetting.datePicketFormat"
          />
        </UIFigField>

        <UIFigField
          v-if="store.payload.command_type === 6"
          editing
          class="fig-grid__wide"
          :label="$t('applicationPage.form.temporarily_absent')"
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
        </UIFigField>

        <!-- Tanlov asosida (4) — komissiya qarori sanasi + raqami -->
        <template v-if="store.payload.command_type === 4">
          <UIFigField
            editing
            :label="$t('documentPage.command.form.competition_decision_date')"
            path="competition_decision_date"
          >
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.competition_decision_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </UIFigField>

          <UIFigField
            editing
            :label="$t('documentPage.command.form.competition_decision_number')"
            path="competition_decision_number"
          >
            <n-input
              class="w-full"
              v-model:value="store.payload.competition_decision_number"
              placeholder="13-TK"
            />
          </UIFigField>
        </template>

        <!-- To'liqsiz ish kuni (9) / haftasi (10) — kun rejimi + ish vaqti -->
        <template v-if="store.payload.command_type === 9 || store.payload.command_type === 10">
          <UIFigField
            v-if="store.payload.command_type === 9"
            editing
            :label="$t('documentPage.command.form.work_day_mode')"
            path="work_day"
          >
            <n-input
              class="w-full"
              v-model:value="store.payload.work_day"
              placeholder="5 kunlik ish kuni"
            />
          </UIFigField>
          <UIFigField
            v-else
            editing
            :label="$t('documentPage.command.form.week_days')"
            path="week_days"
          >
            <n-input
              class="w-full"
              v-model:value="store.payload.week_days"
              placeholder="Dushanba–Payshanba"
            />
          </UIFigField>

          <UIFigField editing :label="$t('documentPage.command.form.start_time')" path="start_time">
            <n-time-picker
              class="w-full"
              v-model:formatted-value="store.payload.start_time"
              format="HH:mm"
              value-format="HH:mm"
            />
          </UIFigField>

          <UIFigField editing :label="$t('documentPage.command.form.end_time')" path="end_time">
            <n-time-picker
              class="w-full"
              v-model:formatted-value="store.payload.end_time"
              format="HH:mm"
              value-format="HH:mm"
            />
          </UIFigField>
        </template>
      </div>
    </UIFigBlock>

    <UIFigBlock
      v-if="store.payload.command_status"
      :title="$t('documentPage.command.form.confirm')"
      :icon="icons.figUsers"
    >
      <div class="fig-grid">
        <UIFigField
          editing
          class="fig-grid__full"
          :label="$t('documentPage.command.form.finance_id')"
        >
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
        </UIFigField>

        <UIFigField
          editing
          class="fig-grid__full"
          :label="$t('documentPage.command.form.confirm')"
          path="director_id"
        >
          <n-select
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
        </UIFigField>
      </div>

      <template v-if="store.sortableConfirmations?.length">
        <div class="flex items-center justify-between gap-4 w-full">
          <span class="text-sm text-fig-text-tertiary">
            {{ $t('documentPage.command.form.viewDescription') }}
          </span>
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

        <VueDraggable
          class="flex flex-col gap-2 w-full"
          v-model="store.sortableConfirmations"
          @end="onChangeDraggle"
        >
          <div
            v-for="(item, index) in store.sortableConfirmations"
            :key="item.id"
            class="sort-target confirm-row"
          >
            <div class="handle">
              <n-icon :size="20" class="text-fig-text-tertiary cursor-move mx-1">
                <component :is="icons.figDotsHorizontal" />
              </n-icon>
            </div>

            <div class="flex-1 min-w-0 select-none">
              <UIUser class="!w-full" :data="item.data" :hide-tooltip="true" :short="false" />
            </div>

            <span v-if="store.oneByOne" class="confirm-order">
              <n-icon :size="16"><DrawText24Regular /></n-icon>
              {{ index + 1 }}
            </span>

            <button type="button" class="confirm-remove" @click="onRemoveEv(item.id)">
              <n-icon :size="16">
                <component :is="icons.figXmark" />
              </n-icon>
            </button>
          </div>
        </VueDraggable>
      </template>
    </UIFigBlock>
  </div>
</template>

<style lang="scss" scoped>
  .command-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    color: var(--fig-text-brand);
  }

  .confirm-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 4px 8px;
    border-radius: 16px;
    background: var(--fig-bg-secondary);
  }

  .confirm-order {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    padding: 4px 10px;
    border-radius: 9999px;
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
    font-size: 13px;
    font-weight: 600;
  }

  .confirm-remove {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 6px;
    border: none;
    border-radius: 9999px;
    background: var(--fig-red-100);
    color: var(--fig-text-red);
    cursor: pointer;
  }
</style>
