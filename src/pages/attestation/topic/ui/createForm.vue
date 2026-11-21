<script setup>
  import { SuperSelect, UIDepartmentSelect, UINSelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'
  import { useTopicStore, useComponentStore, useAccountStore } from '@/store/modules/index.js'

  const { t } = i18n.global
  const formRef = ref(null)
  const store = useTopicStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  // Bo'linmalar faqat faol rol korxonasidan tanlanadi.
  const ownOrgId = computed(() => accStore.account?.organization?.id ?? null)

  // Global — faqat Admin (organization-admin); qolganlarini backend rol doirasi bo'yicha tekshiradi.
  const scopeOptions = computed(() =>
    [
      accStore.checkPermission(accStore.pn.organizationAdmin) && 'all',
      'local',
      'global',
      'department'
    ]
      .filter(Boolean)
      .map((value) => ({ value, label: t(`topicPage.scope_${value}`) }))
  )

  // Ekran ulashish va qat'iy tartib mobilda ishlamaydi.
  const mobileLocked = computed(
    () => store.payload.screen_share_required || store.payload.strict_mode
  )
  watch(mobileLocked, (v) => {
    if (v) store.payload.mobile_allowed = false
  })

  const settings = [
    { key: 'mobile_allowed', label: 'topicPage.mobileAllowed' },
    { key: 'camera_required', label: 'topicPage.cameraRequired' },
    { key: 'screen_share_required', label: 'topicPage.screenShareRequired' },
    { key: 'strict_mode', label: 'topicPage.strictMode' }
  ]

  // «Kimlarga» ro'yxatlari doiraga bog'liq — doira yoki bo'linmalar o'zgarsa qayta yuklanadi.
  const loadAudience = () => {
    if (store.payload.whom === 2) store._audiencePositions()
    else if (store.payload.whom === 3) {
      store.workerParams.page = 1
      store._audienceWorkers()
    }
  }
  const onWhomChange = () => {
    store.payload.whom_ids = []
    loadAudience()
  }
  watch(
    () => [store.payload.scope, store.payload.department_ids.join(',')],
    (_, old) => {
      if (!old || store.showLoading) return
      store.payload.whom_ids = []
      loadAudience()
    }
  )

  const onWorkerSearch = () => {
    store.workerParams.page = 1
    store._audienceWorkers()
  }
  const onWorkerScroll = () => {
    store.workerParams.page += 1
    store._audienceWorkers(true)
  }

  let pinTimer = null
  const onPinSearch = (v) => {
    if (v?.toString().length !== 17) return
    clearTimeout(pinTimer)
    pinTimer = setTimeout(() => store._checkWorker(v.split('-').join('')), 600)
  }

  // Faollashtirish faqat tahrirda va ichida kamida bitta imtihon bo'lsa.
  const canActivate = computed(() => !store.visibleType && store.examsCount > 0)

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  onMounted(() => {
    componentStore._enumExam()
  })

  // Saqlash tugmasi modal footer'ida (TopicPage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-spin :show="store.showLoading">
    <n-form
      ref="formRef"
      :rules="validationRules.topicPage"
      :model="store.payload"
      class="grid grid-cols-12 gap-x-4"
    >
      <n-form-item class="col-span-12 md:col-span-6" :label="$t(`content.name`)" path="name">
        <n-input
          type="text"
          v-model:value="store.payload.name"
          :placeholder="$t('content.enterField')"
        />
      </n-form-item>
      <n-form-item class="col-span-12 md:col-span-6" :label="$t(`content.type`)" path="type">
        <n-select
          v-model:value="store.payload.type"
          filterable
          :options="componentStore.topicTypes"
          label-field="name"
          value-field="id"
          :placeholder="$t('content.choose')"
          :loading="componentStore.enumExamLoading"
        />
      </n-form-item>

      <n-form-item class="col-span-12 md:col-span-6" :label="$t('topicPage.scope')" path="scope">
        <n-select
          v-model:value="store.payload.scope"
          :options="scopeOptions"
          :placeholder="$t('content.choose')"
        />
      </n-form-item>
      <n-form-item
        v-if="store.payload.scope === 'department'"
        class="col-span-12 md:col-span-6"
        :label="$t('topicPage.departments')"
        path="department_ids"
      >
        <UIDepartmentSelect
          v-model="store.payload.department_ids"
          :organization="ownOrgId"
          multiple
        />
      </n-form-item>

      <n-form-item class="col-span-12 md:col-span-6" :label="$t('topicPage.deadline')">
        <n-date-picker
          class="w-full"
          type="datetime"
          clearable
          format="dd.MM.yyyy HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          v-model:formatted-value="store.payload.deadline"
          :placeholder="$t('topicPage.noDeadline')"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12 md:col-span-6"
        :label="$t('topicDetailsPage.exams.chances')"
        path="chances"
      >
        <n-input-number class="w-full" :min="1" :max="10" v-model:value="store.payload.chances" />
      </n-form-item>

      <n-form-item class="col-span-12 md:col-span-6" :label="$t('topicDetailsPage.exams.toWhom')">
        <n-select
          v-model:value="store.payload.whom"
          :options="componentStore.topicWhomList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumExamLoading"
          :disabled="!store.payload.scope"
          @update:value="onWhomChange"
        />
      </n-form-item>
      <n-form-item
        v-if="store.payload.whom === 2"
        class="col-span-12 md:col-span-6"
        :label="$t('topicDetailsPage.exams.positions')"
        path="whom_ids"
      >
        <UINSelect
          multiple
          v-model:value="store.payload.whom_ids"
          :options="store.positionList"
          :loading="store.positionLoading"
          :max-tag-count="1"
          value-field="id"
        />
      </n-form-item>
      <n-form-item
        v-else-if="store.payload.whom === 3"
        class="col-span-12 md:col-span-6"
        :label="$t('topicDetailsPage.exams.workers')"
        path="whom_ids"
      >
        <SuperSelect
          multiple
          :options="store.workerList"
          :loading="store.workerLoading"
          :total-count="store.workerTotal"
          :per-page="store.workerParams.per_page"
          v-model:value="store.payload.whom_ids"
          v-model:search="store.workerParams.search"
          @onSearch="onWorkerSearch"
          @onScrollEv="onWorkerScroll"
        />
      </n-form-item>
      <n-form-item
        v-else-if="store.payload.whom === 5"
        class="col-span-12 md:col-span-6"
        :label="$t('topicDetailsPage.exams.workers')"
        path="whom_ids"
      >
        <UINSelect
          v-model:value="store.payload.whom_ids"
          value-field="id"
          :loading="store.checkWorkerLoading"
          :options="store.checkedWorkers"
          @onSearch="onPinSearch"
          multiple
          pin-select
        />
      </n-form-item>

      <n-form-item class="col-span-12" :label="$t('topicPage.settings')" :show-feedback="false">
        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          <div
            v-for="s in settings"
            :key="s.key"
            class="flex items-center justify-between gap-3 rounded-lg border border-surface-line px-3 py-2"
          >
            <span class="text-sm">{{ $t(s.label) }}</span>
            <n-switch
              v-model:value="store.payload[s.key]"
              :disabled="s.key === 'mobile_allowed' && mobileLocked"
            />
          </div>
          <div
            v-if="!store.visibleType"
            class="flex items-center justify-between gap-3 rounded-lg border border-surface-line px-3 py-2"
          >
            <span class="text-sm">{{ $t('content.status') }}</span>
            <n-switch v-model:value="store.payload.active" :disabled="!canActivate">
              <template #checked>{{ $t('content.active') }}</template>
              <template #unchecked>{{ $t('topicDetailsPage.exams.hidden') }}</template>
            </n-switch>
          </div>
        </div>
      </n-form-item>
    </n-form>
  </n-spin>
</template>
