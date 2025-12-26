<script setup>
  import { useTopicExamStore } from '@/store/modules/index.js'
  import { UIMenuButton, UIPagination } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { BookQuestionMark20Filled } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useTopicExamStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelect = (v) => {
    if (!accStore.checkAction(accStore.pn.examExamsWrite)) return
    if (v.key === 'delete') {
      store.elementId = v.data.id
      store._delete()
    } else if (v.key === 'edit') {
      store.elementId = v.data.id
      store._show()
      store.visibleType = false
      store.visible = true
    } else if (v.key === 'attach_question') {
      store.elementId = v.data.id
      store.attachCategoryVisible = true
      store.attachCategoryVisibleType = true
      store._get_attached_categories()
    }
  }

  const updateStatus = (exam) => {
    store.elementId = exam.id
    store.payload = {
      active: !exam.active
    }
    store._update()
  }
</script>

<template>
  <div v-if="store.list.length > 0" class="h-full flex flex-col">
    <div class="w-full grow basis-auto overflow-auto">
      <n-grid cols="1 400:2" class="p-1" x-gap="20" y-gap="20">
        <template v-for="(item, idx) in store.list" :key="idx">
          <n-gi span="1">
            <div class="rounded-xl p-3 border border-surface-line text-textColor2 relative">
              <span
                class="z-[10] opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"
              ></span>
              <p>
                {{ $t('content.name') }}: <span class="font-bold">{{ item.name }}</span>
              </p>
              <n-divider class="my-1!" />
              <div class="grid grid-cols-12 p-2">
                <!--                <span class="absolute top-0 right-6 z-0">-->
                <!--                  <n-icon size="120" class="text-primary opacity-10">-->
                <!--                    <GlobeSurface20Filled/>-->
                <!--                  </n-icon>-->
                <!--                </span>-->

                <div class="col-span-6 z-10">
                  <p class="line-clamp-1">
                    {{ $t('examPage.question_count') }}:
                    <span class="font-medium">{{ item.tests_count }}</span>
                  </p>
                </div>
                <div class="col-span-6 z-10">
                  <p class="line-clamp-1">
                    {{ $t('examPage.exam_duration') }}:
                    <span class="font-medium">{{ item.minute }}</span>
                  </p>
                </div>
                <div class="col-span-6 z-10">
                  <p class="line-clamp-1">
                    {{ $t('examPage.variant_count') }}:
                    <span class="font-medium">{{ item.variant }}</span>
                  </p>
                </div>
                <div class="col-span-6 z-10">
                  <p class="line-clamp-1">
                    {{ $t('examPage.toWhom') }}:
                    <span class="font-medium">{{ item.whom?.name }}</span>
                  </p>
                </div>
              </div>
              <p class="line-clamp-1 pl-2">
                {{ $t('examPage.deadline', { n: Utils.timeWithMonth(item.deadline) }) }}
              </p>
              <div class="flex justify-between items-center mt-2">
                <n-switch
                  :loading="store.loading && store.elementId === item.id"
                  :value="!!item.active"
                  size="small"
                  @click="updateStatus(item)"
                />
                <UIMenuButton
                  class="z-10"
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
        </template>
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
</template>
<style lang="scss" scoped>
  .bg-gradient-exam-card {
    background: linear-gradient(to right, #7440fd, rgba(141, 107, 253, 0.8));
    .n-icon {
      color: #7440fd;
    }
  }
</style>
