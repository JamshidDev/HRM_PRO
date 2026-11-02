<script setup>
  import { useCommandFormStore } from '@/pages/docFlow/document/command/commandFormStore.js'
  import { SuperSelect } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'
  import { ArrowSyncCircle20Regular } from '@vicons/fluent'
  import { useDebounceFn } from '@vueuse/core'
  import ApiService from '@/service/ApiService.js'

  // 76 kasbga qayta tayyorlash · 77 malaka oshirish (masofadan) · 78 malaka oshirishga yuborish (hujjatgina).
  const store = useCommandFormStore()
  const formRef = ref(null)

  const showProfession = computed(() => store.payload.command_type === 76)
  const showActing = computed(() => store.payload.command_type !== 77)
  const periodKey = computed(() =>
    store.payload.command_type === 76 ? 'retraining' : 'qualification'
  )

  const options = reactive({ center: [], course: [], profession: [] })
  const loading = reactive({ center: false, course: false, profession: false })

  const load = (kind, search) => {
    const params = { kind, search: search || undefined }
    if (kind === 'course') {
      if (!store.form_76.learning_center_id) return
      params.learning_center_id = store.form_76.learning_center_id
    }
    loading[kind] = true
    ApiService.commandService
      ._trainingOptions({ params })
      .then((res) => {
        options[kind] = res.data.data
      })
      .finally(() => {
        loading[kind] = false
      })
  }
  // Vazifani vaqtincha bajaruvchi — shu korxona xodimlaridan (buyruqdagi xodimning o'zi chiqarilmaydi).
  const actings = reactive({ list: [], total: 0, loading: false, search: null, page: 1, reqId: 0 })
  const perPage = 100

  const actingOptions = computed(() => {
    const picked = store.form_76.acting_option
    const list = picked ? [picked, ...actings.list.filter((v) => v.id !== picked.id)] : actings.list
    return list.filter((v) => v.id !== store.payload.worker)
  })

  const loadActings = (infinity = false) => {
    const organizationId = store.workerParams.organization_id
    if (!organizationId) return
    const reqId = ++actings.reqId
    actings.loading = true
    ApiService.workerService
      ._search({
        params: {
          organization_id: organizationId,
          page: actings.page,
          per_page: perPage,
          search: actings.search
        }
      })
      .then((res) => {
        if (reqId !== actings.reqId) return
        const data = res.data.data.data.map((v) => ({
          id: v.id,
          name: `${v.worker.last_name} ${v.worker.first_name} ${v.worker.middle_name}`,
          position: v.position?.name || v?.post_name,
          photo: v.worker?.photo
        }))
        actings.total = res.data.data.total
        actings.list = infinity ? [...actings.list, ...data] : data
      })
      .finally(() => {
        if (reqId === actings.reqId) actings.loading = false
      })
  }

  const onSearchActing = (v) => {
    actings.page = 1
    actings.search = v
    loadActings()
  }
  const onScrollActing = () => {
    actings.page += 1
    loadActings(true)
  }
  const onChangeActing = (id) => {
    store.form_76.acting_option = actingOptions.value.find((v) => v.id === id) ?? null
  }

  // Korxona almashsa ro'yxat va tanlov yangilanadi.
  watch(
    () => store.workerParams.organization_id,
    (v, old) => {
      if (old !== undefined && v !== old) {
        store.form_76.acting_worker_position_id = null
        store.form_76.acting_option = null
      }
      actings.page = 1
      actings.search = null
      if (showActing.value) loadActings()
    },
    { immediate: true }
  )

  const searchCourse = useDebounceFn((v) => load('course', v), 400)
  const searchProfession = useDebounceFn((v) => load('profession', v), 400)

  const onCenterChange = (name) => {
    store.form_76.training_center = name
    store.form_76.learning_center_id = options.center.find((o) => o.name === name)?.id ?? null
    store.form_76.training_course = null
    options.course = []
    load('course')
  }

  // Ro'yxatdan qo'lda yozishga o'tganda tanlangan nom saqlanadi; teskarisida tozalanadi.
  const toggleManual = (field, key) => {
    store.form_76.manual[key] = !store.form_76.manual[key]
    if (!store.form_76.manual[key]) {
      store.form_76[field] = null
      if (key === 'center') store.form_76.learning_center_id = null
    }
  }

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          from: Utils.timeToZone(store.form_76.from),
          to: Utils.timeToZone(store.form_76.to),
          training_center: store.form_76.training_center,
          training_course: store.form_76.training_course,
          profession: showProfession.value ? store.form_76.profession : undefined,
          acting_worker_position_id: showActing.value
            ? store.form_76.acting_worker_position_id
            : undefined,
          telegram_number: store.form_76.telegram_number
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

  onMounted(() => {
    load('center')
    if (showProfession.value) load('profession')
    if (store.form_76.learning_center_id) load('course')
  })

  defineExpose({ onSubmit, validateForm })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_76"
    :rules="validationRules.form_76"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_76.from_${periodKey}`)" path="from">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_76.from"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_76.to_${periodKey}`)" path="to">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_76.to"
          type="date"
          :format="useAppSetting.datePicketFormat"
          :is-date-disabled="(ts) => Boolean(store.form_76.from) && ts < store.form_76.from"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6 @4xl:col-span-3">
      <n-form-item :label="$t(`commandPage.form_76.telegram_number`)" path="telegram_number">
        <n-input class="w-full" type="text" v-model:value="store.form_76.telegram_number" />
      </n-form-item>
    </div>
    <div v-if="showActing" class="col-span-12 @xl:col-span-6">
      <n-form-item
        :label="$t(`commandPage.form_76.acting_worker`)"
        path="acting_worker_position_id"
      >
        <SuperSelect
          :disabled="!store.workerParams.organization_id"
          :options="actingOptions"
          :loading="actings.loading"
          :total-count="actings.total"
          :per-page="perPage"
          v-model:value="store.form_76.acting_worker_position_id"
          v-model:search="actings.search"
          value-field="id"
          @update:value="onChangeActing"
          @onSearch="onSearchActing"
          @onScrollEv="onScrollActing"
        />
      </n-form-item>
    </div>

    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t(`commandPage.form_76.training_center`)" path="training_center">
        <n-input-group>
          <n-input
            v-if="store.form_76.manual.center"
            class="w-full"
            type="text"
            v-model:value="store.form_76.training_center"
          />
          <n-select
            v-else
            :value="store.form_76.training_center"
            :options="options.center"
            :loading="loading.center"
            label-field="name"
            value-field="name"
            filterable
            clearable
            @update:value="onCenterChange"
          />
          <n-tooltip>
            <template #trigger>
              <n-button type="primary" @click="toggleManual('training_center', 'center')">
                <template #icon>
                  <n-icon :size="22"><ArrowSyncCircle20Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{
              $t(
                store.form_76.manual.center
                  ? 'commandPage.form_76.toggle_list'
                  : 'commandPage.form_76.toggle_manual'
              )
            }}
          </n-tooltip>
        </n-input-group>
      </n-form-item>
    </div>
    <div class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t(`commandPage.form_76.training_course`)" path="training_course">
        <n-input-group>
          <n-input
            v-if="store.form_76.manual.course"
            class="w-full"
            type="text"
            v-model:value="store.form_76.training_course"
          />
          <n-select
            v-else
            v-model:value="store.form_76.training_course"
            :options="options.course"
            :loading="loading.course"
            :disabled="!store.form_76.learning_center_id"
            :placeholder="
              store.form_76.learning_center_id
                ? undefined
                : $t('commandPage.form_76.select_center_first')
            "
            label-field="name"
            value-field="name"
            filterable
            remote
            clearable
            @search="searchCourse"
          />
          <n-tooltip>
            <template #trigger>
              <n-button type="primary" @click="toggleManual('training_course', 'course')">
                <template #icon>
                  <n-icon :size="22"><ArrowSyncCircle20Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{
              $t(
                store.form_76.manual.course
                  ? 'commandPage.form_76.toggle_list'
                  : 'commandPage.form_76.toggle_manual'
              )
            }}
          </n-tooltip>
        </n-input-group>
      </n-form-item>
    </div>
    <div v-if="showProfession" class="col-span-12 @xl:col-span-6">
      <n-form-item :label="$t(`commandPage.form_76.profession`)" path="profession">
        <n-input-group>
          <n-input
            v-if="store.form_76.manual.profession"
            class="w-full"
            type="text"
            v-model:value="store.form_76.profession"
          />
          <n-select
            v-else
            v-model:value="store.form_76.profession"
            :options="options.profession"
            :loading="loading.profession"
            label-field="name"
            value-field="name"
            filterable
            remote
            clearable
            @search="searchProfession"
          />
          <n-tooltip>
            <template #trigger>
              <n-button type="primary" @click="toggleManual('profession', 'profession')">
                <template #icon>
                  <n-icon :size="22"><ArrowSyncCircle20Regular /></n-icon>
                </template>
              </n-button>
            </template>
            {{
              $t(
                store.form_76.manual.profession
                  ? 'commandPage.form_76.toggle_list'
                  : 'commandPage.form_76.toggle_manual'
              )
            }}
          </n-tooltip>
        </n-input-group>
      </n-form-item>
    </div>
  </n-form>
</template>
