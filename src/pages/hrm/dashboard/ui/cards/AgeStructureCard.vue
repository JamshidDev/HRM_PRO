<script setup>
  /**
   * Figma v3 · Tab 1 "Yosh va jins bo'yicha tuzilma" (node 2959:58420).
   *
   * Maketda har bir yosh guruhi uchun erkak/ayol yarim-ustunlaridan piramida
   * chiziladi. Backend `/v1/hr/dashboard` yosh kesimini jins bo'yicha
   * ajratmaydi — faqat uchta guruh yig'indisi keladi — shuning uchun qatorda
   * bitta to'liq ustun turadi, jins taqsimoti esa pastdagi legendada (umumiy
   * erkak/ayol soni) ko'rsatiladi.
   */
  import HeadMortarboard from '@/assets/icons/hrmDashboard/head-mortarboard.svg'
  import FigPanel from '../fig/FigPanel.vue'
  import { useDashboardStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  defineEmits(['detail'])

  const store = useDashboardStore()

  const total = computed(() =>
    store.dashboard.ageCard.reduce((sum, item) => sum + (item.count ?? 0), 0)
  )

  const rows = computed(() => {
    const max = Math.max(...store.dashboard.ageCard.map((item) => item.count ?? 0), 0)
    return store.dashboard.ageCard.map((item) => ({
      title: item.title,
      count: item.count ?? 0,
      // ustun eni eng katta guruhga nisbatan, foiz esa umumiy songa nisbatan
      width: max ? Math.max(((item.count ?? 0) / max) * 100, 2) : 0,
      percent: total.value ? Math.round(((item.count ?? 0) / total.value) * 100) : 0
    }))
  })

  const genders = computed(() => {
    const g = store.dashboard.genders
    if (!g) return []
    const sum = (g.man ?? 0) + (g.woman ?? 0)
    const share = (value) => (sum ? Math.round(((value ?? 0) / sum) * 100) : 0)
    return [
      { key: 'man', token: '--fig-icon-brand', label: 'enum.man', count: g.man, percent: share(g.man) },
      { key: 'woman', token: '--fig-icon-pink', label: 'enum.woman', count: g.woman, percent: share(g.woman) }
    ]
  })

  const format = (value) => Utils.formatNumberToMoney(value) || String(value ?? 0)
</script>

<template>
  <FigPanel
    tint="indigo"
    :icon="HeadMortarboard"
    :title="$t('dashboardPage.age.structureTitle')"
    :action-text="$t('content.detail')"
    inner-class="px-4 py-1"
    @action="$emit('detail')"
  >
    <div v-for="(row, idx) in rows" :key="idx" class="flex items-center gap-2 py-1.5">
      <div class="flex h-4 min-w-px flex-1 items-center">
        <span
          class="h-full rounded-full bg-fig-brand"
          :style="{ width: `${row.width}%` }"
        ></span>
      </div>
      <p class="w-[150px] shrink-0 truncate text-[12px] leading-4 text-fig-text-secondary">
        {{ $t(row.title) }}
      </p>
      <p
        class="w-[56px] shrink-0 text-right text-[12px] leading-4 font-semibold text-fig-text-primary"
      >
        {{ format(row.count) }}
      </p>
      <p class="w-[34px] shrink-0 text-right text-[12px] leading-4 text-fig-text-tertiary">
        {{ row.percent }}%
      </p>
    </div>

    <div class="mt-auto flex flex-wrap items-center gap-4 pt-1.5">
      <div v-for="item in genders" :key="item.key" class="flex items-center gap-1.5">
        <span
          class="h-[9px] w-[9px] shrink-0 rounded-[2px]"
          :style="{ backgroundColor: `var(${item.token})` }"
        ></span>
        <p class="text-[12px] leading-4 whitespace-nowrap text-fig-text-secondary">
          {{ $t(item.label) }} · {{ format(item.count) }} · {{ item.percent }}%
        </p>
      </div>
    </div>
  </FigPanel>
</template>
