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
        file: true,
        rows: [
          {
            label: t('signatureHistory.detail.document'),
            value: `${documentLabel(x.document_model)}${x.document_id ? ` №${x.document_id}` : ''}`
          },
          {
            label: t('signatureHistory.table.signingTime'),
            value: Utils.dateTimeLabel(x.signing_time)
          },
          {
            label: t('signatureHistory.table.createdAt'),
            value: Utils.dateTimeLabel(x.created_at)
          },
          { label: t('signatureHistory.detail.confirmationId'), value: x.confirmation_id }
        ]
      },
      {
        title: t('signatureHistory.detail.secSignature'),
        rows: [
          {
            label: t('signatureHistory.table.keyType'),
            value: x.key_type ? keyTypeLabel(x.key_type) : null
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
      cls: 'text-textColor3',
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
    :width="560"
  >
    <template #content>
      <n-spin :show="store.detailLoading">
        <div v-if="d" class="flex flex-col gap-2.5 pb-3">
          <!-- Imzolovchi -->
          <div class="sh-box px-3 py-2.5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-[15px] font-semibold leading-5">
                  {{ fullName(d.user?.worker) || '—' }}
                </div>
                <div
                  v-if="d.user?.organization?.name"
                  class="text-[13px] leading-5 text-textColor1"
                >
                  {{ d.user.organization.name }}
                </div>
                <div
                  v-if="d.user?.worker?.pin || d.user?.phone"
                  class="text-xs leading-5 text-textColor3 flex flex-wrap gap-x-3"
                >
                  <span v-if="d.user?.worker?.pin">
                    {{ $t('signatureHistory.table.pin') }}: {{ d.user.worker.pin }}
                  </span>
                  <span v-if="d.user?.phone">{{ d.user.phone }}</span>
                </div>
              </div>
              <UIChip :tone="methodTone(d.method)" class="shrink-0">
                {{ methodLabel(d.method) }}
              </UIChip>
            </div>
          </div>

          <!-- Tekshiruv natijasi -->
          <div v-if="v" class="sh-box">
            <div class="sh-box-head">
              <span>{{ $t('signatureHistory.verify.title') }}</span>
              <span class="flex items-center gap-1 text-[13px]" :class="mainVerdict.cls">
                <n-icon size="18"><component :is="mainVerdict.icon" /></n-icon>
                {{ mainVerdict.text }}
              </span>
            </div>
            <div class="px-3 pt-2 pb-1 flex flex-col gap-1">
              <div v-for="c in checks" :key="c.label" class="flex items-center gap-2 text-[13px]">
                <n-icon size="16" :class="c.cls"><component :is="c.icon" /></n-icon>
                <span>{{ c.label }}</span>
              </div>
            </div>
            <div v-if="signerRows.length" class="sh-rows">
              <div v-for="r in signerRows" :key="r.label" class="sh-row">
                <span class="text-textColor3">{{ r.label }}</span>
                <span :class="r.mono ? 'font-mono text-xs break-all' : 'break-words'">
                  {{ r.value || '—' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Hujjat / Sertifikat / Qurilma -->
          <div v-for="sec in sections" :key="sec.title" class="sh-box">
            <div class="sh-box-head">
              <span>{{ sec.title }}</span>
              <template v-if="sec.file">
                <n-button
                  v-if="d.signed_file_url"
                  size="tiny"
                  secondary
                  type="primary"
                  @click="openSafeUrl(d.signed_file_url)"
                >
                  <template #icon>
                    <n-icon><DocumentPdf24Regular /></n-icon>
                  </template>
                  {{ $t('signatureHistory.detail.openSignedFile') }}
                </n-button>
                <span v-else class="text-xs font-normal text-textColor3">
                  {{ $t('signatureHistory.detail.noSignedFile') }}
                </span>
              </template>
            </div>
            <div class="sh-rows">
              <div v-for="r in sec.rows" :key="r.label" class="sh-row">
                <span class="text-textColor3">{{ r.label }}</span>
                <span :class="r.mono ? 'font-mono text-xs break-all' : 'break-words'">
                  {{ r.value || '—' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Chizilgan imzo -->
          <div v-if="drawn" class="sh-box">
            <div class="sh-box-head">{{ $t('signatureHistory.detail.drawnImage') }}</div>
            <div class="px-3 pt-2">
              <div class="rounded-lg border border-surface-line bg-white p-2 w-fit">
                <img
                  :src="drawn"
                  alt="signature"
                  class="block max-h-[160px] max-w-full object-contain"
                />
              </div>
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

<style scoped>
  /* Quti: chegara + kulrang sarlavha band; qatorlar orasida chiziq yo'q. */
  .sh-box {
    border: 1px solid var(--surface-line);
    border-radius: 12px;
    overflow: hidden;
  }
  .sh-box-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 34px;
    padding: 6px 12px;
    border-bottom: 1px solid var(--surface-line);
    background: color-mix(in srgb, var(--surface-ground) 55%, transparent);
    font-size: 13px;
    font-weight: 600;
    color: var(--textColor0);
  }
  .sh-rows {
    padding: 4px 0;
  }
  .sh-row {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 12px;
    padding: 4px 12px;
    font-size: 13px;
    line-height: 20px;
  }
  @media (max-width: 479px) {
    .sh-row {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
</style>
