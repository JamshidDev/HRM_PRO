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
  const vacant = computed(() =>
    props.data?.vacant ?? (props.data?.rate > props.data?.real_rate ? props.data.rate - props.data.real_rate : 0)
  )
  const over = computed(() =>
    props.data?.over ?? (props.data?.rate < props.data?.real_rate ? props.data.real_rate - props.data.rate : 0)
  )
</script>

<template>
  <div :class="[isWorker ? 'grid-cols-3 !w-[120px]' : 'grid-cols-4 !w-[160px]']" class="grid gap-1">
    <template v-if="isWorker">
      <n-button round size="tiny" secondary>{{ data.group }}</n-button>
      <n-button round size="tiny" secondary>{{ data.rate }}</n-button>
      <n-button type="warning" round size="tiny" secondary>{{ data.rank }}</n-button>
    </template>
    <template v-else>
      <n-button round size="tiny" secondary :class="[data.rate > 0 && '!font-semibold']">{{
        data.rate
      }}</n-button>
      <n-button round size="tiny" secondary :class="[data.rate > 0 && '!font-semibold']">{{
        data.real_rate
      }}</n-button>
      <n-button
        :disabled="vacant <= 0"
        :type="vacant > 0 ? 'success' : undefined"
        round
        size="tiny"
        secondary
      >
        {{ vacant }}
      </n-button>
      <n-button
        :disabled="over <= 0"
        :type="over > 0 ? 'error' : undefined"
        round
        size="tiny"
        secondary
      >
        {{ over }}
      </n-button>
    </template>
  </div>
</template>
