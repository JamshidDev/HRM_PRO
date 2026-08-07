<script setup>
  import { useCategoryQuestionStore } from '@/store/modules'
  import {
    NoDataPicture,
    UIEditorViewer,
    UIMenuButton,
    UITablePagination
  } from '@/components/index.js'

  const store = useCategoryQuestionStore()

  const onClickAction = (v) => {
    if (v.key === 'edit') {
      store.visibleType = false
      store.visible = true
      store.elementId = v.data.id
      store._show()
    } else if (v.key === 'delete') {
      store.elementId = v.data.id
      store._delete()
    }
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Raqamlash sahifadan qat'i nazar uzluksiz: 2-sahifada 16, 17, ...
  const questionNumber = (idx) =>
    String((store.params.page - 1) * store.params.per_page + idx + 1).padStart(2, '0')
</script>

<template>
  <n-spin :show="store.loading" class="h-full">
    <div v-if="store.list.length === 0 && !store.loading" class="h-full grid place-items-center">
      <NoDataPicture class="mt-0!" />
    </div>

    <div v-else class="h-full flex flex-col p-1 bg-surface-section rounded-[20px]">
      <div class="grow basis-auto min-h-0 overflow-auto px-4">
        <div
          v-for="(item, idx) in store.list"
          :key="item.id"
          class="py-4 border-b border-surface-line last:border-b-0"
        >
          <div class="flex items-start gap-3">
            <span
              class="shrink-0 rounded-lg bg-surface-ground-soft px-2 py-1 text-xs font-semibold text-textColor2"
            >
              {{ questionNumber(idx) }}
            </span>
            <div class="grow min-w-0 font-semibold">
              <UIEditorViewer :html="item.ques" />
            </div>
            <n-spin v-if="item.id === store.elementId && store.deleteLoading" size="small" />
            <UIMenuButton
              v-else
              class="shrink-0"
              :data="item"
              permission-prefix="exam-categories"
              show-edit
              @select-ev="onClickAction"
            />
          </div>

          <div class="mt-3 pl-11 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div v-for="(option, optionIdx) in item.options" :key="optionIdx" class="flex gap-2">
              <!-- faqat ko'rsatish uchun: to'g'ri javob shu yerdan o'zgartirilmaydi -->
              <n-radio class="pointer-events-none shrink-0" :checked="!!option.is_correct" />
              <UIEditorViewer
                :class="{ 'font-semibold': !!option.is_correct }"
                :html="option.text"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="shrink-0 rounded-b-2xl px-5" style="background: var(--table-header)">
        <UITablePagination
          :page="store.params.page"
          :per-page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
        />
      </div>
    </div>
  </n-spin>
</template>
