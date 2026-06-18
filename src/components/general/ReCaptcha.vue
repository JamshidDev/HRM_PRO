<script setup>
  import { ref, onMounted } from 'vue'

  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  const emit = defineEmits(['update:answer'])

  const containerRef = ref(null)
  const widgetId = ref(null)

  function loadScript() {
    if (document.querySelector('script[src*="recaptcha/api.js"]')) return Promise.resolve()
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = resolve
      document.head.appendChild(script)
    })
  }

  function waitForGrecaptcha() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.grecaptcha?.render) {
          window.grecaptcha.ready(resolve)
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  function renderWidget() {
    if (!containerRef.value) return
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    widgetId.value = window.grecaptcha.render(containerRef.value, {
      sitekey: SITE_KEY,
      theme: isDark ? 'dark' : 'light',
      callback: (token) => emit('update:answer', token),
      'expired-callback': () => emit('update:answer', null),
      'error-callback': () => emit('update:answer', null)
    })
  }

  function reset() {
    if (isLocalhost) {
      emit('update:answer', 'localhost-bypass')
      return
    }
    if (widgetId.value !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetId.value)
      emit('update:answer', null)
    }
  }

  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  onMounted(async () => {
    if (isLocalhost) {
      emit('update:answer', 'localhost-bypass')
      return
    }
    await loadScript()
    await waitForGrecaptcha()
    renderWidget()
  })

  defineExpose({ reset })
</script>

<template>
  <div ref="containerRef" />
</template>
