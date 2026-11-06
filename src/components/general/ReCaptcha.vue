<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import RefreshIcon from '@/assets/icons/figRefresh.svg'

  const emit = defineEmits(['update:answer', 'update:key', 'update:enabled', 'submit'])

  const imgSrc = ref(null)
  const loading = ref(false)
  const error = ref(false)
  const answer = ref('')
  let expireTimer = null

  function clearExpireTimer() {
    if (expireTimer) {
      clearTimeout(expireTimer)
      expireTimer = null
    }
  }

  async function loadCaptcha() {
    loading.value = true
    error.value = false
    answer.value = ''
    clearExpireTimer()
    emit('update:answer', '')
    emit('update:key', null)
    try {
      const res = await $ApiService.authService._getCaptcha()
      const data = res.data?.data ?? res.data
      imgSrc.value = data.captcha_image
      emit('update:key', data.captcha_key)
      // Backend captcha o'chirilgan (lokal) bo'lsa — maydon ko'rsatilmaydi.
      emit('update:enabled', data.enabled !== false)
      if (data.expires_in) {
        expireTimer = setTimeout(loadCaptcha, data.expires_in * 1000)
      }
    } catch {
      imgSrc.value = null
      error.value = true
    } finally {
      loading.value = false
    }
  }

  function onInput(val) {
    answer.value = val
    emit('update:answer', val)
  }

  function reset() {
    loadCaptcha()
  }

  onMounted(loadCaptcha)
  onBeforeUnmount(clearExpireTimer)

  defineExpose({ reset })
</script>

<template>
  <div class="captcha-block w-full flex items-center gap-2">
    <!-- Figma «Container» (node 4821:46349): 216×56, 16px radius, rasm 174px + 40px tugma -->
    <div class="captcha-card flex items-stretch rounded-2xl overflow-hidden border shrink-0">
      <div class="captcha-image flex items-center justify-center">
        <n-spin v-if="loading" :size="20" />
        <img v-else-if="imgSrc" :src="imgSrc" alt="captcha" class="captcha-img object-contain" />
        <span v-else class="text-textColor3 text-xs px-2 text-center">{{
          $t('loginPage.captchaWrong')
        }}</span>
      </div>

      <n-tooltip placement="top" trigger="hover">
        <template #trigger>
          <button
            type="button"
            class="captcha-refresh"
            :class="{ 'is-loading': loading }"
            :disabled="loading"
            @click="reset"
          >
            <n-icon :size="18"><RefreshIcon /></n-icon>
          </button>
        </template>
        <span>{{ $t('loginPage.captchaRefresh') }}</span>
      </n-tooltip>
    </div>

    <n-input
      size="large"
      class="grow login-new__input captcha-input"
      :value="answer"
      :placeholder="$t('loginPage.captchaPlaceholder')"
      :maxlength="10"
      @update:value="onInput"
      @keyup.enter="$emit('submit')"
    />
  </div>
</template>

<style scoped>
  .captcha-card {
    height: 56px;
    background-color: var(--login-captcha-bg, var(--color-surface-section));
    border-color: var(--login-field-border, var(--color-surface-line));
  }

  .captcha-image {
    height: 100%;
    width: 174px;
    padding: 3px 0;
  }

  /* Javob maydoni captcha bilan bir balandlikda (Figma: 56px, 12px radius) */
  .captcha-input {
    --n-height: 56px !important;
    --n-border-radius: 12px !important;
  }

  .captcha-img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    display: block;
  }

  .captcha-refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 100%;
    border-left: 1px solid var(--login-field-border, var(--color-surface-line));
    background-color: transparent;
    color: var(--login-ink, var(--color-textColor0));
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .captcha-refresh:hover:not(:disabled) {
    background-color: var(--login-field-border, var(--color-surface-line));
    color: var(--login-ink, var(--color-textColor0));
  }

  .captcha-refresh:active:not(:disabled) {
    transform: scale(0.96);
  }

  .captcha-refresh:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .captcha-refresh.is-loading :deep(svg) {
    animation: captcha-spin 0.8s linear infinite;
  }

  @keyframes captcha-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
