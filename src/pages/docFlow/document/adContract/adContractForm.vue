<script setup>
  import { useDocumentDateLimit } from '@/composables/useDocumentDateLimit.js'
  import { UISegmentTabs, UISelect, UISignerList } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import validationRules from '@/utils/validationRules.js'
  // Hujjat sanasi: yaratishda sozlamadagi oyna, tahrirda o'zgarmaydi.
  const { isDateDisabled } = useDocumentDateLimit()
  const formRef = ref(null)
  import { useComponentStore } from '@/store/modules/index.js'
  import { useAdContractFormStore } from './adContractFormStore.js'
  import { NAvatar } from 'naive-ui'
  import Utils from '@/utils/Utils.js'
  import UIDepartment from '@/components/ui/UIDepartment.vue'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'
  import ApiService from '@/service/ApiService.js'
  import { SuperSelect } from '@/components/index.js'

  const store = useAdContractFormStore()
  const componentStore = useComponentStore()
  const showCheckBox = ref(false)
  const confirmationList = ref([])
  const financeList = ref([])
  const rankRangeTitle = ref('')
  const props = defineProps({
    callBack: {
      type: Function,
      default: null
    },
    workers: {
      type: Array,
      default: []
    },
    organization: {
      type: Array,
      default: []
    },
    // create — yaratish modali; edit — hujjat drawer'idagi «Ma'lumotlar» tabi.
    mode: { type: String, default: 'create' },
    readonly: { type: Boolean, default: false },
    // To'liq ekranda modal tanasining o'zi skroll qiladi — ichki skroll kerak emas.
    fullscreen: { type: Boolean, default: false }
  })
  const isEdit = computed(() => props.mode === 'edit')

  // Tab uchun: tekshiruv natijasi (saqlash tugmalari tabning o'zida).
  const submit = () =>
    new Promise((resolve) => {
      formRef.value?.validate((error) => resolve({ isValid: !error }))
    })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        // Tahrir rejimi — saqlash o'rniga qayta yuborish modali.
        if (store.editId) return store._submitEdit()
        store.saveLoading = true
        store._create(props.callBack)
      }
    })
  }

  // Yaratish modalida tugmalar buyruqlar modalidagidek sarlavhada (page.vue) —
  // ular `onSubmit` ni chaqiradi. Tab esa `submit` bilan faqat tekshiruv natijasini oladi.
  defineExpose({ submit, onSubmit })
  const onChangeDepartment = (v) => {
    store.payload.department_id = v
    componentStore.departmentPositionList = []
    store.payload.department_position_id = null
    if (v.length === 0) return
    componentStore._departmentPosition(v[0].id)
  }
  const onChangeStatus = (v) => {
    if (v) {
      componentStore._positions()
    }
  }
  const onChangeStructure = (v) => {
    store.payload.organization_id = v
    if (v.length > 0) {
      componentStore.departmentList = []
      store.payload.department_id = []
      componentStore.depParams.organizations = v[0].id
      componentStore._departmentTree()
    }
  }

  const onChangeOrganization = (v) => {
    store.organization = v
    componentStore.workerList = []
    store.workers = []
    store.payload.worker_position_id = null
    componentStore.workerParams.organization_id = v.length > 0 ? v?.[0]?.id : null
  }
  const renderLabel = (option) => {
    return [
      h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
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
              { class: 'text-xs font-medium text-gray-500' },
              [option.last_name, option.first_name?.[0], option.middle_name?.[0]].filter(Boolean).join('.')
            ),
            h('div', { class: 'text-xs text-gray-400' }, option.position)
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
        [option?.last_name, option?.first_name, option?.middle_name].filter(Boolean).join(' ')
      )
    ]
  }
  const onChangeWorker = () => {
    const worker = componentStore.workerList.filter(
      (v) => v.id === store.payload.worker_position_id
    )[0]
    const typeId = worker.typeId
    store.payload.type = null
    componentStore._adContractType(typeId)
    showCheckBox.value = [2, 4, 5].includes(typeId)
    store.payload.group = worker.group
    store.payload.rank = worker.rank
    store.payload.salary = worker?.salary?.toString()
  }

  // Tahrirda tiklangan xodim uchun «lavozim holati» belgisi (yaratishdagidek).
  watch(
    () => store.editId,
    (id) => {
      if (id) showCheckBox.value = [2, 4, 5].includes(componentStore.workerList[0]?.typeId)
    },
    { immediate: true }
  )
  // 14 — FXSH bekor qilish kelishuvi; buyruq bilan tuzilsa 80-buyruq yaratiladi.
  const AD_TYPE_CIVIL_CANCEL = 14
  const isCivilCancel = computed(() => store.payload.type === AD_TYPE_CIVIL_CANCEL)
  const kindOptions = computed(() => [
    { label: i18n.global.t('commandPage.form_80.kind_contract'), value: 1 },
    { label: i18n.global.t('commandPage.form_80.kind_service'), value: 2 }
  ])

  // Sabab ro'yxati — reason-types?type=80.
  const reasonFor = ref(null)
  const loadReasons = () => {
    reasonFor.value = 80
    componentStore._reasonTypes(80)
  }

  // Shartnoma rekvizitlari FXSH shartnomasidan to'ldiriladi, foydalanuvchi o'zgartira oladi.
  const contractLoading = ref(false)
  const contractFound = ref(null)
  const fillCivilContract = (wpId) => {
    contractLoading.value = true
    ApiService.commandService
      ._civilContract({ params: { worker_position_id: wpId } })
      .then((res) => {
        if (store.payload.worker_position_id !== wpId || !isCivilCancel.value) return
        const c = res.data.data
        contractFound.value = Boolean(c)
        const toTime = (v) => (v ? new Date(v).getTime() : null)
        store.payload.civil_contract_number = c?.number ?? null
        store.payload.civil_contract_date = toTime(c?.contract_date)
        store.payload.contract_to_date = toTime(c?.contract_to_date) ?? store.payload.contract_to_date
      })
      .catch(() => {
        contractFound.value = false
      })
      .finally(() => {
        contractLoading.value = false
      })
  }
  watch(
    () => [store.payload.type, store.payload.worker_position_id],
    ([type, wpId], old) => {
      if (type !== AD_TYPE_CIVIL_CANCEL || !wpId) {
        contractFound.value = null
        return
      }
      if (reasonFor.value !== 80) loadReasons()
      // Tahrirda tiklangan qiymatlar birinchi yuklashda ustidan yozilmaydi.
      if (!old && store.editId && store.payload.civil_contract_number) return
      fillCivilContract(wpId)
    },
    { immediate: true }
  )

  // Kadrlar mas'uli — kelishuv korxonasi xodimlaridan (80-buyruq formasidagidek).
  const hrList = reactive({ list: [], total: 0, loading: false, search: null, page: 1, reqId: 0 })
  const hrPerPage = 100
  const hrOrgId = computed(() => store.organization?.[0]?.id ?? null)
  const hrOptions = computed(() => {
    const picked = store.payload.hr_option
    const list = picked ? [picked, ...hrList.list.filter((v) => v.id !== picked.id)] : hrList.list
    return list.filter((v) => v.id !== store.payload.worker_position_id)
  })
  const loadHr = (infinity = false) => {
    if (!hrOrgId.value) return
    const reqId = ++hrList.reqId
    hrList.loading = true
    ApiService.workerService
      ._search({
        params: { organization_id: hrOrgId.value, page: hrList.page, per_page: hrPerPage, search: hrList.search }
      })
      .then((res) => {
        if (reqId !== hrList.reqId) return
        const data = res.data.data.data.map((v) => ({
          id: v.id,
          name: `${v.worker.last_name} ${v.worker.first_name} ${v.worker.middle_name}`,
          position: v.position?.name || v?.post_name,
          photo: v.worker?.photo
        }))
        hrList.total = res.data.data.total
        hrList.list = infinity ? [...hrList.list, ...data] : data
      })
      .finally(() => {
        if (reqId === hrList.reqId) hrList.loading = false
      })
  }
  const onSearchHr = (v) => {
    hrList.page = 1
    hrList.search = v
    loadHr()
  }
  const onScrollHr = () => {
    hrList.page += 1
    loadHr(true)
  }
  const onChangeHr = (id) => {
    store.payload.hr_option = hrOptions.value.find((v) => v.id === id) ?? null
  }
  watch(
    () => [isCivilCancel.value && store.payload.command_status, hrOrgId.value],
    ([need, org], old) => {
      if (old && old[1] && org !== old[1]) {
        store.payload.hr_worker_position_id = null
        store.payload.hr_option = null
      }
      if (!need) return
      hrList.page = 1
      hrList.search = null
      loadHr()
    },
    { immediate: true }
  )

  // Buyruq turlari ro'yxati. Forma ochilganda (yangi yoki tahrir) tanlangan/tiklangan buyruq
  // turi saqlanadi; faqat kelishuv turi o'zgarganda tozalanadi. Tahrirda tiklangan qiymat
  // `editCommandType` da keladi. Ro'yxatda bitta tur bo'lsa — o'zi tanlanadi.
  const loadCommandTypes = (reset) => {
    if (!store.payload.type) return
    store.payload.command_type = store.editCommandType ?? (reset ? null : store.payload.command_type)
    store.editCommandType = null
    const data = {
      status: 'contract-additional',
      type: store.payload.type
    }
    componentStore._commandTypes(data, (id) => {
      if (!store.payload.command_type) store.payload.command_type = id
    })
  }
  watch(
    () => store.payload.type,
    () => loadCommandTypes(true)
  )
  onMounted(() => loadCommandTypes(false))

  watchEffect(() => {
    if (store.payload.type === 8) {
      store._getStructures()
    }
  })

  const onOpenEv = (v) => {
    if (!v) return
    store.payload.worker_position_id = null
    componentStore.onOpenWorkerEv(v)
  }

  const showPositionDate = computed(() => {
    const show = [8].includes(store.payload.type)
    if (!show) {
      store.payload.position_date = null
    }
    return show
  })

  const showForm = computed(() =>
    store.payload.type === null ? true : [1, 8].includes(store.payload.type)
  )

  // Ro'yxatda sudralganda yoki o'chirilganda — tartib payload'ga ham yoziladi.
  const onSignersUpdate = (items) => {
    store.sortableConfirmations = items
    store.payload.confirmations = items.map((v) => v.id)
  }

  // Yuborish tartibi: bir vaqtda yoki navbat bilan (`oneByOne`) — buyruqlardagidek almashtirgich.
  const signMode = computed({
    get: () => (store.oneByOne ? 'sequential' : 'parallel'),
    set: (v) => (store.oneByOne = v === 'sequential')
  })
  const modeTabs = computed(() => [
    { id: 'parallel', name: i18n.global.t('documentPage.command.form.route.parallel') },
    { id: 'sequential', name: i18n.global.t('documentPage.command.form.route.sequential') }
  ])
  // Imzolovchilar ro'yxati keyin yuklansa (sahifa yangilanganda) — buxgalter/kelishuvchi ro'yxatlari qayta quriladi.
  watch(
    () => componentStore.confirmationList,
    () => syncConfirmationEv()
  )
  const fetchConfirmation = () => {
    if (componentStore.confirmationList.length > 0) return
    componentStore._confirmations()
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
  // Avval tanlanganlar o'z o'rnida qoladi, yangilari oxiriga qo'shiladi (buyruqdagi
  // CommandFormBody.vue kabi) — sudrab berilgan tartib yangi kelishuvchi qo'shilganda yo'qolmaydi.
  const fillSortableConfirmations = () => {
    const selected = store.payload.confirmations
    const kept = store.sortableConfirmations.filter((v) => selected.includes(v.id))
    const keptIds = kept.map((v) => v.id)
    const added = confirmationList.value
      .filter((v) => selected.includes(v.id) && !keptIds.includes(v.id))
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
    store.sortableConfirmations = [...kept, ...added]
  }
  const onRemoveEv = (id) => {
    store.sortableConfirmations = store.sortableConfirmations.filter((v) => v.id !== id)
    store.payload.confirmations = store.payload.confirmations.filter((v) => v !== id)
  }

  const onChangePosition = (id) => {
    const index = componentStore.departmentPositionList.findIndex((x) => x.id === id)
    if (index === -1) return
    const selectedP = componentStore.departmentPositionList[index]
    store.payload.group = selectedP.group?.id
    store.payload.rank = selectedP.rank?.id
    rankRangeTitle.value = ` (${selectedP.rank.name} - ${selectedP.max_rank.name})`
  }

  onMounted(() => {
    if (componentStore.groupList.length === 0) {
      componentStore._enums()
    }
    if (componentStore.scheduleList.length === 0) {
      componentStore._scheduleList()
    }

    if (props.workers.length === 0) {
      // componentStore._workers()
    } else {
      store.resetForm()
      componentStore.workerList = props.workers
      store.payload.worker_position_id = componentStore.workerList[0].id
      store.organization = props.organization
      componentStore._adContractType(componentStore.workerList[0].contractTypeId)
    }
    componentStore._structures()

    fetchConfirmation()
    syncConfirmationEv()
  })
</script>

<template>
  <n-form
    ref="formRef"
    :rules="validationRules.adContractFrom"
    :model="store.payload"
    :class="{ 'ad-contract-form--readonly': readonly }"
  >
    <div
      :style="isEdit || fullscreen ? null : 'height: calc(100vh - 100px)'"
      :class="isEdit || fullscreen ? '' : 'overflow-y-auto overflow-x-hidden pb-4'"
    >
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12">
          <div
            class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground mt-6 mb-4"
          >
            <div class="col-span-12 md:col-span-6 flex">
              <n-form-item
                class="w-full"
                :label="$t(`documentPage.form.organization`)"
                path="organization_id"
              >
                <UISelect
                  :options="componentStore.structureList"
                  :modelV="store.organization"
                  @updateModel="onChangeOrganization"
                  :checkedVal="store.structureCheck2"
                  @updateCheck="(v) => (store.structureCheck2 = v)"
                  v-model:search="componentStore.structureParams.search"
                  @onSearch="componentStore._structures"
                  :loading="componentStore.structureLoading"
                  :multiple="false"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 flex">
              <n-form-item class="w-full" :label="$t(`documentPage.form.worker`)" path="worker">
                <n-select
                  :disabled="store.organization.length === 0 || workers.length > 0 || Boolean(store.editId)"
                  v-model:value="store.payload.worker_position_id"
                  filterable
                  :options="componentStore.workerList"
                  label-field="name"
                  value-field="id"
                  :render-label="UIHelper.selectRender.label"
                  :render-tag="UIHelper.selectRender.value"
                  @update:value="onChangeWorker"
                  :loading="componentStore.workerLoading"
                  @scroll="componentStore.onScrollWorker"
                  @search="componentStore.onSearchWorker"
                  @update:show="onOpenEv"
                />
              </n-form-item>
            </div>
          </div>
        </div>

        <div
          class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground"
        >
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12 md:col-span-6 lg:col-span-2">
              <n-form-item :label="$t(`documentPage.form.contractNumber`)" path="number">
                <n-input
                  :allow-input="Utils.onlyAllowNumber"
                  class="w-full"
                  type="text"
                  v-model:value="store.payload.number"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-6">
              <n-form-item :label="$t(`documentPage.form.type`)" path="type">
                <n-select
                  v-model:value="store.payload.type"
                  :disabled="Boolean(store.editId)"
                  filterable
                  :options="componentStore.adContractTypes"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.adContractTypeLoading"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-4">
              <n-form-item :label="$t(`documentPage.form.contractDate`)" path="contract_date">
                <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.contract_date"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                  :is-date-disabled="isDateDisabled"
                  :disabled="Boolean(store.editId)"
                />
              </n-form-item>
            </div>
            <!-- 1-tur: o'zgartirish bandlari — bo'sh qolsa hujjatda qo'lda yozish uchun nuqtali qator -->
            <div v-if="store.payload.type === 1" class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.changes`)" path="changes">
                <n-input
                  v-model:value="store.payload.changes"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  :maxlength="3000"
                  show-count
                  :placeholder="$t(`documentPage.form.changesPlaceholder`)"
                />
              </n-form-item>
            </div>
          </div>
        </div>

        <!-- Lavozim shartlari (1/8) va bekor qilish sanasi (12/13); boshqa turda bo'sh blok chiqmasin -->
        <div
          v-if="showForm || [12, 13].includes(store.payload.type)"
          class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4"
        >
          <div class="grid grid-cols-12 gap-x-4">
            <template v-if="showForm">
              <template v-if="store.payload.type === 8">
                <div class="col-span-12">
                  <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
                    <UISelect
                      :options="store.structureList"
                      :modelV="store.payload.organization_id"
                      @updateModel="onChangeStructure"
                      :checkedVal="store.structureCheck"
                      @updateCheck="(v) => (store.structureCheck = v)"
                      v-model:search="store.structureParams.search"
                      @onSearch="store._getStructures"
                      :loading="store.structureLoading"
                      :multiple="false"
                    />
                  </n-form-item>
                </div>
                <div v-if="showCheckBox" class="col-span-12 flex justify-end">
                  <n-checkbox
                    v-model:checked="store.payload.position_status"
                    @update:checked="onChangeStatus"
                  >
                    <span class="text-xs text-gray-500">{{
                      $t(`documentPage.form.positionStatus`)
                    }}</span>
                  </n-checkbox>
                </div>
                <template v-if="store.payload.position_status && showCheckBox">
                  <div class="col-span-12 md:col-span-6 lg:col-span-4">
                    <n-form-item :label="$t(`documentPage.form.position`)" path="position_id">
                      <n-select
                        v-model:value="store.payload.position_id"
                        filterable
                        :options="componentStore.positionList"
                        label-field="name"
                        value-field="id"
                        :loading="componentStore.positionLoading"
                      />
                    </n-form-item>
                  </div>
                </template>
                <template v-else>
                  <div class="col-span-12 md:col-span-6 lg:col-span-6">
                    <n-form-item :label="$t(`documentPage.form.department`)" path="department_id">
                      <UIDepartment
                        :modelV="store.payload.department_id"
                        @updateModel="onChangeDepartment"
                        :checkedVal="store.departmentCheck"
                        @updateCheck="(v) => (store.departmentCheck = v)"
                        :multiple="false"
                      />
                    </n-form-item>
                  </div>
                  <div class="col-span-6">
                    <n-form-item
                      :label="$t(`documentPage.form.position`)"
                      path="department_position_id"
                    >
                      <n-select
                        :options="componentStore.departmentPositionList"
                        :loading="componentStore.departmentPositionLoading"
                        :disabled="!Boolean(store.payload.department_id?.length)"
                        :render-label="UIHelper.selectRender.labelColor"
                        :render-tag="UIHelper.selectRender.value"
                        v-model:value="store.payload.department_position_id"
                        @update:value="onChangePosition"
                        filterable
                        label-field="name"
                        value-field="id"
                      />
                    </n-form-item>
                  </div>
                </template>
              </template>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.group`)" path="group">
                  <n-select
                    v-model:value="store.payload.group"
                    filterable
                    :options="componentStore.groupList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.enumLoading"
                    clearable
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.rank`) + rankRangeTitle" path="rank">
                  <n-select
                    v-model:value="store.payload.rank"
                    filterable
                    :options="componentStore.rankList"
                    label-field="name"
                    value-field="id"
                    :loading="componentStore.enumLoading"
                    clearable
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.rate`)" path="rate">
                  <n-input-number
                    :max="1"
                    :min="0.1"
                    :step="0.1"
                    :show-button="false"
                    class="w-full"
                    v-model:value="store.payload.rate"
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.salary`)" path="salary">
                  <n-input
                    class="w-full"
                    type="text"
                    :allow-input="Utils.onlyAllowNumber"
                    v-model:value="store.payload.salary"
                  >
                    <template #suffix>
                      {{ $t('content.sum') }}
                    </template>
                  </n-input>
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item :label="$t(`documentPage.form.schedule_id`)" path="schedule_id">
                  <n-select
                    v-model:value="store.payload.schedule_id"
                    filterable
                    :options="componentStore.scheduleList"
                    value-field="id"
                    :loading="componentStore.scheduleLoading"
                    :render-label="UIHelper.scheduleRender.label"
                    :render-tag="UIHelper.scheduleRender.value"
                    clearable
                  />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-4" v-if="showPositionDate">
                <n-form-item :label="$t(`documentPage.form.position_date`)" path="position_date">
                  <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.position_date"
                    type="date"
                    :format="useAppSetting.datePicketFormat"
                  />
                </n-form-item>
              </div>
            </template>
            <!--
              Shartnoma bekor qilinadigan sana. 12 = FXSH bekor qilish (eski),
              13 = mehnat shartnomasini bekor qilish, 14 = FXSH bekor qilish
              kelishuvi (yangi shablon, 12 ning o'rinbosari).
              ⚠️ Bu ro'yxatda bo'lmagan tur uchun maydon YASHIRINADI, lekin
              store.resetForm() contract_to_date ni `now` qilib beradi va
              Utils.checkRequestBody null-emas qiymatni o'chirmaydi → hujjatga
              foydalanuvchi ko'rmagan BUGUNGI sana tushib qoladi.
            -->
            <div
              v-if="[12, 13].includes(store.payload.type)"
              class="col-span-12 md:col-span-6 lg:col-span-4"
            >
              <n-form-item
                :label="$t(`documentPage.form.contract_to_date`)"
                path="contract_to_date"
              >
                <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.contract_to_date"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
          </div>
        </div>
        <!-- 14: bekor qilinayotgan FXSH shartnomasi — qiymatlar shartnomadan, o'zgartirish mumkin -->
        <div
          v-if="isCivilCancel"
          class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4"
        >
          <div
            v-if="store.payload.worker_position_id && contractFound !== null && !contractLoading"
            class="mb-3 rounded-lg border px-3 py-2 text-sm"
            :class="
              contractFound
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-warning/40 bg-warning/10 text-warning'
            "
          >
            {{
              $t(
                contractFound
                  ? 'commandPage.form_80.contract_found'
                  : 'commandPage.form_80.contract_not_found'
              )
            }}
          </div>
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12 md:col-span-4">
              <n-form-item
                :label="$t(`commandPage.form_80.civil_contract_number`)"
                path="civil_contract_number"
              >
                <n-input
                  v-model:value="store.payload.civil_contract_number"
                  :loading="contractLoading"
                  :placeholder="$t(`commandPage.form_80.civil_contract_number`)"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-4">
              <n-form-item
                :label="$t(`commandPage.form_80.civil_contract_date`)"
                path="civil_contract_date"
              >
                <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.civil_contract_date"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-4">
              <n-form-item
                :label="$t(`commandPage.form_80.civil_cancel_date`)"
                path="contract_to_date"
              >
                <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.contract_to_date"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
            <div class="col-span-12">
              <n-form-item :label="$t(`documentPage.form.cancel_reason`)" path="cancel_reason">
                <n-select
                  v-model:value="store.payload.cancel_reason"
                  :options="componentStore.reasonTypes"
                  :loading="componentStore.reasonTypeLoading"
                  label-field="name"
                  value-field="id"
                />
              </n-form-item>
            </div>
          </div>
        </div>
        <div
          class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4"
        >
          <n-form-item :label="$t(`documentPage.form.director`)" path="director_id">
            <n-select
              size="large"
              value-field="id"
              label-field="last_name"
              v-model:value="store.payload.director_id"
              :options="componentStore.confirmationList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderLabel"
              :render-tag="renderValue"
              @update:value="syncConfirmationEv"
            />
          </n-form-item>
        </div>
        <div
          class="col-span-12 pt-4 flex justify-center gap-2 items-center relative"
        >
          <n-divider dashed title-placement="left" class="w-full mt-1!">
            <div class="flex items-center gap-3">
              <n-switch
                v-model:value="store.payload.command_status"
                :disabled="Boolean(store.editId)"
              />
              <span class="text-primary font-medium">{{
                $t(`documentPage.form.command_status`)
              }}</span>
            </div>
          </n-divider>
        </div>
        <div
          v-if="store.payload.command_status"
          class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4"
        >
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12 md:col-span-6 lg:col-span-6">
              <n-form-item :label="$t(`documentPage.form.command_type`)" path="command_type">
                <n-select
                  :disabled="!Boolean(store.payload.type)"
                  v-model:value="store.payload.command_type"
                  filterable
                  :options="componentStore.commandTypeList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.commandTypeLoading"
                  clearable
                />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
              <n-form-item
                :label="$t(`documentPage.command.form.command_number`)"
                path="command_number"
              >
                <n-input class="w-full" type="text" v-model:value="store.payload.command_number" />
              </n-form-item>
            </div>
            <div class="col-span-12 md:col-span-6 lg:col-span-3">
              <n-form-item
                :label="$t(`documentPage.command.form.command_date`)"
                path="command_date"
              >
                <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.command_date"
                  type="date"
                  :format="useAppSetting.datePicketFormat"
                  :is-date-disabled="isDateDisabled"
                  :disabled="Boolean(store.editId)"
                />
              </n-form-item>
            </div>
            <template v-if="isCivilCancel">
              <div class="col-span-12 md:col-span-6 lg:col-span-4">
                <n-form-item
                  :label="$t(`commandPage.form_80.civil_contract_kind`)"
                  path="civil_contract_kind"
                >
                  <n-select v-model:value="store.payload.civil_contract_kind" :options="kindOptions" />
                </n-form-item>
              </div>
              <div class="col-span-12 md:col-span-6 lg:col-span-8">
                <n-form-item
                  :label="$t(`commandPage.form_80.hr_worker`)"
                  path="hr_worker_position_id"
                >
                  <SuperSelect
                    :disabled="!hrOrgId"
                    :options="hrOptions"
                    :loading="hrList.loading"
                    :total-count="hrList.total"
                    :per-page="hrPerPage"
                    v-model:value="store.payload.hr_worker_position_id"
                    v-model:search="hrList.search"
                    value-field="id"
                    @update:value="onChangeHr"
                    @onSearch="onSearchHr"
                    @onScrollEv="onScrollHr"
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
              <n-form-item :label="$t(`documentPage.command.form.confirm`)" path="confirmations">
                <n-select
                  :disabled="!store.payload.director_id"
                  size="large"
                  value-field="id"
                  multiple
                  v-model:value="store.payload.confirmations"
                  :options="confirmationList"
                  :loading="componentStore.confirmationLoading"
                  :render-label="renderLabel"
                  :render-tag="renderValue"
                  @update:value="onChangeConfirmation"
                />
              </n-form-item>
            </div>
            <!-- Buyruqlardagi (CommandSigners.vue) ko'rinish: yuborish tartibi almashtirgichi
                 izohi bilan, ro'yxat — umumiy UISignerList. Kelishuvda tanishuvchi yo'q. -->
            <div v-if="store.sortableConfirmations?.length" class="col-span-12 flex flex-col gap-2">
              <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
                <div class="text-xs text-textColor3 min-w-0 flex-1 basis-[260px] leading-snug">
                  {{
                    $t(
                      store.oneByOne
                        ? 'documentPage.command.form.route.sequentialHint'
                        : 'documentPage.command.form.route.parallelHint'
                    )
                  }}
                </div>
                <UISegmentTabs v-model="signMode" :tabs="modeTabs" class="shrink-0" />
              </div>
              <UISignerList
                :items="store.sortableConfirmations"
                :sequential="store.oneByOne"
                :allow-viewers="false"
                @update:items="onSignersUpdate"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-form>
</template>

<style scoped>
  /* Faqat ko'rish rejimi — maydonlar o'qiladi, lekin o'zgartirilmaydi. */
  .ad-contract-form--readonly {
    pointer-events: none;
  }
</style>
