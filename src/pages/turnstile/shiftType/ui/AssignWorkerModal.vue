<script setup>
  import { UIModal, UIUser } from '@/components/index.js'
  import { toWorkerItem } from './workerItem.js'
  import { Checkmark16Filled, PersonQuestionMark20Regular, Search20Regular } from '@vicons/fluent'

  // Bitta o'ringa xodim biriktirish: shu davrda smenasi yo'q xodimlar qidiruv bilan.
  const props = defineProps({
    title: { type: String, default: '' },
    hint: { type: String, default: '' },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    takenIds: { type: Array, default: () => [] },
    // false — korxonaning barcha shtat xodimlari («Barchasi» rejimi).
    onlyFree: { type: Boolean, default: true }
  })
  const emit = defineEmits(['select'])
  const visible = defineModel('visible', { type: Boolean, default: false })

  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  const search = ref('')
  let timer = null

  const load = () => {
    loading.value = true
    $ApiService.shiftTypeService
      ._getWorkers({
        params: {
          page: 1,
          per_page: 50,
          search: search.value?.trim() || undefined,
          ...(props.onlyFree ? { has_schedule: 'No', start_date: props.startDate, end_date: props.endDate } : {})
        }
      })
      .then((res) => {
        total.value = res.data.data.total
        list.value = res.data.data.data.map(toWorkerItem)
      })
      .finally(() => {
        loading.value = false
      })
  }

  const onSearch = () => {
    clearTimeout(timer)
    timer = setTimeout(load, 350)
  }

  watch(visible, (v) => {
    if (!v) return
    search.value = ''
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
    <div class="mt-2 mb-1 text-xs text-secondary">
      {{ $t(onlyFree ? 'shiftType.generate.freeWorkers' : 'shiftType.generate.allWorkers', { n: total }) }}
    </div>
    <n-spin :show="loading">
      <div class="h-[420px] overflow-y-auto -mx-1 px-1">
        <div
          v-if="!loading && !list.length"
          class="h-full flex flex-col items-center justify-center gap-2 text-secondary text-sm"
        >
          <n-icon size="36"><PersonQuestionMark20Regular /></n-icon>
          {{ $t('shiftType.generate.noFreeWorkers') }}
        </div>
        <button
          v-for="item in list"
          :key="item.id"
          type="button"
          class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors border border-transparent"
          :class="
            taken.has(item.id)
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer'
          "
          @click="onPick(item)"
        >
          <UIUser :data="item.data" :short="false" :avatar-clickable="false" hide-tooltip class="flex-1 min-w-0" />
          <span
            v-if="taken.has(item.id)"
            class="shrink-0 inline-flex items-center gap-1 text-xs text-success"
          >
            <n-icon size="14"><Checkmark16Filled /></n-icon>
            {{ $t('shiftType.generate.alreadyAssigned') }}
          </span>
        </button>
      </div>
    </n-spin>
  </UIModal>
</template>
