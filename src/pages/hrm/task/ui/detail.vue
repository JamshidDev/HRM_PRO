<script setup>
  import { UIBadge, UIStatus, UIUser } from '@/components/index.js'
  import { useAccountStore, useTaskStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { taskStatusObj, taskStatusName } from './statusHelper.js'

  const { t } = i18n.global
  const store = useTaskStore()
  const accStore = useAccountStore()

  const statusOptions = computed(() => [
    { label: t('task.status.created'), value: 1 },
    { label: t('task.status.in_progress'), value: 2 },
    { label: t('task.status.done'), value: 3 },
    { label: t('task.status.blocked'), value: 4 }
  ])

  const statusLabel = (n) => (n != null ? taskStatusName(n) : '')
  const transitionText = (h) =>
    h.from_status == null
      ? statusLabel(h.to_status)
      : `${statusLabel(h.from_status)} → ${statusLabel(h.to_status)}`
  const dt = (s) => (s ? String(s).slice(0, 16).replace('T', ' ') : '')

  const myWorkerId = computed(() => accStore.account?.worker?.id)
  const myAssignee = computed(() =>
    (store.detail?.assignees || []).find((a) => a.worker_id === myWorkerId.value)
  )
  const assigneeName = (workerId) =>
    (store.detail?.assignees || []).find((a) => a.worker_id === workerId)?.full_name || '—'

  watch(
    () => store.detail,
    (d) => {
      if (d && myAssignee.value) store.statusPayload.status = myAssignee.value.status
    }
  )

  const canSaveStatus = computed(
    () =>
      myAssignee.value &&
      store.statusPayload.status &&
      store.statusPayload.status !== myAssignee.value.status
  )
</script>

<template>
  <div v-if="store.detailLoading" class="py-10 flex justify-center">
    <n-spin size="medium" />
  </div>

  <div v-else-if="store.detail" class="flex flex-col gap-4">
    <!-- ===== Ma'lumot tab ===== -->
    <template v-if="store.detailTab === 'info'">
      <div>
        <div class="text-lg font-semibold text-textColor2">{{ store.detail.title }}</div>
        <p v-if="store.detail.description" class="text-sm text-textColor3 mt-1 whitespace-pre-line">
          {{ store.detail.description }}
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <UIBadge
            v-if="store.detail.deadline"
            :type="Utils.colorTypes.warning"
            :show-icon="false"
            :label="$t('task.table.deadline') + ': ' + dt(store.detail.deadline)"
          />
          <UIBadge
            :type="Utils.colorTypes.dark"
            :show-icon="false"
            :label="$t('content.date') + ': ' + dt(store.detail.created_at)"
          />
        </div>
      </div>

      <div>
        <div class="text-xs text-textColor3 mb-1">{{ $t('task.table.creator') }}</div>
        <UIUser :short="false" :data="{ photo: store.detail.creator?.photo }">
          <template #name>
            <span class="text-sm text-textColor2">{{ store.detail.creator?.full_name || '—' }}</span>
          </template>
        </UIUser>
      </div>

      <div>
        <div class="text-xs text-textColor3 mb-1">{{ $t('task.table.assignees') }}</div>
        <div class="flex flex-col gap-2">
          <div
            v-for="a in store.detail.assignees"
            :key="a.worker_id"
            class="flex items-center justify-between gap-2"
          >
            <UIUser :short="false" :data="{ photo: a.photo }">
              <template #name>
                <span class="text-sm text-textColor2">{{ a.full_name }}</span>
              </template>
            </UIUser>
            <UIStatus :status="taskStatusObj(a.status)" pill />
          </div>
        </div>
      </div>

      <div v-if="myAssignee" class="border border-borderColor rounded-xl p-3 flex flex-col gap-2">
        <div class="text-sm font-medium text-textColor2">{{ $t('task.myStatus') }}</div>
        <n-select
          v-model:value="store.statusPayload.status"
          :options="statusOptions"
          label-field="label"
          value-field="value"
        />
        <n-input
          v-model:value="store.statusPayload.comment"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :placeholder="$t('task.statusComment')"
        />
        <n-button
          type="primary"
          :disabled="!canSaveStatus"
          :loading="store.statusSaving"
          @click="store._updateStatus()"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>

    <!-- ===== Holat tarixi tab ===== -->
    <template v-else-if="store.detailTab === 'history'">
      <div v-if="store.detail.status_history?.length" class="flex flex-col">
        <div
          v-for="h in store.detail.status_history"
          :key="h.id"
          class="flex items-start justify-between gap-3 py-2 border-b border-borderColor last:border-0"
        >
          <div class="min-w-0">
            <div class="text-sm text-textColor2">
              <b>{{ assigneeName(h.worker_id) }}</b>
              <span class="text-textColor3"> — {{ transitionText(h) }}</span>
            </div>
            <div v-if="h.comment" class="text-xs text-textColor3 mt-0.5">{{ h.comment }}</div>
          </div>
          <span class="text-xs text-textColor3 whitespace-nowrap shrink-0">{{ dt(h.created_at) }}</span>
        </div>
      </div>
      <div v-else class="text-sm text-textColor3 py-3">—</div>
    </template>

    <!-- ===== Izohlar tab ===== -->
    <template v-else>
      <div v-if="store.detail.comments?.length" class="flex flex-col gap-2 mb-2">
        <div v-for="c in store.detail.comments" :key="c.id" class="bg-bodyColor rounded-lg p-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-textColor2">{{ c.full_name || '—' }}</span>
            <span class="text-xs text-textColor3 whitespace-nowrap">{{ dt(c.created_at) }}</span>
          </div>
          <p class="text-sm text-textColor2 mt-1 whitespace-pre-line">{{ c.comment }}</p>
        </div>
      </div>
      <div class="flex gap-2 items-end">
        <n-input
          v-model:value="store.commentText"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 3 }"
          :placeholder="$t('task.addComment')"
        />
        <n-button
          type="primary"
          :disabled="!store.commentText"
          :loading="store.commentSaving"
          @click="store._addComment()"
        >
          {{ $t('content.add') }}
        </n-button>
      </div>
    </template>
  </div>
</template>
