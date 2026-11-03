<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { SuperSelect } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'
  import ApiService from '@/service/ApiService.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  // 80 — FXSH bekor qilish: ijrochi asosiy «Xodim» maydonida, shartnoma rekvizitlari avtomatik yoki qo'lda.
  const store = useCommandFormStore()
  const formRef = ref(null)

  const kindOptions = computed(() => [
    { label: t('commandPage.form_80.kind_contract'), value: 1 },
    { label: t('commandPage.form_80.kind_service'), value: 2 }
  ])

  const hrList = reactive({ list: [], total: 0, loading: false, search: null, page: 1, reqId: 0 })
  const perPage = 100

  const hrOptions = computed(() => {
    const picked = store.form_80.hr_option
    const list = picked ? [picked, ...hrList.list.filter((v) => v.id !== picked.id)] : hrList.list
    return list.filter((v) => v.id !== store.payload.worker)
  })

  const loadHr = (infinity = false) => {
    const organizationId = store.workerParams.organization_id
    if (!organizationId) return
    const reqId = ++hrList.reqId
    hrList.loading = true
    ApiService.workerService
      ._search({
        params: { organization_id: organizationId, page: hrList.page, per_page: perPage, search: hrList.search }
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
    store.form_80.hr_option = hrOptions.value.find((v) => v.id === id) ?? null
  }

  watch(
    () => store.workerParams.organization_id,
    (v, old) => {
      if (old !== undefined && v !== old) {
        store.form_80.hr_worker_position_id = null
        store.form_80.hr_option = null
      }
      hrList.page = 1
      hrList.search = null
      loadHr()
    },
    { immediate: true }
  )

  // Xodim tanlanganda FXSH shartnomasi bo'lsa raqam va sana to'ldiriladi, bo'lmasa HR o'zi kiritadi.
  const contractLoading = ref(false)
  const contractFound = ref(null)
  watch(
    () => store.payload.worker,
    (wpId, old) => {
      if (!wpId) {
        contractFound.value = null
        return
      }
      // Tahrirda tiklangan qiymatlar birinchi yuklashda ustidan yozilmaydi.
      if (old === undefined && (store.form_80.civil_contract_number || store.form_80.civil_contract_date)) return
      contractLoading.value = true
      ApiService.commandService
        ._civilContract({ params: { worker_position_id: wpId } })
        .then((res) => {
          if (store.payload.worker !== wpId) return
          const c = res.data.data
          contractFound.value = Boolean(c)
          store.form_80.civil_contract_number = c?.number ?? null
          store.form_80.civil_contract_date = c?.contract_date ? new Date(c.contract_date).getTime() : null
        })
        .catch(() => {
          contractFound.value = false
        })
        .finally(() => {
          contractLoading.value = false
        })
    },
    { immediate: true }
  )

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          civil_contract_number: store.form_80.civil_contract_number,
          civil_contract_date: Utils.timeToZone(store.form_80.civil_contract_date),
          civil_cancel_date: Utils.timeToZone(store.form_80.civil_cancel_date),
          civil_contract_kind: store.form_80.civil_contract_kind,
          hr_worker_position_id: store.form_80.hr_worker_position_id
        }
      } else {
        data = null
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
    :model="store.form_80"
    :rules="validationRules.form_80"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div v-if="store.payload.worker && contractFound !== null && !contractLoading" class="col-span-12 mb-3">
      <div
        v-if="contractFound"
        class="rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
      >
        {{ $t('commandPage.form_80.contract_found') }}
      </div>
      <div v-else class="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
        {{ $t('commandPage.form_80.contract_not_found') }}
      </div>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_80.civil_contract_number`)" path="civil_contract_number">
        <n-input
          v-model:value="store.form_80.civil_contract_number"
          :loading="contractLoading"
          :placeholder="$t('commandPage.form_80.civil_contract_number')"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_80.civil_contract_date`)" path="civil_contract_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_80.civil_contract_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_80.civil_contract_kind`)" path="civil_contract_kind">
        <n-select v-model:value="store.form_80.civil_contract_kind" :options="kindOptions" />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_80.civil_cancel_date`)" path="civil_cancel_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_80.civil_cancel_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t(`commandPage.form_80.hr_worker`)" path="hr_worker_position_id">
        <SuperSelect
          :disabled="!store.workerParams.organization_id"
          :options="hrOptions"
          :loading="hrList.loading"
          :total-count="hrList.total"
          :per-page="perPage"
          v-model:value="store.form_80.hr_worker_position_id"
          v-model:search="hrList.search"
          value-field="id"
          @update:value="onChangeHr"
          @onSearch="onSearchHr"
          @onScrollEv="onScrollHr"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
