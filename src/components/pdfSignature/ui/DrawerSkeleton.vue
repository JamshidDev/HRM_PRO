<script setup>
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
</script>

<template>
  <div class="w-full flex-1 min-h-0 flex gap-3">
    <div class="hidden md:flex flex-col w-[360px] h-full">
      <SectionHeader full-height plain tight-body :title="$t('documentPage.signature.attachedDocuments')">
        <div class="flex flex-col">
          <div v-for="i in 2" :key="i" class="flex items-center gap-2 p-2">
            <n-skeleton width="32px" height="32px" :sharp="false" class="rounded-md shrink-0" />
            <div class="flex-1 flex flex-col gap-1.5">
              <n-skeleton width="70%" height="12px" :sharp="false" class="rounded-md" />
              <n-skeleton width="40%" height="10px" :sharp="false" class="rounded-md" />
            </div>
            <n-skeleton width="16px" height="16px" :sharp="false" class="rounded-sm shrink-0" />
            <n-skeleton width="16px" height="16px" :sharp="false" class="rounded-sm shrink-0" />
          </div>
        </div>
        <n-skeleton width="140px" height="14px" :sharp="false" class="rounded-md mt-3 ml-2" />
      </SectionHeader>
    </div>

    <div class="flex-1 min-w-0 h-full flex flex-col">
      <div class="w-full shrink-0 rounded-2xl bg-surface-section px-4 py-3 flex items-center justify-between gap-4 mb-3">
        <div class="flex flex-col gap-1.5">
          <n-skeleton width="180px" height="16px" :sharp="false" class="rounded-md" />
          <n-skeleton width="80px" height="12px" :sharp="false" class="rounded-md" />
        </div>
        <div class="flex gap-2 shrink-0">
          <n-skeleton width="120px" height="34px" :sharp="false" class="rounded-md" />
          <n-skeleton width="120px" height="34px" :sharp="false" class="rounded-md" />
        </div>
      </div>
      <n-skeleton class="flex-1 min-h-0 rounded-2xl" :sharp="false" />
    </div>

    <div class="hidden md:flex flex-col w-[360px] h-full">
      <SectionHeader full-height plain tight-body :title="$t('documentPage.signature.viewer')">
        <div class="flex flex-col gap-2">
          <div
            v-for="i in 5"
            :key="i"
            class="w-full rounded-xl p-3 border border-surface-line flex items-center gap-2"
          >
            <n-skeleton width="44px" height="44px" :sharp="false" round class="shrink-0" />
            <div class="flex-1 flex flex-col gap-1.5">
              <n-skeleton width="65%" height="12px" :sharp="false" class="rounded-md" />
              <n-skeleton width="35%" height="10px" :sharp="false" class="rounded-md" />
              <n-skeleton width="70px" height="18px" :sharp="false" class="rounded-full mt-1" />
            </div>
          </div>
        </div>
      </SectionHeader>
    </div>
  </div>
</template>
