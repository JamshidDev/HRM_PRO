<script setup>
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    },
    isWorker: {
      type: Boolean,
      default: false
    }
  })

  // Vakant/sverx HAR shtat birligi bo'yicha API'da hisoblanadi (`vacant`/`over`).
  // Bo'lim darajasida `rate - real_rate` olsak, bir lavozimdagi bo'sh o'rin
  // boshqasidagi ortiqchani yeb qo'yadi va sverx ekranda yo'qoladi.
  // Lavozim kartasida bu maydonlar yo'q — u yerda bitta shtat birligi, ayirma to'g'ri.
  const vacant = computed(
    () =>
      props.data?.vacant ??
      (props.data?.rate > props.data?.real_rate ? props.data.rate - props.data.real_rate : 0)
  )
  const over = computed(
    () =>
      props.data?.over ??
      (props.data?.rate < props.data?.real_rate ? props.data.real_rate - props.data.rate : 0)
  )

  // Rang faqat qiymat bo'lganda beriladi — nol kulrang bo'lib, ko'z muhim
  // raqamlarga (vakant/sverx) tushadi.
  const tone = {
    neutral: 'bg-fig-bg-secondary text-fig-text-primary',
    green: 'bg-fig-chip-green text-fig-chip-green-text',
    red: 'bg-fig-red-50 text-fig-text-red',
    amber: 'bg-fig-chip-amber text-fig-chip-amber-text',
    empty: 'text-fig-text-disable'
  }

  const items = computed(() => {
    const d = props.data || {}
    if (props.isWorker) {
      return [
        { value: d.group, cls: d.group ? tone.neutral : tone.empty },
        { value: d.rate, cls: d.rate ? tone.neutral : tone.empty },
        { value: d.rank, cls: d.rank ? tone.amber : tone.empty }
      ]
    }
    return [
      { value: d.rate, cls: d.rate > 0 ? tone.neutral : tone.empty },
      { value: d.real_rate, cls: d.real_rate > 0 ? tone.neutral : tone.empty },
      { value: vacant.value, cls: vacant.value > 0 ? tone.green : tone.empty },
      { value: over.value, cls: over.value > 0 ? tone.red : tone.empty }
    ]
  })
</script>

<template>
  <div class="flex items-center gap-1 shrink-0">
    <span
      v-for="(item, idx) in items"
      :key="idx"
      class="inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-semibold tabular-nums"
      :class="item.cls"
    >
      {{ item.value ?? 0 }}
    </span>
  </div>
</template>
