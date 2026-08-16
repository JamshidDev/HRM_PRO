<script setup>
  import { ref, computed, watch } from 'vue'
  import { Edit32Regular, Delete20Regular } from '@vicons/fluent'
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import { UIModal, UITable, UIProfileSection, UIProfileEmpty } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  /** Figma "Nogironlik" bo'limi (node 2672:255721) */
  const { t } = i18n.global
  const store = useWorkerProfileStore()
  const formRef = ref(null)

  const levelOptions = [
    { id: 1, name: t('relativePage.disability.level1') },
    { id: 2, name: t('relativePage.disability.level2') },
    { id: 3, name: t('relativePage.disability.level3') }
  ]

  const levelLabels = {
    1: t('relativePage.disability.level1'),
    2: t('relativePage.disability.level2'),
    3: t('relativePage.disability.level3')
  }

  const getLevelLabel = (level) => levelLabels[level] || level

  const rules = computed(() => {
    const baseRules = { ...validationRules.disabilityForm }
    if (!store.workerDisabilityPayload.is_lifelong) {
      baseRules.to = validationRules.common.requiredDateTimeField
    }
    return baseRules
  })

  watch(
    () => store.workerDisabilityPayload.is_lifelong,
    (val) => {
      if (val) store.workerDisabilityPayload.to = null
    }
  )

  const onAdd = () => {
    store.resetWorkerDisabilityForm()
    store.workerDisabilityVisibleType = true
    store.workerDisabilityVisible = true
  }

  const onEdit = (item) => {
    store.resetWorkerDisabilityForm()
    store.workerDisabilityElementId = item.id
    store.workerDisabilityPayload.number = item.number
    store.workerDisabilityPayload.level = item.level
    store.workerDisabilityPayload.from = item.from ? new Date(item.from).getTime() : null
    store.workerDisabilityPayload.to = item.to ? new Date(item.to).getTime() : null
    store.workerDisabilityPayload.comment = item.comment
    store.workerDisabilityPayload.is_lifelong = !item.to
    store.workerDisabilityVisibleType = false
    store.workerDisabilityVisible = true
  }

  const onDelete = (item) => {
    store.workerDisabilityElementId = item.id
    store._deleteWorkerDisability()
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.workerDisabilityVisibleType) {
          store._createWorkerDisability()
        } else {
          store._updateWorkerDisability()
        }
      }
    })
  }

  const onCancel = () => {
    store.workerDisabilityVisible = false
  }

  const columns = computed(() => [
    { key: 'number', title: t('relativePage.disability.number'), minWidth: 140 },
    { key: 'level', title: t('relativePage.disability.level'), width: 160 },
    { key: 'from', title: t('relativePage.disability.from'), width: 140 },
    { key: 'to', title: t('relativePage.disability.to'), width: 170 },
    { key: 'comment', title: t('relativePage.disability.comment'), minWidth: 260 }
  ])

  const actions = computed(() => [
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    }
  ])
</script>

<template>
  <UIProfileSection :title="$t('workerProfile.disability.title')" @add="onAdd">
    <UITable
      auto-height
      :columns="columns"
      :actions="actions"
      :data="store.workerDisabilityList"
      :loading="store.workerDisabilityLoading"
    >
      <template #empty><UIProfileEmpty /></template>

      <template #cell-level="{ value }">
        <span v-if="value" class="disability-level">{{ getLevelLabel(value) }}</span>
      </template>

      <template #cell-from="{ value }">{{ Utils.timeOnlyDate(value) }}</template>

      <!-- Muddati bo'sh bo'lsa nogironlik muddatsiz belgilangan -->
      <template #cell-to="{ value }">
        {{ value ? Utils.timeOnlyDate(value) : $t('relativePage.disability.lifelong') }}
      </template>

      <template #cell-comment="{ value }">
        <span class="line-clamp-2">{{ value || '—' }}</span>
      </template>
    </UITable>
  </UIProfileSection>

  <UIModal
    v-model:visible="store.workerDisabilityVisible"
    :title="
      store.workerDisabilityVisibleType
        ? $t('relativePage.disability.createTitle')
        : $t('relativePage.disability.updateTitle')
    "
    width="500px"
  >
    <div class="overflow-y-auto">
      <n-form ref="formRef" :model="store.workerDisabilityPayload" :rules="rules">
        <n-form-item :label="$t('relativePage.disability.number')" path="number">
          <n-input type="text" v-model:value="store.workerDisabilityPayload.number" />
        </n-form-item>

        <n-form-item :label="$t('relativePage.disability.level')" path="level">
          <n-select
            v-model:value="store.workerDisabilityPayload.level"
            :options="levelOptions"
            label-field="name"
            value-field="id"
          />
        </n-form-item>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <n-form-item :label="$t('relativePage.disability.from')" path="from">
              <n-date-picker
                class="w-full"
                v-model:value="store.workerDisabilityPayload.from"
                type="date"
                :format="useAppSetting.datePicketFormat"
              />
            </n-form-item>
          </div>
          <div class="col-span-6">
            <n-form-item :label="$t('relativePage.disability.to')" path="to">
              <n-date-picker
                class="w-full"
                v-model:value="store.workerDisabilityPayload.to"
                type="date"
                :format="useAppSetting.datePicketFormat"
                :disabled="store.workerDisabilityPayload.is_lifelong"
              />
            </n-form-item>
          </div>
        </div>

        <div
          class="border border-surface-line rounded-lg p-3 mb-4 cursor-pointer hover:border-primary transition-colors"
          :class="store.workerDisabilityPayload.is_lifelong && 'border-primary bg-primary/5'"
          @click="
            store.workerDisabilityPayload.is_lifelong = !store.workerDisabilityPayload.is_lifelong
          "
        >
          <n-checkbox
            :checked="store.workerDisabilityPayload.is_lifelong"
            @update:checked="(v) => (store.workerDisabilityPayload.is_lifelong = v)"
            @click.stop
          >
            <span class="font-medium">{{ $t('relativePage.disability.lifelong') }}</span>
          </n-checkbox>
          <p class="text-xs text-secondary mt-1 ml-6">
            {{ $t('relativePage.disability.lifelongHint') }}
          </p>
        </div>

        <n-form-item :label="$t('relativePage.disability.comment')" path="comment">
          <n-input
            type="textarea"
            :rows="3"
            v-model:value="store.workerDisabilityPayload.comment"
          />
        </n-form-item>
      </n-form>
    </div>

    <div class="flex justify-end gap-2">
      <n-button @click="onCancel" type="default" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.workerDisabilitySaveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style lang="scss" scoped>
  .disability-level {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 6px;
    background: var(--fig-blue-100);
    color: var(--fig-text-brand);
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
  }
</style>
