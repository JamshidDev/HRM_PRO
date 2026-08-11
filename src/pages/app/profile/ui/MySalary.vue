<script setup>
  // Xodim o'z oyligini ko'radi (PINFL orqali). Backend: /v1/me/salary(+/months)
  import salary1cService from '@/service/v1/accountant/salary1cService.js'

  const months = ref([])
  const selected = ref(null) // 'YYYY-M'
  const payslip = ref(null)
  const loading = ref(false)
  const history = ref([])

  const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const monthOptions = computed(() =>
    months.value.map((m) => ({ label: `${m.year} / ${m.month}`, value: `${m.year}-${m.month}` }))
  )

  const loadSalary = async () => {
    if (!selected.value) return
    const [y, m] = selected.value.split('-').map(Number)
    loading.value = true
    try {
      const [ps, hist] = await Promise.all([
        salary1cService._mySalary({ params: { year: y, month: m } }),
        salary1cService._myHistory({ params: { year: y, month: m } })
      ])
      payslip.value = ps.data.data
      history.value = hist.data.data?.versions ?? []
    } finally {
      loading.value = false
    }
  }
  const onSelect = (v) => {
    selected.value = v
    loadSalary()
  }

  onMounted(async () => {
    const res = await salary1cService._myMonths()
    months.value = res.data.data?.months ?? []
    if (months.value.length) {
      selected.value = `${months.value[0].year}-${months.value[0].month}`
      await loadSalary()
    }
  })
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <span class="text-sm font-semibold">{{ $t('salary1c.mySalary') }}</span>
      <n-select v-if="months.length" :value="selected" :options="monthOptions" size="small" class="w-40"
        :placeholder="$t('salary1c.selectMonth')" @update:value="onSelect" />
    </div>

    <n-spin :show="loading">
      <div v-if="payslip" class="ms-card">
        <p class="font-semibold text-base">{{ payslip.fio }}</p>
        <p class="text-xs text-textColor3 mb-3">{{ payslip.position }} · {{ payslip.year }}/{{ payslip.month }}</p>

        <p class="ms-grp">{{ $t('salary1c.accruals') }}</p>
        <n-table :single-line="false" size="small">
          <thead><tr>
            <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
            <th>{{ $t('salary1c.rowName') }}</th>
            <th class="text-right! w-[140px]">{{ $t('salary1c.amount') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="(a, i) in payslip.accruals" :key="'a' + i">
              <td>{{ a.paying_code || '—' }}</td>
              <td>{{ a.paying_name }}</td>
              <td class="text-right! ms-num">{{ fmt(a.summa) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="font-semibold">{{ $t('salary1c.accrual') }}</td>
              <td class="text-right! ms-num font-semibold">{{ fmt(payslip.accrual_total) }}</td>
            </tr>
          </tbody>
        </n-table>

        <p class="ms-grp mt-4">{{ $t('salary1c.deductions') }}</p>
        <n-table :single-line="false" size="small">
          <thead><tr>
            <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
            <th>{{ $t('salary1c.rowName') }}</th>
            <th class="text-right! w-[140px]">{{ $t('salary1c.amount') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="(d, i) in payslip.deductions" :key="'d' + i">
              <td>{{ d.paying_code || 'НДФЛ' }}</td>
              <td>{{ d.paying_name }}</td>
              <td class="text-right! ms-num">{{ fmt(d.summa) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="font-semibold">{{ $t('salary1c.deduction') }}</td>
              <td class="text-right! ms-num font-semibold">{{ fmt(payslip.deduction_total) }}</td>
            </tr>
          </tbody>
        </n-table>

        <div class="ms-net"><span>{{ $t('salary1c.net') }}</span><b class="text-primary">{{ fmt(payslip.net_total) }}</b></div>

        <template v-if="history.length > 1">
          <p class="ms-grp mt-4">{{ $t('salary1c.history') }}</p>
          <n-table :single-line="false" size="small">
            <thead><tr>
              <th class="w-[70px]">{{ $t('salary1c.version') }}</th>
              <th>{{ $t('salary1c.event') }}</th>
              <th class="text-right! w-[140px]">{{ $t('salary1c.net') }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="v in history" :key="v.id">
                <td>v{{ v.version }}</td>
                <td class="text-xs">
                  <template v-if="v.version === 1">
                    {{ $t('salary1c.added') }}: {{ (v.first_synced_at || '').slice(0, 16) }}
                  </template>
                  <template v-else>
                    {{ $t('salary1c.changed') }}: {{ (v.valid_from || '').slice(0, 16) }}
                  </template>
                  <n-tag v-if="v.is_current" type="success" size="tiny" round class="ml-2">{{ $t('salary1c.current') }}</n-tag>
                </td>
                <td class="text-right! ms-num">{{ fmt(v.net_total) }}</td>
              </tr>
            </tbody>
          </n-table>
        </template>
      </div>
      <n-empty v-else-if="!loading" :description="$t('salary1c.noData')" class="py-10" />
    </n-spin>
  </div>
</template>

<style scoped>
  .ms-card { max-width: 680px; }
  .ms-grp { font-size: 12px; font-weight: 700; color: var(--textColor2, #475467); margin-bottom: 4px; }
  .ms-num { font-variant-numeric: tabular-nums; }
  .ms-net { display: flex; justify-content: space-between; padding: 8px 12px; margin-top: 10px; background: var(--color-brand-surface, #eff8ff); border-radius: 10px; font-weight: 700; }
</style>
