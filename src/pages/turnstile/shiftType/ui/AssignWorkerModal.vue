<script setup>
  import { UIModal } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/AppSetting.js'
  import { toWorkerItem } from './workerItem.js'
  import {
    Checkmark16Filled,
    CheckmarkCircle12Regular,
    ChevronRight16Regular,
    Clock12Regular,
    PersonQuestionMark20Regular,
    Search20Regular
  } from '@vicons/fluent'

  // Bitta o'ringa xodim biriktirish: korxonaning barcha shtat xodimlari; har biri yonida joriy oydagi smenasi.
  const props = defineProps({
    title: { type: String, default: '' },
    hint: { type: String, default: '' },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    takenIds: { type: Array, default: () => [] }
  })
  const emit = defineEmits(['select'])
  const visible = defineModel('visible', { type: Boolean, default: false })

  const PER_PAGE = 30
  const list = ref([])
  const total = ref(0)
  const page = ref(1)
  const loading = ref(false)
  const search = ref('')
  // Belgilansa — faqat shu oyda smenasi yo'q xodimlar.
  const onlyFree = ref(false)
  const scroller = ref(null)
  // Eskirgan javob (oldingi qidiruv) yangisini bosib ketmasin.
  let reqId = 0
  let timer = null

  const hasMore = computed(() => list.value.length < total.value)

  const load = (append = false) => {
    const id = ++reqId
    const next = append ? page.value + 1 : 1
    loading.value = true
    $ApiService.shiftTypeService
      ._getWorkers({
        params: {
          page: next,
          per_page: PER_PAGE,
          search: search.value?.trim() || undefined,
          start_date: props.startDate,
          end_date: props.endDate,
          has_schedule: onlyFree.value ? 'No' : undefined
        }
      })
      .then((res) => {
        if (id !== reqId) return
        const items = res.data.data.data.map(toWorkerItem)
        const seen = new Set(append ? list.value.map((v) => v.id) : [])
        total.value = res.data.data.total
        page.value = next
        list.value = [...(append ? list.value : []), ...items.filter((x) => !seen.has(x.id))]
        if (!append && scroller.value) scroller.value.scrollTop = 0
      })
      .finally(() => {
        if (id === reqId) loading.value = false
      })
  }

  const onSearch = () => {
    clearTimeout(timer)
    timer = setTimeout(() => load(), 350)
  }

  // Pastga yaqinlashganda keyingi sahifa.
  const onScroll = (e) => {
    const el = e.target
    if (loading.value || !hasMore.value) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) load(true)
  }

  watch(onlyFree, () => load())

  watch(visible, (v) => {
    if (!v) return
    search.value = ''
    list.value = []
    total.value = 0
    load()
  })

  const taken = computed(() => new Set(props.takenIds))

  const onPick = (item) => {
    if (taken.value.has(item.id)) return
    emit('select', item)
    visible.value = false
  }
</script>

<template>
  <UIModal v-model:visible="visible" :width="560" :title="title">
    <div v-if="hint" class="mb-3 px-3 py-2 rounded-lg bg-primary/5 text-sm text-secondary leading-[1.4]">
      {{ hint }}
    </div>
    <n-input v-model:value="search" clearable autofocus :placeholder="$t('content.search')" @input="onSearch" @clear="onSearch">
      <template #prefix>
        <n-icon size="16" class="text-secondary"><Search20Regular /></n-icon>
      </template>
    </n-input>
    <div class="mt-2 mb-1 flex items-center justify-between gap-2 text-xs text-secondary">
      <span>{{ $t(onlyFree ? 'shiftType.generate.freeWorkersCount' : 'shiftType.generate.allWorkers', { n: total }) }}</span>
      <div class="flex items-center gap-2">
        <n-spin v-if="loading && list.length" :size="12" />
        <n-checkbox v-model:checked="onlyFree" size="small">
          <span class="text-xs">{{ $t('shiftType.generate.onlyFree') }}</span>
        </n-checkbox>
      </div>
    </div>
    <div ref="scroller" class="h-[440px] overflow-y-auto -mx-1 px-1" @scroll.passive="onScroll">
      <div v-if="loading && !list.length" class="h-full flex items-center justify-center">
        <n-spin />
      </div>
      <div v-else-if="!list.length" class="h-full flex flex-col items-center justify-center gap-2 text-secondary text-sm">
        <n-icon size="36"><PersonQuestionMark20Regular /></n-icon>
        {{ $t('shiftType.generate.workersNotFound') }}
      </div>
      <template v-else>
        <div class="flex flex-col gap-1">
          <button
            v-for="item in list"
            :key="item.id"
            type="button"
            class="group w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left border transition-colors"
            :class="
              taken.has(item.id)
                ? 'border-surface-line bg-surface-ground cursor-default'
                : 'border-surface-line bg-surface-section hover:border-primary hover:bg-primary/5 cursor-pointer'
            "
            @click="onPick(item)"
          >
            <n-avatar
              round
              :size="28"
              class="shrink-0"
              :src="item.data.photo || useAppSetting.noAvailableImage"
              :fallback-src="Utils.noAvailableImage"
            />
            <div class="flex-1 min-w-0 text-[13px] font-medium text-textColor0 leading-[1.25] truncate" :title="item.name">
              {{ item.name }}
            </div>
            <span
              v-if="item.shifts.length"
              class="shrink-0 max-w-[40%] inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] leading-none bg-fig-chip-amber text-fig-chip-amber-text"
              :title="item.shifts.join(', ')"
            >
              <n-icon size="12" class="shrink-0"><Clock12Regular /></n-icon>
              <span class="truncate">{{ item.shifts.join(', ') }}</span>
            </span>
            <span
              v-else
              class="shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] leading-none bg-fig-chip-green text-fig-chip-green-text"
            >
              <n-icon size="12"><CheckmarkCircle12Regular /></n-icon>
              {{ $t('shiftType.generate.noShift') }}
            </span>
            <span v-if="taken.has(item.id)" class="shrink-0 inline-flex items-center gap-1 text-xs text-success">
              <n-icon size="14"><Checkmark16Filled /></n-icon>
              {{ $t('shiftType.generate.alreadyAssigned') }}
            </span>
            <n-icon v-else size="14" class="shrink-0 text-textColor3 group-hover:text-primary">
              <ChevronRight16Regular />
            </n-icon>
          </button>
        </div>
        <div v-if="hasMore && loading" class="py-2 flex justify-center">
          <n-spin :size="16" />
        </div>
      </template>
    </div>
  </UIModal>
</template>
