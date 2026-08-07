<script setup>
  import { UIUserGroup } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { auditCardMock } from './constants.js'

  const props = defineProps({
    // constants.js dagi auditCards yozuvi: { type, title, countKey, icon, color }
    card: {
      type: Object,
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  })

  defineEmits(['view'])

  const colorClass = computed(() => {
    const classes = {
      primary: 'text-primary bg-primary/10',
      success: 'text-success bg-success/10',
      warning: 'text-warning bg-warning/10',
      danger: 'text-danger bg-danger/10'
    }
    return classes[props.card.color] ?? classes.primary
  })

  // formatNumberToMoney 0/falsy uchun undefined qaytaradi — shuning uchun guard.
  const formattedCount = computed(() => Utils.formatNumberToMoney(props.count) ?? 0)
</script>

<template>
  <div
    @click="$emit('view')"
    class="h-full flex flex-col gap-3 p-4 border border-surface-line rounded-lg bg-surface-section hover-effect-card cursor-pointer"
  >
    <div class="flex items-center gap-2">
      <span
        :class="colorClass"
        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      >
        <n-icon size="18"><component :is="card.icon" /></n-icon>
      </span>
      <p class="font-medium text-textColor2 leading-snug line-clamp-2">{{ $t(card.title) }}</p>
    </div>

    <div class="flex items-end justify-between gap-2">
      <h3 class="text-3xl font-semibold text-textColor0 font-grotesk">{{ formattedCount }}</h3>
      <UIUserGroup
        @click.stop
        :max="3"
        :data="auditCardMock.avatars"
        :has-more="auditCardMock.avatarsMore"
      />
    </div>

    <div class="flex items-center justify-between gap-2 pt-3 border-t border-surface-line">
      <span class="text-xs text-textColor3">{{ $t('dashboardPage.audit.lastChecked') }}:</span>
      <span class="text-xs font-semibold text-textColor0">{{ auditCardMock.lastCheckedAt }}</span>
    </div>
  </div>
</template>
