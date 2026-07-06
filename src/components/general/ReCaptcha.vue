<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { ArrowClockwise20Filled } from '@vicons/fluent'

  const emit = defineEmits(['update:answer', 'update:key', 'submit'])

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
    <div
      class="captcha-card flex items-stretch rounded-2xl overflow-hidden border border-surface-line bg-surface-section shrink-0"
    >
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
            <n-icon :size="18" :component="ArrowClockwise20Filled" />
          </button>
        </template>
        <span>{{ $t('loginPage.captchaRefresh') }}</span>
      </n-tooltip>
    </div>

    <n-input
      size="large"
      class="grow login-new__input"
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
    height: 48px;
  }

  @media (min-width: 1024px) {
    .captcha-card {
      height: 52px;
    }
  }

  .captcha-image {
    height: 100%;
    aspect-ratio: 160 / 46;
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
    border-left: 1px solid var(--color-surface-line);
    background-color: var(--color-surface-ground);
    color: var(--color-textColor2);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .captcha-refresh:hover:not(:disabled) {
    background-color: var(--color-surface-line);
    color: var(--color-textColor0);
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
