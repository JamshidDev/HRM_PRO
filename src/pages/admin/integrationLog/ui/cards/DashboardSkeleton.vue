<script setup>
  const barHeights = [45, 70, 55, 85, 60, 90, 50, 75, 40, 65]
  const rows = Array.from({ length: 7 })
</script>

<template>
  <div class="grid grid-cols-12 gap-4 mt-4">

    <!-- ── Stat cards skeleton (6 cards) ──────────────────────────────────── -->
    <div
      v-for="i in 6" :key="i"
      class="xl:col-span-2 md:col-span-4 col-span-6 px-3 pt-2.5 pb-2 rounded-xl bg-surface-section border border-surface-line relative overflow-hidden flex flex-col min-h-[110px]"
    >
      <div class="flex items-start justify-between">
        <n-skeleton width="32px" height="32px" :sharp="false" class="rounded-lg" />
        <n-skeleton width="40px" height="20px" :sharp="false" class="rounded-md" />
      </div>
      <div class="mt-2 flex-1">
        <n-skeleton width="70px" height="22px" :sharp="false" class="rounded-md" />
        <n-skeleton width="90px" height="14px" :sharp="false" class="rounded-md mt-1.5" />
      </div>
      <n-skeleton width="100%" height="6px" :sharp="false" class="rounded-full mt-1.5" />
    </div>

    <!-- ── Timeline chart skeleton ────────────────────────────────────────── -->
    <div class="xl:col-span-8 col-span-12 bg-surface-section border border-surface-line rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-surface-line flex items-center justify-between">
        <n-skeleton width="130px" height="18px" :sharp="false" class="rounded-md" />
        <div class="flex items-center gap-3">
          <n-skeleton width="60px" height="14px" :sharp="false" class="rounded-md" />
          <n-skeleton width="60px" height="14px" :sharp="false" class="rounded-md" />
        </div>
      </div>
      <!-- Bars -->
      <div class="px-4 py-4 flex items-end gap-2 h-[220px]">
        <div
          v-for="(h, idx) in barHeights" :key="idx"
          class="flex-1 flex items-end gap-1"
        >
          <n-skeleton
            :height="Math.round(160 * (h / 100))"
            :sharp="false"
            class="w-full rounded-t-md"
          />
          <n-skeleton
            :height="Math.round(160 * ((h * 0.15) / 100))"
            :sharp="false"
            class="w-full rounded-t-md"
          />
        </div>
      </div>
    </div>

    <!-- ── Methods + Statuses skeleton ───────────────────────────────────── -->
    <div class="xl:col-span-4 col-span-12 bg-surface-section border border-surface-line rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-surface-line flex items-center justify-between">
        <n-skeleton width="80px" height="18px" :sharp="false" class="rounded-md" />
        <n-skeleton width="90px" height="14px" :sharp="false" class="rounded-md" />
      </div>
      <!-- Pie + legend -->
      <div class="flex items-center px-3 pt-3 pb-2 gap-3">
        <n-skeleton width="120px" height="120px" :sharp="false" class="rounded-full flex-shrink-0" />
        <div class="flex-1 flex flex-col gap-3">
          <div v-for="j in 5" :key="j" class="flex items-center justify-between">
            <n-skeleton width="55px" height="18px" :sharp="false" class="rounded-md" />
            <n-skeleton width="40px" height="14px" :sharp="false" class="rounded-md" />
          </div>
        </div>
      </div>
      <!-- Statuses -->
      <div class="mx-4 border-t border-surface-line" />
      <div class="grid grid-cols-2 gap-x-3 gap-y-3 px-4 py-3">
        <div v-for="k in 4" :key="k">
          <div class="flex items-center justify-between mb-1.5">
            <n-skeleton width="50px" height="18px" :sharp="false" class="rounded-md" />
            <n-skeleton width="28px" height="14px" :sharp="false" class="rounded-md" />
          </div>
          <n-skeleton width="100%" height="4px" :sharp="false" class="rounded-full" />
        </div>
      </div>
    </div>

    <!-- ── Top Clients skeleton ───────────────────────────────────────────── -->
    <div class="xl:col-span-6 col-span-12 bg-surface-section border border-surface-line rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-line">
        <n-skeleton width="130px" height="18px" :sharp="false" class="rounded-md" />
      </div>
      <div class="divide-y divide-surface-line">
        <div v-for="r in rows" :key="r" class="flex items-center gap-3 px-4 py-2">
          <n-skeleton width="16px" height="16px" :sharp="false" class="rounded-sm flex-shrink-0" />
          <n-skeleton width="32px" height="32px" :sharp="false" class="rounded-lg flex-shrink-0" />
          <div class="flex-1 flex flex-col gap-1.5">
            <n-skeleton width="110px" height="14px" :sharp="false" class="rounded-md" />
            <n-skeleton width="60px" height="12px" :sharp="false" class="rounded-md" />
          </div>
          <div class="flex items-center gap-2">
            <n-skeleton width="58px" height="26px" :sharp="false" class="rounded-lg" />
            <n-skeleton width="58px" height="26px" :sharp="false" class="rounded-lg" />
            <n-skeleton width="58px" height="26px" :sharp="false" class="rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Top Endpoints skeleton ─────────────────────────────────────────── -->
    <div class="xl:col-span-6 col-span-12 bg-surface-section border border-surface-line rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-surface-line">
        <n-skeleton width="130px" height="18px" :sharp="false" class="rounded-md" />
      </div>
      <div class="divide-y divide-surface-line">
        <div v-for="r in rows" :key="r" class="flex items-center gap-3 px-4 py-2">
          <n-skeleton width="16px" height="16px" :sharp="false" class="rounded-sm flex-shrink-0" />
          <n-skeleton width="48px" height="26px" :sharp="false" class="rounded-md flex-shrink-0" />
          <div class="flex-1 flex flex-col gap-1.5">
            <n-skeleton width="160px" height="14px" :sharp="false" class="rounded-md" />
            <n-skeleton width="100%" height="4px" :sharp="false" class="rounded-full" />
          </div>
          <div class="flex items-center gap-2">
            <n-skeleton width="58px" height="26px" :sharp="false" class="rounded-lg" />
            <n-skeleton width="58px" height="26px" :sharp="false" class="rounded-lg" />
            <n-skeleton width="58px" height="26px" :sharp="false" class="rounded-lg" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
