<script setup>
import {useTopicExamStore} from "@/store/modules/index.js"
import {UIMenuButton, UIPagination} from "@/components/index.js";
import Utils from "@/utils/Utils.js"
import {BookQuestionMark20Filled} from "@vicons/fluent";
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useTopicExamStore()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v) => {
  if(!accStore.checkAction(accStore.pn.examExamsWrite)) return
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
      <n-grid cols="1 400:2" class="p-1" x-gap="20" y-gap="20">
        <template  v-for="(item, idx) in store.list" :key="idx">
          <n-gi span="1">
            <div class="rounded-xl p-3" style="box-shadow: rgba(50, 50, 93, 0.25) 0 0 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;">
              <p>{{ $t('content.name') }}: <span class="font-bold">{{ item.name }}</span></p>
              <n-divider class="my-1!" />
              <ul class="list-disc pl-5">
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
                <li>
                  <p>
                    {{$t('topicDetailsPage.exams.chances')}}: <span class="font-bold">{{item.chances}}</span>
                  </p>
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
          </n-gi>
        </template>
      </n-grid>
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