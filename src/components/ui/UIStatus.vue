<script setup>
  import {
    Timer16Regular,
    Eye16Filled,
    CheckmarkCircle24Filled,
    Circle20Filled,
    ErrorCircle12Filled
  } from '@vicons/fluent'
  const props = defineProps({
    status: Object,
    size: {
      type: String,
      default: 'tiny'
    },
    pill: {
      type: Boolean,
      default: false
    }
  })

  const statusList = [
    {
      id: 1,
      name: 'Process',
      type: 'warning',
      icon: Timer16Regular
    },
    {
      id: 2,
      name: 'Read',
      type: 'default',
      icon: Eye16Filled
    },
    {
      id: 3,
      name: 'Success',
      type: 'success',
      icon: CheckmarkCircle24Filled
    },
    {
      id: 4,
      name: 'Rejected',
      type: 'error',
      icon: Eye16Filled
    },
    {
      id: 5,
      name: 'Deleted',
      type: 'error',
      icon: Eye16Filled
    },
    {
      id: 6,
      name: 'Active',
      type: 'success',
      icon: Circle20Filled
    },
    {
      id: 7,
      name: 'DeActive',
      type: 'error',
      icon: Circle20Filled
    },
    {
      id: 8,
      name: 'Error',
      type: 'error',
      icon: ErrorCircle12Filled
    },
    {
      id: 9,
      name: 'Primary',
      type: 'primary',
      icon: ErrorCircle12Filled
    }
  ]

  const type = computed(() => {
    const v = statusList.filter((x) => x.id === props.status?.id)
    if (v.length) return v[0].type
    else return 'primary'
  })

  const icon = computed(() => {
    const v = statusList.filter((x) => x.id === props.status?.id)
    if (v.length) return v[0].icon
    else return Eye16Filled
  })
</script>

<template>
  <div class="flex items-center">
    <n-button
      :type="type"
      :size="size"
      :dashed="!pill"
      :secondary="pill"
      :round="pill"
      class="truncate max-w-full"
    >
      <template #icon>
        <component :is="icon" />
      </template>

      <n-ellipsis :tooltip="{ style: { maxWidth: '300px' } }">
        {{ status?.name }}
      </n-ellipsis>
    </n-button>
  </div>
</template>
