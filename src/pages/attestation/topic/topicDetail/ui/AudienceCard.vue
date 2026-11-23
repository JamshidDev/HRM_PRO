<script setup>
  import { computed, ref, watch } from 'vue'
  import { Edit16Regular, People16Regular } from '@vicons/fluent'
  import { UIUser } from '@/components/index.js'
  import { useAccountStore, useTopicStore } from '@/store/modules/index.js'

  // Mavzu kimlar uchun: doira, bo'linmalar, «Kimlarga» va auditoriyadagi xodimlar soni.
  const props = defineProps({ topic: { type: Object, default: null } })
  const store = useTopicStore()
  const accStore = useAccountStore()

  const info = ref(null)
  const loading = ref(false)
  const workers = ref([])
  const workersTotal = ref(0)
  const workersPage = ref(1)
  const workersLoading = ref(false)
  const PER_PAGE = 20

  const loadWorkers = (append = false) => {
    const ids = info.value?.whom_ids ?? []
    if (info.value?.whom !== 3 || !ids.length) {
      workers.value = []
      workersTotal.value = 0
      return
    }
    workersLoading.value = true
    $ApiService.topicService
      ._topicWorkers({
        id: props.topic.id,
        params: { ids: ids.join(','), page: workersPage.value, per_page: PER_PAGE }
      })
      .then((res) => {
        const d = res.data.data
        workers.value = append ? [...workers.value, ...d.data] : d.data
        workersTotal.value = d.total
      })
      .finally(() => {
        workersLoading.value = false
      })
  }

  const load = () => {
    if (!props.topic?.id) return
    loading.value = true
    $ApiService.topicService
      ._audience({ id: props.topic.id })
      .then((res) => {
        info.value = res.data.data
        workersPage.value = 1
        loadWorkers()
      })
      .finally(() => {
        loading.value = false
      })
  }

  const moreWorkers = () => {
    workersPage.value += 1
    loadWorkers(true)
  }

  // Tahrir oynasi yopilganda (saqlangan bo'lishi mumkin) qayta yuklanadi.
  watch(
    () => [props.topic?.id, props.topic?.whom, props.topic?.scope, store.visible],
    ([, , , visible]) => {
      if (!visible) load()
    },
    { immediate: true }
  )

  const canEdit = computed(() => accStore.checkPermission(accStore.pn.examTopicsWrite))
  const onEdit = () => {
    store.elementId = props.topic.id
    store.visibleType = false
    store._show()
    store.visible = true
  }

  const scopeLabel = computed(() =>
    props.topic?.scope ? `topicPage.scope_${props.topic.scope}` : null
  )
  const userOf = (row) => ({
    photo: row.worker?.photo,
    lastName: row.worker?.last_name,
    firstName: row.worker?.first_name,
    middleName: row.worker?.middle_name,
    position: [row.department?.name, row.position?.name].filter(Boolean).join(' · ')
  })
</script>

<template>
  <div class="rounded-2xl border border-surface-line bg-surface-section p-4 flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm font-semibold text-textColor0">{{ $t('topicPage.audienceTitle') }}</p>
      <div class="flex items-center gap-2">
        <span
          v-if="info"
          class="inline-flex items-center gap-1.5 rounded-full bg-fig-chip-brand text-fig-chip-brand-text px-2.5 py-1 text-xs font-semibold"
        >
          <n-icon size="14"><People16Regular /></n-icon>
          {{ $t('topicPage.audienceTotal', { n: info.total }) }}
        </span>
        <n-button v-if="canEdit" size="small" class="rounded-lg!" @click="onEdit">
          <template #icon>
            <n-icon :component="Edit16Regular" />
          </template>
          {{ $t('content.edit') }}
        </n-button>
      </div>
    </div>

    <n-spin :show="loading">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="rounded-xl border border-surface-line p-3">
          <p class="text-xs text-fig-text-tertiary">{{ $t('topicPage.scope') }}</p>
          <p class="mt-1 text-sm font-medium text-textColor0">
            {{ scopeLabel ? $t(scopeLabel) : '—' }}
          </p>
        </div>
        <div class="rounded-xl border border-surface-line p-3">
          <p class="text-xs text-fig-text-tertiary">{{ $t('topicPage.departments') }}</p>
          <div v-if="info?.departments?.length" class="mt-1 flex flex-wrap gap-1">
            <n-tag v-for="d in info.departments" :key="d.id" size="small" round>
              {{ d.name }}
            </n-tag>
          </div>
          <p v-else class="mt-1 text-sm text-fig-text-secondary">
            {{ $t('topicPage.allDepartments') }}
          </p>
        </div>
        <div class="rounded-xl border border-surface-line p-3">
          <p class="text-xs text-fig-text-tertiary">{{ $t('topicDetailsPage.exams.toWhom') }}</p>
          <p class="mt-1 text-sm font-medium text-textColor0">
            {{ info ? $t(`topicPage.whom_${[1, 2, 3].includes(info.whom) ? info.whom : 1}`) : '—' }}
          </p>
        </div>
      </div>

      <div v-if="info?.whom === 2 && info.positions?.length" class="mt-3 flex flex-wrap gap-1.5">
        <n-tag v-for="p in info.positions" :key="p.id" size="small" round type="info">
          {{ p.name }}
        </n-tag>
      </div>

      <div v-if="info?.whom === 3" class="mt-3 flex flex-col gap-2">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          <div
            v-for="w in workers"
            :key="w.id"
            class="rounded-xl border border-surface-line px-3 py-2"
          >
            <UIUser :data="userOf(w)" :short="false" :avatar-clickable="false" />
          </div>
        </div>
        <div v-if="workers.length < workersTotal" class="flex justify-center">
          <n-button size="small" :loading="workersLoading" @click="moreWorkers">
            {{ $t('topicPage.loadMore') }}
          </n-button>
        </div>
      </div>
    </n-spin>
  </div>
</template>
