<script setup>
  import {
    ArrowDownload24Regular,
    CheckmarkCircle24Filled,
    DismissCircle24Filled,
    DocumentPdf24Regular,
    QuestionCircle24Regular,
    ShieldCheckmark24Regular
  } from '@vicons/fluent'
  import { UIChip, UIDrawer } from '@/components/index.js'
  import { useSignatureHistoryStore } from '@/store/modules/index.js'
  import { openSafeUrl } from '@/utils/sanitize.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import {
    documentLabel,
    fullName,
    imageSrc,
    keyTypeLabel,
    keyTypeStyle,
    methodLabel,
    methodTone
  } from './helpers.js'

  const { t } = i18n.global
  const store = useSignatureHistoryStore()

  const d = computed(() => store.detail)
  const v = computed(() => store.verifyResult)
  const drawn = computed(() => imageSrc(d.value?.image))
  // E-IMZO javobi alohida bo'limda, qolgan meta «Texnik ma'lumot» da.
  const eimzoResponse = computed(() => d.value?.meta?.eimzo_response ?? null)
  const eimzoText = computed(() =>
    eimzoResponse.value ? JSON.stringify(eimzoResponse.value, null, 2) : ''
  )
  const restMeta = computed(() =>
    Object.fromEntries(Object.entries(d.value?.meta ?? {}).filter(([k]) => k !== 'eimzo_response'))
  )
  const hasMeta = computed(() => Object.keys(restMeta.value).length > 0)
  const metaText = computed(() => (hasMeta.value ? JSON.stringify(restMeta.value, null, 2) : ''))

  // Bo'limlar: hujjat, imzo/sertifikat, qurilma.
  const sections = computed(() => {
    const x = d.value
    if (!x) return []
    return [
      {
        title: t('signatureHistory.detail.secDocument'),
        rows: [
          {
            label: t('signatureHistory.detail.document'),
            value: `${documentLabel(x.document_model)}${x.document_id ? ` №${x.document_id}` : ''}`
          },
          { label: t('signatureHistory.detail.confirmationId'), value: x.confirmation_id }
        ]
      },
      {
        title: t('signatureHistory.detail.secSignature'),
        rows: [
          {
            label: t('signatureHistory.table.signingTime'),
            value: Utils.dateTimeLabel(x.signing_time)
          },
          {
            label: t('signatureHistory.table.createdAt'),
            value: Utils.dateTimeLabel(x.created_at)
          },
          {
            label: t('signatureHistory.detail.certificateCode'),
            value: x.certificate_code,
            mono: true
          },
          {
            label: t('signatureHistory.detail.certificateExpired'),
            value: Utils.dateTimeLabel(x.certificate_expired)
          },
          {
            label: t('signatureHistory.detail.hasPkcs7'),
            value: x.has_pkcs7 ? t('signatureHistory.detail.yes') : t('signatureHistory.detail.no')
          }
        ]
      },
      {
        title: t('signatureHistory.detail.secDevice'),
        rows: [
          { label: t('signatureHistory.table.ip'), value: x.ip_address, mono: true },
          { label: t('signatureHistory.detail.userAgent'), value: x.user_agent, mono: true }
        ]
      }
    ]
  })

  // true/false/null -> belgi + rang
  const triState = (val) => {
    if (val === true)
      return {
        icon: CheckmarkCircle24Filled,
        cls: 'text-success',
        text: t('signatureHistory.verify.yes')
      }
    if (val === false)
      return {
        icon: DismissCircle24Filled,
        cls: 'text-danger',
        text: t('signatureHistory.verify.no')
      }
    return {
      icon: QuestionCircle24Regular,
      cls: 'text-gray-400',
      text: t('signatureHistory.verify.notChecked')
    }
  }

  const checks = computed(() => {
    const r = v.value
    if (!r) return []
    const list = []
    if (r.pkcs7) {
      list.push({
        label: t('signatureHistory.verify.certificateVerified'),
        ...triState(r.certificate_verified ?? null)
      })
      list.push({
        label: t('signatureHistory.verify.documentMatches'),
        ...triState(r.document_matches ?? null)
      })
    }
    if (r.file && r.file.stored === false) {
      list.push({ label: t('signatureHistory.verify.fileNotStored'), ...triState(null), text: '' })
    } else {
      list.push({
        label: t('signatureHistory.verify.fileIntact'),
        ...triState(r.file?.intact ?? null)
      })
    }
    return list
  })

  const signerRows = computed(() => {
    const r = v.value
    if (!r?.pkcs7) return []
    const s = r.signer || {}
    const validity = [s.valid_from, s.valid_to].filter(Boolean).join(' — ')
    return [
      {
        label: t('signatureHistory.verify.signer'),
        value: [s.full_name, s.pin].filter(Boolean).join(' · ')
      },
      { label: t('signatureHistory.verify.serial'), value: s.serial_number, mono: true },
      { label: t('signatureHistory.verify.validity'), value: validity },
      { label: t('signatureHistory.verify.signingTime'), value: r.signing_time },
      {
        label: t('signatureHistory.verify.status'),
        value: [r.status, r.message].filter(Boolean).join(' — ')
      }
    ]
  })

  const mainVerdict = computed(() => {
    const r = v.value
    if (!r) return null
    if (!r.pkcs7) return { ...triState(null), text: t('signatureHistory.verify.noPkcs7') }
    if (r.valid === true) return { ...triState(true), text: t('signatureHistory.verify.valid') }
    if (r.valid === false) return { ...triState(false), text: t('signatureHistory.verify.invalid') }
    return { ...triState(null), text: t('signatureHistory.verify.notChecked') }
  })
</script>

<template>
  <UIDrawer
    :visible="store.detailVisible"
    @update:visible="(val) => (store.detailVisible = val)"
    :title="$t('signatureHistory.detail.title')"
    :width="640"
  >
    <template #content>
      <n-spin :show="store.detailLoading">
        <div v-if="d" class="flex flex-col gap-4 pb-4">
          <div class="rounded-xl border border-surface-line p-4 flex flex-col gap-2">
            <div class="text-base font-semibold">{{ fullName(d.user?.worker) || '—' }}</div>
            <div class="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
              <span v-if="d.user?.worker?.pin">
                {{ $t('signatureHistory.table.pin') }}: {{ d.user.worker.pin }}
              </span>
              <span v-if="d.user?.phone">{{ d.user.phone }}</span>
            </div>
            <div v-if="d.user?.organization?.name" class="text-sm">
              {{ d.user.organization.name }}
            </div>
            <div class="flex flex-wrap gap-2 pt-1">
              <UIChip :tone="methodTone(d.method)" compact>{{ methodLabel(d.method) }}</UIChip>
              <UIChip
                v-if="keyTypeStyle(d.key_type)"
                :tone="keyTypeStyle(d.key_type).tone"
                :icon="keyTypeStyle(d.key_type).icon"
                compact
              >
                {{ keyTypeLabel(d.key_type) }}
              </UIChip>
            </div>
          </div>

          <div v-if="v" class="rounded-xl border border-surface-line p-4 flex flex-col gap-3">
            <div class="text-sm font-semibold">{{ $t('signatureHistory.verify.title') }}</div>
            <div class="flex items-center gap-2 text-base font-semibold" :class="mainVerdict.cls">
              <n-icon size="26"><component :is="mainVerdict.icon" /></n-icon>
              <span>{{ mainVerdict.text }}</span>
            </div>
            <div v-for="c in checks" :key="c.label" class="flex items-center gap-2 text-sm">
              <n-icon size="20" :class="c.cls"><component :is="c.icon" /></n-icon>
              <span>{{ c.label }}</span>
              <span v-if="c.text" class="text-gray-500">— {{ c.text }}</span>
            </div>
            <div
              v-if="signerRows.length"
              class="grid grid-cols-[170px_1fr] gap-x-3 gap-y-1 text-sm"
            >
              <template v-for="r in signerRows" :key="r.label">
                <span class="text-gray-500">{{ r.label }}</span>
                <span :class="r.mono ? 'font-mono break-all' : 'break-words'">{{
                  r.value || '—'
                }}</span>
              </template>
            </div>
          </div>

          <div
            v-for="sec in sections"
            :key="sec.title"
            class="rounded-xl border border-surface-line p-4 flex flex-col gap-2"
          >
            <div class="text-sm font-semibold">{{ sec.title }}</div>
            <div class="grid grid-cols-[170px_1fr] gap-x-3 gap-y-2 text-sm">
              <template v-for="r in sec.rows" :key="r.label">
                <span class="text-gray-500">{{ r.label }}</span>
                <span :class="r.mono ? 'font-mono text-xs break-all' : 'break-words'">{{
                  r.value || '—'
                }}</span>
              </template>
            </div>
            <div v-if="sec.title === $t('signatureHistory.detail.secDocument')" class="pt-1">
              <n-button
                v-if="d.signed_file_url"
                size="small"
                secondary
                type="primary"
                @click="openSafeUrl(d.signed_file_url)"
              >
                <template #icon>
                  <n-icon><DocumentPdf24Regular /></n-icon>
                </template>
                {{ $t('signatureHistory.detail.openSignedFile') }}
              </n-button>
              <span v-else class="text-sm text-gray-400">
                {{ $t('signatureHistory.detail.noSignedFile') }}
              </span>
            </div>
          </div>

          <div v-if="drawn" class="rounded-xl border border-surface-line p-4 flex flex-col gap-2">
            <div class="text-sm font-semibold">{{ $t('signatureHistory.detail.drawnImage') }}</div>
            <div class="rounded-lg border border-surface-line bg-white p-2 w-fit">
              <img :src="drawn" alt="signature" class="max-h-[180px] max-w-full object-contain" />
            </div>
          </div>

          <n-collapse v-if="eimzoResponse || hasMeta" :default-expanded-names="['eimzo']">
            <n-collapse-item
              v-if="eimzoResponse"
              :title="$t('signatureHistory.detail.eimzoResponse')"
              name="eimzo"
            >
              <div
                class="text-xs font-mono whitespace-pre-wrap break-all rounded-lg bg-surface-section p-2 max-h-[420px] overflow-auto"
                v-text="eimzoText"
              />
            </n-collapse-item>
            <n-collapse-item
              v-if="hasMeta"
              :title="$t('signatureHistory.detail.secTechnical')"
              name="meta"
            >
              <div
                class="text-xs font-mono whitespace-pre-wrap break-all rounded-lg bg-surface-section p-2"
                v-text="metaText"
              />
            </n-collapse-item>
          </n-collapse>
        </div>
        <div v-else class="min-h-[200px]" />
      </n-spin>
    </template>

    <template v-if="d" #footer>
      <div class="grid gap-2" :class="d.has_pkcs7 ? 'grid-cols-2' : 'grid-cols-1'">
        <n-button
          v-if="d.has_pkcs7"
          :loading="store.pkcs7Loading"
          @click="store._downloadPkcs7(d.id)"
        >
          <template #icon>
            <n-icon><ArrowDownload24Regular /></n-icon>
          </template>
          {{ $t('signatureHistory.detail.downloadPkcs7') }}
        </n-button>
        <n-button type="primary" :loading="store.verifyLoading" @click="store._verify(d.id)">
          <template #icon>
            <n-icon><ShieldCheckmark24Regular /></n-icon>
          </template>
          {{ $t('signatureHistory.detail.verify') }}
        </n-button>
      </div>
    </template>
  </UIDrawer>
</template>
