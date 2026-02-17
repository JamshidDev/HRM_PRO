<script setup>
  import { defineProps, computed } from 'vue'
  import { CalendarClock16Regular, ArrowRight24Filled } from '@vicons/fluent'
  import { v4 as uuidv4 } from 'uuid'

  const MAX_TAGS = 2

  const props = defineProps({
    title: {
      type: String,
      default: 'Breaking: New Company Policy Updates for 2024'
    },
    description: {
      type: String,
      default:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
    },
    date: {
      type: String,
      default: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    tags: {
      type: Array,
      default: () => ['Company News That is a really long tag', 'HR Updates', "good"]
    },
    imageUrl: {
      type: String,
      default: `https://picsum.photos/seed/${uuidv4()}/800/500`
    },
    author: {
      type: String,
      default: 'Sarah Johnson'
    },
    authorAvatar: {
      type: String,
      default: 'https://i.pravatar.cc/150?img=47'
    }
  })

  const visibleTags = computed(() => props.tags.slice(0, MAX_TAGS))
  const hiddenTagCount = computed(() => Math.max(0, props.tags.length - MAX_TAGS))
</script>

<template>
  <div
    class="rounded-lg border border-surface-line bg-surface-section overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
  >
    <!-- Image Section -->
    <div class="relative overflow-hidden h-48">
      <img
        :src="imageUrl"
        :alt="title"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
      <!-- Black gradient overlay -->
      <div
        class="z-10 absolute flex items-end inset-0 bg-gradient-to-b from-transparent to-dark pointer-events-none"
      >
        <h3
          class="m-2 text-xl font-semibold text-white mb-3 line-clamp-2 hover:text-primary transition-colors"
        >
          {{ title }}
        </h3>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-5">
      <!-- Date -->
      <div class="flex items-center gap-2 text-sm text-textColor3 mb-3">
        <n-icon size="16">
          <CalendarClock16Regular />
        </n-icon>
        <span>{{ date }}</span>
      </div>

      <!-- Description -->
      <p class="text-textColor1 text-sm leading-relaxed line-clamp-2 mb-3">
        {{ description }}
      </p>

      <!-- Read More Link -->
      <a
        href="#"
        class="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
      >
        Read More
        <n-icon size="16">
          <ArrowRight24Filled />
        </n-icon>
      </a>
    </div>

    <!-- Footer with Author + Tags -->
    <div class="px-5 py-3 border-t border-surface-line bg-surface-ground flex items-center gap-3">
      <!-- Author -->
      <div v-if="author" class="flex items-center gap-1.5 shrink-0">
        <img :src="authorAvatar" class="w-5 h-5 rounded-full object-cover" />
        <span class="text-xs text-textColor3 font-medium">{{ author }}</span>
      </div>

      <!-- Tags -->
      <div v-if="tags.length" class="flex gap-1.5 items-center ml-auto min-w-0">
        <span
          v-for="(tag, index) in visibleTags"
          :key="index"
          class="px-2.5 py-0.5 text-xs font-medium bg-primary text-white rounded-full min-w-0 shrink truncate"
        >
          {{ tag }}
        </span>
        <span
          v-if="hiddenTagCount"
          class="px-2.5 py-0.5 text-xs font-medium bg-surface-line text-textColor3 rounded-full"
        >
          +{{ hiddenTagCount }}
        </span>
      </div>
    </div>
  </div>
</template>
