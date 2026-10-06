<script setup>
  import { useShiftTypeStore } from '@/store/modules/index.js'
  import { Apps20Regular, People16Regular, PeopleTeam16Regular, Search20Regular } from '@vicons/fluent'

  const props = defineProps({
    selectedId: {
      type: Number,
      default: null
    },
    // «Barcha guruhlar» bandi faqat guruhlarni ko'rish huquqi bo'lganda ma'noli.
    showAll: {
      type: Boolean,
      default: true
    }
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
    'shift-item group relative w-full text-left rounded-lg px-3 py-2.5 cursor-pointer',
    'transition-colors duration-150',
    props.selectedId === id
      ? 'shift-item--active bg-primary/10'
      : 'hover:bg-surface-ground/60'
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
      <button v-if="showAll" type="button" :class="itemClass(null)" @click="emit('select', null)">
        <div class="flex items-center gap-2.5">
          <span
            class="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors"
            :class="selectedId === null ? 'bg-primary text-white' : 'bg-surface-ground text-secondary'"
          >
            <n-icon size="16"><Apps20Regular /></n-icon>
          </span>
          <span class="font-medium text-sm">{{ $t('shiftType.form.allGroups') }}</span>
        </div>
      </button>

      <div v-if="showAll" class="mx-3 my-2 border-t border-surface-line"></div>

      <template v-if="showSkeleton">
        <div v-for="i in 6" :key="i" class="px-3 py-2.5 flex flex-col gap-2">
          <n-skeleton height="14px" width="80%" :sharp="false" />
          <n-skeleton height="10px" width="50%" :sharp="false" />
        </div>
      </template>

      <div
        v-else
        class="flex flex-col gap-0.5 transition-opacity duration-200"
        :class="store.loading && 'opacity-50 pointer-events-none'"
      >
        <button
          v-for="item in filteredList"
          :key="item.id"
          type="button"
          :title="item.name"
          :class="itemClass(item.id)"
          @click="emit('select', item)"
        >
          <div
            class="text-sm font-medium leading-[1.3] line-clamp-2 transition-colors"
            :class="selectedId === item.id ? 'text-primary' : 'text-textColor0'"
          >
            {{ item.name }}
          </div>
          <div class="mt-1.5 flex items-center gap-3 text-xs text-secondary">
            <span class="truncate">{{ item.type?.name }}</span>
            <span class="ml-auto flex items-center gap-1 shrink-0" :title="$t('shiftType.form.groupCount')">
              <n-icon size="14"><PeopleTeam16Regular /></n-icon>
              <span class="font-medium tabular-nums">{{ item.groups }}</span>
            </span>
            <span class="flex items-center gap-1 shrink-0" :title="$t('shiftType.form.workerCount')">
              <n-icon size="14"><People16Regular /></n-icon>
              <span class="font-medium tabular-nums">{{ item.workers }}</span>
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
