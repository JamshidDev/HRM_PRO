<script setup>
  import { useAppSetting } from '@/utils/index.js'

  const props = defineProps({
    data: {
      type: Array,
      default: []
    },
    max: {
      type: Number,
      default: 4
    },
    hasMore: {
      type: Number,
      default: 0
    },
    hideMore: {
      type: Boolean,
      default: false
    },
    // Avatar diametri (px). Default 40 — mavjud chaqiruvlar o'zgarmaydi.
    size: {
      type: Number,
      default: 40
    }
  })
  const onOpen = (photo) => {
    window.$openViewer(photo)
  }
</script>

<template>
  <div class="relative z-3" v-bind="$attrs">
    <n-avatar-group :options="data" :size="size" :max="max">
      <template #avatar="{ option: { photo, fullName } }">
        <n-tooltip>
          <template #trigger>
            <n-avatar
              round
              :size="size"
              class="ui__user-group z-0"
              :src="photo || useAppSetting.noAvailableImage"
              :fallback-src="useAppSetting.noAvailableImage"
              @click="onOpen(photo)"
            />
          </template>
          {{ fullName }}
        </n-tooltip>
      </template>
      <template #rest="{ options: restOptions, rest }">
        <n-avatar v-if="!hideMore" :size="size" class="has-more-avatar">+{{ hasMore }}</n-avatar>
      </template>
    </n-avatar-group>
  </div>
</template>
