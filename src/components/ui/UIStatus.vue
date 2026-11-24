<script setup>
  import {
    Timer16Regular,
    Eye16Filled,
    CheckmarkCircle24Filled,
    Circle20Filled,
    ErrorCircle12Filled,
    AddCircle24Filled,
    Edit24Filled,
    Delete24Filled,
    ArrowUndo24Filled
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
      icon: Eye16Filled
    },
    {
      id: 6,
      name: 'Active',
      type: 'success',
      icon: Circle20Filled
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
      icon: ErrorCircle12Filled
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

  // Maketda tasdiqlangan holat "badge-check" ikonkasi bilan chiziladi — bu aynan
  // eksport qilingan `figBadgeCheck.svg`. Qolgan holatlar uchun statusning o'z ikonkasi.
  const figIcon = computed(() => (type.value === 'success' ? icons.figBadgeCheck : icon.value))
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
