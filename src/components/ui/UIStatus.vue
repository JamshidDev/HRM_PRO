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
  const props = defineProps({
    status: Object,
    size: {
      type: String,
      default: 'tiny'
    },
    pill: {
      type: Boolean,
      default: false
    },
    /**
     * Maketdagi (Figma) "Status" chipi: yumshoq fon + rangli matn + 16px ikonka.
     * OPT-IN — berilmasa komponent avvalgidek `n-button` chizadi, shu bois
     * UIStatus ishlatadigan qolgan ~45 sahifa o'zgarishsiz qoladi.
     */
    fig: {
      type: Boolean,
      default: false
    },
    /**
     * `fig` chip rangini status turidan QAT'IY NAZAR majburlash uchun:
     * 'brand' | 'green' | 'amber' | 'red' | 'neutral'. Maketda ba'zi ustunlar
     * (masalan buyruq "Hujjat" holati) semantik rangdan farqli chizilgan.
     */
    tone: {
      type: String,
      default: null
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
      icon: Eye16Filled
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
      icon: Circle20Filled
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

  // Ranglar `assets/scss/variables.scss` dagi `--fig-chip-*` / `--fig-bg-*`
  // tokenlaridan keladi — qorong'i mavzu variantlari o'sha yerda berilgan.
  const figToneClass = {
    green: 'bg-fig-chip-green text-fig-chip-green-text',
    brand: 'bg-fig-chip-brand text-fig-chip-brand-text',
    amber: 'bg-fig-chip-amber text-fig-chip-amber-text',
    red: 'bg-fig-red-50 text-fig-text-red',
    neutral: 'bg-fig-bg-disable text-fig-text-tertiary'
  }

  const figClass = computed(
    () => figToneClass[props.tone] || figToneClass[toneByType[type.value]] || figToneClass.brand
  )

  // Maketda tasdiqlangan holat "badge-check" ikonkasi bilan chiziladi — bu aynan
  // eksport qilingan `figBadgeCheck.svg`. Qolgan holatlar uchun statusning o'z
  // ikonkasi qoladi (ular maketda ko'rsatilmagan).
  const figIcon = computed(() => (type.value === 'success' ? icons.figBadgeCheck : icon.value))
</script>

<template>
  <!-- Maket varianti (node 2511:18119): rounded-full, 12/4 padding, 4px gap,
       16px ikonka, 12px semibold matn. -->
  <n-tooltip v-if="fig" trigger="hover" :disabled="!status?.name">
    <template #trigger>
      <span
        class="inline-flex max-w-full items-center justify-center gap-1 rounded-full px-3 py-1 text-[12px] leading-4 font-semibold"
        :class="figClass"
      >
        <component :is="figIcon" class="shrink-0" width="16" height="16" />
        <span class="truncate">{{ status?.name }}</span>
      </span>
    </template>
    <span>{{ status?.name }}</span>
  </n-tooltip>

  <div v-else class="inline-flex items-center">
    <n-button
      :type="type"
      :size="size"
      :dashed="!pill"
      :secondary="pill"
      :round="pill"
      class="truncate max-w-full"
    >
      <template #icon>
        <component :is="icon" />
      </template>

      <n-ellipsis :tooltip="{ style: { maxWidth: '300px' } }">
        {{ status?.name }}
      </n-ellipsis>
    </n-button>
  </div>
</template>
