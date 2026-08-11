<script setup>
  import { UISelect, SuperSelect } from '@/components/index.js'
  import { useComponentStore, useTaskStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useTaskStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const statusOptions = computed(() => [
    { label: t('task.status.created'), value: 1 },
    { label: t('task.status.in_progress'), value: 2 },
    { label: t('task.status.done'), value: 3 },
    { label: t('task.status.blocked'), value: 4 }
  ])

  // n-date-picker ms bilan ishlaydi; payload.deadline esa doim 'YYYY-MM-DD HH:mm:ss'
  // string (backend shuni kutadi). Computed ikki tomonlama aylantiradi — formatted-value
  // quirk'siz (create ham, edit oldindan to'ldirish ham ishonchli).
  const fmtDb = (ms) => {
    const d = new Date(ms)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`
  }
  const deadlineTs = computed({
    get: () =>
      store.payload.deadline ? new Date(store.payload.deadline.replace(' ', 'T')).getTime() : null,
    set: (ms) => {
      store.payload.deadline = ms ? fmtDb(ms) : null
    }
  })

  onMounted(() => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  })

  // Edit drawer/modal ochilганda — tanlangan korxona bo'yicha xodimlarni yuklashga tayyorla.
  watch(
    () => store.visible,
    (v) => {
      if (v && !store.visibleType && store.payload.organization_id?.[0]) {
        componentStore.workerParams.organization_id = store.payload.organization_id[0].id
      }
    }
  )

  // Xodim opsiyalari — value = workers.id (backend shuni kutadi). worker.id bo'yicha dedup.
  const workerOptions = computed(() => {
    const base = componentStore.workerList.map((w) => ({
      id: w.worker?.id ?? w.id,
      name: w.name,
      photo: w.photo,
      position: w.position
    }))
    const merged = [...store.editAssignees.map((e) => ({ id: e.value, name: e.label })), ...base]
    const seen = new Set()
    const out = []
    for (const o of merged) {
      if (o.id != null && !seen.has(o.id)) {
        seen.add(o.id)
        out.push(o)
      }
    }
    return out
  })

  const onChangeStructure = (v) => {
    store.payload.organization_id = v
    store.payload.worker_ids = []
    componentStore.workerList = []
    componentStore.workerParams.search = null
    componentStore.workerParams.page = 1
    componentStore.workerParams.organization_id = v.length > 0 ? v[0].id : null
    if (v.length > 0) componentStore._workers()
  }
  const onDefaultVal = (v) => {
    store.payload.organization_id = v
    componentStore.workerParams.organization_id = v[0]?.id
  }
  const onWorkerSearch = (val) => {
    componentStore.workerParams.page = 1
    componentStore.workerParams.search = val
    componentStore._workers()
  }
  const onWorkerScroll = () => {
    if (
      !componentStore.workerLoading &&
      componentStore.totalWorker > componentStore.workerList.length
    ) {
      componentStore.workerParams.page += 1
      componentStore._workers(true)
    }
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      if (store.visibleType) store._create()
      else store._update()
    })
  }
</script>

<template>
  <n-form ref="formRef" :model="store.payload" :rules="validationRules.common">
    <!-- Korxona — faqat yaratishda (update'da o'zgarmaydi) -->
    <n-form-item
      v-if="store.visibleType"
      :label="$t('content.organization')"
      path="organization_id"
      :rule="validationRules.common.requiredMultiSelectField"
    >
      <UISelect
        :options="componentStore.structureList"
        :modelV="store.payload.organization_id"
        @defaultValue="onDefaultVal"
        @updateModel="onChangeStructure"
        :checkedVal="store.structureCheck"
        @updateCheck="(v) => (store.structureCheck = v)"
        v-model:search="componentStore.structureParams.search"
        @onSearch="componentStore._structures"
        :loading="componentStore.structureLoading"
        :multiple="false"
        :auto-select="true"
      />
    </n-form-item>

    <!-- Bajaruvchilar (bir yoki bir nechta) — SuperSelect (buyruqlar sahifasidagidek) -->
    <n-form-item
      :label="$t('content.worker')"
      path="worker_ids"
      :rule="validationRules.common.requiredMultiSelectField"
    >
      <SuperSelect
        multiple
        :max-tag-count="2"
        :disabled="store.visibleType && store.payload.organization_id.length === 0"
        :options="workerOptions"
        :loading="componentStore.workerLoading"
        :total-count="componentStore.totalWorker"
        :per-page="componentStore.workerParams.per_page"
        v-model:value="store.payload.worker_ids"
        v-model:search="componentStore.workerParams.search"
        value-field="id"
        label-field="name"
        @onSearch="onWorkerSearch"
        @onScrollEv="onWorkerScroll"
      />
    </n-form-item>

    <!-- Sarlavha -->
    <n-form-item
      :label="$t('content.title')"
      path="title"
      :rule="validationRules.common.requiredStringField"
    >
      <n-input v-model:value="store.payload.title" :placeholder="$t('content.title')" />
    </n-form-item>

    <!-- Tavsif -->
    <n-form-item :label="$t('content.description')" path="description">
      <n-input
        v-model:value="store.payload.description"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 6 }"
        :placeholder="$t('content.description')"
      />
    </n-form-item>

    <!-- Boshlang'ich holat — faqat yaratishda -->
    <n-form-item v-if="store.visibleType" :label="$t('task.table.status')" path="status">
      <n-select
        v-model:value="store.payload.status"
        :options="statusOptions"
        label-field="label"
        value-field="value"
      />
    </n-form-item>

    <!-- Muddat (ixtiyoriy) -->
    <n-form-item :label="$t('task.table.deadline')" path="deadline">
      <n-date-picker
        class="w-full"
        v-model:value="deadlineTs"
        type="datetime"
        format="yyyy-MM-dd HH:mm"
        :update-value-on-close="true"
        clearable
      />
    </n-form-item>

    <div class="grid grid-cols-2 gap-2 mt-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
