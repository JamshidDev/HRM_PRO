<script setup>
import {UIUser, UIPagination, UIMenuButton, NoDataPicture, UIStatus, UIBadge} from "@/components/index.js"
import {useExamAttemptStore, useTopicExamResultStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useTopicExamResultStore()
const attemptStore = useExamAttemptStore()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v) => {
  if (v.key === Utils.ActionTypes.view) {
    attemptStore.visible = true
    attemptStore.elementId = v.data.id
    attemptStore._get_attempt()
  } else if (v.key === Utils.ActionTypes.delete) {
    store.elementId = v.data.id
    store._delete()
  }
}


const resultClass = (allQuestion, correctAnswerCount) => {
  const percent = (correctAnswerCount / allQuestion) * 100
  if (percent >= 86) return 'border-success! text-success!'
  if (percent >= 56) return 'border-warning! text-warning!'
  return 'border-danger! text-danger!'
}


</script>
<template>
<div class="w-full overflow-x-auto">
  <n-spin :show="store.loading">
    <n-table
        v-if="store.list.length>0"
        size="small"
        class="w-full mt-4"
        :single-line="false"
    >
      <thead>
      <tr>
        <th class="text-center! w-[40px] min-w-[40px]">{{ $t('content.number') }}</th>
        <th>
          {{ $t('content.worker') }}
        </th>
        <th class="w-[200px]">
          {{ $t('examPage.topic') }}
        </th>
        <th class="w-[300px]">
          {{ $t('solveExamPage.exam') }}
        </th>
        <th class="w-[200px]">
          {{ $t('content.type') }}
        </th>
        <th class="w-[140px] min-w-[140px]">
          {{ $t('examPage.startTime') }}
        </th>
        <th class="w-[140px] min-w-[140px]">
          {{ $t('examPage.endTime') }}
        </th>
        <th class="w-[60px] ">
          {{ $t('examPage.result') }}
        </th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(result, idx) in store.list"
          :key="idx"
          :class="[result?.deleted_at && 'opacity-30']">
        <td class="text-center!">{{ idx + 1 + (store.params.page - 1) * store.params.per_page }}</td>
        <td>
          <UIUser
              :over-line="Boolean(result?.deleted_at)"
              :short="false"
              :data="{
              photo: result.worker.photo,
              lastName: result.worker.last_name,
              firstName: result.worker.first_name,
              middleName: result.worker.middle_name,
            }"
          >
            <template v-if="result?.deleted_at" #position>
              <span class="text-xs text-danger">{{ $t('examPage.deletedResult') }}</span>
            </template>
          </UIUser>
        </td>
        <td>
          <n-tooltip trigger="hover">
            <template #trigger>
              <p class="w-[200px] line-clamp-1 border rounded-lg
             border-surface-line px-1 bg-dark/4 cursor-pointer">{{ result.topic?.name }}</p>
            </template>
            {{ result.topic?.name }}
          </n-tooltip>
        </td>
        <td>
          {{ result.exam?.name }}
        </td>
        <td>
          <n-tooltip trigger="hover">
            <template #trigger>
              <p class="w-[200px] line-clamp-1 border rounded-lg
             border-surface-line px-1 bg-dark/4 cursor-pointer">{{ result.topic?.type?.name }}</p>
            </template>
            {{ result.topic?.type?.name }}
          </n-tooltip>
        </td>
        <td>
          <n-tag round size="small" type="primary">
            {{ Utils.timeWithMonth(result?.created) }}
          </n-tag>
        </td>
        <td>
          <n-tag v-if="result?.ended" round size="small" type="error">
            {{ Utils.timeWithMonth(result?.ended) }}
          </n-tag>
        </td>
        <td class="text-center">
          <template v-if="typeof result?.result === 'number'">
            <n-tag :bordered="false" class=" rounded-2xl! w-[32px] h-[32px]! justify-center border-dashed! border! bg-transparent!"
                   :class="resultClass(result.exam?.tests_count, result.result)" round>
              {{ result?.result }}
            </n-tag>
          </template>

        </td>
        <td>
          <UIMenuButton
              show-view
              :data="result"
              @select-ev="onSelectEv"
          />
        </td>
      </tr>
      </tbody>
    </n-table>
    <UIPagination
        v-if="store.totalItems>store.params.per_page"
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
    />
    <NoDataPicture v-if="store.list.length===0 && !store.loading"/>
  </n-spin>
</div>

</template>