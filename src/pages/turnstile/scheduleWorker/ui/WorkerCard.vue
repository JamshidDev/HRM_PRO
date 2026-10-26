<script setup>
  // Smena modallaridagi yagona xodim kartasi: avatar (bosh harflar) + ism + lavozim, o'ngda holat.
  const props = defineProps({
    name: { type: String, default: '' },
    position: { type: String, default: '' },
    // primary | danger | success
    tone: { type: String, default: 'primary' },
    // Kartani ajratib ko'rsatish (tanlangan / joriy xodim).
    highlight: { type: Boolean, default: false }
  })

  const initials = computed(() =>
    (props.name || '')
      .split(' ')
      .slice(0, 2)
      .map((x) => x[0] || '')
      .join('')
      .toUpperCase()
  )
  const toneClass = computed(
    () =>
      ({
        primary: 'bg-primary/10 text-primary',
        danger: 'bg-fig-red-50 text-fig-text-red',
        success: 'bg-success/10 text-success'
      })[props.tone] ?? 'bg-primary/10 text-primary'
  )
  const borderClass = computed(() => {
    if (!props.highlight) return 'border-surface-line'
    return props.tone === 'success' ? 'border-success/40 bg-success/5' : 'border-primary/60 bg-primary/5'
  })
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm" :class="borderClass">
    <div
      class="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold"
      :class="toneClass"
    >
      {{ initials }}
    </div>
    <div class="min-w-0 flex-1">
      <div class="font-medium leading-[1.25] line-clamp-2" :title="name">{{ name }}</div>
      <div v-if="position" class="text-xs text-secondary line-clamp-1">{{ position }}</div>
      <slot />
    </div>
    <div v-if="$slots.aside" class="shrink-0 flex flex-col items-end gap-1 text-xs">
      <slot name="aside" />
    </div>
  </div>
</template>
