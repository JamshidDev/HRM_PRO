<script setup>
  defineProps({
    variant: {
      type: String,
      default: 'chevrons'
    }
  })
</script>

<template>
  <span aria-hidden="true" class="absolute pointer-events-none select-none">
    <svg
      v-if="variant === 'chevrons'"
      viewBox="0 0 140 140"
      preserveAspectRatio="xMidYMid slice"
      class="w-[120px] h-[130px]"
      fill="none"
    >
      <path d="M30,-10 L100,70 L30,150" stroke="currentColor" stroke-width="1.5" opacity="0.28" />
      <path d="M52,-10 L122,70 L52,150" stroke="currentColor" stroke-width="1.5" opacity="0.2" />
      <path d="M74,-10 L144,70 L74,150" stroke="currentColor" stroke-width="1.5" opacity="0.13" />
      <path d="M96,-10 L166,70 L96,150" stroke="currentColor" stroke-width="1.5" opacity="0.07" />
    </svg>
    <svg
      v-else-if="variant === 'circles'"
      viewBox="0 0 160 160"
      class="w-[160px] h-[160px]"
      fill="none"
    >
      <circle cx="110" cy="50" r="26" stroke="currentColor" stroke-width="1.5" opacity="0.2" />
      <circle cx="110" cy="50" r="48" stroke="currentColor" stroke-width="1.5" opacity="0.13" />
      <circle cx="110" cy="50" r="70" stroke="currentColor" stroke-width="1.5" opacity="0.08" />
      <circle cx="110" cy="50" r="92" stroke="currentColor" stroke-width="1.5" opacity="0.04" />
    </svg>
    <svg
      v-else-if="variant === 'rects'"
      viewBox="0 0 150 150"
      class="w-[150px] h-[150px]"
      fill="none"
    >
      <rect
        x="55"
        y="15"
        width="46"
        height="46"
        rx="12"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.18"
      />
      <rect
        x="41"
        y="1"
        width="74"
        height="74"
        rx="18"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.11"
      />
      <rect
        x="27"
        y="-13"
        width="102"
        height="102"
        rx="24"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.06"
      />
    </svg>
    <svg
      v-else-if="variant === 'lines'"
      viewBox="0 0 160 120"
      class="w-[160px] h-[120px]"
      fill="none"
    >
      <line
        x1="60"
        y1="0"
        x2="180"
        y2="120"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.2"
      />
      <line
        x1="82"
        y1="0"
        x2="202"
        y2="120"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.15"
      />
      <line
        x1="104"
        y1="0"
        x2="224"
        y2="120"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.11"
      />
      <line
        x1="126"
        y1="0"
        x2="246"
        y2="120"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.07"
      />
      <line
        x1="148"
        y1="0"
        x2="268"
        y2="120"
        stroke="currentColor"
        stroke-width="1.5"
        opacity="0.04"
      />
    </svg>
    <svg
      v-else-if="variant === 'dots'"
      viewBox="0 0 118 70"
      class="w-[118px] h-[70px]"
      fill="currentColor"
    >
      <template v-for="row in 4" :key="row">
        <circle
          v-for="col in 6"
          :key="col"
          :cx="10 + (col - 1) * 18"
          :cy="10 + (row - 1) * 18"
          r="2"
          :opacity="Math.max(0.2 - (row - 1) * 0.045 - (col - 1) * 0.02, 0)"
        />
      </template>
    </svg>
    <svg v-else-if="variant === 'faceid'" viewBox="0 0 90 90" class="w-[72px] h-[72px]" fill="none">
      <path
        d="M8,26 L8,14 Q8,8 14,8 L26,8"
        stroke="currentColor"
        stroke-width="2"
        opacity="0.22"
        stroke-linecap="round"
      />
      <path
        d="M64,8 L76,8 Q82,8 82,14 L82,26"
        stroke="currentColor"
        stroke-width="2"
        opacity="0.22"
        stroke-linecap="round"
      />
      <path
        d="M82,64 L82,76 Q82,82 76,82 L64,82"
        stroke="currentColor"
        stroke-width="2"
        opacity="0.22"
        stroke-linecap="round"
      />
      <path
        d="M26,82 L14,82 Q8,82 8,76 L8,64"
        stroke="currentColor"
        stroke-width="2"
        opacity="0.22"
        stroke-linecap="round"
      />
      <circle cx="45" cy="45" r="14" stroke="currentColor" stroke-width="1.5" opacity="0.14" />
    </svg>
  </span>
</template>
