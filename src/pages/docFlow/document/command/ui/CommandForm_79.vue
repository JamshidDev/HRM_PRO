<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { SuperSelect } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'
  import ApiService from '@/service/ApiService.js'

  // 79 — Murabbiylik: shogird asosiy «Xodim» maydonida, murabbiy shu korxona xodimlaridan (hujjatgina).
  const store = useCommandFormStore()
  const formRef = ref(null)

  const mentors = reactive({ list: [], total: 0, loading: false, search: null, page: 1, reqId: 0 })
  const perPage = 100

  const mentorOptions = computed(() => {
    const picked = store.form_79.mentor_option
    const list = picked ? [picked, ...mentors.list.filter((v) => v.id !== picked.id)] : mentors.list
    return list.filter((v) => v.id !== store.payload.worker)
  })

  const loadMentors = (infinity = false) => {
    const organizationId = store.workerParams.organization_id
    if (!organizationId) return
    const reqId = ++mentors.reqId
    mentors.loading = true
    ApiService.workerService
      ._search({
        params: {
          organization_id: organizationId,
          page: mentors.page,
          per_page: perPage,
          search: mentors.search
        }
      })
      .then((res) => {
        if (reqId !== mentors.reqId) return
        const data = res.data.data.data.map((v) => ({
          id: v.id,
          name: `${v.worker.last_name} ${v.worker.first_name} ${v.worker.middle_name}`,
          position: v.position?.name || v?.post_name,
          photo: v.worker?.photo
        }))
        mentors.total = res.data.data.total
        mentors.list = infinity ? [...mentors.list, ...data] : data
      })
      .finally(() => {
        if (reqId === mentors.reqId) mentors.loading = false
      })
  }

  const onSearchMentor = (v) => {
    mentors.page = 1
    mentors.search = v
    loadMentors()
  }
  const onScrollMentor = () => {
    mentors.page += 1
    loadMentors(true)
  }
  const onChangeMentor = (id) => {
    store.form_79.mentor_option = mentorOptions.value.find((v) => v.id === id) ?? null
  }

  // Korxona almashsa murabbiy ro'yxati va tanlovi yangilanadi.
  watch(
    () => store.workerParams.organization_id,
    (v, old) => {
      if (old !== undefined && v !== old) {
        store.form_79.mentor_worker_position_id = null
        store.form_79.mentor_option = null
      }
      mentors.page = 1
      mentors.search = null
      loadMentors()
    },
    { immediate: true }
  )

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          mentor_worker_position_id: store.form_79.mentor_worker_position_id,
          mentor_date: Utils.timeToZone(store.form_79.mentor_date),
          from: Utils.timeToZone(store.form_79.from),
          to: Utils.timeToZone(store.form_79.to),
          mentor_percent: store.form_79.mentor_percent
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
    :model="store.form_79"
    :rules="validationRules.form_79"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t(`commandPage.form_79.mentor`)" path="mentor_worker_position_id">
        <SuperSelect
          :disabled="!store.workerParams.organization_id"
          :options="mentorOptions"
          :loading="mentors.loading"
          :total-count="mentors.total"
          :per-page="perPage"
          v-model:value="store.form_79.mentor_worker_position_id"
          v-model:search="mentors.search"
          value-field="id"
          @update:value="onChangeMentor"
          @onSearch="onSearchMentor"
          @onScrollEv="onScrollMentor"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_79.mentor_date`)" path="mentor_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_79.mentor_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_79.mentor_percent`)" path="mentor_percent">
        <n-input-number
          class="w-full"
          v-model:value="store.form_79.mentor_percent"
          :min="1"
          :max="100"
          :precision="0"
          :show-button="false"
        >
          <template #suffix>%</template>
        </n-input-number>
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_79.from`)" path="from">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_79.from"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_79.to`)" path="to">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_79.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
          :is-date-disabled="(ts) => Boolean(store.form_79.from) && ts < store.form_79.from"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
