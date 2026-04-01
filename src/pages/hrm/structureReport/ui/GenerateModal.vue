<script setup>
  import { NAvatar } from 'naive-ui'
  import { CheckmarkCircle12Filled, Delete16Regular, DocumentBulletList24Regular, Organization12Filled, ArrowLeft16Regular, ArrowRight16Regular, Play16Filled, Save16Regular } from '@vicons/fluent'
  import { UIModal, UISelect, UIUser } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useStructureReportStore, useComponentStore } from '@/store/modules/index.js'
  import ReportTable from './ReportTable.vue'
  import ContractsTable from './ContractsTable.vue'

  const store = useStructureReportStore()

  const reportInnerTab = ref('jadval')
  const componentStore = useComponentStore()

  const expandedKeys = ref([])

  const orgSelectOptions = computed(() => {
    return store.organizations.map((o) => ({
      label: o.name,
      value: o.id,
      name: o.name
    }))
  })

  const stepNumber = computed(() => {
    return store.modalTab === 'organizations' ? 1 : 2
  })

  const stepStatus = computed(() => {
    return store.reportData.length > 0 ? 'finish' : 'process'
  })

  const modalTitle = computed(() => {
    if (store.modalTab === 'reports' && store.reportYear && store.reportMonth) {
      const monthName = Utils.getMonthNameById(store.reportMonth)
      return `${store.reportYear}, ${monthName}`
    }
    return null
  })

  // --- Director / Tasdiqlovchilar ---
  const excludeIds = computed(() => {
    const ids = new Set()
    if (store.editMode) {
      if (store.editDirectorData?.id) ids.add(store.editDirectorData.id)
      store.editConfirmationData.forEach((c) => ids.add(c.id))
    }
    return ids
  })

  const directorOptions = computed(() => {
    if (!store.editMode) return componentStore.confirmationList
    return componentStore.confirmationList.filter((v) => !excludeIds.value.has(v.id))
  })

  const confirmationOptions = computed(() => {
    let list = componentStore.confirmationList
    if (store.director_id) {
      list = list.filter((v) => v.id !== store.director_id)
    }
    if (store.editMode) {
      list = list.filter((v) => !excludeIds.value.has(v.id))
    }
    return list
  })

  const renderLabel = (option) => {
    return [
      h(
        'div',
        { class: 'flex gap-2 my-1 items-center px-2' },
        [
          h(NAvatar, {
            src: option.photo,
            'fallback-src': Utils.noAvailableImage
          }),
          h('div', { class: 'flex flex-col' }, [
            h('div', { class: 'text-xs font-medium text-gray-500 leading-[1.2]' },
              `${option.last_name} ${option.first_name?.[0]}.${option.middle_name?.[0]}.`
            ),
            h('div', { class: 'text-xs text-primary leading-[1.2]' }, option.position)
          ])
        ]
      )
    ]
  }

  const renderValue = ({ option }) => {
    if (!option) return ''
    return [
      h('div', { class: 'flex gap-2 my-1 items-center' },
        `${option?.last_name} ${option?.first_name} ${option?.middle_name}`
      )
    ]
  }

  const directorLoading = ref(false)

  const onDirectorChange = () => {
    store.confirmations = store.confirmations.filter((id) => id !== store.director_id)
    if (store.editMode && store.director_id) {
      const selectedId = store.director_id
      directorLoading.value = true
      $ApiService.structureReportService
        ._update({ id: store.elementId, data: { director_id: selectedId } })
        .then(() => {
          return store._refreshConfirmations()
        })
        .finally(() => {
          directorLoading.value = false
          store.director_id = null
        })
    }
  }

  watch(() => store.modalVisible, (v) => {
    if (v) {
      if (componentStore.confirmationList.length === 0) {
        componentStore._confirmations()
      }
    }
  })

  // --- Confirmation users list ---
  const addConfirmationLoading = ref(false)

  const addConfirmation = (id) => {
    if (!id) return
    // editConfirmationData da bor
    const alreadyExists = store.editConfirmationData.some((c) => c.id === id)
    if (alreadyExists) {
      window.$message?.warning('Allaqachon bor')
      return
    }
    // director sifatida tanlangan
    if (id == store.director_id || id == store.editDirectorData?.id) {
      window.$message?.warning('Bu foydalanuvchi director sifatida tanlangan')
      return
    }
    const user = componentStore.confirmationList.find((c) => c.id === id)
    if (!user) return
    addConfirmationLoading.value = true
    $ApiService.structureReportService
      ._createConfirmation({
        data: {
          report: store.elementId,
          confirmation_id: id
        }
      })
      .then(() => {
        return store._refreshConfirmations()
      })
      .catch(() => {
        window.$message?.warning('Allaqachon bor')
      })
      .finally(() => {
        addConfirmationLoading.value = false
      })
  }

  const removeConfirmationLoading = ref(false)

  const removeConfirmation = (id) => {
    if (!id) return
    removeConfirmationLoading.value = true
    $ApiService.structureReportService
      ._deleteConfirmation({ id })
      .then(() => {
        return store._refreshConfirmations()
      })
      .finally(() => {
        removeConfirmationLoading.value = false
      })
  }

  // --- Select / Generate ---
  const hasContracts = computed(() => {
    return store.reportData.some((v) => v.contracts && v.contracts.length > 0)
  })

  const totalContracts = computed(() => {
    const orgData = store.reportData.find((v) => String(v.organization_id) === store.activeOrgTab)
    return orgData?.contracts?.length || 0
  })

  const canGenerate = computed(() => {
    return store.selectedOrganizations.length > 0 && (store.director_id || store.editDirectorData?.id)
  })

  const onSelectOrg = (val) => {
    store.activeOrgTab = String(val)
  }

  const onChangeStructure = (v) => {
    store.selectedOrganizations = v
    if (store.editMode) {
      const selectedIds = v.map((o) => o.id).sort()
      const originalIds = [...store.originalOrgIds].sort()
      const isSame = selectedIds.length === originalIds.length && selectedIds.every((id, i) => id === originalIds[i])
      if (isSame) {
        store.reportData = [...store.originalReportData]
        store.reportRawData = [...store.originalReportRawData]
        store.organizations = [...store.originalOrganizations]
        store.activeOrgTab = store.originalActiveOrgTab
      } else {
        store.reportData = []
        store.reportRawData = []
        store.organizations = []
        store.activeOrgTab = null
      }
    }
  }

  const onDefaultOrganization = (v) => {
    store.selectedOrganizations = v
  }

  const onSubmit = () => {
    if (!canGenerate.value) return
    store._generate()
  }
</script>

<template>
  <UIModal v-model:visible="store.modalVisible" :width="900" height="85vh" :title="$t('structureReport.name')">
    <template #header-title>
      {{ $t('structureReport.name') }}
      <span v-if="modalTitle" class="text-gray-400 ml-2">{{ modalTitle }}</span>
    </template>
    <div class="mb-4">
      <n-steps :current="stepNumber" :status="stepStatus" size="small" class="mt-1">
        <template #finish-icon>
          <n-icon><CheckmarkCircle12Filled /></n-icon>
        </template>
        <n-step :title="$t('content.organization')" />
        <n-step :title="$t('structureReport.reports')" />
      </n-steps>
    </div>

    <!-- Step 1: Korxonani tanlang -->
    <div v-show="store.modalTab === 'organizations'" class="flex flex-col gap-4">
      <div>
        <label class="text-xs text-gray-500 mb-1 font-medium">
          {{ $t('content.organization') }}
        </label>
        <UISelect
          :options="componentStore.structureList"
          :model-v="store.selectedOrganizations"
          :checked-val="expandedKeys"
          @updateModel="onChangeStructure"
          @defaultValue="onDefaultOrganization"
          @updateCheck="(v) => (expandedKeys = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-gray-500 mb-1 font-medium">
            {{ $t('documentPage.command.form.director_id') }}
          </label>
          <n-select
            value-field="id"
            label-field="last_name"
            v-model:value="store.director_id"
            :options="directorOptions"
            :loading="componentStore.confirmationLoading"
            :render-label="renderLabel"
            :render-tag="renderValue"
            filterable
            clearable
            @update:value="onDirectorChange"
          />
          <n-spin :show="directorLoading" size="small">
            <div v-if="store.editMode && store.editDirectorData" class="mt-2 bg-gray-50 rounded-lg px-1 py-1 inline-flex">
              <UIUser
                :short="true"
                :data="{
                  photo: store.editDirectorData.photo,
                  lastName: store.editDirectorData.last_name,
                  firstName: store.editDirectorData.first_name,
                  middleName: store.editDirectorData.middle_name,
                  position: store.editDirectorData.position
                }"
              />
            </div>
          </n-spin>
        </div>
        <div>
          <label class="text-xs text-gray-500 mb-1 font-medium">
            {{ $t('documentPage.command.form.confirm') }}
          </label>
          <!-- Edit mode: select qo'shish uchun -->
          <n-select
            v-if="store.editMode"
            value-field="id"
            label-field="last_name"
            :value="null"
            :options="confirmationOptions"
            :loading="componentStore.confirmationLoading"
            :render-label="renderLabel"
            filterable
            clearable
            :placeholder="$t('structureReport.addApprover')"
            @update:value="addConfirmation"
          />
          <!-- Create mode: oddiy multiple select -->
          <n-select
            v-else
            :disabled="!store.director_id"
            value-field="id"
            label-field="last_name"
            multiple
            v-model:value="store.confirmations"
            :options="confirmationOptions"
            :loading="componentStore.confirmationLoading"
            :render-label="renderLabel"
            :render-tag="renderValue"
            filterable
            :max-tag-count="1"
          />
        </div>
      </div>
      <n-spin :show="addConfirmationLoading || removeConfirmationLoading" size="small">
      <div v-if="store.editMode && store.editConfirmationData.length > 0" class="flex flex-col gap-2">
        <label class="text-xs text-gray-500 font-medium">
          {{ $t('documentPage.command.form.confirm') }} ({{ store.editConfirmationData.length }})
        </label>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="user in store.editConfirmationData"
            :key="user.id"
            class="flex items-center gap-2 bg-gray-50 border border-surface-line rounded-lg pl-1 pr-1 py-1"
          >
            <UIUser
              :short="true"
              :data="{
                photo: user.photo,
                lastName: user.last_name,
                firstName: user.first_name,
                middleName: user.middle_name,
                position: user.position
              }"
            />
            <n-button
              text
              type="error"
              size="small"
              @click="removeConfirmation(user.id)"
            >
              <template #icon>
                <n-icon><Delete16Regular /></n-icon>
              </template>
            </n-button>
          </div>
        </div>
      </div>
      </n-spin>
    </div>

    <!-- Step 2: Hisobotlar -->
    <div v-show="store.modalTab === 'reports'">
      <div v-if="store.reportData.length > 0">
        <div class="mb-3 flex flex-col gap-3">
          <n-select
            :value="store.activeOrgTab ? Number(store.activeOrgTab) : null"
            :options="orgSelectOptions"
            :render-label="UIHelper.selectRender.label"
            filterable
            :placeholder="$t('content.choose')"
            @update:value="onSelectOrg"
          />
          <n-tabs v-model:value="reportInnerTab" type="segment" size="small">
            <n-tab name="jadval">{{ $t('structureReport.tableTab') }}</n-tab>
            <n-tab name="xodimlar">
              <span class="inline-flex items-center gap-1.5">
                {{ $t('structureReport.workersTab') }}
                <span v-if="totalContracts > 0" class="text-[11px] font-medium bg-primary text-white rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1">
                  {{ totalContracts }}
                </span>
              </span>
            </n-tab>
          </n-tabs>
        </div>

        <ReportTable
          v-if="reportInnerTab === 'jadval' && store.activeOrgTab"
          :key="'r-' + store.activeOrgTab"
          :organization-id="Number(store.activeOrgTab)"
        />

        <ContractsTable
          v-else-if="reportInnerTab === 'xodimlar' && store.activeOrgTab"
          :key="'c-' + store.activeOrgTab"
          :organization-id="Number(store.activeOrgTab)"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 h-[60px] items-center" v-if="store.modalTab === 'organizations'">
        <n-button
          type="primary"
          @click="onSubmit"
          :loading="store.generateLoading"
          :disabled="!canGenerate"
        >
          <template #icon>
            <n-icon><Play16Filled /></n-icon>
          </template>
          {{ $t('structureReport.generate') }}
        </n-button>
        <n-button
          v-if="store.editMode"
          :disabled="store.reportData.length === 0 || store.organizations.length === 0"
          @click="store.modalTab = 'reports'"
          icon-placement="right"
        >
          <template #icon>
            <n-icon><ArrowRight16Regular /></n-icon>
          </template>
          {{ $t('content.next') }}
        </n-button>
      </div>
      <div class="flex justify-between h-[60px] items-center" v-else-if="store.modalTab === 'reports'">
        <n-button @click="store.modalTab = 'organizations'">
          <template #icon>
            <n-icon><ArrowLeft16Regular /></n-icon>
          </template>
          {{ $t('content.back') }}
        </n-button>
        <div class="flex gap-3">
          <n-button
            v-if="store.editMode && store.organizations.length > 0"
            type="error"
            :loading="store.saveLoading"
            @click="store._deleteDetail(Number(store.activeOrgTab))"
          >
            <template #icon>
              <n-icon><Delete16Regular /></n-icon>
            </template>
            {{ $t('content.delete') }}
          </n-button>
          <n-button
            type="primary"
            :loading="store.saveLoading"
            :disabled="store.reportData.length === 0"
            @click="store.editMode ? store._updateDetail(Number(store.activeOrgTab)) : store._save()"
          >
            <template #icon>
              <n-icon><Save16Regular /></n-icon>
            </template>
            {{ $t('content.save') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIModal>
</template>
