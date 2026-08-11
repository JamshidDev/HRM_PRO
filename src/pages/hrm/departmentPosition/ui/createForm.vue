<script setup>
  import { h } from 'vue'
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useDepartmentPositionStore, useComponentStore } from '@/store/modules/index.js'
  import Utils, { generateUUIDKey } from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { UINSelect, UISelect } from '@/components/index.js'
  import { useDebounce } from '@/utils/index.js'

  const store = useDepartmentPositionStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['onCancelEv'])
  const onCancelEv = () => {
    emits('onCancelEv')
  }

  const props = defineProps({
    callback: {
      type: Function,
      default: null
    },
    heightFull: {
      type: Boolean,
      default: true
    }
  })

  const depParams = computed(() => ({
    ...store.depParams,
    organizations: store.payload.organization_id.map((v) => v.id).toString(),
    key: undefined
  }))
  const departmentState = computed(() => componentStore.getDepartmentState(store.depParams.key))
  const fetchDepartment = useDebounce(componentStore.createDepartmentFetcher(store.depParams.key))
  const onSearchDepartment = (v) => {
    store.depParams.page = 1
    store.depParams.search = v
    fetchDepartment(depParams.value)
  }
  const onScrollDepartment = () => {
    store.depParams.page++
    fetchDepartment(depParams.value, true)
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.visibleType) {
          store._create(props.callback)
        } else {
          store._update(props.callback)
        }
      }
    })
  }

  const onChangeStructure = (v) => {
    store.payload.organization_id = v
    departmentState.value.list = []
    store.payload.department_id = null
    store.payload.tariff_grid_id = null
    store.gridColumns = []
    store.gridOptions = []
    fetchDepartment(depParams.value)
  }

  const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : Number(v).toLocaleString('ru-RU'))
  const onSelectGrid = (v) => store._selectGrid(v)

  // Setka dropdown label — nomi (qalin) + izoh (kichik, ikki qator). FAQAT dropdown ro'yxatida.
  const renderGridLabel = (option, selected) => {
    // Tanlangan qiymat (trigger) — faqat nom (input bir qatorli, siqilmasin).
    if (selected) return option.name
    return h('div', { class: 'flex flex-col py-0.5' }, [
      h('span', { class: 'font-medium' }, option.name),
      option.note ? h('span', { class: 'text-xs text-secondary line-clamp-2' }, option.note) : null
    ])
  }

  // Tanlangan setka tavsifi — select OSTIDA ko'rsatiladi (input siqilib qolmasin).
  const selectedGridNote = computed(() => {
    const g = store.gridOptions.find((x) => x.id === store.payload.tariff_grid_id)
    return g?.note || ''
  })

  // Guruh/razryad — setka tanlangan bo'lsa faqat setkada MAVJUDLARI.
  const groupOptions = computed(() =>
    store.gridGroupIds.length
      ? componentStore.groupList.filter((g) => store.gridGroupIds.includes(g.id))
      : componentStore.groupList
  )
  const rankOptions = computed(() =>
    store.gridRankIds.length
      ? componentStore.rankList.filter((r) => store.gridRankIds.map(String).includes(String(r.id)))
      : componentStore.rankList
  )

  // Bo'lim o'zgarsa — setka ro'yxati qayta yuklanadi (union+fallback).
  watch(
    () => store.payload.department_id,
    () => {
      store.payload.tariff_grid_id = null
      store.gridColumns = []
      store._fetchGrids()
    }
  )
  // Guruh/razryad o'zgarsa va setka tanlangan bo'lsa — asosiy oklad qayta hisoblanadi.
  watch(
    () => [store.payload.group, store.payload.rank],
    () => {
      if (store.payload.tariff_grid_id) store._recomputeAmount()
    }
  )

  const updateShowEv = (v) => {
    if (!v) return
    if (!store.visibleType && departmentState.value.list.length === 1) {
      store.payload.department_id = null
      fetchDepartment(depParams.value)
    }
  }

  const showStructureField = computed(() => !props.callback)

  onMounted(() => {
    store.depParams.search = null
    if (store.visibleType) {
      departmentState.value.list = []
    } else {
      // Tahrir: mavjud koeffitsientlar + biriktirilgan setkalar.
      if (store.elementId) store._loadCoefficients(store.elementId)
      store._fetchGrids()
    }
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div :class="[heightFull ? 'h-[calc(100vh-120px)]' : '']">
      <div class="grid grid-cols-12 gap-x-4 overflow-x-hidden">
        <n-form-item
          v-if="showStructureField"
          class="col-span-12"
          :label="$t(`content.organization`)"
        >
          <UISelect
            :options="componentStore.structureList"
            :model-v="store.payload.organization_id"
            @updateModel="onChangeStructure"
            :checked-val="store.structureCheck"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            @updateCheck="(v) => (store.structureCheck = v)"
            :loading="componentStore.structureLoading"
            :multiple="false"
            :auto-select="true"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12"
          :label="$t(`departmentPositionPage.form.department_id`)"
          path="department_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <UINSelect
            clearable
            :loading="departmentState.loading"
            :options="departmentState.list"
            :total-count="departmentState.total"
            v-model:value="store.payload.department_id"
            @onSearch="onSearchDepartment"
            @onScrollEv="onScrollDepartment"
            @updateShow="updateShowEv"
          />
        </n-form-item>
        <label class="col-span-12 text-secondary mb-2">{{ $t(`departmentPositionPage.form.position_id`) }}
          <span class="n-form-item-label__asterisk text-danger">&nbsp;*</span>
          <template v-if="store.payload.position_id">(<span class="select-all cursor-pointer">{{ store.payload.position_id }}</span>)</template>
        </label>
        <n-form-item
          class="col-span-12"
          :show-label="false"
          :label="$t(`departmentPositionPage.form.position_id`)"
          path="position_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <div class="flex gap-2 w-full items-center">
            <n-select
              class="w-[calc(100% - 60px)]"
              v-model:value="store.payload.position_id"
              filterable
              clearable
              :options="componentStore.positionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.positionLoading"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
            />
          </div>
        </n-form-item>
        <n-form-item
          class="col-span-12"
          :class="store.gridColumns.length > 1 ? 'md:col-span-8' : 'md:col-span-12'"
          :label="$t(`departmentPositionPage.form.tariff_grid`)"
        >
          <div class="w-full">
            <n-select
              v-model:value="store.payload.tariff_grid_id"
              filterable
              clearable
              :options="store.gridOptions"
              label-field="name"
              value-field="id"
              :loading="store.gridLoading"
              :placeholder="$t(`departmentPositionPage.form.tariff_grid_ph`)"
              :render-label="renderGridLabel"
              @update:value="onSelectGrid"
            />
            <p v-if="selectedGridNote" class="dp-grid-note" :title="selectedGridNote">
              {{ selectedGridNote }}
            </p>
          </div>
        </n-form-item>
        <n-form-item
          v-if="store.gridColumns.length > 1"
          class="col-span-12 md:col-span-4"
          :label="$t(`departmentPositionPage.form.tariff_grid_column`)"
        >
          <n-select
            v-model:value="store.payload.tariff_grid_column"
            :options="store.gridColumns"
            label-field="name"
            value-field="key"
            @update:value="() => store._recomputeAmount()"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.group`)"
          path="group"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-select
            v-model:value="store.payload.group"
            filterable
            clearable
            :options="groupOptions"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.rank`)"
          path="rank"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-select
            v-model:value="store.payload.rank"
            filterable
            clearable
            :options="rankOptions"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.max_rank`)"
          path="max_rank"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-select
            v-model:value="store.payload.max_rank"
            filterable
            clearable
            :options="componentStore.rankList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.rate`)"
          path="rate"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-input-number
            :max="300"
            :min="0"
            :step="0.1"
            :show-button="false"
            class="w-full"
            type="text"
            :allow-input="Utils.onlyAllowNumber"
            v-model:value="store.payload.rate"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.salary`)"
          path="salary"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="store.payload.salary"
            type="text"
            :allow-input="Utils.onlyAllowNumber"
            :disabled="!!store.payload.tariff_grid_id"
            :loading="store.amountLoading"
          >
            <template #suffix>
              {{ $t('content.sum') }}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.experience`)"
          path="experience"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="store.payload.experience"
            type="text"
            :allow-input="Utils.onlyAllowNumber"
          >
            <template #suffix>
              {{ $t('content.month') }}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-8"
          :label="$t(`departmentPositionPage.form.educations`)"
          path="education"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <n-select
            v-model:value="store.payload.education"
            filterable
            clearable
            :options="componentStore.educationList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </n-form-item>

        <!-- Oklad oshiruvchi koeffitsientlar -->
        <div class="col-span-12 mt-2 dp-coef">
          <div class="flex items-center justify-between mb-2">
            <span class="text-secondary font-medium">{{ $t('departmentPositionPage.form.coefficients') }}</span>
            <n-button size="small" dashed type="primary" @click="store.addCoeffRow()">
              + {{ $t('departmentPositionPage.form.addCoefficient') }}
            </n-button>
          </div>
          <div
            v-for="(c, idx) in store.payload.coefficients"
            :key="idx"
            class="grid grid-cols-12 gap-2 mb-2 items-center"
          >
            <n-input-number
              class="col-span-6 md:col-span-2"
              v-model:value="c.percent"
              :min="0"
              :show-button="false"
              :placeholder="$t('departmentPositionPage.form.percent')"
            >
              <template #suffix>%</template>
            </n-input-number>
            <n-input
              class="col-span-6 md:col-span-4"
              v-model:value="c.reason"
              :placeholder="$t('departmentPositionPage.form.reason')"
            />
            <n-date-picker
              class="col-span-6 md:col-span-2"
              type="date"
              clearable
              v-model:formatted-value="c.valid_from"
              value-format="yyyy-MM-dd"
              :placeholder="$t('departmentPositionPage.form.validFrom')"
            />
            <n-date-picker
              class="col-span-6 md:col-span-3"
              type="date"
              clearable
              v-model:formatted-value="c.valid_to"
              value-format="yyyy-MM-dd"
              :placeholder="$t('departmentPositionPage.form.validTo')"
            />
            <n-button
              class="col-span-12 md:col-span-1"
              quaternary
              type="error"
              @click="store.removeCoeffRow(idx)"
            >
              ✕
            </n-button>
          </div>
          <div class="flex justify-end gap-6 text-sm mt-2 pt-2 dp-coef-total">
            <span class="text-surface-500">{{ $t('departmentPositionPage.form.baseSalary') }}:
              <b class="text-surface-800">{{ fmt(store.baseSalary) }}</b></span>
            <span class="text-primary">{{ $t('departmentPositionPage.form.totalSalary') }}:
              <b>{{ fmt(store.totalSalary) }}</b> {{ $t('content.sum') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="onCancelEv" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>
  .dp-coef-total {
    border-top: 1px dashed var(--surface-line, #e5e7eb);
  }
  .dp-grid-note {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--textColor2, #64748b);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
