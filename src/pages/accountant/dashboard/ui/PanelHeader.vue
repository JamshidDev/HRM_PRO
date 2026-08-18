<script setup>
  defineProps({
    icon: {
      type: [Object, Function],
      default: null
    },
    // Chip foni — maketdagi tint tokenlari
    tint: {
      type: String,
      default: 'indigo'
    },
    title: String,
    subtitle: String,
    // O'ng tarafdagi "Batafsil ↗" havolasi
    actionText: {
      type: String,
      default: null
    },
    // Maketda sarlavhasiz panellarda 500/secondary, subtitle borlarida 600/primary
    plain: Boolean
  })

  defineEmits(['action'])

  const tintClass = {
    blue: 'bg-fig-blue-100',
    green: 'bg-fig-green-100',
    indigo: 'bg-fig-indigo-100',
    amber: 'bg-fig-amber-100',
    pink: 'bg-fig-pink-100'
  }
</script>

<template>
  <div class="flex w-full items-center gap-2.5 py-3 pl-2 pr-1">
    <span v-if="icon" class="shrink-0 rounded-full p-1.5" :class="tintClass[tint]">
      <span class="flex h-5 w-5 items-center justify-center">
        <component :is="icon" />
      </span>
    </span>

    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <p
        class="truncate text-[14px] leading-[18px]"
        :class="
          plain ? 'font-medium text-fig-text-secondary' : 'font-semibold text-fig-text-primary'
        "
      >
        {{ title }}
      </p>
      <p v-if="subtitle" class="truncate text-[12px] leading-4 text-fig-text-tertiary">
        {{ subtitle }}
      </p>
    </div>

    <button
      v-if="actionText"
      type="button"
      class="shrink-0 cursor-pointer whitespace-nowrap px-2 text-[12px] leading-4 text-fig-text-brand"
      @click="$emit('action')"
    >
      {{ actionText }} ↗
    </button>
  </div>
</template>
