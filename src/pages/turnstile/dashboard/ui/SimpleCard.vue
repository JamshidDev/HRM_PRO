<script setup>
  import { UIUserGroup } from '@/components/index.js'
  import { Utils } from '@/utils/index.js'
  import DeltaBadge from './DeltaBadge.vue'
  import UserIcon1 from '@/assets/icons/user-icon-1.svg'
  import UserIcon2 from '@/assets/icons/user-icon-2.svg'
  import UserIcon3 from '@/assets/icons/user-icon-3.svg'

  const props = defineProps({
    type: {
      type: String,
      default: 'primary'
    },
    count: Number,
    title: String,
    icon: Object,
    list: Array,
    listMore: {
      type: Number,
      default: null
    },
    badgeText: {
      type: String,
      default: null
    },
    delta: {
      type: Object,
      default: null
    },
    invert: Boolean,
    deltaLoading: Boolean,
    // Ikonka SVG'sining o'z rangi (hex). Berilsa chip foni shu rangdan olinadi.
    chipColor: {
      type: String,
      default: null
    },
    // Yuqori o'ng burchakdagi dekorativ rasm: 1 | 2 | 3
    decor: {
      type: Number,
      default: null
    }
  })

  const typeClass = computed(() => {
    const classes = {
      primary: 'text-primary bg-primary/10',
      warning: 'text-warning bg-warning/10',
      dark: 'text-dark bg-dark/10',
      danger: 'text-danger bg-danger/10',
      success: 'text-success bg-success/10'
    }
    return classes[props.type] || classes.primary
  })

  // Kartaning yuqori o'ng burchagidagi xira dekorativ rasm.
  const decorIcons = { 1: UserIcon1, 2: UserIcon2, 3: UserIcon3 }
  const decorIcon = computed(() => decorIcons[props.decor] || null)

  const formatted = computed(() => Utils.formatNumberToMoney(props.count) || '0')
</script>

<template>
  <div
    class="flex flex-col cursor-pointer border border-surface-line hover-effect-card p-4 rounded-2xl bg-surface-section/75 relative overflow-hidden"
  >
    <!-- yuqori o'ng burchakdagi xira dekor -->
    <component
      :is="decorIcon"
      v-if="decorIcon"
      aria-hidden="true"
      class="absolute -top-2 right-2 w-[86px] h-[86px] pointer-events-none select-none"
    />

    <!-- yuqori qator: ikonka + sarlavha -->
    <div class="relative flex items-start gap-3">
      <div
        :class="chipColor ? '' : typeClass"
        :style="chipColor ? { backgroundColor: chipColor + '1A' } : null"
        class="w-[36px] h-[36px] shrink-0 rounded-[10px] flex justify-center items-center"
      >
        <component :is="icon" class="w-[20px] h-[20px]" />
      </div>
      <p class="text-sm font-semibold text-textColor0 leading-[1.3] line-clamp-2 pt-1">
        {{ title }}
      </p>
    </div>

    <!-- katta raqam va o'ngda avatarlar -->
    <div class="relative flex items-end justify-between gap-3 mt-4">
      <div class="font-grotesk font-bold text-textColor0 text-[30px] leading-[1.1]">
        {{ formatted }}
      </div>
      <span class="shrink-0" v-if="listMore">
        <UIUserGroup
          @click.stop
          :max="3"
          :data="listMore > 3 ? [...list, ...list] : list"
          :has-more="listMore - 3"
        />
      </span>
    </div>

    <div class="border-t border-surface-line mt-4 pt-3">
      <DeltaBadge :delta="delta" :invert="invert" :loading="deltaLoading" />
    </div>
  </div>
</template>
