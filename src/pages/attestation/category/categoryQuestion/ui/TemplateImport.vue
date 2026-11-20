<script setup>
  import { h } from 'vue'
  import { ArrowUpload24Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { useCategoryQuestionStore, useCategoryStore } from '@/store/modules/index.js'

  const { t } = i18n.global
  const emits = defineEmits(['done'])
  const store = useCategoryQuestionStore()
  const categoryStore = useCategoryStore()

  const fileInput = ref(null)
  const file = ref(null)
  const rows = ref([])
  const loading = ref(false)
  const saving = ref(false)

  const validCount = computed(() => rows.value.filter((r) => !r.error).length)
  const skippedCount = computed(() => rows.value.length - validCount.value)

  const send = (preview) => {
    const data = new FormData()
    data.append('file', file.value)
    return $ApiService.categoryService._importTemplate({
      id: store.category_id,
      data,
      preview
    })
  }

  // Fayl tanlanganda o'qib ko'rsatiladi (bazaga yozilmaydi).
  const onFile = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    file.value = f
    rows.value = []
    loading.value = true
    send(true)
      .then((res) => {
        rows.value = res.data.data.rows
      })
      .catch(() => {
        file.value = null
      })
      .finally(() => {
        loading.value = false
      })
  }

  const onImport = () => {
    saving.value = true
    send(false)
      .then((res) => {
        $Toast.success(t('categoryPage.importDone', { n: res.data.data.imported }))
        file.value = null
        rows.value = []
        emits('done')
      })
      .finally(() => {
        saving.value = false
      })
  }

  const columns = computed(() => [
    { title: t('categoryPage.rowNo'), key: 'row', width: 70, align: 'center' },
    { title: t('categoryPage.question'), key: 'ques', minWidth: 260 },
    { title: t('categoryPage.correctAnswer'), key: 'correct', minWidth: 160 },
    {
      title: t('categoryPage.wrongAnswers'),
      key: 'wrong',
      minWidth: 220,
      render: (row) => row.wrong.join(' · ')
    },
    {
      title: t('categoryPage.status'),
      key: 'error',
      width: 220,
      render: (row) =>
        h(
          'span',
          {
            class: [
              'inline-flex rounded-full px-2 py-0.5 text-[12px] leading-[16px]',
              row.error
                ? 'bg-fig-red-100 text-fig-text-red'
                : 'bg-fig-chip-green text-fig-chip-green-text'
            ]
          },
          row.error || t('categoryPage.ok')
        )
    }
  ])
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-[13px] text-fig-text-secondary">{{ $t('categoryPage.chooseFile') }}</p>
      <div class="flex gap-2">
        <n-button
          type="success"
          ghost
          :loading="categoryStore.templateLoading"
          @click="categoryStore._template()"
        >
          {{ $t('categoryPage.downloadTemplate') }}
        </n-button>
        <n-button type="primary" :loading="loading" @click="fileInput?.click()">
          <template #icon>
            <n-icon :component="ArrowUpload24Regular" />
          </template>
          {{ file ? file.name : $t('categoryPage.pressUpload') }}
        </n-button>
        <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="onFile" />
      </div>
    </div>

    <template v-if="rows.length">
      <p class="text-[13px] text-fig-text-primary">
        {{ $t('categoryPage.previewSummary', { valid: validCount, skipped: skippedCount }) }}
      </p>
      <n-data-table
        :columns="columns"
        :data="rows"
        :row-key="(r) => r.row"
        :max-height="420"
        size="small"
        :bordered="true"
        :row-class-name="(r) => (r.error ? 'opacity-70' : '')"
      />
      <div class="flex justify-end">
        <n-button type="primary" :disabled="!validCount" :loading="saving" @click="onImport">
          {{ $t('categoryPage.importConfirm') }} ({{ validCount }})
        </n-button>
      </div>
    </template>
  </div>
</template>
