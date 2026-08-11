<script setup>
  // Ilova (annex) + kategoriya tablari. Har biriga MatrixTable (KO'RISH yoki TAHRIR).
  // Rows manbai — store.editState (bitta manba: view ham, edit ham shundan chizadi).
  import { ANNEXES } from '../annexConfig.js'
  import { useTariffGridStore } from '@/store/modules/index.js'
  import MatrixTable from './MatrixTable.vue'

  const props = defineProps({
    editable: { type: Boolean, default: false },
    baseAmount: { type: [Number, String], default: 0 },
    minFloor: { type: [Number, String], default: null }
  })
  const store = useTariffGridStore()
  const annexes = ANNEXES
  const rowsOf = (code, catKey) => store.editState[code]?.[catKey] ?? []
  const onFormula = (code, catKey, p) => store.applyFormulaToRows(rowsOf(code, catKey), p)
</script>

<template>
  <n-tabs type="line" animated size="small">
    <n-tab-pane v-for="a in annexes" :key="a.code" :name="a.code" :tab="a.name">
      <MatrixTable
        v-if="a.categories.length === 1"
        :rows="rowsOf(a.code, a.categories[0].key)"
        :groups="a.groups"
        :base-amount="baseAmount"
        :min-floor="minFloor"
        :editable="editable"
        @formula="(p) => onFormula(a.code, a.categories[0].key, p)"
      />
      <n-tabs v-else type="segment" animated size="small">
        <n-tab-pane v-for="c in a.categories" :key="c.key" :name="String(c.key)" :tab="c.name">
          <MatrixTable
            :rows="rowsOf(a.code, c.key)"
            :groups="a.groups"
            :base-amount="baseAmount"
            :min-floor="minFloor"
            :editable="editable"
            @formula="(p) => onFormula(a.code, c.key, p)"
          />
        </n-tab-pane>
      </n-tabs>
    </n-tab-pane>
  </n-tabs>
</template>
