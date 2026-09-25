<script setup>
  import { UIModal } from '@/components/index.js'
  import { Search16Regular, CheckmarkCircle16Filled, MailAttach16Regular } from '@vicons/fluent'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  // Hujjatga ariza(lar)ni bog'lash. Fayl biriktirish alohida — chap paneldagi plitkalar.
  const store = usePdfViewerStore()

  const search = ref('')
  const selected = ref([])

  // Allaqachon bog'langan arizalar — ro'yxatda o'chiq ko'rinadi.
  const linkedIds = computed(
    () =>
      new Set(
        store.fileList
          .filter((v) => !v?.file)
          .map((v) => v?.worker_application?.id ?? v?.worker_application_id)
          .filter(Boolean)
      )
  )

  const items = computed(() => {
    const q = search.value.trim().toLowerCase()
    return store.documentApplications.filter(
      (a) =>
        !q ||
        String(a.number ?? '').includes(q) ||
        (a.fullName || '').toLowerCase().includes(q) ||
        (a.typeName || '').toLowerCase().includes(q)
    )
  })

  const isLinked = (a) => linkedIds.value.has(a.id)
  const isSelected = (a) => selected.value.includes(a.id)
  const toggle = (a) => {
    if (isLinked(a)) return
    selected.value = isSelected(a)
      ? selected.value.filter((id) => id !== a.id)
      : [...selected.value, a.id]
  }

  watch(
    () => store.attachVisible,
    (v) => {
      if (!v) return
      search.value = ''
      selected.value = []
      store._documentApplications({
        model: store.model,
        document_id: store.document_id,
        per_page: 100
      })
    }
  )

  const onSubmit = () => {
    if (!selected.value.length) return
    const formData = new FormData()
    formData.append('document_id', store.document_id)
    formData.append('model', store.model)
    formData.append('status', 'application')
    formData.append('worker_applications', selected.value.toString())
    store._attachFile(formData, () => {
      store.attachVisible = false
      store._files()
      store._refreshMeta()
    })
  }
</script>

<template>
  <UIModal
    :width="520"
    :visible="store.attachVisible"
    @update:visible="(v) => (store.attachVisible = v)"
    :title="$t('documentPage.attach.attachApplication')"
  >
    <template #default>
      <div class="flex flex-col gap-3">
        <p class="text-sm text-textColor3">
          {{ $t('documentPage.signature.files.applicationsHint') }}
        </p>

        <n-input v-model:value="search" clearable :placeholder="$t('content.search')">
          <template #prefix>
            <n-icon><Search16Regular /></n-icon>
          </template>
        </n-input>

        <n-spin :show="store.docApplicationLoading">
          <div class="flex flex-col gap-1.5 max-h-[50vh] min-h-[120px] overflow-y-auto pr-1">
            <div
              v-if="!store.docApplicationLoading && !items.length"
              class="flex flex-col items-center justify-center text-center py-8 text-textColor3"
            >
              <n-icon size="28" class="mb-2"><MailAttach16Regular /></n-icon>
              <span class="text-sm">{{ $t('documentPage.signature.files.noApplications') }}</span>
            </div>

            <div
              v-for="a in items"
              :key="a.id"
              class="flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors"
              :class="
                isLinked(a)
                  ? 'border-surface-line bg-surface-ground opacity-70 cursor-default'
                  : isSelected(a)
                    ? 'border-primary bg-primary/5 cursor-pointer'
                    : 'border-surface-line bg-surface-section hover:bg-surface-ground cursor-pointer'
              "
              @click="toggle(a)"
            >
              <n-checkbox
                :checked="isLinked(a) || isSelected(a)"
                :disabled="isLinked(a)"
                @click.stop
                @update:checked="() => toggle(a)"
              />
              <n-avatar
                round
                :size="32"
                :src="a.photo || Utils.noAvailableImage"
                :fallback-src="Utils.noAvailableImage"
                class="shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-textColor1 truncate">{{ a.fullName }}</div>
                <div class="text-xs text-textColor3 truncate">
                  №{{ a.number }} · {{ a.typeName }}
                  <template v-if="a.created"> · {{ Utils.timeOnlyDate(a.created) }}</template>
                </div>
              </div>
              <span
                v-if="isLinked(a)"
                class="shrink-0 inline-flex items-center gap-1 text-[11px] text-fig-chip-green-text"
              >
                <n-icon size="14"><CheckmarkCircle16Filled /></n-icon>
                {{ $t('documentPage.signature.files.linked') }}
              </span>
            </div>
          </div>
        </n-spin>

        <div class="flex items-center justify-between gap-3 pt-1">
          <span class="text-xs text-textColor3">
            {{ $t('documentPage.signature.files.selectedCount', { count: selected.length }) }}
          </span>
          <div class="flex gap-2">
            <n-button :disabled="store.attachLoading" @click="store.attachVisible = false">
              {{ $t('content.cancel') }}
            </n-button>
            <n-button
              type="primary"
              :loading="store.attachLoading"
              :disabled="!selected.length"
              @click="onSubmit"
            >
              {{ $t('documentPage.signature.files.attachSubmit') }}
            </n-button>
          </div>
        </div>
      </div>
    </template>
  </UIModal>
</template>
