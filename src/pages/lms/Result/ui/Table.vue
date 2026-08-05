<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useLmsLessonStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useLmsLessonStore()

  const changePage = (v) => {
    store.resultParams.page = v.page
    store.resultParams.per_page = v.per_page
    store._resultIndex()
  }

  const resultClass = (allQuestion, correctAnswerCount) => {
    const percent = (correctAnswerCount / allQuestion) * 100
    if (percent >= 86) return 'border-success! text-success!'
    if (percent >= 56) return 'border-warning! text-warning!'
    return 'border-danger! text-danger!'
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 260
    },
    {
      key: 'exam',
      title: t('content.exam'),
      width: 400
    },
    {
      key: 'topic.type.name',
      title: t('content.type'),
      width: 260
    },
    {
      key: 'eduPlan',
      title: t('lmsWorkerPage.form.eduPlan'),
      width: 160
    },
    {
      key: 'date',
      title: t('content.date'),
      width: 250
    },
    {
      key: 'result',
      title: t('content.result'),
      width: 100,
      align: 'center'
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.resultList"
    :loading="store.resultLoading"
    :page="store.resultParams.page"
    :per-page="store.resultParams.per_page"
    :total="store.totalResult"
    storage-key="lms-result"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.exam?.name
        }"
      />
    </template>

    <template #cell-exam="{ row }">
      <div class="leading-[1.2]">{{ row.exam.name }}</div>
      <div class="leading-[1.2] text-secondary">{{ row.topic.name }}</div>
    </template>

    <template #cell-eduPlan="{ row }">
      <div class="text-xs">
        {{ $t('categoryPage.questionCount') }}:
        <span class="text-sm">{{ row?.exam?.tests_count }}</span>
      </div>
      <div class="text-xs">
        {{ $t('resultPage.form.chances') }}:
        <span class="text-sm">{{ row?.exam?.chances }}</span>
      </div>
    </template>

    <template #cell-date="{ row }">
      <div class="text-xs">
        <span class="text-secondary">{{ $t('content.startDate') }}: </span>
        {{ row.created }}
      </div>
      <div class="text-xs">
        <span class="text-secondary">{{ $t('content.endDate') }} :</span> {{ row.ended }}
      </div>
    </template>

    <template #cell-result="{ row }">
      <template v-if="typeof row?.result === 'number'">
        <n-tag
          :bordered="false"
          class="rounded-2xl! w-[32px] h-[32px]! justify-center border-dashed! border! bg-transparent!"
          :class="resultClass(row.exam?.tests_count, row.result)"
          round
        >
          {{ row?.result }}
        </n-tag>
      </template>
    </template>
  </UITable>
</template>
