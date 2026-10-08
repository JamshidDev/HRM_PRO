<script setup>
  // Xodim o'z oyligini ko'radi (PINFL orqali). Backend: /v1/me/salary(+/months).
  // Bir oyda BIR NECHTA kareshok bo'lishi mumkin (ish joyi o'zgargan: eski + yangi
  // korxona) → `salary` massivi. Har kareshok alohida karta + o'z korxona tarixi.
  import salary1cService from '@/service/v1/accountant/salary1cService.js'

  const months = ref([])
  const selected = ref(null) // 'YYYY-M'
  const payslips = ref([]) // [{...payslip, organization}]
  const historyByOrg = ref({}) // organization_id → versions[]
  const loading = ref(false)

  const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('ru-RU'))
  const monthOptions = computed(() =>
    months.value.map((m) => ({ label: `${m.year} / ${m.month}`, value: `${m.year}-${m.month}` }))
  )
  const historyOf = (orgId) => historyByOrg.value[orgId] ?? []

  const loadSalary = async () => {
    if (!selected.value) return
    const [y, m] = selected.value.split('-').map(Number)
    loading.value = true
    try {
      const res = await salary1cService._mySalary({ params: { year: y, month: m } })
      const list = res.data.data?.salary ?? []
      payslips.value = list
      // Har kareshok (korxona) uchun versiya tarixini alohida yuklaymiz.
      const entries = await Promise.all(
        list.map((p) =>
          salary1cService
            ._myHistory({ params: { year: y, month: m, organization_id: p.organization_id } })
            .then((r) => [p.organization_id, r.data.data?.versions ?? []])
        )
      )
      historyByOrg.value = Object.fromEntries(entries)
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
      <template v-if="payslips.length">
        <div v-for="p in payslips" :key="p.id" class="ms-card mb-5">
          <p class="font-semibold text-base">{{ p.fio }}</p>
          <p class="text-xs text-textColor3 mb-1">{{ p.position }} · {{ p.year }}/{{ p.month }}</p>
          <p v-if="p.organization?.name" class="text-xs font-medium text-primary mb-3">
            {{ p.organization.name }}
          </p>

          <p class="ms-grp">{{ $t('salary1c.accruals') }}</p>
          <n-table :single-line="false" size="small">
            <thead><tr>
              <th class="w-[80px]">{{ $t('salary1c.code') }}</th>
              <th>{{ $t('salary1c.rowName') }}</th>
              <th class="text-right! w-[140px]">{{ $t('salary1c.amount') }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="(a, i) in p.accruals" :key="'a' + i">
                <td>{{ a.paying_code || '—' }}</td>
                <td>{{ a.paying_name }}</td>
                <td class="text-right! ms-num">{{ fmt(a.summa) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-semibold">{{ $t('salary1c.accrual') }}</td>
                <td class="text-right! ms-num font-semibold">{{ fmt(p.accrual_total) }}</td>
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
              <tr v-for="(d, i) in p.deductions" :key="'d' + i">
                <td>{{ d.paying_code || 'НДФЛ' }}</td>
                <td>{{ d.paying_name }}</td>
                <td class="text-right! ms-num">{{ fmt(d.summa) }}</td>
              </tr>
              <tr>
                <td colspan="2" class="font-semibold">{{ $t('salary1c.deduction') }}</td>
                <td class="text-right! ms-num font-semibold">{{ fmt(p.deduction_total) }}</td>
              </tr>
            </tbody>
          </n-table>

          <div class="ms-net"><span>{{ $t('salary1c.net') }}</span><b class="text-primary">{{ fmt(p.net_total) }}</b></div>

          <template v-if="historyOf(p.organization_id).length > 1">
            <p class="ms-grp mt-4">{{ $t('salary1c.history') }}</p>
            <n-table :single-line="false" size="small">
              <thead><tr>
                <th class="w-[70px]">{{ $t('salary1c.version') }}</th>
                <th>{{ $t('salary1c.event') }}</th>
                <th class="text-right! w-[140px]">{{ $t('salary1c.net') }}</th>
              </tr></thead>
              <tbody>
                <tr v-for="v in historyOf(p.organization_id)" :key="v.id">
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
      </template>
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
