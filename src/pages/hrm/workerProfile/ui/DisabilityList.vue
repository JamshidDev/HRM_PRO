<script setup>
  import { ref, computed, watch } from 'vue'
  import { AddCircle28Regular, Edit16Regular, Delete16Regular } from '@vicons/fluent'
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import { UIModal, UIBadge } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

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

  const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  const rules = computed(() => {
    const baseRules = { ...validationRules.disabilityForm }
    if (!store.workerDisabilityPayload.is_lifelong) {
      baseRules.to = validationRules.common.requiredDateTimeField
    }
    return baseRules
  })

  watch(() => store.workerDisabilityPayload.is_lifelong, (val) => {
    if (val) {
      store.workerDisabilityPayload.to = null
    }
  })

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

  const onDelete = (id) => {
    store.workerDisabilityElementId = id
    store._deleteWorkerDisability()
  }

  const onCancel = () => {
    store.workerDisabilityVisible = false
  }
</script>

<template>
  <n-spin :show="store.workerDisabilityLoading">
    <div class="grid grid-cols-12 mb-16 mt-16 gap-4 border border-dashed border-surface-line p-4 rounded-2xl">
      <div class="col-span-12 mb-4 flex justify-between items-center">
        <p class="text-textColor0 font-medium">{{ $t('workerProfile.disability.title') }}</p>
        <n-button @click="onAdd" type="primary" size="small">
          <template #icon>
            <AddCircle28Regular />
          </template>
          {{ $t('content.add') }}
        </n-button>
      </div>

      <template v-if="store.workerDisabilityList.length > 0">
        <div
          v-for="item in store.workerDisabilityList"
          :key="item.id"
          class="col-span-12 md:col-span-6"
        >
            <div
              class="group bg-gray-50 hover:bg-white border border-surface-line rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary"
            >
              <div class="grid grid-cols-2">
                <div class="px-2 py-1.5 border-r border-b border-surface-line">
                  <p class="text-xs text-secondary">{{ $t('relativePage.disability.number') }}</p>
                  <p class="text-sm font-medium text-textColor0">{{ item.number }}</p>
                </div>
                <div class="px-2 py-1.5 border-b border-surface-line">
                  <p class="text-xs text-secondary">{{ $t('relativePage.disability.level') }}</p>
                  <p class="text-sm font-medium text-textColor0">{{ getLevelLabel(item.level) }}</p>
                </div>
                <div class="px-2 py-1.5 border-r border-b border-surface-line">
                  <p class="text-xs text-secondary">{{ $t('relativePage.disability.from') }}</p>
                  <p class="text-sm font-medium text-textColor0">{{ formatDate(item.from) }}</p>
                </div>
                <div class="px-2 py-1.5 border-b border-surface-line">
                  <p class="text-xs text-secondary">{{ $t('relativePage.disability.to') }}</p>
                  <p class="text-sm font-medium" :class="item.to ? 'text-textColor0' : 'text-red-500'">
                    {{ item.to ? formatDate(item.to) : $t('relativePage.disability.lifelong') }}
                  </p>
                </div>
                <div class="px-2 py-1.5 col-span-2 border-b border-surface-line">
                  <p class="text-xs text-secondary">{{ $t('relativePage.disability.comment') }}</p>
                  <p class="text-sm text-textColor0 line-clamp-2">{{ item.comment || '-' }}</p>
                </div>
              </div>
              <div class="flex justify-end items-center gap-2 px-2 py-1.5">
                <n-button size="tiny" type="primary" secondary @click.stop="onEdit(item)">
                  <template #icon>
                    <n-icon size="14">
                      <Edit16Regular />
                    </n-icon>
                  </template>
                  {{ $t('content.edit') }}
                </n-button>
                <n-popconfirm @positive-click="onDelete(item.id)">
                  <template #trigger>
                    <n-button size="tiny" type="error" secondary @click.stop>
                      <template #icon>
                        <n-icon size="14">
                          <Delete16Regular />
                        </n-icon>
                      </template>
                      {{ $t('content.delete') }}
                    </n-button>
                  </template>
                  {{ $t('content.confirmDelete') }}
                </n-popconfirm>
              </div>
            </div>
        </div>
      </template>

      <div v-else class="col-span-12 justify-center flex">
        <span class="text-gray-200">{{ $t('workerProfile.disability.noData') }}</span>
      </div>
    </div>

    <UIModal
      v-model:visible="store.workerDisabilityVisible"
      :title="store.workerDisabilityVisibleType ? $t('relativePage.disability.createTitle') : $t('relativePage.disability.updateTitle')"
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
            @click="store.workerDisabilityPayload.is_lifelong = !store.workerDisabilityPayload.is_lifelong"
          >
            <n-checkbox
              :checked="store.workerDisabilityPayload.is_lifelong"
              @update:checked="(v) => store.workerDisabilityPayload.is_lifelong = v"
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
  </n-spin>
</template>
