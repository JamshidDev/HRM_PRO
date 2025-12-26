<script setup>
  import { useAccountStore, useComponentStore, useLmsLessonStore } from '@/store/modules/index.js'
  import { UIPageFilter } from '@/components/index.js'
  const store = useLmsLessonStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const filterEvent = () => {
    if (!accStore.checkAction(accStore.pn.lmsLessonsRead)) return
    store.params.page = 1
    store._index()
  }

  const resetFilter = () => {
    store.params.learning_center_id = null
    filterEvent()
  }

  const filterCount = computed(() => Number(Boolean(store.params.learning_center_id)))

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.lmsLessonsWrite)) return
    store.resetForm()
    store.payload.lesson_date = new Date().getTime()
    store.visibleType = true
    store.visible = true
  }

  const onChangeMonth = (v) => {
    store.currentTime = v
    const givenDate = new Date(v)
    store.params.month = givenDate.getMonth() + 1
    store.params.year = givenDate.getFullYear()
    filterEvent()
  }
</script>

<template>
  <UIPageFilter
    v-model:search="store.params.search"
    :search-loading="store.loading"
    @onSearch="filterEvent"
    :filter-count="filterCount"
    @onClear="resetFilter"
    @onAdd="onAdd"
  >
    <template #filterContent>
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('eduPlanPage.form.learning_center')
      }}</label>
      <n-select
        clearable
        filterable
        v-model:value="store.params.learning_center_id"
        :options="componentStore.lmsLearningCenters"
        :loading="componentStore.lmsLearningCenterLoading"
        label-field="name"
        value-field="id"
        @update:value="filterEvent"
      />
      <label class="mt-3 text-xs text-gray-500 mb-1 font-medium">{{
        $t('eduPlanPage.form.learning_center')
      }}</label>
      <n-date-picker
        v-model:value="store.currentTime"
        type="month"
        format="y MMM"
        month-format="MMM"
        clearable
        :actions="['confirm']"
        @update-value="onChangeMonth"
      />
    </template>
  </UIPageFilter>
</template>
