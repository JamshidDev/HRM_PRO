<script setup>
  import { Timer16Regular, ErrorCircle12Filled } from '@vicons/fluent'
  import icons from '@/assets/icons'
  import Utils from '@/utils/Utils.js'
  import UIChip from './UIChip.vue'

  // Ko'rinish — umumiy `UIChip` (buyruqlar sahifasidagi chip). Proplar avvalgidek qoldi.
  const props = defineProps({
    // Raqam ham keladi (masalan `row.year`) — faqat matn sifatida chiqariladi.
    label: {
      type: [String, Number],
      default: ''
    },
    // `Utils.colorTypes.*` ('Info', 'Success'…) — katta-kichik harf farq qilmaydi.
    type: {
      type: String,
      default: Utils.colorTypes.info
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    icon: {
      type: Object,
      default: null
    },
    // Eski proplar — chip o'z padding'iga ega, e'tiborga olinmaydi.
    paddingY: {
      type: String,
      default: ''
    }
  })

  // colorType -> chip rangi va standart ikonkasi. Ikonka faqat holat ranglarida
  // (yashil / sariq / qizil); oddiy yorliqlar ikonkasiz — o'z `icon`i berilmasa.
  const types = {
    info: { tone: 'brand', icon: null },
    primary: { tone: 'brand', icon: null },
    success: { tone: 'green', icon: icons.figBadgeCheck },
    warning: { tone: 'amber', icon: Timer16Regular },
    error: { tone: 'red', icon: ErrorCircle12Filled },
    dark: { tone: 'neutral', icon: null },
    secondary: { tone: 'neutral', icon: null }
  }

  const current = computed(() => types[String(props.type || '').toLowerCase()] || types.info)
  const chipIcon = computed(() => (props.showIcon ? props.icon || current.value.icon : null))
</script>

<template>
  <div class="flex items-center max-w-full">
    <UIChip :label="label" :tone="current.tone" :icon="chipIcon" tooltip>
      <template v-if="$slots.icon && showIcon" #icon>
        <slot name="icon" />
      </template>
    </UIChip>
  </div>
</template>
