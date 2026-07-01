<script setup>
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'

  defineProps({
    examDetail: {
      type: Object,
      default: null
    },
    workerDetail: {
      type: Object,
      default: null
    },
    questionsCount: {
      type: Number,
      default: 0
    }
  })

  const visible = defineModel('visible', { type: Boolean, default: false })
</script>

<template>
  <n-drawer v-model:show="visible" :width="380" placement="right">
    <n-drawer-content :title="$t('solveExamPage.info')" closable>
      <div v-if="workerDetail && examDetail" class="flex flex-col gap-4">
        <img
          :src="workerDetail.user.worker.photo || useAppSetting.noAvailableImage"
          @error="Utils.onImgError"
          alt="img"
          class="w-full h-[220px] object-contain rounded-lg border border-surface-line bg-surface-ground"
        />
        <n-table size="small">
          <tr>
            <th>{{ $t('solveExamPage.exam') }}</th>
            <td>{{ examDetail.name }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.firstName') }}</th>
            <td>{{ workerDetail.user.worker.first_name }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.lastName') }}</th>
            <td>{{ workerDetail.user.worker.last_name }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.middleName') }}</th>
            <td>{{ workerDetail.user.worker.middle_name }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.startedAt') }}</th>
            <td>{{ Utils.timeWithMonth(workerDetail.created) }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.variant') }}</th>
            <td>{{ examDetail.variant }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.totalTime') }}</th>
            <td>{{ examDetail.minute }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.deadline') }}</th>
            <td>{{ Utils.timeWithMonth(examDetail.deadline) }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.attempts') }}</th>
            <td>{{ examDetail.chances }}</td>
          </tr>
          <tr>
            <th>{{ $t('solveExamPage.questions') }}</th>
            <td>{{ questionsCount }}</td>
          </tr>
        </n-table>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>
