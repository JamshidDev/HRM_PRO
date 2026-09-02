<script setup>
  import { Pin16Filled, Pin16Regular } from '@vicons/fluent'
  import { MenuItemBadge } from '@components'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    item: { type: Object, required: true },
    category: { type: String, default: null },
    active: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false }
  })

  const emit = defineEmits(['select', 'togglePin'])

  const pinTitle = computed(() => (props.pinned ? t('sidebar.unpin') : t('sidebar.pin')))
</script>

<template>
  <div
    @click="emit('select', item)"
    class="panel-item-single relative"
    :class="[active && 'active-panel-item-single', item?.disable && 'opacity-30']"
  >
    <MenuItemBadge :category="category" :field="item?.name" />
    <div class="item-icon rounded-[10px]">
      <n-icon size="20">
        <component :is="item.icon" />
      </n-icon>
    </div>
    <div class="item-title truncate pl-2">
      <span>{{ $t(item.label) }} </span>
    </div>

    <!--
      Pin tugmasi: pinlangan elementda doim, qolganida faqat hoverda ko'rinadi.
      Joyi HAR DOIM band (`.panel-item-pin` kengligi o'zgarmaydi) — aks holda hover
      paytida sarlavha qisqarib "sakrab" turardi.
      `click.stop` — busiz bosish ustidagi qatorning navigatsiyasini ham chaqiradi.
    -->
    <button
      type="button"
      class="panel-item-pin"
      :class="pinned && 'panel-item-pin-on'"
      :title="pinTitle"
      @click.stop="emit('togglePin', item)"
    >
      <n-icon size="14">
        <Pin16Filled v-if="pinned" />
        <Pin16Regular v-else />
      </n-icon>
    </button>
  </div>
</template>
