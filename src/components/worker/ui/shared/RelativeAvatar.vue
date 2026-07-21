<script setup>
  const props = defineProps({
    fullName: {
      type: String,
      default: ''
    },
    relationName: {
      type: String,
      default: ''
    }
  })

  // No relation-type enum exists on the backend (relationName is free text),
  // so the color is derived deterministically from the text itself.
  const PALETTE = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-rose-100', text: 'text-rose-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600' }
  ]

  const hashIndex = (text) => {
    const sum = text
      .toString()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return sum % PALETTE.length
  }

  const colors = computed(() => PALETTE[hashIndex(props.relationName || props.fullName)])

  const initials = computed(() => {
    return (props.fullName || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  })
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      class="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-semibold"
      :class="[colors.bg, colors.text]"
    >
      {{ initials }}
    </span>
    <span class="text-xs font-medium px-2 py-1 rounded-full" :class="[colors.bg, colors.text]">
      {{ relationName }}
    </span>
  </div>
</template>
