<script setup>
  import { UIUserGroup } from '@/components/index.js'
  import CardDecor from './CardDecor.vue'

  const props = defineProps({
    type: {
      type: String,
      default: 'primary'
    },
    count: Number,
    title: String,
    icon: Object,
    list: Array,
    listMore: {
      type: Number,
      default: null
    },
    badgeText: {
      type: String,
      default: null
    }
  })

  const typeClass = computed(() => {
    const classes = {
      primary: 'text-primary bg-primary/10',
      warning: 'text-warning bg-warning/10',
      dark: 'text-dark bg-dark/10',
      danger: 'text-danger bg-danger/10',
      success: 'text-success bg-success/10'
    }
    return classes[props.type]
  })
</script>

<template>
  <div
    class="grid cursor-pointer border border-surface-line hover-effect-card p-4 rounded-2xl bg-surface-section/75 relative overflow-hidden"
  >
    <CardDecor variant="chevrons" class="-top-3 -right-3" :class="typeClass.split(' ')[0]" />
    <div class="flex justify-between items-start">
      <div
        :class="[typeClass]"
        class="w-[40px] h-[40px] rounded-xl flex justify-center items-center"
      >
        <n-icon size="24">
          <component :is="icon" />
        </n-icon>
      </div>
    </div>

    <div class="z-10 flex items-end justify-between mt-3">
      <div>
        <p class="text-left leading-[1.2] font-bold text-textColor0 text-[26px] font-grotesk">
          {{ count }}
        </p>
        <p class="text-secondary text-xs font-medium leading-[1.2] line-clamp-1 text-left mt-1">
          {{ title }}
        </p>
      </div>
      <span class="flex items-center" v-if="listMore">
        <UIUserGroup
          @click.stop
          :max="4"
          :data="listMore > 3 ? [...list, ...list] : list"
          :has-more="listMore - 3"
        />
      </span>
    </div>
  </div>
</template>
