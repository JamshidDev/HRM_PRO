<script setup>
  import {
    Checkmark20Regular,
    Dismiss20Regular,
    Edit20Regular,
    Phone20Regular
  } from '@vicons/fluent'
  import { UIFigBlock } from '@/components/index.js'
  import { useMobileUserStore, useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useMobileUserStore()
  const accStore = useAccountStore()

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.mobileAppVersion))

  const platforms = ['android', 'ios']
  const rowByPlatform = (platform) => store.versions.find((v) => v.platform === platform) ?? null

  const onUpgrade = (platform) => {
    if (!canWrite.value) return
    store._startVersionEdit(platform)
  }

  // Kiritish paytida faqat raqam va nuqta o'tkaziladi.
  const allowVersion = (v) => v === '' || /^[0-9.]*$/.test(v)

  // `1`, `1.9`, `1.9.2`, `1.9.2.3` — semver uslubidagi 1-4 bo'lak.
  const VERSION_RE = /^\d+(\.\d+){0,3}$/

  const onSave = () => {
    const value = String(store.editValue ?? '').trim()
    if (!value) return
    if (!VERSION_RE.test(value)) {
      $Toast.error(t('mobileUserPage.versionInvalid'))
      return
    }
    void store._saveVersion()
  }

  onMounted(() => {
    if (!accStore.canView(accStore.pn.mobileUsersRead)) return
    store._loadVersions()
  })
</script>

<template>
  <div class="version-cards">
    <UIFigBlock
      v-for="platform in platforms"
      :key="platform"
      class="version-card"
      :title="platform === 'android' ? 'Android' : 'iOS'"
      :icon="Phone20Regular"
      :watermark="false"
    >
      <n-spin v-if="store.versionsLoading" size="small" />

      <div v-else class="version-row">
        <div class="version-row__label">{{ $t('mobileUserPage.form.latestVersion') }}</div>

        <template v-if="store.editingPlatform === platform">
          <div class="version-row__edit">
            <!-- Versiya MATN: `1.9.2` son emas, shuning uchun `n-input-number`
                 to'g'ri kelmaydi (u `1.9` ga kesib tashlardi). -->
            <n-input
              v-model:value="store.editValue"
              size="small"
              class="version-row__input"
              placeholder="1.9.2"
              :allow-input="allowVersion"
              :maxlength="20"
              @keyup.enter="onSave"
            />
            <button
              type="button"
              class="version-icon-btn version-icon-btn--ghost"
              :disabled="store.versionSaving"
              @click="store._cancelVersionEdit()"
            >
              <n-icon :size="16"><Dismiss20Regular /></n-icon>
            </button>
            <button
              type="button"
              class="version-icon-btn version-icon-btn--brand"
              :disabled="store.versionSaving"
              @click="onSave"
            >
              <n-spin v-if="store.versionSaving" size="12" />
              <n-icon v-else :size="16"><Checkmark20Regular /></n-icon>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="version-row__view">
            <span class="version-row__value">{{
              rowByPlatform(platform)?.latest_version || '—'
            }}</span>
            <n-tooltip v-if="canWrite" trigger="hover">
              <template #trigger>
                <button
                  type="button"
                  class="version-icon-btn version-icon-btn--edit"
                  @click="onUpgrade(platform)"
                >
                  <n-icon :size="16"><Edit20Regular /></n-icon>
                </button>
              </template>
              {{ $t('mobileUserPage.upgrade') }}
            </n-tooltip>
          </div>
        </template>
      </div>
    </UIFigBlock>
  </div>
</template>

<style scoped>
  .version-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
  }

  .version-card {
    flex: 0 0 auto;
    width: 260px;
  }

  .version-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .version-row__label {
    font-size: 12px;
    color: var(--fig-text-secondary, #71717a);
  }

  .version-row__view {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .version-row__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--fig-text-primary, #18181b);
  }

  .version-row__edit {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .version-row__input {
    flex: 1 1 auto;
  }

  .version-icon-btn {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--fig-br-disable, #e4e4e7);
    background: var(--fig-bg-surface, #fff);
    color: var(--fig-text-secondary, #71717a);
    transition:
      background-color 0.16s ease,
      border-color 0.16s ease,
      color 0.16s ease;
  }

  .version-icon-btn:disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .version-icon-btn--ghost:hover {
    border-color: var(--fig-text-danger, #dc2626);
    color: var(--fig-text-danger, #dc2626);
  }

  .version-icon-btn--brand {
    border-color: var(--fig-text-brand, #1570ef);
    background: var(--fig-text-brand, #1570ef);
    color: #fff;
  }

  .version-icon-btn--brand:hover {
    opacity: 0.9;
  }

  .version-icon-btn--edit:hover {
    border-color: var(--fig-text-brand, #1570ef);
    color: var(--fig-text-brand, #1570ef);
  }

  @media (max-width: 640px) {
    .version-card {
      width: 100%;
    }
  }
</style>
