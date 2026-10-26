<script setup>
  import { useShiftTypeStore } from '@/store/modules/index.js'
  import { UIToggleTag } from '@/components/index.js'
  import { crewSizeOf } from '@/pages/turnstile/scheduleWorker/ui/navbat.js'
  import { People16Regular, PeopleTeam16Regular, Search20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import ShiftPattern from './ShiftPattern.vue'
  import { formatCount } from './shiftPattern.js'

  const props = defineProps({
    selectedId: {
      type: Number,
      default: null
    }
  })

  const emit = defineEmits(['select'])

  const { t } = i18n.global
  const store = useShiftTypeStore()

  const ALL = 0
  const typeFilter = ref(ALL)

  // Ro'yxatdagi mavjud turlar bo'yicha tablar (Smena, Har kunlik, ...).
  const typeTabs = computed(() => {
    const seen = new Map()
    for (const v of store.list) if (v.type?.id && !seen.has(v.type.id)) seen.set(v.type.id, v.type.name)
    return [{ id: ALL, name: t('content.all') }, ...[...seen].map(([id, name]) => ({ id, name }))]
  })

  // Backend `schedule-types` `search` parametrini e'tiborsiz qoldiradi, shuning uchun
  // turlar to'liq yuklanadi (store'da per_page katta) va qidiruv brauzerda bajariladi.
  const query = ref('')
  const filteredList = computed(() => {
    const q = query.value?.trim().toLowerCase()
    return store.list.filter(
      (v) =>
        (typeFilter.value === ALL || v.type?.id === typeFilter.value) &&
        (!q || v.name?.toLowerCase().includes(q))
    )
  })

  // Birinchi yuklashda bo'sh spinner o'rniga skeleton; keyingi yuklashlarda ro'yxat
  // joyida qoladi va faqat xira tortadi — sakrash bo'lmaydi.
  const showSkeleton = computed(() => store.loading && store.list.length === 0)

  const itemClass = (id) => [
    'shift-item group relative w-full text-left rounded-lg px-3 py-2.5 cursor-pointer border',
    'transition-colors duration-150',
    props.selectedId === id
      ? 'shift-item--active bg-primary/10 border-primary/40'
      : 'border-surface-line hover:bg-surface-ground/60 hover:border-primary/30'
  ]
</script>

<template>
  <aside
    class="flex flex-col min-h-0 max-h-[420px] lg:max-h-none bg-surface-section border border-surface-line rounded-xl overflow-hidden"
  >
    <div class="px-4 pt-4 pb-3 flex flex-col gap-3 border-b border-surface-line">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold">{{ $t('shiftType.form.shiftTypes') }}</span>
        <span
          class="text-xs font-medium text-secondary bg-surface-ground rounded-full px-2 py-0.5 min-w-[28px] text-center"
        >
          {{ filteredList.length }}
        </span>
      </div>
      <n-input v-model:value="query" clearable :placeholder="$t('content.search')">
        <template #prefix>
          <n-icon size="16" class="text-secondary"><Search20Regular /></n-icon>
        </template>
      </n-input>
      <div v-if="typeTabs.length > 2" class="flex flex-wrap gap-1.5">
        <UIToggleTag
          v-for="tab in typeTabs"
          :key="tab.id"
          :label="tab.name"
          :checked="typeFilter === tab.id"
          @toggle="typeFilter = tab.id"
        />
      </div>
    </div>

    <div class="shift-scroll flex-1 min-h-0 overflow-y-auto p-2">
      <template v-if="showSkeleton">
        <div v-for="i in 6" :key="i" class="px-3 py-2.5 flex flex-col gap-2">
          <n-skeleton height="14px" width="80%" :sharp="false" />
          <n-skeleton height="6px" width="60%" :sharp="false" />
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

          <ShiftPattern :shift-type="item" class="mt-2" />

          <div class="mt-2 flex items-center gap-1.5 text-[11px] leading-none text-secondary">
            <span class="truncate px-1.5 py-0.5 rounded bg-surface-ground">{{ item.type?.name }}</span>
            <span
              v-if="crewSizeOf(item)"
              class="shrink-0 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
              :title="$t('shiftType.groupView.crewSizeHint')"
            >
              {{ $t('shiftType.groupView.crewSize', { n: crewSizeOf(item) }) }}
            </span>
            <span class="ml-auto shrink-0 flex items-center gap-2.5">
              <span class="flex items-center gap-0.5" :title="$t('shiftType.form.groupCount')">
                <n-icon size="13"><PeopleTeam16Regular /></n-icon>{{ formatCount(item.groups) }}
              </span>
              <span class="flex items-center gap-0.5" :title="$t('shiftType.form.workerCount')">
                <n-icon size="13"><People16Regular /></n-icon>{{ formatCount(item.workers) }}
              </span>
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
