<script setup>
  import { Desktop20Regular, Phone20Regular } from '@vicons/fluent'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import DeviceIcon from '@/assets/icons/figKey.svg'
  import Utils from '@/utils/Utils.js'

  const loading = ref(false)
  const sessions = ref([])

  // Mobil qurilmalar tepada, keyin web; har guruhda oxirgi faollik bo'yicha.
  const sorted = computed(() =>
    [...sessions.value].sort(
      (a, b) =>
        (a.kind === 'mobile' ? 0 : 1) - (b.kind === 'mobile' ? 0 : 1) ||
        String(b.last_active_at || '').localeCompare(String(a.last_active_at || ''))
    )
  )

  const title = (s) =>
    s.kind === 'mobile'
      ? s.device_model || s.platform || '—'
      : [s.browser, s.os].filter(Boolean).join(' · ') || 'Web'

  const load = () => {
    loading.value = true
    $ApiService.accountService
      ._sessions()
      .then((res) => {
        sessions.value = (res.data.data.sessions || []).filter((s) => s.kind !== 'integration')
      })
      .finally(() => {
        loading.value = false
      })
  }

  onMounted(load)
</script>

<template>
  <SectionHeader :title="$t('deviceSessions.title')" :icon="DeviceIcon" large full-height>
    <n-spin :show="loading">
      <div v-if="sorted.length" class="grid grid-cols-1 gap-2">
        <div
          v-for="s in sorted"
          :key="s.id"
          class="grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl bg-surface-ground px-4 py-3"
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
        </div>
      </div>
      <n-empty v-else-if="!loading" :description="$t('deviceSessions.empty')" class="py-8" />
    </n-spin>
  </SectionHeader>
</template>
