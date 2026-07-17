<script setup>
  const props = defineProps({
    length: {
      type: Number,
      default: 6
    }
  })
  const emit = defineEmits(['complete'])

  const model = defineModel({ type: String, default: '' })

  const digits = ref(Array.from({ length: props.length }, (_, i) => model.value?.[i] || ''))
  const cellRefs = ref([])

  watch(model, (value) => {
    const next = Array.from({ length: props.length }, (_, i) => value?.[i] || '')
    if (next.join('') !== digits.value.join('')) digits.value = next
  })

  const syncModel = () => {
    const value = digits.value.join('')
    model.value = value
    if (value.length === props.length && !digits.value.includes('')) emit('complete', value)
  }

  const fillFrom = (startIndex, rawText) => {
    const chars = rawText.replace(/\D/g, '').split('')
    chars.forEach((ch, offset) => {
      const target = startIndex + offset
      if (target < props.length) digits.value[target] = ch
    })
    syncModel()
    const focusIndex = Math.min(startIndex + chars.length, props.length - 1)
    nextTick(() => cellRefs.value[focusIndex]?.focus())
  }

  const onInput = (index, event) => {
    const raw = event.target.value
    if (raw.replace(/\D/g, '') === '') {
      digits.value[index] = ''
      syncModel()
      return
    }
    fillFrom(index, raw)
  }

  const onKeydown = (index, event) => {
    if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
      cellRefs.value[index - 1]?.focus()
    }
  }

  const onPaste = (index, event) => {
    event.preventDefault()
    const text = event.clipboardData?.getData('text') || ''
    fillFrom(index, text)
  }
</script>

<template>
  <div class="otp-box-input flex gap-2">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      ref="cellRefs"
      :value="digit"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="1"
      class="otp-box-input__cell"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste(index, $event)"
    />
  </div>
</template>

<style scoped>
  .otp-box-input__cell {
    width: 100%;
    max-width: 48px;
    height: 52px;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    border-radius: 16px;
    border: 1px solid var(--color-surface-line);
    background: transparent;
    color: var(--color-textColor0);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .otp-box-input__cell:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 16%, transparent);
  }
</style>
