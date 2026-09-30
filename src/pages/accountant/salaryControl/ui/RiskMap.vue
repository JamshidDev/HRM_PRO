<script setup>
  import { UIBadge } from '@/components/index.js'
  import { useSalaryControlStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSalaryControlStore()

  // Backend status -> badge turi + matn kaliti.
  const statusMeta = {
    bad: { type: Utils.colorTypes.error, label: 'salaryControl.risk.status.bad' },
    chk: { type: Utils.colorTypes.warning, label: 'salaryControl.risk.status.chk' },
    ok: { type: Utils.colorTypes.success, label: 'salaryControl.risk.status.ok' },
    na: { type: Utils.colorTypes.secondary, label: 'salaryControl.risk.status.na' }
  }

  const badgeType = (status) => statusMeta[status]?.type ?? Utils.colorTypes.secondary
  const badgeLabel = (status) => t(statusMeta[status]?.label ?? 'salaryControl.risk.status.na')

  // 4 ta status bo'yicha KPI (soni + risk raqamlari ro'yxati).
  const statusOrder = ['bad', 'chk', 'ok', 'na']
  const kpi = computed(() => {
    const list = store.risks ?? []
    return statusOrder.map((status) => {
      const items = list.filter((r) => r.status === status)
      return {
        status,
        type: badgeType(status),
        label: badgeLabel(status),
        count: items.length,
        numbers: items.map((r) => r.n).join(', ')
      }
    })
  })

  // Risklarni blok bo'yicha guruhlaymiz (tartibni birinchi uchrash bo'yicha saqlaymiz).
  const blocks = computed(() => {
    const map = new Map()
    for (const r of store.risks ?? []) {
      const key = r.block ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(r)
    }
    return Array.from(map, ([block, items]) => ({ block, items }))
  })
</script>

<template>
  <n-spin :show="store.risksLoading">
    <!-- Yuqori KPI qatori: status bo'yicha risklar soni. -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in kpi"
        :key="card.status"
        class="flex flex-col gap-2 rounded-2xl bg-fig-block px-4 py-3"
      >
        <div class="flex items-center justify-between gap-2">
          <UIBadge :label="card.label" :type="card.type" />
          <span class="text-[20px] leading-[26px] font-semibold text-textColor1">
            {{ card.count }}
          </span>
        </div>
        <p class="truncate text-[12px] leading-[16px] text-textColor3">
          <template v-if="card.numbers">
            {{ $t('salaryControl.risk.riskNumbers', { list: card.numbers }) }}
          </template>
          <template v-else>—</template>
        </p>
      </div>
    </div>

    <!-- Oy me'yori. -->
    <p v-if="store.norm != null" class="mt-3 text-[12px] leading-[16px] text-textColor3">
      {{ $t('salaryControl.risk.norm', { norm: store.norm }) }}
    </p>

    <!-- Bloklar bo'yicha risk kartalari. -->
    <div v-for="group in blocks" :key="group.block" class="mt-5">
      <h3 class="mb-2 text-[14px] leading-[20px] font-semibold text-textColor1">
        {{ group.block }}
      </h3>

      <div class="flex flex-col gap-3">
        <n-card
          v-for="risk in group.items"
          :key="risk.n"
          size="small"
          :bordered="true"
          class="rounded-2xl"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-[14px] leading-[20px] font-medium text-textColor1">
              {{ $t('salaryControl.risk.title', { n: risk.n, title: risk.title }) }}
            </p>
            <UIBadge :label="badgeLabel(risk.status)" :type="badgeType(risk.status)" />
          </div>

          <p
            v-if="risk.finding"
            class="mt-2 text-[13px] leading-[18px] text-textColor2 whitespace-pre-line"
          >
            {{ risk.finding }}
          </p>
          <p
            v-if="risk.advice"
            class="mt-1 text-[12px] leading-[16px] text-textColor3 whitespace-pre-line"
          >
            {{ risk.advice }}
          </p>

          <!-- Ta'sirlangan xodimlar (status na bo'lmaganda va ro'yxat bor bo'lsa). -->
          <n-collapse
            v-if="risk.status !== 'na' && risk.count > 0 && risk.affected?.length"
            class="mt-3"
          >
            <n-collapse-item
              :title="$t('salaryControl.risk.affected', { count: risk.count })"
              name="affected"
            >
              <n-table :bordered="false" :single-line="false" size="small">
                <thead>
                  <tr>
                    <th>{{ $t('salaryControl.risk.table.fio') }}</th>
                    <th>{{ $t('salaryControl.risk.table.position') }}</th>
                    <th>{{ $t('salaryControl.risk.table.detail') }}</th>
                    <th class="text-right">{{ $t('salaryControl.risk.table.summa') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(emp, idx) in risk.affected" :key="idx">
                    <td>{{ emp.fio }}</td>
                    <td>{{ emp.position }}</td>
                    <td>{{ emp.detail }}</td>
                    <td class="text-right">
                      {{ emp.summa != null ? Utils.formatNumberToMoney(emp.summa) : '—' }}
                    </td>
                  </tr>
                </tbody>
              </n-table>
            </n-collapse-item>
          </n-collapse>
        </n-card>
      </div>
    </div>

    <!-- Ma'lumot yo'q holati. -->
    <div
      v-if="!store.risksLoading && (store.risks?.length ?? 0) === 0"
      class="py-16 text-center text-textColor3"
    >
      {{ $t('salaryControl.risk.empty') }}
    </div>
  </n-spin>
</template>

<style scoped></style>
