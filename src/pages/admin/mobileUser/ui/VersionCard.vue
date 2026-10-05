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

  // `1.9`, `19.2.1`, `1.9.2.3` — semver uslubidagi 1-4 bo'lak (backend bilan bir xil).
  const VERSION_RE = /^\d+(\.\d+){0,3}$/

  // Bo'laklar son sifatida solishtiriladi: `1.10.0 > 1.9.3`.
  const compareVersions = (a, b) => {
    const pa = a.split('.').map(Number)
    const pb = b.split('.').map(Number)
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] ?? 0) - (pb[i] ?? 0)
      if (d !== 0) return d < 0 ? -1 : 1
    }
    return 0
  }

  const draft = computed(() => ({
    latest: String(store.editLatest ?? '').trim(),
    min: String(store.editMin ?? '').trim()
  }))

  // Minimal versiya ko'tarilsa — pastdagi hamma foydalanuvchi bloklanadi, alohida ogohlantiriladi.
  const minRaised = computed(() => {
    const current = rowByPlatform(store.editingPlatform)?.min_supported_version
    const { min } = draft.value
    if (!VERSION_RE.test(min)) return false
    return !current || !VERSION_RE.test(current) || compareVersions(min, current) > 0
  })

  const validate = () => {
    const { latest, min } = draft.value
    if (!latest || !min) return false
    if (!VERSION_RE.test(latest) || !VERSION_RE.test(min)) {
      $Toast.error(t('mobileUserPage.versionInvalid'))
      return false
    }
    if (compareVersions(min, latest) > 0) {
      $Toast.error(t('mobileUserPage.minGreaterThanLatest'))
      return false
    }
    return true
  }

  const forceHint = (platform) => {
    const row = rowByPlatform(platform)
    return row?.force_update
      ? t('mobileUserPage.forcedHint', { version: row.latest_version })
      : t('mobileUserPage.optionalHint', { min: row?.min_supported_version })
  }

  // Popconfirm faqat to'g'ri qiymatda ochiladi — aks holda xato darhol ko'rsatiladi.
  const confirmShow = ref(false)
  const onConfirmShow = (show) => {
    confirmShow.value = show ? validate() : false
  }

  const onSave = () => {
    if (!validate()) return
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

      <div v-else-if="store.editingPlatform === platform" class="version-edit">
        <!-- Versiya MATN: `1.9.2` son emas, shuning uchun `n-input-number` to'g'ri kelmaydi. -->
        <label class="version-field">
          <span class="version-field__label">{{ $t('mobileUserPage.form.latestVersion') }}</span>
          <n-input
            v-model:value="store.editLatest"
            size="small"
            placeholder="19.2.1"
            :allow-input="allowVersion"
            :maxlength="20"
          />
        </label>
        <label class="version-field">
          <span class="version-field__label">{{ $t('mobileUserPage.form.minVersion') }}</span>
          <n-input
            v-model:value="store.editMin"
            size="small"
            placeholder="19.2.0"
            :allow-input="allowVersion"
            :maxlength="20"
          />
        </label>
        <div class="version-edit__actions">
          <button
            type="button"
            class="version-icon-btn version-icon-btn--ghost"
            :disabled="store.versionSaving"
            @click="store._cancelVersionEdit()"
          >
            <n-icon :size="16"><Dismiss20Regular /></n-icon>
          </button>
          <n-popconfirm
            :positive-text="$t('content.confirm')"
            :negative-text="$t('content.cancel')"
            :show="confirmShow"
            @update:show="onConfirmShow"
            @positive-click="onSave"
          >
            <template #trigger>
              <button
                type="button"
                class="version-icon-btn version-icon-btn--brand"
                :disabled="store.versionSaving"
              >
                <n-spin v-if="store.versionSaving" size="12" />
                <n-icon v-else :size="16"><Checkmark20Regular /></n-icon>
              </button>
            </template>
            <div class="max-w-[300px] text-pretty">
              {{
                minRaised
                  ? $t('mobileUserPage.confirmMinRaise', { version: draft.min })
                  : $t('mobileUserPage.confirmSave')
              }}
            </div>
          </n-popconfirm>
        </div>
      </div>

      <div v-else class="version-row">
        <div class="version-row__view">
          <div>
            <div class="version-row__label">{{ $t('mobileUserPage.form.latestVersion') }}</div>
            <span class="version-row__value">{{
              rowByPlatform(platform)?.latest_version || '—'
            }}</span>
          </div>
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
        <div v-if="rowByPlatform(platform)?.latest_version" class="version-row__meta">
          <span>
            {{ $t('mobileUserPage.form.minVersion') }}:
            <b>{{ rowByPlatform(platform)?.min_supported_version || '—' }}</b>
          </span>
          <!-- Pastga ochiladi — tepadagi tahrirlash tugmasini yopmasin. -->
          <n-tooltip trigger="hover" placement="bottom">
            <template #trigger>
              <n-tag
                size="small"
                round
                :bordered="false"
                :type="rowByPlatform(platform)?.force_update ? 'error' : 'success'"
              >
                {{
                  rowByPlatform(platform)?.force_update
                    ? $t('mobileUserPage.forced')
                    : $t('mobileUserPage.optional')
                }}
              </n-tag>
            </template>
            {{ forceHint(platform) }}
          </n-tooltip>
        </div>
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
    width: 280px;
  }

  .version-edit {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .version-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .version-field__label {
    font-size: 12px;
    color: var(--fig-text-secondary, #71717a);
  }

  .version-edit__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .version-row__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    color: var(--fig-text-secondary, #71717a);
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
