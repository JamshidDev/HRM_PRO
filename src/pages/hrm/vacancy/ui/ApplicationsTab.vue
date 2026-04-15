<script setup>
  import { UIPagination, NoDataPicture, UIUser, UIBadge, UIMenuButton, UIModal, UIStatus } from '@/components/index.js'
  import { useVacancyStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { Attach16Regular, CheckmarkCircle20Regular, Info24Regular, Checkmark24Regular, Dismiss24Regular } from '@vicons/fluent'
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

  const extraOptions = [
    {
      label: t('vacancy.confirm'),
      key: 'confirm',
      icon: CheckmarkCircle20Regular
    }
  ]

  const getStatusId = (statusId) => {
    if (statusId === 1) return 1 // Process (warning)
    if (statusId === 2) return 3 // Success (success)
    if (statusId === 3) return 4 // Rejected (error)
    return 1
  }

  const changePage = (v) => {
    store.applicationsParams.page = v.page
    store.applicationsParams.per_page = v.per_page
    store._applications()
  }

  const openFile = (url) => {
    window.open(url, '_blank')
  }

  const onSelectEv = (v) => {
    if (Utils.ActionTypes.view === v.key) {
      store.openApplicationView(v.data)
    } else if (v.key === 'confirm') {
      store.openConfirmModal(v.data)
    }
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
  <n-spin :show="store.applicationsLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.applicationsList.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
            <th class="min-w-[100px]">{{ $t('content.birthday') }}</th>
            <th class="min-w-[120px]">{{ $t('workerProfile.tabs.education') }}</th>
            <th class="min-w-[150px]">{{ $t('workerView.general.nationality') }}</th>
            <th class="min-w-[150px]">{{ $t('workerView.general.address') }}</th>
            <th class="min-w-[100px]">{{ $t('content.date') }}</th>
            <th class="min-w-[100px]">{{ $t('content.status') }}</th>
            <th class="min-w-[80px]">{{ $t('content.files') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.applicationsList" :key="idx">
            <td>
              <span class="text-center block">{{
                (store.applicationsParams.page - 1) * store.applicationsParams.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <UIUser
                :short="false"
                :data="{
                  photo: item.user?.photo,
                  lastName: item.user?.last_name,
                  firstName: item.user?.first_name,
                  middleName: item.user?.middle_name
                }"
              >
                <template #position>
                  <span class="text-xs text-textColor3">{{ item.user?.pin }}</span>
                </template>
              </UIUser>
            </td>
            <td>
              <UIBadge
                :type="Utils.colorTypes.secondary"
                :show-icon="false"
                :label="Utils.timeOnlyDate(item.user?.birthday)"
              />
            </td>
            <td>{{ educationLevels[item.user?.education] || '-' }}</td>
            <td>{{ item.user?.nationality?.name || '-' }}</td>
            <td>
              <div class="text-xs">
                <p class="text-textColor2">{{ item.user?.current_region?.name }}</p>
                <p class="text-textColor3">{{ item.user?.current_city?.name }}</p>
              </div>
            </td>
            <td>
              <UIBadge
                :type="Utils.colorTypes.secondary"
                :show-icon="false"
                :label="Utils.timeOnlyDate(item.created_at)"
              />
            </td>
            <td>
              <UIStatus
                :status="{
                  name: item.status?.name,
                  id: getStatusId(item.status?.id)
                }"
              />
            </td>
            <td>
              <div class="flex gap-1">
                <n-button
                  v-for="file in item.files"
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
                <span v-if="!item.files?.length">-</span>
              </div>
            </td>
            <td>
              <UIMenuButton
                :data="item"
                :show-view="true"
                :show-delete="false"
                :extra-options="extraOptions"
                @selectEv="onSelectEv"
              />
            </td>
          </tr>
        </tbody>
      </n-table>
      <UIPagination
        :page="store.applicationsParams.page"
        :per_page="store.applicationsParams.per_page"
        :total="store.applicationsTotalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.applicationsList.length === 0 && !store.applicationsLoading" />
  </n-spin>

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
