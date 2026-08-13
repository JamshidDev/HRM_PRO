<script setup>
  const props = defineProps({
    data: {
      type: Object,
      required: true
    },
    showPanel: {
      type: Boolean,
      default: true
    }
  })

  const isBot = computed(() => props.data?.bot)
</script>

<template>
  <div class="flex w-full mb-6" :class="[isBot ? 'justify-start' : 'justify-end']">
    <div class="flex items-end" :class="[showPanel ? 'max-w-full' : 'max-w-[92%]']">
      <div
        :class="[
          isBot ? 'bot-bubble rounded-bl-none' : 'bg-primary! text-white! rounded-br-none',
          showPanel ? 'p-4' : 'p-3'
        ]"
        class="inline-block border border-surface-line rounded-2xl"
      >
        <div
          :class="[isBot ? 'text-surface!' : 'text-white!', showPanel ? 'text-base' : 'text-sm']"
          class="prose w-auto"
          v-html="data?.text"
        ></div>

        <div
          v-if="data?.time"
          class="flex justify-start border-t mt-2 pt-2"
          :class="[isBot ? 'border-surface-line' : 'border-white/25']"
        >
          <p
            class="leading-none"
            :class="[isBot ? 'text-secondary' : 'text-white/80', showPanel ? 'text-base' : 'text-sm']"
          >
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

<style scoped>
  .bot-bubble {
    background: #eff8ff;
  }
  [data-theme='dark'] .bot-bubble {
    background: #102644;
  }
</style>

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
