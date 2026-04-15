<script setup>
  import { useTopicExamStore, useTopicStore } from '@/store/modules/index.js'
  import { UIMenuButton, UIPagination, NoDataPicture } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    BookQuestionMark20Filled,
    Clock24Regular,
    Copy24Regular,
    People24Regular,
    CalendarLtr24Regular,
    Checkmark16Regular,
    Dismiss16Regular
  } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useTopicExamStore()
  const topicStore = useTopicStore()

  const changePage = (v) => {
    store.topicId = topicStore.elementId
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelect = (v) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    store.topicId = topicStore.elementId
    store.elementId = v.data.id
    if (v.key === 'delete') {
      store._delete()
    } else if (v.key === 'edit') {
      store._show()
      store.visibleType = false
      store.visible = true
    } else if (v.key === 'attach_question') {
      store.attachCategoryVisible = true
      store.attachCategoryVisibleType = true
      store._get_attached_categories()
    }
  }

  const updateStatus = (exam) => {
    store.topicId = topicStore.elementId
    store.elementId = exam.id
    store.payload = { active: !exam.active }
    store._update()
  }
</script>

<template>
  <n-spin :show="store.loading" class="h-full">
  <div class="h-full flex flex-col">
    <div class="w-full grow basis-auto overflow-auto">
      <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
      <n-grid v-else cols="1 500:2" class="p-1" x-gap="16" y-gap="16">
        <n-gi v-for="(item, idx) in store.list" :key="idx" span="1">
          <div
            class="rounded-xl border border-surface-line overflow-hidden"
            :class="item.active ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-surface-line'"
          >
            <!-- Header -->
            <div class="px-4 pt-3 pb-2 flex items-start justify-between gap-2">
              <p class="font-semibold text-[14px] text-textColor0 leading-snug line-clamp-2">
                {{ item.name }}
              </p>
              <n-tag
                size="small"
                round
                :type="item.active ? 'success' : 'default'"
                class="shrink-0 mt-[2px]"
              >
                <template #icon>
                  <n-icon :component="item.active ? Checkmark16Regular : Dismiss16Regular" />
                </template>
                {{ item.active ? $t('content.active') : $t('content.noActive') }}
              </n-tag>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-x-4 gap-y-1 px-4 pb-2">
              <div class="flex items-center gap-1.5 text-[13px] text-textColor2">
                <n-icon size="14" class="text-primary shrink-0"><BookQuestionMark20Filled /></n-icon>
                <span class="truncate">{{ $t('examPage.question_count') }}: <b>{{ item.tests_count }}</b></span>
              </div>
              <div class="flex items-center gap-1.5 text-[13px] text-textColor2">
                <n-icon size="14" class="text-warning shrink-0"><Clock24Regular /></n-icon>
                <span class="truncate">{{ $t('examPage.exam_duration') }}: <b>{{ item.minute }}</b></span>
              </div>
              <div class="flex items-center gap-1.5 text-[13px] text-textColor2">
                <n-icon size="14" class="text-info shrink-0"><Copy24Regular /></n-icon>
                <span class="truncate">{{ $t('examPage.variant_count') }}: <b>{{ item.variant }}</b></span>
              </div>
              <div class="flex items-center gap-1.5 text-[13px] text-textColor2">
                <n-icon size="14" class="text-success shrink-0"><People24Regular /></n-icon>
                <span class="truncate">{{ $t('examPage.toWhom') }}: <b>{{ item.whom?.name }}</b></span>
              </div>
            </div>

            <!-- Deadline -->
            <div class="px-4 pb-2 flex items-center gap-1.5 text-[12px] text-textColor2">
              <n-icon size="13" class="text-danger shrink-0"><CalendarLtr24Regular /></n-icon>
              <span>{{ $t('examPage.deadline', { n: Utils.timeWithMonth(item.deadline) }) }}</span>
            </div>

            <!-- Footer -->
            <div class="px-4 py-2 border-t border-surface-line flex items-center justify-between bg-surface-ground/30">
              <n-switch
                :loading="store.loading && store.elementId === item.id"
                :value="!!item.active"
                size="small"
                @click="updateStatus(item)"
              />
              <UIMenuButton
                :data="item"
                :extra-options="[
                  {
                    label: $t('topicDetailsPage.questions.name'),
                    key: 'attach_question',
                    icon: BookQuestionMark20Filled,
                    visible: true
                  }
                ]"
                :show-delete="true"
                :show-edit="true"
                size="tiny"
                @select-ev="onSelect"
              />
            </div>
          </div>
        </n-gi>
      </n-grid>
    </div>
    <div class="shrink-0">
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
  </div>
  </n-spin>
</template>
