<script setup>
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  })

  const isBot = computed(() => props.data?.bot)
</script>

<template>
  <div class="flex w-full mb-6" :class="[isBot ? 'justify-start' : 'justify-end']">
    <div class="flex items-end">
      <div
        :class="[isBot ? 'bg-info/5 rounded-bl-none' : 'bg-primary! text-white! rounded-br-none']"
        class="inline-block p-4 border border-surface-line rounded-2xl"
      >
        <div
          :class="[isBot ? 'text-surface!' : 'text-white!']"
          class="prose w-auto text-base"
          v-html="data?.text"
        ></div>

        <div
          v-if="data?.time"
          class="flex justify-start border-t mt-2 pt-2"
          :class="[isBot ? 'border-surface-line' : 'border-white/25']"
        >
          <p class="leading-none text-base" :class="[isBot ? 'text-secondary' : 'text-white/80']">
            {{ data.time }}
          </p>
        </div>

        <!-- <div v-if="isBot" class="flex justify-between mt-4 text-secondary">
          <div class="flex gap-2">
            <n-icon class="cursor-pointer scale-100 hover:scale-[1.1] transition-all" size="20">
              <ThumbLike24Filled v-if="data.like === 2" class="text-info/50" />
              <ThumbLike20Regular @click="store.like(data.key, true)" v-else />
            </n-icon>
            <n-icon class="cursor-pointer scale-100 hover:scale-[1.1] transition-all" size="20">
              <ThumbDislike20Filled class="text-danger/50" v-if="data.like === 3" />
              <ThumbDislike20Regular @click="store.like(data.key, false)" v-else />
            </n-icon>
          </div>
          <div>
            <n-icon
              @click="Utils.copyToClipboard(data?.text, copied)"
              class="cursor-pointer scale-100 hover:scale-[1.1] transition-all"
              size="24"
            >
              <Copy16Regular />
            </n-icon>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style>
  .prose {
    strong {
      color: var(--color-textColor0) !important;
      font-weight: bold;
    }
    pre {
      background-color: var(--color-textColor0) !important;
      width: 100%;
      overflow: auto;
      margin-top: 10px;
      margin-bottom: 10px;
      display: inline-block !important;
      text-wrap: wrap;
    }
    p {
      margin-top: 2px;
      margin-bottom: 2px;
    }
  }
</style>
