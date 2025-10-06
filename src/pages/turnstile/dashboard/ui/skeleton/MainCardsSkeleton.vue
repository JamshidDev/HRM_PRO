<script setup>
// Skeleton component for MainCards
const props = defineProps({
  // How many card placeholders to render
  count: {
    type: Number,
    default: 4
  }
})
</script>

<template>
  <div class="mt-4">
    <div class="w-full grid grid-cols-12 gap-4 border-dashed border-surface-line rounded-xl">
      <div
        v-for="index in count"
        :key="index"
        class="col-span-12 md:col-span-6 xl:col-span-3 border border-surface-line hover-effect-card px-4 py-2 rounded-xl bg-surface-section relative"
      >
        <div class="flex justify-between items-start">
          <!-- Icon skeleton -->
          <n-skeleton
            width="40px"
            height="40px"
            :sharp="false"
            class="rounded-lg"
          />
          <!-- Badge skeleton -->
          <n-skeleton
            width="60px"
            height="24px"
            :sharp="false"
            class="rounded-lg"
          />
        </div>

        <!-- Content row skeletons -->
        <div class="z-10 text-right flex items-center justify-between mt-2">
          <div>
            <!-- Big number/title skeleton -->
            <n-skeleton 
              width="80px" 
              height="28px" 
              :sharp="false"
            />
            <!-- Description skeleton -->
            <div class="!mt-2">
              <n-skeleton 
                width="120px" 
                height="16px" 
                :sharp="false"
              />
            </div>
          </div>
          <!-- Right-side group skeleton -->
          <span class="flex items-center">
            <n-skeleton :width="132" round size="medium" />
          </span>
        </div>

        <!-- Decorative effect placeholder -->
        <span class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: additional styles for skeleton if needed */
</style>
