<script setup>
  // HR: muddatli ariza havolasi — yaratish (muddat, tur), nusxalash/QR, ro'yxat va muddatini tugatish.
  import QRCode from 'qrcode'
  import { UIModal } from '@/components/index.js'
  import { confirmDialog } from '@/components/notify/alertDialog.js'
  import { selectWrap } from '@/utils/selectWrap.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import {
    ArrowLeft20Regular,
    Copy20Regular,
    Clock20Regular,
    PersonBoard20Regular,
    Person20Regular
  } from '@vicons/fluent'

  const { t } = i18n.global
  const visible = defineModel('visible', { type: Boolean, default: false })
  const api = $ApiService.applicationLinkService
  const MINUTES = [15, 30, 60, 120]
  // Kim uchun: hozircha faqat tizimdagi xodim; fuqaro — keyingi bosqich.
  const AUDIENCES = [
    { key: 'worker', icon: PersonBoard20Regular, label: 'applicationLink.audienceWorker', hint: 'applicationLink.audienceWorkerHint' },
    { key: 'citizen', icon: Person20Regular, label: 'applicationLink.audienceCitizen', hint: 'applicationLink.audienceCitizenHint', disabled: true }
  ]

  const tab = ref('new')
  const form = reactive({ audience: 'worker', minutes: 30, type: null })
  const types = ref([])
  const creating = ref(false)
  const created = ref(null)
  const qr = ref(null)
  const now = ref(Date.now())
  let tick = null

  const linkUrl = (token) => `${window.location.origin}${AppPaths.ApplicationLink}/${token}`
  const fmtLeft = (sec) => {
    const s = Math.max(0, Math.floor(sec))
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }
  // Qolgan vaqt server javobidan + o'tgan vaqt bo'yicha.
  const leftOf = (row) => Math.max(0, row.expires_in - (now.value - row._at) / 1000)

  const list = ref([])
  const listLoading = ref(false)
  const loadList = async () => {
    listLoading.value = true
    try {
      const res = await api._index({ params: { per_page: 50 } })
      const at = Date.now()
      list.value = (res.data.data.data ?? []).map((r) => ({ ...r, _at: at }))
    } finally {
      listLoading.value = false
    }
  }

  watch(visible, async (v) => {
    if (!v) {
      clearInterval(tick)
      return
    }
    created.value = null
    qr.value = null
    tab.value = 'new'
    tick = setInterval(() => (now.value = Date.now()), 1000)
    if (!types.value.length) {
      const res = await api._types()
      types.value = (res.data.data ?? []).map((x) => ({ value: x.id, label: x.name }))
    }
  })
  watch(tab, (v) => v === 'list' && loadList())
  onBeforeUnmount(() => clearInterval(tick))

  const create = async () => {
    creating.value = true
    try {
      const res = await api._create({ data: { minutes: form.minutes, type: form.type } })
      created.value = { ...res.data.data, _at: Date.now() }
      qr.value = await QRCode.toDataURL(linkUrl(created.value.token), { margin: 1, width: 220 })
    } finally {
      creating.value = false
    }
  }
  const copy = (token) => Utils.copyToClipboard(linkUrl(token), () => $Toast.info(t('applicationLink.copied')))

  const revoke = (row) =>
    confirmDialog({
      message: t('applicationLink.revokeConfirm'),
      onConfirm: async () => {
        await api._revoke({ id: row.id })
        if (created.value?.id === row.id) created.value = null
        await loadList()
      }
    })
  const newFromList = () => {
    created.value = null
    tab.value = 'new'
  }
  const stateType = { active: 'success', expired: 'default', revoked: 'error' }
</script>

<template>
  <UIModal v-model:visible="visible" :title="$t('applicationLink.modalTitle')" width="min(640px, calc(100vw - 32px))">
    <n-tabs v-model:value="tab" type="segment" animated>
      <n-tab-pane name="new" :tab="$t('applicationLink.newTab')" class="link-pane">
        <div v-if="!created" class="flex flex-col gap-4 pt-2">
          <div>
            <div class="mb-2 text-sm text-textColor2">{{ $t('applicationLink.audience') }}</div>
            <div class="grid grid-cols-2 gap-2" role="radiogroup">
              <button
                v-for="a in AUDIENCES"
                :key="a.key"
                type="button"
                role="radio"
                :aria-checked="form.audience === a.key"
                :disabled="a.disabled"
                class="aud-box"
                :class="{ 'is-active': form.audience === a.key, 'is-disabled': a.disabled }"
                @click="!a.disabled && (form.audience = a.key)"
              >
                <n-icon size="20" class="aud-box__icon"><component :is="a.icon" /></n-icon>
                <span class="min-w-0 text-left">
                  <span class="flex items-center gap-1.5 text-sm font-semibold leading-5">
                    {{ $t(a.label) }}
                    <n-tag v-if="a.disabled" size="tiny" round :bordered="false">{{ $t('applicationLink.soon') }}</n-tag>
                  </span>
                  <span class="block truncate text-xs leading-4 text-textColor3">{{ $t(a.hint) }}</span>
                </span>
              </button>
            </div>
          </div>
          <div>
            <div class="mb-2 text-sm text-textColor2">{{ $t('applicationLink.duration') }}</div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="m in MINUTES"
                :key="m"
                type="button"
                class="dur-box"
                :class="{ 'is-active': form.minutes === m }"
                @click="form.minutes = m"
              >
                <span class="text-lg font-semibold">{{ m }}</span>
                <span class="text-xs">{{ $t('applicationLink.minutes', { n: '' }).trim() }}</span>
              </button>
            </div>
          </div>
          <div>
            <div class="mb-2 text-sm text-textColor2">{{ $t('applicationLink.type') }}</div>
            <n-select
              v-bind="selectWrap"
              v-model:value="form.type"
              filterable
              clearable
              :options="types"
              :placeholder="$t('applicationLink.typeAny')"
            />
          </div>
        </div>

        <div v-else class="flex flex-col items-center gap-3 pt-2 text-center">
          <div class="text-sm font-medium text-success">{{ $t('applicationLink.newLink') }}</div>
          <img v-if="qr" :src="qr" alt="QR" class="h-[220px] w-[220px] rounded-xl bg-white p-2" />
          <div class="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <n-icon size="18"><Clock20Regular /></n-icon>
            {{ $t('applicationLink.left') }}: {{ fmtLeft(leftOf(created)) }}
          </div>
          <div v-if="created.type" class="text-xs text-textColor2">{{ created.type.name }}</div>
          <n-input-group>
            <n-input :value="linkUrl(created.token)" readonly />
            <n-button type="primary" ghost @click="copy(created.token)">
              <template #icon><n-icon><Copy20Regular /></n-icon></template>
              {{ $t('applicationLink.copy') }}
            </n-button>
          </n-input-group>
        </div>
      </n-tab-pane>

      <n-tab-pane name="list" :tab="$t('applicationLink.linksTab')" class="link-pane">
        <n-spin :show="listLoading">
          <div v-if="!list.length" class="py-8 text-center text-sm text-textColor3">{{ $t('applicationLink.empty') }}</div>
          <div class="flex flex-col gap-2 pt-2">
            <div v-for="row in list" :key="row.id" class="link-row">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <n-tag size="small" round :bordered="false" :type="stateType[row.state]">
                    {{ $t(`applicationLink.state.${row.state}`) }}
                  </n-tag>
                  <span v-if="row.state === 'active'" class="text-xs font-semibold text-primary">
                    {{ fmtLeft(leftOf(row)) }}
                  </span>
                  <span class="truncate text-sm text-textColor1">{{ row.type?.name || $t('applicationLink.typeAny') }}</span>
                </div>
                <div class="mt-1 text-xs text-textColor3">
                  {{ Utils.timeWithMonth?.(row.created_at) || row.created_at }} · {{ $t('applicationLink.creator') }}: {{ row.creator || '—' }}
                  · {{ $t('applicationLink.applications') }}: {{ row.applications_count }} ({{ row.sent_count }} {{ $t('applicationLink.sent') }})
                </div>
              </div>
              <div v-if="row.state === 'active'" class="flex shrink-0 gap-1">
                <n-button size="small" secondary @click="copy(row.token)">
                  <template #icon><n-icon><Copy20Regular /></n-icon></template>
                </n-button>
                <n-button size="small" type="error" secondary @click="revoke(row)">{{ $t('applicationLink.revoke') }}</n-button>
              </div>
            </div>
          </div>
        </n-spin>
      </n-tab-pane>
    </n-tabs>

    <!-- Amal tugmalari — modal pastida (tab almashganda joyi o'zgarmaydi) -->
    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-2">
        <template v-if="tab === 'new' && !created">
          <n-button type="primary" class="min-w-[160px]" :loading="creating" @click="create">
            {{ $t('applicationLink.create') }}
          </n-button>
        </template>
        <template v-else-if="tab === 'new'">
          <n-button secondary class="min-w-[130px]" @click="visible = false">{{ $t('content.close') }}</n-button>
          <n-button type="primary" class="min-w-[160px]" @click="created = null">
            <template #icon><n-icon><ArrowLeft20Regular /></n-icon></template>
            {{ $t('applicationLink.newTab') }}
          </n-button>
        </template>
        <n-button v-else type="primary" class="min-w-[160px]" @click="newFromList">
          {{ $t('applicationLink.newTab') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>

<style scoped>
  .aud-box {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 8px 12px;
    border: 1.5px solid var(--color-surface-line);
    border-radius: 14px;
    background: var(--color-surface-section);
    color: var(--color-textColor1);
    cursor: pointer;
    transition:
      border-color 0.15s,
      background-color 0.15s;
  }
  .aud-box:not(.is-disabled):hover {
    border-color: color-mix(in srgb, var(--color-primary) 45%, transparent);
  }
  .aud-box.is-active {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  }
  .aud-box.is-disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
  .aud-box__icon {
    flex-shrink: 0;
    color: var(--color-textColor2);
  }
  .aud-box.is-active {
    color: var(--color-primary);
  }
  .aud-box.is-active .aud-box__icon {
    color: var(--color-primary);
  }
  /* Tablar almashganda modal balandligi o'zgarmaydi — ro'yxat ichkarida aylanadi */
  .link-pane {
    height: 400px;
    overflow-y: auto;
  }
  .dur-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px 6px;
    border: 1.5px solid var(--color-surface-line);
    border-radius: 14px;
    background: var(--color-surface-section);
    color: var(--color-textColor1);
    cursor: pointer;
  }
  .dur-box.is-active {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  }
  .link-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--color-surface-line);
    border-radius: 14px;
  }
</style>
