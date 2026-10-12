<script setup>
  import {
    ArrowEnterLeft20Regular,
    Certificate20Regular,
    Desktop20Regular,
    Password20Regular,
    Phone20Regular,
    QrCode20Regular
  } from '@vicons/fluent'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import ShieldIcon from '@/assets/icons/tsDoorOpen.svg'
  import Utils from '@/utils/Utils.js'

  const PER_PAGE = 10

  const methodIcons = { password: Password20Regular, qr: QrCode20Regular, eimzo: Certificate20Regular, app: Phone20Regular }

  const loading = ref(false)
  const rows = ref([])
  const total = ref(0)
  const page = ref(1)
  const clientId = ref(null)
  const clientOptions = ref([])

  const load = () => {
    loading.value = true
    $ApiService.accountService
      ._ssoLogins({ params: { page: page.value, per_page: PER_PAGE, client_id: clientId.value || undefined } })
      .then((res) => {
        rows.value = res.data.data.data
        total.value = res.data.data.total
      })
      .finally(() => {
        loading.value = false
      })
  }

  const onFilter = () => {
    page.value = 1
    load()
  }

  // «Chrome · macOS» ko'rinishidagi qisqa qurilma nomi.
  const device = (ua) => {
    if (!ua) return null
    const browser =
      [['Edg/', 'Edge'], ['OPR/', 'Opera'], ['YaBrowser', 'Yandex'], ['Firefox/', 'Firefox'], ['Chrome/', 'Chrome'], ['Safari/', 'Safari']].find(
        ([needle]) => ua.includes(needle)
      )?.[1] ?? null
    const os =
      [['Android', 'Android'], ['iPhone', 'iOS'], ['iPad', 'iOS'], ['Windows', 'Windows'], ['Mac OS', 'macOS'], ['Linux', 'Linux']].find(
        ([needle]) => ua.includes(needle)
      )?.[1] ?? null
    return [browser, os].filter(Boolean).join(' · ') || ua.slice(0, 60)
  }

  const isMobile = (ua) => /Android|iPhone|iPad/.test(ua ?? '')

  onMounted(() => {
    load()
    $ApiService.accountService._ssoLoginClients().then((res) => {
      clientOptions.value = res.data.data.map((c) => ({ label: c.name, value: c.id }))
    })
  })
</script>

<template>
  <SectionHeader :title="$t('ssoLogins.title')" :icon="ShieldIcon" large>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <p class="text-sm text-textColor2 max-w-[640px]">{{ $t('ssoLogins.description') }}</p>
      <n-select
        v-model:value="clientId"
        :options="clientOptions"
        :placeholder="$t('ssoLogins.allSystems')"
        clearable
        class="w-[240px]"
        @update:value="onFilter"
      />
    </div>

    <n-spin :show="loading">
      <div v-if="rows.length" class="grid grid-cols-1 gap-2">
        <div
          v-for="item in rows"
          :key="item.id"
          class="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-surface-ground px-4 py-3"
        >
          <span class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <n-icon size="20"><ArrowEnterLeft20Regular /></n-icon>
          </span>

          <div class="min-w-0">
            <p class="text-sm font-semibold text-textColor0 truncate">{{ item.client?.name ?? '—' }}</p>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-textColor3">
              <span class="flex items-center gap-1">
                <n-icon size="14"><component :is="methodIcons[item.auth_method]" /></n-icon>
                {{ $t(`ssoLogins.method.${item.auth_method}`) }}
              </span>
              <span v-if="item.ip" class="font-mono">{{ item.ip }}</span>
              <span v-if="item.user_agent" class="flex items-center gap-1" :title="item.user_agent">
                <n-icon size="14">
                  <Phone20Regular v-if="isMobile(item.user_agent)" />
                  <Desktop20Regular v-else />
                </n-icon>
                {{ device(item.user_agent) }}
              </span>
            </div>
          </div>

          <span class="text-xs text-textColor2 whitespace-nowrap">
            {{ Utils.timeWithMonth(item.created_at) }}
          </span>
        </div>
      </div>

      <n-empty v-else-if="!loading" :description="$t('ssoLogins.empty')" class="py-10" />
    </n-spin>

    <div v-if="total > PER_PAGE" class="flex justify-end mt-4">
      <n-pagination
        v-model:page="page"
        :page-size="PER_PAGE"
        :item-count="total"
        @update:page="load"
      />
    </div>
  </SectionHeader>
</template>
