<script setup>
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    page: { type: Number, default: 1 },
    perPage: { type: Number, default: 15 },
    total: { type: Number, default: 0 },
    pageSizes: { type: Array, default: () => [10, 15, 20, 30, 50, 100] }
  })

  const emit = defineEmits(['change-page'])

  const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))

  const rangeFrom = computed(() => (props.page - 1) * props.perPage + 1)
  const rangeTo = computed(() => Math.min(props.page * props.perPage, props.total))

  const sizeOptions = computed(() => props.pageSizes.map((n) => ({ label: `${n}`, value: n })))

  const onPage = (page) => emit('change-page', { page, per_page: props.perPage })

  // O'lcham o'zgarganda joriy sahifa mavjud bo'lmay qolishi mumkin — har doim boshiga qaytamiz.
  const onPerPage = (per_page) => emit('change-page', { page: 1, per_page })
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-4 py-3 lg:justify-between">
    <span class="text-sm text-textColor2">
      <span class="font-bold text-primary">{{ total }}</span> {{ t('content.fromTa') }}
      <span class="font-bold text-primary">{{ rangeFrom }}-{{ rangeTo }}</span>
      {{ t('content.untilShow') }}
    </span>

    <n-pagination :page="page" :page-count="pageCount" @update:page="onPage" />

    <div class="flex shrink-0 items-center gap-2">
      <span class="text-sm text-textColor2 whitespace-nowrap">{{ t('content.perPage') }}</span>
      <n-select
        class="w-[76px]"
        size="small"
        :value="perPage"
        :options="sizeOptions"
        :consistent-menu-width="false"
        @update:value="onPerPage"
      />
    </div>
  </div>
</template>
