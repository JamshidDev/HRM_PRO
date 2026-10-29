<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { useAccountStore, useComponentStore } from '@/store/modules/index.js'
  import UIDepartment from '@/components/ui/UIDepartment.vue'
  import UIHelper from '@utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting, AppPaths } from '@/utils/index.js'
  import { useRouter } from 'vue-router'
  import { Search24Regular, Warning24Filled, PersonAdd20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useCommandFormStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  const router = useRouter()
  const formRef = ref(null)
  const searching = ref(false)
  const notFound = ref(false)

  const form = computed(() => store.form_5)
  // Boshqa joyda faol asosiy shtat (type=1) — rahbar sifatida qabul qilib bo'lmaydi.
  const mainElsewhere = computed(() =>
    (form.value.worker?.positions || []).filter((p) => p.type_id === 1)
  )
  const isPinDirector = (v) => typeof v === 'string' && v.startsWith('w')

  // PINFL'dagi odam rahbar select'iga vaqtincha option bo'lib tushadi (reyestrda bo'lsa — o'sha yozuv).
  const applyDirector = () => {
    const w = form.value.worker
    const inRegistry = w ? componentStore.confirmationList.find((c) => c.worker_id === w.id) : null
    const dp = componentStore.departmentPositionList.find(
      (v) => v.id === form.value.department_position_id
    )
    store.pinDirector =
      w && !inRegistry
        ? {
            id: `w${w.id}`,
            last_name: w.last_name,
            first_name: w.first_name,
            middle_name: w.middle_name,
            photo: w.photo,
            position: dp?.name || ''
          }
        : null
    const current = store.payload.director_id
    if (!current || isPinDirector(current)) {
      store.payload.director_id = inRegistry?.id ?? store.pinDirector?.id ?? null
    }
  }

  const search = () => {
    const pin = String(form.value.pin || '').replace(/\D/g, '')
    if (pin.length !== 14) return
    searching.value = true
    notFound.value = false
    $ApiService.workerService
      ._checkWorker({ params: { pin }, silentError: true })
      .then((res) => {
        form.value.worker = res.data.data
      })
      .catch(() => {
        form.value.worker = null
        notFound.value = true
      })
      .finally(() => {
        searching.value = false
        applyDirector()
      })
  }
  watch(
    () => form.value.pin,
    (v) => {
      if (String(v || '').replace(/\D/g, '').length === 14) search()
      else if (form.value.worker) {
        form.value.worker = null
        applyDirector()
      }
    }
  )
  watch(() => form.value.department_position_id, applyDirector)

  // Bo'limlar daraxti buyruq korxonasi bo'yicha; birinchi yuklashda tiklangan bo'lim/lavozim saqlanadi.
  const loadDepartments = (orgId, reset) => {
    if (reset) {
      form.value.department_id = []
      form.value.department_position_id = null
    }
    componentStore.departmentList = []
    componentStore.departmentPositionList = []
    if (!orgId) return
    componentStore.depParams.organizations = orgId
    componentStore._departmentTree({ own: 1 })
    const dep = form.value.department_id?.[0]?.id
    if (dep) componentStore._departmentPosition(dep)
  }
  watch(
    () => store.payload.organization_id?.[0]?.id,
    (id, old) => loadDepartments(id, old !== undefined),
    { immediate: true }
  )
  const onChangeDepartment = (v) => {
    form.value.department_id = v
    form.value.department_position_id = null
    componentStore.departmentPositionList = []
    if (v.length) componentStore._departmentPosition(v[0].id)
  }

  const onAddWorker = () => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    router.push({ name: `${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}` })
  }

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate((error) => {
      if (error) return
      if (!form.value.worker) {
        $Alert.warning(t('commandPage.form_5.workerRequired'))
        return
      }
      if (mainElsewhere.value.length) {
        $Alert.warning(t('commandPage.form_5.mainElsewhere'))
        return
      }
      const directorWorker = isPinDirector(mainData.director_id)
      data = {
        ...mainData,
        director_id: directorWorker ? undefined : mainData.director_id,
        director_worker_id: directorWorker ? Number(mainData.director_id.slice(1)) : null,
        worker_id: form.value.worker.id,
        workers: undefined,
        worker_position_id: undefined,
        department_position_id: form.value.department_position_id,
        position_date: Utils.timeToZone(form.value.position_date),
        contract_date: Utils.timeToZone(form.value.contract_date),
        number: form.value.number,
        rate: 1,
        superior_position: form.value.superior_position,
        superior_order_date: Utils.timeToZone(form.value.superior_order_date),
        superior_order_number: form.value.superior_order_number
      }
    })
    return { data, isValid: Boolean(data) }
  }

  const validateForm = async () => {
    await formRef.value?.validate()
  }

  defineExpose({ onSubmit, validateForm })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_5"
    :rules="validationRules.form_5"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('commandPage.form_5.pin')" path="pin">
        <n-input
          v-model:value="store.form_5.pin"
          :allow-input="(v) => /^\d*$/.test(v)"
          :maxlength="14"
          :placeholder="$t('commandPage.form_5.pinPlaceholder')"
          :loading="searching"
          clearable
        >
          <template #prefix>
            <n-icon><Search24Regular /></n-icon>
          </template>
        </n-input>
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 flex items-center">
      <div v-if="form.worker" class="flex items-center gap-3 w-full py-1">
        <n-avatar round :size="40" :src="form.worker.photo || Utils.noAvailableImage" />
        <div class="min-w-0">
          <div class="text-sm font-medium text-textColor1 truncate">
            {{ Utils.combineFullName(form.worker) }}
          </div>
          <div class="text-xs text-textColor3">
            {{
              form.worker.positions?.length
                ? $t('commandPage.form_5.hasPositions', { n: form.worker.positions.length })
                : $t('commandPage.form_5.noPositions')
            }}
          </div>
        </div>
      </div>
      <div v-else-if="notFound" class="flex items-center gap-2 w-full text-sm text-textColor2">
        <span>{{ $t('commandPage.form_5.notFound') }}</span>
        <n-button size="small" secondary type="primary" @click="onAddWorker">
          <template #icon><PersonAdd20Regular /></template>
          {{ $t('commandPage.form_5.addWorker') }}
        </n-button>
      </div>
    </div>
    <div v-if="mainElsewhere.length" class="col-span-12 mb-3">
      <div
        class="flex gap-2 items-start rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
      >
        <n-icon size="20" class="mt-0.5 flex-shrink-0"><Warning24Filled /></n-icon>
        <div>
          <div class="font-medium">{{ $t('commandPage.form_5.mainElsewhere') }}</div>
          <div v-for="p in mainElsewhere" :key="p.id" class="text-xs mt-0.5">
            {{ p.organization }} — {{ p.position }}
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('documentPage.form.department')" path="department_id">
        <UIDepartment
          v-model:search="componentStore.depParams.search"
          :model-v="store.form_5.department_id"
          @updateModel="onChangeDepartment"
          :multiple="false"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t('documentPage.form.position')" path="department_position_id">
        <n-select
          :disabled="!store.form_5.department_id.length"
          v-model:value="store.form_5.department_position_id"
          filterable
          :options="componentStore.departmentPositionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.departmentPositionLoading"
          :render-tag="UIHelper.selectRender.value"
          :render-label="UIHelper.selectRender.labelColor"
        />
      </n-form-item>
    </div>

    <div class="col-span-12">
      <n-form-item :label="$t('commandPage.form_5.superior_position')" path="superior_position">
        <n-input
          v-model:value="store.form_5.superior_position"
          :placeholder="$t('commandPage.form_5.superiorPlaceholder')"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_5.superior_order_date')" path="superior_order_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_5.superior_order_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item
        :label="$t('commandPage.form_5.superior_order_number')"
        path="superior_order_number"
      >
        <n-input v-model:value="store.form_5.superior_order_number" placeholder="13-TK" />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_5.position_date')" path="position_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_5.position_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_5.contract_date')" path="contract_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_5.contract_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-4">
      <n-form-item :label="$t('commandPage.form_5.number')" path="number">
        <n-input v-model:value="store.form_5.number" />
      </n-form-item>
    </div>
  </n-form>
</template>
