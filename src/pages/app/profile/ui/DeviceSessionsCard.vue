<script setup>
  import { Desktop20Regular, Dismiss16Regular, Phone20Regular } from '@vicons/fluent'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import DeviceIcon from '@/assets/icons/figKey.svg'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const loading = ref(false)
  const revoking = ref(null)
  const sessions = ref([])
  const remaining = ref(0)
  let timer = null

  // Mobil qurilmalar tepada, keyin web; har guruhda oxirgi faollik bo'yicha.
  const sorted = computed(() =>
    [...sessions.value].sort(
      (a, b) =>
        (a.kind === 'mobile' ? 0 : 1) - (b.kind === 'mobile' ? 0 : 1) ||
        String(b.last_active_at || '').localeCompare(String(a.last_active_at || ''))
    )
  )
  const current = computed(() => sessions.value.find((s) => s.is_current))
  const others = computed(() => sessions.value.filter((s) => !s.is_current))

  // Yangi seans eskilarini 60 daqiqadan keyin yopadi; o'zidan yangisini — istalgan payt (web va mobil bir xil).
  const canRevoke = (s) =>
    !s.is_current &&
    (remaining.value === 0 || String(s.created_at || '') > String(current.value?.created_at || ''))
  const minutesLeft = computed(() => Math.ceil(remaining.value / 60))

  const title = (s) =>
    s.kind === 'mobile'
      ? s.device_model || s.platform || '—'
      : [s.browser, s.os].filter(Boolean).join(' · ') || 'Web'

  const startTimer = () => {
    clearInterval(timer)
    if (remaining.value <= 0) return
    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)
      if (!remaining.value) clearInterval(timer)
    }, 1000)
  }

  const load = () => {
    loading.value = true
    $ApiService.accountService
      ._sessions()
      .then((res) => {
        const data = res.data.data
        sessions.value = (data.sessions || []).filter((s) => s.kind !== 'integration')
        remaining.value = Number(data.remaining_seconds) || 0
        startTimer()
      })
      .finally(() => {
        loading.value = false
      })
  }

  const revoke = (s) => {
    revoking.value = s.id
    $ApiService.accountService
      ._revokeSession({ id: s.id })
      .then(() => {
        $Toast.success(t('deviceSessions.revoked'))
        load()
      })
      .finally(() => {
        revoking.value = null
      })
  }

  const revokeOthers = () => {
    revoking.value = 'all'
    $ApiService.accountService
      ._revokeOtherSessions()
      .then(() => {
        $Toast.success(t('deviceSessions.revoked'))
        load()
      })
      .finally(() => {
        revoking.value = null
      })
  }

  onMounted(load)
  onUnmounted(() => clearInterval(timer))
</script>

<template>
  <SectionHeader :title="$t('deviceSessions.title')" :icon="DeviceIcon" large full-height>
    <n-spin :show="loading">
      <div
        v-if="remaining > 0 && others.length"
        class="rounded-2xl bg-primary/8 px-4 py-3 mb-3 text-sm text-textColor2"
      >
        {{ $t('deviceSessions.protected', { min: minutesLeft }) }}
      </div>

      <div v-if="sorted.length" class="grid grid-cols-1 gap-2">
        <div
          v-for="s in sorted"
          :key="s.id"
          class="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-surface-ground px-4 py-3"
        >
          <span
            class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
          >
            <n-icon size="20">
              <Phone20Regular v-if="s.kind === 'mobile'" />
              <Desktop20Regular v-else />
            </n-icon>
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 min-w-0">
              <p class="text-sm font-semibold text-textColor0 truncate">{{ title(s) }}</p>
              <n-tag v-if="s.is_current" size="small" type="success" round>
                {{ $t('deviceSessions.current') }}
              </n-tag>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-textColor3">
              <span>{{ $t(`deviceSessions.kind.${s.kind}`) }}</span>
              <span v-if="s.kind === 'mobile' && s.app_version">v{{ s.app_version }}</span>
              <span v-if="s.ip" class="font-mono">{{ s.ip }}</span>
              <span v-if="s.last_active_at">
                {{ $t('deviceSessions.lastActive') }}: {{ Utils.timeWithMonth(s.last_active_at) }}
              </span>
            </div>
          </div>
          <n-popconfirm
            v-if="!s.is_current"
            :positive-text="$t('deviceSessions.revoke')"
            :negative-text="$t('content.cancel')"
            @positive-click="revoke(s)"
          >
            <template #trigger>
              <n-button
                size="small"
                type="error"
                secondary
                :disabled="!canRevoke(s)"
                :loading="revoking === s.id"
              >
                <template #icon>
                  <n-icon><Dismiss16Regular /></n-icon>
                </template>
                {{ $t('deviceSessions.revoke') }}
              </n-button>
            </template>
            {{ $t('deviceSessions.revokeConfirm') }}
          </n-popconfirm>
        </div>
      </div>
      <n-empty v-else-if="!loading" :description="$t('deviceSessions.empty')" class="py-8" />

      <n-popconfirm
        v-if="others.length > 1"
        :positive-text="$t('deviceSessions.revoke')"
        :negative-text="$t('content.cancel')"
        @positive-click="revokeOthers"
      >
        <template #trigger>
          <n-button
            class="mt-3"
            type="error"
            secondary
            block
            :disabled="remaining > 0"
            :loading="revoking === 'all'"
          >
            {{ $t('deviceSessions.revokeOthers') }}
          </n-button>
        </template>
        {{ $t('deviceSessions.revokeOthersConfirm') }}
      </n-popconfirm>
    </n-spin>
  </SectionHeader>
</template>
