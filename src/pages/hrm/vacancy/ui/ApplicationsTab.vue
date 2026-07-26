<script setup>
  import { UIUser, UIBadge, UIModal, UIStatus, UITable } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import validationRules from '@/utils/validationRules.js'
  import {
    Attach16Regular,
    CheckmarkCircle20Regular,
    Info24Regular,
    Checkmark24Regular,
    Dismiss24Regular,
    Eye16Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useVacancyStore()
  const formRef = ref(null)

  const confirmRules = {
    confirmMessage: validationRules.common.requiredStringField
  }

  const educationLevels = {
    1: "O'rta",
    2: "O'rta maxsus",
    3: 'Oliy',
    4: 'Magistr'
  }

  const getStatusId = (statusId) => {
    if (statusId === 1) return 1 // Process (warning)
    if (statusId === 2) return 3 // Success (success)
    if (statusId === 3) return 4 // Rejected (error)
    return 1
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'birthday',
      title: t('content.birthday'),
      minWidth: 100
    },
    {
      key: 'education',
      title: t('workerProfile.tabs.education'),
      minWidth: 120
    },
    {
      key: 'user.nationality.name',
      title: t('workerView.general.nationality'),
      minWidth: 150
    },
    {
      key: 'address',
      title: t('workerView.general.address'),
      minWidth: 150
    },
    {
      key: 'date',
      title: t('content.date'),
      minWidth: 100
    },
    {
      key: 'status',
      title: t('content.status'),
      minWidth: 100
    },
    {
      key: 'files',
      title: t('content.files'),
      minWidth: 80
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: (row) => store.openApplicationView(row)
    },
    {
      label: t('vacancy.confirm'),
      key: 'confirm',
      icon: UIHelper.renderIcon(CheckmarkCircle20Regular),
      action: (row) => store.openConfirmModal(row)
    }
  ])

  const changePage = (v) => {
    store.applicationsParams.page = v.page
    store.applicationsParams.per_page = v.per_page
    store._applications()
  }

  const openFile = (url) => {
    window.open(url, '_blank')
  }

  const handleAccept = () => {
    formRef.value?.validate((errors) => {
      if (!errors) {
        store._acceptWithMessage()
      }
    })
  }

  const handleReject = () => {
    formRef.value?.validate((errors) => {
      if (!errors) {
        store._rejectWithMessage()
      }
    })
  }
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.applicationsList"
    :loading="store.applicationsLoading"
    :page="store.applicationsParams.page"
    :per-page="store.applicationsParams.per_page"
    :total="store.applicationsTotalItems"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row.user?.photo,
          lastName: row.user?.last_name,
          firstName: row.user?.first_name,
          middleName: row.user?.middle_name
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3">{{ row.user?.pin }}</span>
        </template>
      </UIUser>
    </template>

    <template #cell-birthday="{ row }">
      <UIBadge
        :type="Utils.colorTypes.secondary"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.user?.birthday)"
      />
    </template>

    <template #cell-education="{ row }">
      {{ educationLevels[row.user?.education] || '-' }}
    </template>

    <template #cell-address="{ row }">
      <div class="text-xs">
        <p class="text-textColor2">{{ row.user?.current_region?.name }}</p>
        <p class="text-textColor3">{{ row.user?.current_city?.name }}</p>
      </div>
    </template>

    <template #cell-date="{ row }">
      <UIBadge
        :type="Utils.colorTypes.secondary"
        :show-icon="false"
        :label="Utils.timeOnlyDate(row.created_at)"
      />
    </template>

    <template #cell-status="{ row }">
      <UIStatus
        :status="{
          name: row.status?.name,
          id: getStatusId(row.status?.id)
        }"
      />
    </template>

    <template #cell-files="{ row }">
      <div class="flex gap-1">
        <n-button
          v-for="file in row.files"
          :key="file.id"
          size="tiny"
          type="primary"
          secondary
          @click="openFile(file.file)"
        >
          <template #icon>
            <n-icon :component="Attach16Regular" />
          </template>
        </n-button>
        <span v-if="!row.files?.length">-</span>
      </div>
    </template>
  </UITable>

  <!-- Confirm Modal -->
  <UIModal
    :width="520"
    :visible="store.confirmModalVisible"
    @update:visible="store.closeConfirmModal"
    :title="$t('vacancy.confirm')"
  >
    <div class="flex flex-col gap-4">
      <!-- Info block -->
      <div class="flex items-start gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5">
        <n-icon size="20" class="text-primary mt-[1px] shrink-0">
          <Info24Regular />
        </n-icon>
        <span class="text-sm text-primary leading-[1.5]">
          {{ $t('vacancy.confirmInfo') }}
        </span>
      </div>

      <!-- Message block -->
      <div class="flex flex-col gap-2 p-4 rounded-xl border border-surface-line bg-surface-ground/20">
        <n-form ref="formRef" :model="store" :rules="confirmRules">
          <n-form-item :label="$t('vacancy.confirmMessage')" path="confirmMessage" class="!mb-0">
            <n-input
              v-model:value="store.confirmMessage"
              type="textarea"
              :rows="2"
              :autosize="{ minRows: 2, maxRows: 4 }"
              :placeholder="$t('vacancy.confirmMessagePlaceholder')"
            />
          </n-form-item>
        </n-form>
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button
          type="error"
          ghost
          :loading="store.applicationActionLoading"
          @click="handleReject"
        >
          <template #icon><n-icon><Dismiss24Regular /></n-icon></template>
          {{ $t('content.reject') }}
        </n-button>
        <n-button
          type="success"
          :loading="store.applicationActionLoading"
          @click="handleAccept"
        >
          <template #icon><n-icon><Checkmark24Regular /></n-icon></template>
          {{ $t('vacancy.accept') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
