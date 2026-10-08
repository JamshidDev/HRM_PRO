<script setup>
  // Admin: iqtisod bo'limi E-IMZO tasdig'i — yoqish/o'chirish, faol tasdiqlar, bekor qilish.
  import { ShieldKeyhole24Filled } from '@vicons/fluent'
  import { UIPageContent } from '@/components/index.js'
  import axios from '@/service/index.js'
  import i18n from '@/i18n/index.js'
  import dayjs from 'dayjs'

  const { t } = i18n.global

  const enabled = ref(true)
  const settingsLoading = ref(false)
  const list = ref([])
  const listLoading = ref(false)
  const revoking = ref(null)

  const loadSettings = async () => {
    const res = await axios.get('/v1/eimzo-gate/admin/settings')
    enabled.value = !!res.data?.data?.enabled
  }

  const loadList = async () => {
    listLoading.value = true
    try {
      const res = await axios.get('/v1/eimzo-gate/admin/verifications')
      list.value = res.data?.data ?? []
    } finally {
      listLoading.value = false
    }
  }

  const onToggle = async (value) => {
    settingsLoading.value = true
    try {
      const res = await axios.put(
        '/v1/eimzo-gate/admin/settings',
        { enabled: value },
        { silentSuccess: true }
      )
      enabled.value = !!res.data?.data?.enabled
      $Toast.success(t(enabled.value ? 'eimzoGateAdmin.enabledToast' : 'eimzoGateAdmin.disabledToast'))
    } finally {
      settingsLoading.value = false
    }
  }

  const onRevoke = async (row) => {
    revoking.value = row.user_id
    try {
      await axios.delete(`/v1/eimzo-gate/admin/verifications/${row.user_id}`, {
        silentSuccess: true
      })
      $Toast.success(t('eimzoGateAdmin.revokedToast'))
      await loadList()
    } finally {
      revoking.value = null
    }
  }

  const columns = computed(() => [
    { title: t('eimzoGateAdmin.user'), key: 'full_name', render: (r) => r.full_name || `#${r.user_id}` },
    { title: t('eimzoGateAdmin.phone'), key: 'phone' },
    { title: t('eimzoGateAdmin.cert'), key: 'cert_name' },
    { title: t('eimzoGateAdmin.serial'), key: 'cert_serial' },
    {
      title: t('eimzoGateAdmin.verifiedAt'),
      key: 'verified_at',
      render: (r) => dayjs(r.verified_at).format('DD.MM.YYYY HH:mm')
    },
    {
      title: '',
      key: 'actions',
      width: 150,
      render: (r) =>
        h(
          resolveComponent('n-button'),
          {
            size: 'small',
            type: 'error',
            secondary: true,
            loading: revoking.value === r.user_id,
            onClick: () => onRevoke(r)
          },
          { default: () => t('eimzoGateAdmin.revoke') }
        )
    }
  ])

  onMounted(() => {
    loadSettings()
    loadList()
  })
</script>

<template>
  <UIPageContent>
    <div class="flex flex-col gap-4">
      <div
        class="flex items-center gap-4 rounded-2xl border border-surface-line bg-surface-section px-5 py-4"
      >
        <div
          class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <n-icon size="22"><ShieldKeyhole24Filled /></n-icon>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-textColor0">{{ t('eimzoGateAdmin.title') }}</div>
          <div class="text-xs text-textColor3 mt-0.5">{{ t('eimzoGateAdmin.subtitle') }}</div>
        </div>
        <n-switch :value="enabled" :loading="settingsLoading" @update:value="onToggle" />
      </div>

      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-textColor0">
          {{ t('eimzoGateAdmin.listTitle') }} ({{ list.length }})
        </div>
        <n-button size="small" secondary :loading="listLoading" @click="loadList">
          {{ t('eimzoGateAdmin.refresh') }}
        </n-button>
      </div>
      <n-data-table
        :columns="columns"
        :data="list"
        :loading="listLoading"
        :bordered="false"
        size="small"
        :row-key="(r) => r.token_id"
      />
    </div>
  </UIPageContent>
</template>
