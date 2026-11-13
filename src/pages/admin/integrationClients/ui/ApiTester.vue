<script setup>
  // Integratsiya API tester: mijoz kalitlari bilan haqiqiy imzoli so'rov yuborib, qaysi API ishlashini ko'rsatadi.
  import { UIModal } from '@/components/index.js'
  import {
    Copy16Regular,
    Eye20Regular,
    LockClosed16Regular,
    EyeOff20Regular,
    Play20Regular,
    Search20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const props = defineProps({
    visible: { type: Boolean, default: false },
    // Qatordan ochilganda: { id, name, public_key }.
    client: { type: Object, default: null }
  })
  const emits = defineEmits(['update:visible'])

  const API_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

  const publicKey = ref('')
  const secretKey = ref('')
  const showSecret = ref(false)
  const catalog = ref([])
  const catalogLoading = ref(false)
  const query = ref('')
  const selectedKey = ref(null)
  // key → { status, ms, ok, data, error }
  const results = ref({})
  // key → { params: {name: value}, body: string }
  const forms = ref({})
  const sending = ref(false)

  const keyOf = (e) => `${e.method} ${e.path}`
  const selected = computed(() => catalog.value.find((e) => keyOf(e) === selectedKey.value) ?? null)

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return catalog.value.filter(
      (e) => !q || [e.path, e.summary, e.tag, e.permission].some((v) => String(v ?? '').toLowerCase().includes(q))
    )
  })

  const groups = computed(() => {
    const map = new Map()
    for (const e of filtered.value) {
      const tag = String(e.tag || '—').replace(/^Integration\s*\/\s*/i, '')
      if (!map.has(tag)) map.set(tag, [])
      map.get(tag).push(e)
    }
    return [...map.entries()].map(([tag, items]) => ({ tag, items }))
  })

  const ensureForm = (e) => {
    const k = keyOf(e)
    if (!forms.value[k]) {
      const params = {}
      for (const p of e.params) params[p.name] = p.example != null ? String(p.example) : ''
      forms.value[k] = {
        params,
        body: e.body != null ? JSON.stringify(e.body, null, 2) : ''
      }
    }
    return forms.value[k]
  }

  const form = computed(() => (selected.value ? ensureForm(selected.value) : null))

  const loadCatalog = async () => {
    if (catalog.value.length) return
    catalogLoading.value = true
    try {
      const res = await $ApiService.integrationClientsService._apiCatalog()
      catalog.value = res.data.data ?? []
      if (catalog.value.length && !selectedKey.value) selectedKey.value = keyOf(catalog.value[0])
    } finally {
      catalogLoading.value = false
    }
  }

  // Ochilganda: katalog + (qatordan bo'lsa) mijoz kalitlari.
  watch(
    () => props.visible,
    async (v) => {
      if (!v) return
      results.value = {}
      loadCatalog()
      if (props.client?.id) {
        publicKey.value = props.client.public_key ?? ''
        secretKey.value = ''
        try {
          const res = await $ApiService.integrationClientsService._secret(props.client.id)
          secretKey.value = res.data.data?.secret_key ?? ''
          await nextTick()
          checkKeys()
        } catch {
          secretKey.value = ''
        }
      }
    }
  )

  // X-SIGNATURE = hex(HMAC-SHA256(secret, X-TIMESTAMP)) — backend IntegrationClientGuard bilan bir xil.
  const hmacHex = async (secret, message) => {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
      'sign'
    ])
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  const nonce = () =>
    [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('')

  const buildUrl = (e, f) => {
    let path = e.path
    const qs = new URLSearchParams()
    for (const p of e.params) {
      const v = String(f.params[p.name] ?? '').trim()
      if (p.in === 'path') path = path.replace(`{${p.name}}`, encodeURIComponent(v))
      else if (v !== '') qs.append(p.name, v)
    }
    const q = qs.toString()
    return `${API_URL}${path}${q ? `?${q}` : ''}`
  }

  const missingPathParam = (e, f) =>
    e.params.some((p) => p.in === 'path' && !String(f.params[p.name] ?? '').trim())

  // Imzoli so'rov: { status, ok, ms, data } yoki tarmoq xatosida { status: 0, error }.
  const signedRequest = async (method, url, body) => {
    const ts = String(Math.floor(Date.now() / 1000))
    const headers = {
      Accept: 'application/json',
      'Accept-Language': 'uz',
      'X-Auth-Type': 'integration',
      'X-PUBLIC-KEY': publicKey.value.trim(),
      'X-TIMESTAMP': ts,
      'X-SIGNATURE': await hmacHex(secretKey.value.trim(), ts),
      'X-HMAC-VERSION': 'v2',
      'X-NONCE': nonce()
    }
    if (body) headers['Content-Type'] = 'application/json'
    const started = performance.now()
    try {
      const res = await fetch(url, { method, headers, body })
      const text = await res.text()
      let data = text
      try {
        data = JSON.parse(text)
      } catch {
        /* JSON emas — matn ko'rsatiladi */
      }
      return { status: res.status, ok: res.ok, ms: Math.round(performance.now() - started), data }
    } catch (err) {
      return { status: 0, ok: false, ms: Math.round(performance.now() - started), error: String(err?.message ?? err) }
    }
  }

  const send = async (e) => {
    const f = ensureForm(e)
    const k = keyOf(e)
    if (missingPathParam(e, f)) {
      results.value[k] = { status: -1, ok: false, error: t('integrationClients.tester.needPathParam') }
      return
    }
    let body
    if (e.method !== 'GET' && f.body.trim()) {
      try {
        body = JSON.stringify(JSON.parse(f.body))
      } catch {
        results.value[k] = { status: -1, ok: false, error: t('integrationClients.tester.badJson') }
        return
      }
    }
    results.value[k] = await signedRequest(e.method, buildUrl(e, f), body)
  }

  // Kalitlarni tekshirish va mijoz rolini aniqlash — /integration/me (ruxsat talab qilmaydi).
  const identity = ref({ state: 'idle', data: null, message: '' })
  let identityReq = 0
  const checkKeys = async () => {
    if (!publicKey.value.trim() || !secretKey.value.trim()) {
      identity.value = { state: 'idle', data: null, message: '' }
      return
    }
    const id = ++identityReq
    identity.value = { state: 'checking', data: null, message: '' }
    const r = await signedRequest('GET', `${API_URL}/api/v1/integration/me`)
    if (id !== identityReq) return
    identity.value = r.ok
      ? { state: 'valid', data: r.data?.data ?? null, message: '' }
      : {
          state: 'invalid',
          data: null,
          message: (typeof r.data === 'object' && r.data?.message) || r.error || `HTTP ${r.status}`
        }
  }
  // Kalit o'zgarsa eski natija amal qilmaydi — qayta «Tekshirish» kerak.
  watch([publicKey, secretKey], () => {
    if (identity.value.state !== 'checking') identity.value = { state: 'idle', data: null, message: '' }
  })

  // Mijoz rolida endpoint ruxsati yo'q (kalit to'g'ri bo'lsa ma'lum bo'ladi).
  const permissionSet = computed(() => new Set(identity.value.data?.permissions ?? []))
  const lacksPermission = (e) =>
    identity.value.state === 'valid' && Boolean(e.permission) && !permissionSet.value.has(e.permission)

  const canSend = computed(() => publicKey.value.trim() && secretKey.value.trim())

  const onSend = async () => {
    if (!selected.value || !canSend.value) return
    sending.value = true
    try {
      await send(selected.value)
    } finally {
      sending.value = false
    }
  }

  // Natija turi: green — ishlaydi; amber — javob berdi, lekin parametr kerak; red — ishlamadi.
  const tone = (r) => {
    if (!r) return null
    if (r.status >= 200 && r.status < 300) return 'green'
    if ([400, 404, 422].includes(r.status) || r.status === -1) return 'amber'
    return 'red'
  }

  const diagnosis = (r) => {
    if (!r) return ''
    if (r.status === -1) return r.error
    if (r.status === 0) return t('integrationClients.tester.diag.network')
    if (r.status >= 200 && r.status < 300) return t('integrationClients.tester.diag.ok')
    const known = [400, 401, 403, 404, 422, 429]
    if (known.includes(r.status)) return t(`integrationClients.tester.diag.s${r.status}`)
    return t('integrationClients.tester.diag.server')
  }

  const copy = (text) => Utils.copyToClipboard(text, () => $Toast.success(t('content.copied')))

  const selectedResult = computed(() => (selected.value ? results.value[keyOf(selected.value)] : null))
  const pretty = (d) => (typeof d === 'string' ? d : JSON.stringify(d, null, 2))
</script>

<template>
  <UIModal
    :visible="visible"
    width="min(1320px, 96vw)"
    height="86vh"
    compact
    :title="$t('integrationClients.tester.title') + (client?.name ? ` — ${client.name}` : '')"
    @update:visible="(v) => emits('update:visible', v)"
  >
    <div class="at">
      <!-- Kalitlar va umumiy tekshiruv. -->
      <div class="at__top">
        <label class="at__field">
          <span class="at__label">{{ $t('integrationClients.clients.publicKey') }}</span>
          <n-input v-model:value="publicKey" clearable class="at__mono" />
        </label>
        <label class="at__field">
          <span class="at__label">{{ $t('integrationClients.tester.secretKey') }}</span>
          <n-input v-model:value="secretKey" :type="showSecret ? 'text' : 'password'" class="at__mono">
            <template #suffix>
              <n-icon class="cursor-pointer" @click="showSecret = !showSecret">
                <EyeOff20Regular v-if="showSecret" />
                <Eye20Regular v-else />
              </n-icon>
            </template>
          </n-input>
        </label>
        <n-button type="primary" :disabled="!canSend" :loading="identity.state === 'checking'" @click="checkKeys">
          {{ $t('integrationClients.tester.check') }}
        </n-button>
      </div>

      <div v-if="identity.state !== 'idle'" class="at__identity" :class="`at__identity--${identity.state}`">
        <template v-if="identity.state === 'checking'">
          <n-spin size="small" /> {{ $t('integrationClients.tester.checking') }}
        </template>
        <template v-else-if="identity.state === 'valid'">
          <b>{{ $t('integrationClients.tester.keysValid') }}</b>
          <span>{{ identity.data?.name }}</span>
          <span class="at__chip">{{ $t('integrationClients.tester.role') }}: {{ identity.data?.role?.name ?? '—' }}</span>
          <span class="at__chip">
            {{ $t('integrationClients.tester.permissionsCount', { n: identity.data?.permissions?.length ?? 0 }) }}
          </span>
          <span class="at__chip">
            {{
              identity.data?.scope_mode === 'all'
                ? $t('integrationClients.tester.scopeAll')
                : $t('integrationClients.tester.scopeOrgs', { n: identity.data?.organizations?.length ?? 0 })
            }}
          </span>
          <span v-if="identity.data?.is_active === false" class="at__chip at__chip--red">
            {{ $t('integrationClients.tester.inactive') }}
          </span>
        </template>
        <template v-else>
          <b>{{ $t('integrationClients.tester.keysInvalid') }}</b>
          <span>{{ identity.message }}</span>
        </template>
      </div>

      <div class="at__body">
        <aside class="at__list">
          <n-input v-model:value="query" size="small" clearable :placeholder="$t('content.search')">
            <template #prefix><n-icon><Search20Regular /></n-icon></template>
          </n-input>
          <n-spin :show="catalogLoading" class="at__scroll">
            <section v-for="g in groups" :key="g.tag" class="at__group">
              <div class="at__group-title">{{ g.tag }}</div>
              <button
                v-for="e in g.items"
                :key="keyOf(e)"
                type="button"
                class="at__item"
                :class="{ 'at__item--active': keyOf(e) === selectedKey }"
                @click="selectedKey = keyOf(e)"
              >
                <span class="at__method" :class="`at__method--${e.method.toLowerCase()}`">{{ e.method }}</span>
                <span class="at__path">{{ e.path.replace('/api/v1/integration', '') || '/' }}</span>
                <span v-if="lacksPermission(e)" class="at__lock" :title="$t('integrationClients.tester.noPermission')">
                  <n-icon :size="13"><LockClosed16Regular /></n-icon>
                </span>
                <span v-if="results[keyOf(e)]" class="at__code" :class="`at__code--${tone(results[keyOf(e)])}`">
                  {{ results[keyOf(e)].status > 0 ? results[keyOf(e)].status : '!' }}
                </span>
              </button>
            </section>
            <n-empty v-if="!groups.length && !catalogLoading" size="small" class="mt-6" />
          </n-spin>
        </aside>

        <section v-if="selected && form" class="at__detail">
          <div class="at__head">
            <span class="at__method at__method--lg" :class="`at__method--${selected.method.toLowerCase()}`">
              {{ selected.method }}
            </span>
            <code class="at__full-path">{{ selected.path }}</code>
            <n-button quaternary size="tiny" @click="copy(selected.path)">
              <template #icon><n-icon><Copy16Regular /></n-icon></template>
            </n-button>
          </div>
          <div v-if="selected.summary || selected.permission" class="at__meta">
            <span v-if="selected.summary">{{ selected.summary }}</span>
            <span v-if="selected.permission" class="at__perm">{{ selected.permission }}</span>
          </div>

          <div v-if="selected.params.length" class="at__section">
            <div class="at__section-title">{{ $t('integrationClients.tester.params') }}</div>
            <div class="at__params">
              <label v-for="p in selected.params" :key="p.in + p.name" class="at__field">
                <span class="at__label">
                  {{ p.name }}<b v-if="p.required" class="text-fig-text-red"> *</b>
                </span>
                <n-select
                  v-if="p.enum"
                  v-model:value="form.params[p.name]"
                  size="small"
                  clearable
                  :options="p.enum.map((v) => ({ label: String(v), value: String(v) }))"
                />
                <n-input v-else v-model:value="form.params[p.name]" size="small" :placeholder="p.description || ''" />
              </label>
            </div>
          </div>

          <div v-if="selected.method !== 'GET'" class="at__section">
            <div class="at__section-title">Body (JSON)</div>
            <n-input v-model:value="form.body" type="textarea" :autosize="{ minRows: 4, maxRows: 10 }" class="at__mono" />
          </div>

          <div class="at__send">
            <n-button type="primary" :disabled="!canSend" :loading="sending" @click="onSend">
              <template #icon><n-icon><Play20Regular /></n-icon></template>
              {{ $t('integrationClients.tester.send') }}
            </n-button>
          </div>

          <div v-if="selectedResult" class="at__result" :class="`at__result--${tone(selectedResult)}`">
            <div class="at__result-head">
              <span class="at__status" :class="`at__code--${tone(selectedResult)}`">
                {{ selectedResult.status > 0 ? selectedResult.status : '—' }}
              </span>
              <span class="at__diag">{{ diagnosis(selectedResult) }}</span>
              <span v-if="selectedResult.ms != null" class="at__ms">{{ selectedResult.ms }} ms</span>
              <n-button
                v-if="selectedResult.data !== undefined"
                quaternary
                size="tiny"
                @click="copy(pretty(selectedResult.data))"
              >
                <template #icon><n-icon><Copy16Regular /></n-icon></template>
              </n-button>
            </div>
            <pre v-if="selectedResult.data !== undefined" class="at__pre">{{ pretty(selectedResult.data) }}</pre>
            <pre v-else-if="selectedResult.error && selectedResult.status === 0" class="at__pre">{{ selectedResult.error }}</pre>
          </div>
        </section>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  .at {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-height: 0;
  }

  /* Tepa: kalitlar + umumiy tekshiruv. */
  .at__top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: 12px;
    align-items: end;
    padding: 12px;
    border-radius: 10px;
    background: var(--fig-bg-secondary);
  }

  .at__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .at__label {
    color: var(--fig-text-secondary);
    font-size: 12px;
    font-weight: 600;
  }

  .at__mono :deep(input),
  .at__mono :deep(textarea) {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
  }

  /* Kalitlar holati: tekshirilmoqda / to'g'ri (rol, ruxsat, qamrov) / noto'g'ri. */
  .at__identity {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--fig-br-disable);
    border-radius: 10px;
    font-size: 12.5px;
  }

  .at__identity--valid {
    border-color: var(--fig-chip-green-bg);
    background: color-mix(in srgb, var(--fig-chip-green-bg) 40%, transparent);
  }

  .at__identity--valid b {
    color: var(--fig-chip-green-text);
  }

  .at__identity--invalid {
    border-color: var(--fig-br-error);
    background: var(--fig-red-50);
    color: var(--fig-text-red);
  }

  .at__chip {
    padding: 0 8px;
    border-radius: 999px;
    background: var(--fig-block-bg);
    color: var(--fig-text-primary);
    line-height: 22px;
  }

  .at__chip--red {
    color: var(--fig-text-red);
  }

  .at__lock {
    flex: none;
    display: inline-flex;
    color: var(--fig-text-secondary);
  }

  .at__body {
    display: flex;
    gap: 12px;
    flex: 1 1 auto;
    min-height: 0;
  }

  /* Chap: filtr, qidiruv, endpointlar. */
  .at__list {
    flex: 0 0 360px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
  }

  .at__scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
  }

  .at__group {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
  }

  .at__group-title {
    padding: 2px 6px;
    color: var(--fig-text-secondary);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .at__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    text-align: left;
  }

  .at__item:hover {
    background: var(--fig-bg-secondary);
  }

  .at__item--active {
    background: var(--fig-bg-brand-surface);
  }

  .at__method {
    flex: none;
    min-width: 44px;
    padding: 0 6px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
    background: var(--fig-bg-disable);
    color: var(--fig-text-secondary);
  }

  .at__method--lg {
    font-size: 12px;
    line-height: 24px;
  }

  .at__method--get {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }

  .at__method--post {
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
  }

  .at__path {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    color: var(--fig-text-primary);
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .at__code,
  .at__status {
    flex: none;
    min-width: 34px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    line-height: 18px;
    text-align: center;
  }

  .at__status {
    font-size: 13px;
    line-height: 24px;
    min-width: 48px;
  }

  .at__code--green {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }

  .at__code--amber {
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
  }

  .at__code--red {
    background: var(--fig-red-50);
    color: var(--fig-text-red);
  }

  /* O'ng: tanlangan endpoint. */
  .at__detail {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 14px;
    border: 1px solid var(--fig-br-disable);
    border-radius: 10px;
  }

  .at__head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .at__full-path {
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--fig-text-primary);
    font-size: 14px;
    font-weight: 600;
  }

  .at__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    color: var(--fig-text-secondary);
    font-size: 12.5px;
  }

  .at__perm {
    padding: 0 8px;
    border-radius: 999px;
    background: var(--fig-bg-secondary);
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 11.5px;
    line-height: 20px;
  }

  .at__section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .at__section-title {
    color: var(--fig-text-primary);
    font-size: 12px;
    font-weight: 700;
  }

  .at__params {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
  }

  .at__send {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .at__result {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding: 10px 12px;
    border: 1px solid var(--fig-br-disable);
    border-left-width: 4px;
    border-radius: 10px;
  }

  .at__result--green {
    border-left-color: var(--fig-chip-green-text);
  }

  .at__result--amber {
    border-left-color: var(--fig-icon-amber);
  }

  .at__result--red {
    border-left-color: var(--fig-text-red);
  }

  .at__result-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .at__diag {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--fig-text-primary);
    font-size: 13px;
  }

  .at__ms {
    color: var(--fig-text-secondary);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }

  .at__pre {
    max-height: 420px;
    margin: 0;
    overflow: auto;
    padding: 10px;
    border-radius: 8px;
    background: var(--fig-bg-secondary);
    color: var(--fig-text-primary);
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 12px;
    white-space: pre;
  }

  @media (max-width: 900px) {
    .at__top {
      grid-template-columns: 1fr;
    }

    .at__body {
      flex-direction: column;
    }

    .at__list {
      flex-basis: auto;
      max-height: 320px;
    }

    .at__params {
      grid-template-columns: 1fr;
    }
  }
</style>
