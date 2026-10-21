<script setup>
  import { useShiftTypeStore } from '@/store/modules/index.js'
  import { crewSizeOf } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import { Search20Regular } from '@vicons/fluent'

  const props = defineProps({
    selectedId: {
      type: Number,
      default: null
    },
    // «Barcha guruhlar» bandi faqat guruhlarni ko'rish huquqi bo'lganda ma'noli.
  })

  const emit = defineEmits(['select'])

  const store = useShiftTypeStore()

  // Backend `schedule-types` `search` parametrini e'tiborsiz qoldiradi, shuning uchun
  // turlar to'liq yuklanadi (store'da per_page katta) va qidiruv brauzerda bajariladi.
  const query = ref('')
  const filteredList = computed(() => {
    const q = query.value?.trim().toLowerCase()
    if (!q) return store.list
    return store.list.filter((v) => v.name?.toLowerCase().includes(q))
  })

  // Birinchi yuklashda bo'sh spinner o'rniga skeleton; keyingi yuklashlarda ro'yxat
  // joyida qoladi va faqat xira tortadi — sakrash bo'lmaydi.
  const showSkeleton = computed(() => store.loading && store.list.length === 0)

  const itemClass = (id) => [
    'shift-item group relative w-full text-left rounded-lg px-3 py-2 cursor-pointer border',
    'transition-colors duration-150',
    props.selectedId === id
      ? 'shift-item--active bg-primary/10 border-primary/40'
      : 'border-surface-line hover:bg-surface-ground/60 hover:border-primary/30'
  ]

</script>

<template>
  <aside
    class="flex flex-col min-h-0 max-h-[380px] lg:max-h-none bg-surface-section border border-surface-line rounded-xl overflow-hidden"
  >
    <div class="px-4 pt-4 pb-3 flex flex-col gap-3 border-b border-surface-line">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold">{{ $t('shiftType.form.shiftTypes') }}</span>
        <span
          class="text-xs font-medium text-secondary bg-surface-ground rounded-full px-2 py-0.5 min-w-[28px] text-center"
        >
          {{ store.totalItems }}
        </span>
      </div>
      <n-input
        v-model:value="query"
        clearable
        :placeholder="$t('content.search')"
      >
        <template #prefix>
          <n-icon size="16" class="text-secondary"><Search20Regular /></n-icon>
        </template>
      </n-input>
    </div>

    <div class="shift-scroll flex-1 min-h-0 overflow-y-auto p-2">
      <template v-if="showSkeleton">
        <div v-for="i in 6" :key="i" class="px-3 py-2.5 flex flex-col gap-2">
          <n-skeleton height="14px" width="80%" :sharp="false" />
          <n-skeleton height="10px" width="50%" :sharp="false" />
        </div>
      </template>

      <div
        v-else
        class="flex flex-col gap-1.5 transition-opacity duration-200"
        :class="store.loading && 'opacity-50 pointer-events-none'"
      >
        <button
          v-for="item in filteredList"
          :key="item.id"
          type="button"
          :title="item.name"
          :class="itemClass(item.id)"
          @click="emit('select', selectedId === item.id ? null : item)"
        >
          <div
            class="text-[13px] font-medium leading-[1.25] line-clamp-2 transition-colors"
            :class="selectedId === item.id ? 'text-primary' : 'text-textColor0'"
          >
            {{ item.name }}
          </div>
          <div class="mt-1 flex items-center justify-between gap-1.5 text-[11px] leading-none text-secondary">
            <span class="truncate px-1.5 py-0.5 rounded bg-surface-ground">{{ item.type?.name }}</span>
            <span
              v-if="crewSizeOf(item)"
              class="shrink-0 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
              :title="$t('shiftType.groupView.crewSizeHint')"
            >
              {{ $t('shiftType.groupView.crewSize', { n: crewSizeOf(item) }) }}
            </span>
          </div>
        </button>

        <div v-if="!store.loading && filteredList.length === 0" class="text-center text-secondary text-sm py-8">
          {{ $t('shiftType.form.noShiftTypes') }}
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
  /* Tanlangan band: chap tomonda ingichka urg'u chizig'i */
  .shift-item--active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 9999px;
    background: var(--primary-color, currentColor);
  }

  .shift-scroll {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, currentColor 20%, transparent) transparent;
  }
  .shift-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .shift-scroll::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 9999px;
  }
</style>
