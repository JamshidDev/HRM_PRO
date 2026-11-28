<script setup>
  // Ariza havolasi (tizimga kirishsiz): xodim tanlanadi, ariza to'ldiriladi, so'ng E-IMZO imzo sahifasiga o'tiladi.
  import { useRoute, useRouter } from 'vue-router'
  import { selectWrap } from '@/utils/selectWrap.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import LinkSchemaForm from './ui/LinkSchemaForm.vue'
  import { Clock20Regular, Building20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const route = useRoute()
  const router = useRouter()
  const api = $ApiService.applicationLinkService
  const token = route.params.token

  const loading = ref(true)
  const error = ref(null)
  const info = ref(null)
  const schema = ref(null)
  const left = ref(0)
  let timer = null

  const errMessage = (e) => e?.response?.data?.message || t('applicationLink.loadError')

  const stopTimer = () => timer && clearInterval(timer)
  const startTimer = (seconds) => {
    left.value = seconds
    stopTimer()
    timer = setInterval(() => {
      left.value = Math.max(0, left.value - 1)
      if (left.value === 0) {
        stopTimer()
        error.value = t('applicationLink.expired')
      }
    }, 1000)
  }
  const leftText = computed(() => {
    const m = Math.floor(left.value / 60)
    const s = left.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  onMounted(async () => {
    try {
      const [i, s] = await Promise.all([api._info(token), api._schema(token)])
      info.value = i.data.data
      schema.value = s.data.data.application_schema
      startTimer(info.value.expires_in)
      if (info.value.type) form.type = info.value.type.id
    } catch (e) {
      error.value = errMessage(e)
    } finally {
      loading.value = false
    }
  })
  onBeforeUnmount(stopTimer)

  // ---- Xodim: F.I.Sh. yoki telefon ----
  const workerOptions = ref([])
  const workerLoading = ref(false)
  let searchTimer = null
  const onWorkerSearch = (q) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(async () => {
      if (!q || q.trim().length < 3) {
        workerOptions.value = []
        return
      }
      workerLoading.value = true
      try {
        const res = await api._workers(token, q)
        workerOptions.value = (res.data.data ?? []).map((w) => ({ value: w.id, label: w.name }))
      } catch (e) {
        error.value = errMessage(e)
      } finally {
        workerLoading.value = false
      }
    }, 350)
  }

  const form = reactive({ worker_id: null, type: null, worker_position_id: null })
  const data = reactive({})
  const positions = ref([])

  watch(
    () => form.worker_id,
    async (id) => {
      positions.value = []
      form.worker_position_id = null
      if (!id) return
      try {
        const res = await api._positions(token, id)
        positions.value = (res.data.data ?? []).map((p) => ({ value: p.id, label: p.post_short_name || p.post_name }))
        form.worker_position_id = positions.value[0]?.value ?? null
      } catch (e) {
        error.value = errMessage(e)
      }
    }
  )
  watch(
    () => form.type,
    () => Object.keys(data).forEach((k) => delete data[k])
  )

  const typeOptions = computed(() =>
    (schema.value?.groups ?? []).map((g) => ({
      type: 'group',
      key: `g${g.id}`,
      label: g.name,
      children: (schema.value?.types ?? []).filter((x) => x.group === g.id).map((x) => ({ value: x.id, label: x.name }))
    }))
  )
  const typeDef = computed(() => schema.value?.types?.find((x) => x.id === form.type) ?? null)

  const loadChildren = async () => (form.worker_id ? (await api._children(token, form.worker_id)).data.data : [])
  const loadNotices = async (types) =>
    form.worker_id ? (await api._notices(token, form.worker_id, types)).data.data : []

  const formRef = ref(null)
  // Hamma majburiy ma'lumot to'ldirilgandagina «Tasdiqlash» faol.
  const canSubmit = computed(
    () =>
      !!form.worker_id &&
      !!form.type &&
      !!form.worker_position_id &&
      !!typeDef.value &&
      formRef.value?.isComplete === true
  )
  const saving = ref(false)
  const missing = ref({})
  const submit = async () => {
    missing.value = {
      worker_id: !form.worker_id,
      type: !form.type,
      worker_position_id: !form.worker_position_id
    }
    const okSchema = formRef.value?.validate() ?? true
    if (Object.values(missing.value).some(Boolean) || !okSchema) return
    saving.value = true
    try {
      const res = await api._store(token, form.worker_id, {
        type: form.type,
        worker_position_id: form.worker_position_id,
        data: { ...data }
      })
      // Qoralama saqlandi — E-IMZO bilan imzolash sahifasi (imzolansa HR'ga yuboriladi).
      router.push({
        path: `${AppPaths.DocumentViewer}/${Utils.viewerStatus.signatureDocument}`,
        query: { token: res.data.data.sign_token, from: 'link' }
      })
    } catch (e) {
      // Xato oynasi axios interceptor'da ko'rsatiladi.
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <div class="link-bg flex min-h-screen w-full justify-center px-4 py-8">
    <div class="w-full max-w-[720px]">
      <n-spin :show="loading">
        <!-- Havola yaroqsiz / muddati tugagan -->
        <div v-if="error" class="link-card p-8 text-center">
          <n-icon size="40" class="text-warning"><Clock20Regular /></n-icon>
          <h2 class="mt-3 text-lg font-semibold text-textColor0">{{ $t('applicationLink.unavailable') }}</h2>
          <p class="mt-2 text-sm text-textColor2">{{ error }}</p>
        </div>

        <template v-else-if="info">
          <div class="link-card mb-4 flex flex-wrap items-center justify-between gap-3 p-5">
            <div class="min-w-0">
              <div class="text-xs font-semibold uppercase tracking-wide text-textColor3">{{ $t('applicationLink.title') }}</div>
              <div class="mt-1 flex items-center gap-1.5 text-base font-semibold text-textColor0">
                <n-icon size="18" class="text-primary"><Building20Regular /></n-icon>
                <span class="truncate">{{ info.organization?.name }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold" :class="left < 120 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'">
              <n-icon size="18"><Clock20Regular /></n-icon>
              {{ leftText }}
            </div>
          </div>

          <div class="link-card p-5 sm:p-6">
            <n-form label-placement="top">
              <n-form-item :label="$t('applicationLink.worker')" :show-require-mark="true" :validation-status="missing.worker_id ? 'error' : undefined" :feedback="missing.worker_id ? $t('rules.requiredField') : undefined">
                <n-select
                  v-bind="selectWrap"
                  v-model:value="form.worker_id"
                  filterable
                  remote
                  clearable
                  :options="workerOptions"
                  :loading="workerLoading"
                  :placeholder="$t('applicationLink.workerPlaceholder')"
                  @search="onWorkerSearch"
                />
              </n-form-item>

              <n-form-item :label="$t('applicationPage.form.type')" :show-require-mark="true" :validation-status="missing.type ? 'error' : undefined" :feedback="missing.type ? $t('rules.requiredField') : undefined">
                <n-input v-if="info.type" :value="info.type.name" readonly />
                <n-select v-else v-bind="selectWrap" v-model:value="form.type" filterable :options="typeOptions" />
              </n-form-item>

              <n-form-item v-if="form.worker_id" :label="$t('applicationLink.position')" :show-require-mark="true" :validation-status="missing.worker_position_id ? 'error' : undefined" :feedback="missing.worker_position_id ? $t('rules.requiredField') : undefined">
                <n-select v-bind="selectWrap" v-model:value="form.worker_position_id" :options="positions" />
              </n-form-item>

              <LinkSchemaForm
                v-if="typeDef && form.worker_id"
                :key="`${form.type}-${form.worker_id}`"
                ref="formRef"
                :def="typeDef"
                :data="data"
                :load-children="loadChildren"
                :load-notices="loadNotices"
              />
            </n-form>

            <div class="mt-4">
              <n-button type="primary" size="large" block :loading="saving" :disabled="!canSubmit" @click="submit">
                {{ $t('applicationLink.submit') }}
              </n-button>
            </div>
          </div>
        </template>
      </n-spin>
    </div>
  </div>
</template>

<style scoped>
  .link-bg {
    background:
      radial-gradient(1200px 380px at 50% -60px, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 70%),
      var(--color-surface-ground);
  }
  /* Tanlangan qiymat bitta qatorda, sig'masa «…» */
  .link-card :deep(.n-base-selection-label),
  .link-card :deep(.n-base-selection-input__content),
  .link-card :deep(.n-base-selection-input) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .link-card {
    border: 1px solid var(--color-surface-line);
    border-radius: 20px;
    background: var(--color-surface-section);
  }
</style>
