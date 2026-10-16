<script setup>
  // Admin: iqtisod bo'limi E-IMZO tasdig'i — yoqish/o'chirish va tasdiqdan ozod rollar.
  import { ShieldKeyhole24Filled } from '@vicons/fluent'
  import { UIPageContent } from '@/components/index.js'
  import axios from '@/service/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const enabled = ref(true)
  const settingsLoading = ref(false)
  const roles = ref([])
  const rolesLoading = ref(false)
  const saving = ref(null)

  const loadSettings = async () => {
    const res = await axios.get('/v1/eimzo-gate/admin/settings')
    enabled.value = !!res.data?.data?.enabled
  }

  const loadRoles = async () => {
    rolesLoading.value = true
    try {
      const res = await axios.get('/v1/eimzo-gate/admin/exempt-roles')
      roles.value = res.data?.data ?? []
    } finally {
      rolesLoading.value = false
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
      $Toast.success(
        t(enabled.value ? 'eimzoGateAdmin.enabledToast' : 'eimzoGateAdmin.disabledToast')
      )
    } finally {
      settingsLoading.value = false
    }
  }

  const onExempt = async (row, value) => {
    saving.value = row.id
    try {
      await axios.put(
        `/v1/eimzo-gate/admin/exempt-roles/${row.id}`,
        { exempt: value },
        { silentSuccess: true }
      )
      row.exempt = value
      $Toast.success(t(value ? 'eimzoGateAdmin.exemptOnToast' : 'eimzoGateAdmin.exemptOffToast'))
    } finally {
      saving.value = null
    }
  }

  const exemptCount = computed(() => roles.value.filter((r) => r.exempt).length)

  const columns = computed(() => [
    { title: t('eimzoGateAdmin.role'), key: 'name' },
    { title: t('eimzoGateAdmin.usersCount'), key: 'users_count', width: 160 },
    {
      title: t('eimzoGateAdmin.exempt'),
      key: 'exempt',
      width: 220,
      render: (r) =>
        h('div', { class: 'flex items-center gap-2' }, [
          h(resolveComponent('n-switch'), {
            value: r.exempt,
            disabled: r.locked,
            loading: saving.value === r.id,
            'onUpdate:value': (v) => onExempt(r, v)
          }),
          r.locked
            ? h('span', { class: 'text-xs text-textColor3' }, t('eimzoGateAdmin.adminLocked'))
            : null
        ])
    }
  ])

  onMounted(() => {
    loadSettings()
    loadRoles()
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

      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="text-sm font-semibold text-textColor0">
            {{ t('eimzoGateAdmin.rolesTitle') }} ({{ exemptCount }})
          </div>
          <div class="text-xs text-textColor3 mt-0.5">{{ t('eimzoGateAdmin.rolesHint') }}</div>
        </div>
        <n-button size="small" secondary :loading="rolesLoading" @click="loadRoles">
          {{ t('eimzoGateAdmin.refresh') }}
        </n-button>
      </div>
      <n-data-table
        :columns="columns"
        :data="roles"
        :loading="rolesLoading"
        :bordered="false"
        size="small"
        :row-key="(r) => r.id"
      />
    </div>
  </UIPageContent>
</template>
