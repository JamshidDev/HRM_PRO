<script setup>
import {useTopicExamStore} from "@/store/modules/index.js"
import {UIMenuButton, UIPagination} from "@/components/index.js";
import Utils from "@/utils/Utils.js"
import {BookQuestionMark20Filled} from "@vicons/fluent";

const store = useTopicExamStore()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v) => {
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
  <div v-if="store.list.length>0" class="h-full flex flex-col">
    <div
        class="w-full grow basis-auto overflow-auto"
    >
      <div class="bg-surface-section p-3 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
        <div v-for="(item, idx) in store.list" :key="idx" class="rounded-md p-3 shadow-sm">

          <ul class="list-disc pl-5">

            <li>
              <p>{{ $t('content.name') }}: <span class="font-bold">{{ item.name }}</span></p>
            </li>
            <li class="flex justify-between">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <ul class="list-disc">
                        <li>
                          <p>{{ $t('examPage.question_count') }}: <span class="font-bold">{{ item.tests_count }}</span>
                          </p>
                        </li>
                        <li>
                          <p>{{ $t('examPage.variant_count') }}: <span class="font-bold">{{ item.variant }}</span> </p>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table>
                <tbody>
                  <tr>
                    <td>
                      <ul class="list-disc">

                        <li>
                          <p>{{ $t('examPage.exam_duration') }}: <span class="font-bold">{{ item.minute }}</span></p>
                        </li>
                        <li>
                          <p>{{ $t('examPage.toWhom') }}: <span class="font-bold">{{ item.whom?.name }}</span></p>
                        </li>
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </li>
          </ul>
          <n-tag round size="small" type="warning">
            {{ $t('examPage.deadline', {n: Utils.timeWithMonth(item.deadline)}) }}
          </n-tag>
          <div class="flex justify-between items-center mt-2">
            <n-switch :loading="store.loading && store.elementId === item.id" :value="!!item.active"
                      size="small" @click="updateStatus(item)"/>
            <UIMenuButton
                :data="item"
                :extra-options="[
                      {
                        label: $t('topicDetailsPage.questions.name'),
                        key: 'attach_question',
                        icon: BookQuestionMark20Filled,
                        visible:true,
                      },
                  ]"
                :show-delete="true"
                :show-edit="true"
                size="tiny"
                @select-ev="onSelect"
            />
          </div>

        </div>
      </div>
    </div>
    <div class="shrink-0">
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>

</style>