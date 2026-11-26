<script setup>
  import {
    Timer16Regular,
    Eye16Filled,
    Sparkle16Filled,
    Info16Filled,
    CheckmarkCircle24Filled,
    ErrorCircle12Filled,
    AddCircle24Filled,
    Edit24Filled,
    Delete24Filled,
    ArrowUndo24Filled,
    QuestionCircle16Filled,
    DocumentArrowLeft16Filled
  } from '@vicons/fluent'
  import icons from '@/assets/icons'
  import UIChip from './UIChip.vue'
  const props = defineProps({
    status: Object,
    // Eski (n-button) ko'rinishdan qolgan proplar — endi hamma joyda chip chiziladi,
    // `size` / `pill` / `fig` e'tiborga olinmaydi (chaqiruvlar buzilmasligi uchun qoldirildi).
    size: {
      type: String,
      default: 'tiny'
    },
    pill: {
      type: Boolean,
      default: false
    },
    fig: {
      type: Boolean,
      default: true
    },
    /**
     * `fig` chip rangini status turidan QAT'IY NAZAR majburlash uchun:
     * 'brand' | 'green' | 'amber' | 'red' | 'neutral'. Maketda ba'zi ustunlar
     * (masalan buyruq "Hujjat" holati) semantik rangdan farqli chizilgan.
     */
    tone: {
      type: String,
      default: null
    },
    /**
     * `fig` chipning ixcham varianti (10px matn, 12px ikonka) — tor kartalar uchun.
     * OPT-IN, berilmasa chip o'lchami o'zgarmaydi.
     */
    compact: {
      type: Boolean,
      default: false
    },
    // `fig` chipning status nomi tooltip'i — o'z popover'i bor joylarda o'chiriladi.
    tooltip: {
      type: Boolean,
      default: true
    }
  })

  const statusList = [
    {
      id: 1,
      name: 'Process',
      type: 'warning',
      icon: Timer16Regular
    },
    {
      id: 2,
      name: 'Read',
      type: 'default',
      icon: Eye16Filled
    },
    {
      id: 3,
      name: 'Success',
      type: 'success',
      icon: CheckmarkCircle24Filled
    },
    {
      id: 4,
      name: 'Rejected',
      type: 'error',
      // «Rad etilgan» — ✕ belgili hujjat (src/assets/icons/figFileReject.svg).
      icon: icons.figFileReject
    },
    {
      id: 5,
      name: 'Deleted',
      type: 'error',
      icon: Delete24Filled
    },
    {
      id: 6,
      name: 'Active',
      type: 'success',
      // «Aktiv» — kichik nuqta (jonli holat); ✓ belgisi faqat «Tasdiqlangan» (3) da — ikkalasi yonma-yon farqlansin.
      icon: icons.figDot
    },
    {
      id: 7,
      name: 'DeActive',
      type: 'error',
      // Hujjatlarda 7 = «Muammoli» (muddatida tasdiqlanmagan) — undov belgili doira.
      icon: icons.figAlertCircle
    },
    {
      id: 8,
      name: 'Error',
      type: 'error',
      icon: ErrorCircle12Filled
    },
    {
      id: 9,
      name: 'Primary',
      type: 'primary',
      // Ko'k «ma'lumot» holati (Tekshiruvda, Qabul qilindi…) — «!» xato belgisi emas.
      icon: Info16Filled
    },
    // ── Audit (o'zgarishlar tarixi) holatlari ────────────────────────────────
    // Yangi ID'lar QO'SHILDI, mavjudlari (1..9) o'zgarmadi — boshqa sahifalarga
    // ta'sir yo'q. `audit_logs.status` qiymatlariga mos ikonalar.
    {
      id: 10,
      name: 'AuditCreate',
      type: 'success',
      icon: AddCircle24Filled
    },
    {
      id: 11,
      name: 'AuditUpdate',
      type: 'warning',
      icon: Edit24Filled
    },
    {
      id: 12,
      name: 'AuditDelete',
      type: 'error',
      icon: Delete24Filled
    },
    {
      id: 13,
      name: 'AuditRestore',
      type: 'info',
      icon: ArrowUndo24Filled
    },
    // «Yangi» (hali ko'rilmagan) — ko'k; «Jarayonda» (1, sariq soat) bilan adashmasin.
    {
      id: 14,
      name: 'New',
      type: 'info',
      icon: Sparkle16Filled
    },
    // Hujjat yaratilgan (`Utils.documentStatus[3]`) — buyruqlar maketidagidek ko'k chip, yashil emas:
    // bu holat emas, hujjat borligini bildiradi; yonidagi yashil «Tasdiqlangan» bilan adashmasin.
    {
      id: 15,
      name: 'DocumentReady',
      type: 'primary',
      icon: icons.figBadgeCheck
    },
    // Tugagan (masalan shartnoma «Yakunlangan») — kulrang ✓: tugadi, lekin endi faol emas.
    {
      id: 16,
      name: 'Finished',
      type: 'default',
      icon: CheckmarkCircle24Filled
    },
    // Guvohnomalar: «Tasdiqlanmagan» va «Qaytarib olingan» — o'z belgilari (boshqa holat ikonkasini boshqa rangda
    // qayta ishlatmaslik uchun).
    {
      id: 17,
      name: 'Unverified',
      type: 'info',
      icon: QuestionCircle16Filled
    },
    {
      id: 18,
      name: 'Returned',
      type: 'warning',
      // Hujjat + orqaga strelka — «Jarayonda» soati va audit «Tiklandi» ↶ dan farqli.
      icon: DocumentArrowLeft16Filled
    }
  ]

  const type = computed(() => {
    const v = statusList.filter((x) => x.id === props.status?.id)
    if (v.length) return v[0].type
    else return 'primary'
  })

  const icon = computed(() => {
    const v = statusList.filter((x) => x.id === props.status?.id)
    if (v.length) return v[0].icon
    else return Eye16Filled
  })

  // naive-ui tugma turi -> maketdagi chip rang oilasi.
  const toneByType = {
    success: 'green',
    primary: 'brand',
    info: 'brand',
    warning: 'amber',
    error: 'red',
    default: 'neutral'
  }

  // Chip rangi: `tone` berilsa o'sha, aks holda status turidan.
  const chipTone = computed(() => props.tone || toneByType[type.value] || 'brand')

  // Maketda tasdiqlangan holat (3) "badge-check" ikonkasi bilan chiziladi — `figBadgeCheck.svg`.
  // Boshqa yashil holatlar (Aktiv, audit «Yaratildi»…) o'z ikonkasini saqlaydi — hammasi bir xil ✓ bo'lib qolmasin.
  const figIcon = computed(() => (props.status?.id === 3 ? icons.figBadgeCheck : icon.value))
</script>

<template>
  <!-- Hamma joyda bitta chip ko'rinishi (UIChip) — buyruqlar sahifasidagi maket chipi. -->
  <UIChip
    :label="status?.name"
    :tone="chipTone"
    :icon="figIcon"
    :compact="compact"
    :tooltip="tooltip"
  />
</template>
