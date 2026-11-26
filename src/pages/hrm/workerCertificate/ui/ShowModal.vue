<script setup>
  import { openSafeUrl, safeUrl } from '@/utils/sanitize.js'
  import { UIDocumentCard, UIModal } from '@/components/index.js'
  import { useWorkerCertificateStore } from '@stores'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'
  import icons from '@/assets/icons'
  import { certificateStatus, isExpired, validUntil } from './certificateStatus.js'

  const { t } = i18n.global
  const store = useWorkerCertificateStore()

  const fullName = computed(() => {
    const w = store.showWorker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })

  // Ro'yxatda ko'rinadigan (oxirgi) guvohnoma — kartada «Joriy» belgisi.
  const isLatest = (item) => item.id != null && item.id === store.showWorker?.certificate?.id

  const date = (v) => (v ? Utils.timeOnlyDate(v) : '—')

  // Holat chipi — jadvaldagi bilan bir xil (UIStatus id → rang va belgi).
  const statusOf = (item) => {
    const s = certificateStatus(item)
    return { id: s.status.id, text: s.status.name, tone: s.tone }
  }

  // Gradient — holat chipi rangida (Arxivdagi kabi): tasdiqlangan yashil, tasdiqlanmagan ko'k, ...
  const toneOf = (item) => certificateStatus(item).tone

  // Sanalar yorliqsiz, bitta qatorda: «berilgan → amal qiladi» (uzaytirilgan bo'lsa — yangi sana).
  // To'liq izoh (asl muddat ham) — hover'da.
  const dateTitle = (item) =>
    [
      `${t('workerPositionCertificatePage.form.issueDate')}: ${date(item.issue_date)}`,
      `${t('workerPositionCertificatePage.form.expiryDate')}: ${date(item.expiry_date)}`,
      item.extended_date &&
        `${t('workerPositionCertificatePage.form.extendedDate')}: ${date(item.extended_date)}`
    ]
      .filter(Boolean)
      .join('\n')

  const rowsOf = (item) => [
    {
      text: item.number || '—',
      title: t('workerPositionCertificatePage.form.number'),
      status: statusOf(item)
    },
    {
      // Jadvaldagi kabi: «berilgan – amal qiladi», uzaytirilgan bo'lsa ⓘ «Uzaytirilgan».
      text: `${date(item.issue_date)} – ${date(validUntil(item))}`,
      title: dateTitle(item),
      textClass: isExpired(item) ? 'text-fig-text-red' : 'text-textColor0',
      hint: item.extended_date ? t('workerCertificatePage.table.extendedChip') : ''
    }
  ]

  // Fayl yangi oynada emas, ilova ichidagi ko'rish oynasida ochiladi.
  const fileExt = (url) => (url || '').split('?')[0].split('.').pop().toLowerCase()
  const onView = (item) => {
    const url = safeUrl(item.file)
    if (!url) return
    window.$MediaViewer.showMediaViewer(url, fileExt(url), { title: item.number })
  }

  // «Yuklash» — faylni SAQLAYDI (yangi oynada ochmaydi), Arxivdagi `_download` kabi:
  // fetch → blob → saqlash. Server bloklasa (CORS / tarmoq) — eski yo'l: yangi oynada ochiladi.
  const downloadingId = ref(null)
  const onDownload = async (item) => {
    const url = safeUrl(item.file)
    if (!url || downloadingId.value) return
    downloadingId.value = item.id
    try {
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(String(resp.status))
      const blob = await resp.blob()
      Utils.blobFileDownload(blob, blob.type, `${item.number || 'guvohnoma'}.${fileExt(url)}`)
    } catch {
      openSafeUrl(url)
    } finally {
      downloadingId.value = null
    }
  }
</script>

<template>
  <UIModal
    v-model:visible="store.showVisible"
    :title="fullName"
    width="min(900px, calc(100vw - 32px))"
    height="min(560px, calc(100vh - 64px))"
    :persistent="false"
  >
    <n-spin :show="store.showLoading" class="h-full" content-class="h-full">
      <!-- Oyna o'lchami qat'iy (900 × 560): ~3 qator karta sig'adi, ko'pi bo'lsa ichida skroll (UIModal `height`).
           Ro'yxat sahifasida faqat OXIRGI guvohnoma ko'rinadi — bu yerda hammasi.
           Kartalar — Arxivdagi bilan bir xil (`UIDocumentCard`). Keng ekranda 2 ustun. -->
      <div
        v-if="store.showList.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[120px] pt-2"
      >
        <UIDocumentCard
          v-for="(item, idx) in store.showList"
          :key="item.id ?? idx"
          :icon="icons.figCertificateBadge"
          :icon-size="42"
          icon-color="var(--primary-color)"
          :subtitle="$t('workerCertificatePage.modal.kind')"
          :badge="isLatest(item) ? $t('workerCertificatePage.modal.latest') : ''"
          :title="item.post_name"
          :rows="rowsOf(item)"
          :tone="toneOf(item)"
          :clickable="false"
          :show-actions="!!item.file"
          :downloading="downloadingId === item.id"
          :download-disabled="!!downloadingId && downloadingId !== item.id"
          @view="onView(item)"
          @download="onDownload(item)"
        />
      </div>

      <div
        v-else-if="!store.showLoading"
        class="w-full h-full flex items-center justify-center text-sm text-textColor3"
      >
        {{ $t('workerPositionCertificatePage.no-data') }}
      </div>
    </n-spin>
  </UIModal>
</template>
