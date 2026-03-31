<script setup>
  import { useComponentStore, useStaffingApprovalStore } from '@stores'
  import { SuperSelect, UIModal, UISelect } from '@components'
  import validationRules from '@utils/validationRules.js'
  import DepartmentItem from './DepartmentItem.vue'
  import i18n from '@/i18n/index.js'
  import { useAppSetting, Utils } from '@utils'

  const t = i18n.global.t
  const store = useStaffingApprovalStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)
  const expandList = ref([])
  const selectedOrganization = ref([])
  const expandedKeys = ref([])

  const onChangeOrganization = (v) => {
    selectedOrganization.value = v
    store.payload.organization_id = v.length > 0 ? v[0].id : null
    store.payload.department_positions = []
    expandList.value = []
    store._showGenerate()
  }

  const onDefaultOrganization = (v) => {
    selectedOrganization.value = v
    store.payload.organization_id = v.length > 0 ? v[0].id : null
    store.payload.department_positions = []
    expandList.value = []
    store._showGenerate()
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (!store.payload.department_positions?.length) {
          $Toast.warning(t('message.minimumOneItem'))
          return
        }
        const data = {
          organization_id: store.payload.organization_id,
          department_positions: store.payload?.department_positions,
          confirmations: store.payload.confirmations,
          director_id: store.payload.director_id,
          confirmatory_id: store.payload.confirmatory_id,
          date: Utils.timeToZone(store.payload.date)
        }

        store._create(data)
      }
    })
  }

  const toggleExpand = (id) => {
    const set = new Set(expandList.value)
    set.has(id) ? set.delete(id) : set.add(id)
    expandList.value = [...set]
  }

  const expandedSet = computed(() => new Set(expandList.value))

  const onSelectAll = (positionIds) => {
    const currentSet = new Set(store.payload.department_positions)
    positionIds.forEach((id) => currentSet.add(id))
    store.payload.department_positions = [...currentSet]
  }

  const onUnselectAll = (positionIds) => {
    const removeSet = new Set(positionIds)
    store.payload.department_positions = store.payload.department_positions.filter(
      (id) => !removeSet.has(id)
    )
  }

  const allPositionIds = computed(() => {
    return store.positions.flatMap((dept) => dept.positions.map((p) => p.id))
  })

  const isAllDepartmentsSelected = computed(() => {
    if (allPositionIds.value.length === 0) return false
    return allPositionIds.value.every((id) => store.payload.department_positions.includes(id))
  })

  const toggleSelectAllDepartments = () => {
    if (isAllDepartmentsSelected.value) {
      store.payload.department_positions = []
    } else {
      store.payload.department_positions = [...allPositionIds.value]
    }
  }

  const workerAction = {
    fetch: () => store.worker.list.length || store._workers(),
    onSearch: () => {
      store.worker.params.page = 1
      store._workers()
    },
    onScroll: () => {
      store.worker.params.page++
      store._workers(true)
    }
  }

  const leaderAction = {
    fetch: () => store.leader.list.length || store._organizationLeader(),
    onSearch: () => {
      store.leader.params.page = 1
      store._organizationLeader()
    },
    onScroll: () => {
      store.leader.params.page++
      store._organizationLeader(true)
    }
  }

  const confirmationAction = {
    fetch: () => store.confirmation.list.length || store._confirmation(),
    onSearch: () => {
      store.confirmation.params.page = 1
      store._confirmation()
    },
    onScroll: () => {
      store.confirmation.params.page++
      store._confirmation(true)
    }
  }

  const onChangeParent = (v) => {
    store.leader.list = []
    store.leader.params.search = null
    store.payload.director_id = null
    store.leader.params.page = 1
    if (!v) return
    store._organizationLeader()
  }

  watch(() => store.visible, (v) => {
    if (v) {
      if (componentStore.structureList.length === 0) {
        componentStore._structures()
      }
      selectedOrganization.value = []
      expandedKeys.value = []
    }
  })
</script>

<template>
  <UIModal
    :width="'1200px'"
    v-model:visible="store.visible"
    :title="$t('staffingApproval.createTitle')"
  >
    <n-form ref="formRef" :model="store.payload" :rules="validationRules.common">
      <n-spin :show="store.generateLoading">
        <div class="w-full h-[calc(100vh-160px)] overflow-y-auto pb-10">
          <div class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12">
              <n-form-item :label="$t('content.organization')">
                <UISelect
                  :multiple="false"
                  :options="componentStore.structureList"
                  :model-v="selectedOrganization"
                  :checked-val="expandedKeys"
                  @updateModel="onChangeOrganization"
                  @defaultValue="onDefaultOrganization"
                  @updateCheck="(v) => (expandedKeys = v)"
                  :loading="componentStore.structureLoading"
                  v-model:search="componentStore.structureParams.search"
                  @onSearch="componentStore._structures"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 border border-surface-line rounded-xl p-2 bg-surface-ground/20">
              <div class="grid grid-cols-12 gap-x-4 ">
                <div class="col-span-4">
                  <n-form-item
                    :label="$t(`content.date`)"
                    path="date"
                    :rule-path="validationRules.rulesNames.requiredNumberField"
                  >
                    <n-date-picker
                      class="w-full"
                      v-model:value="store.payload.date"
                      type="date"
                      :format="useAppSetting.datePicketFormat"
                    />
                  </n-form-item>
                </div>
                <div class="col-span-8">
                  <n-form-item
                    :label="$t(`staffingApproval.form.confirmatory_id`)"
                    path="confirmatory_id"
                    :rule-path="validationRules.rulesNames.requiredNumberField"
                  >
                    <SuperSelect
                      v-model:value="store.payload.confirmatory_id"
                      v-model:search="store.worker.params.search"
                      :options="store.worker.list"
                      :loading="store.worker.loading"
                      :total-count="store.worker.totalItems"
                      :per-page="store.worker.params.per_page"
                      :clearable="true"
                      @onScrollEv="workerAction.onScroll"
                      @onSearch="workerAction.onSearch"
                    />
                  </n-form-item>
                </div>
                <div class="col-span-12">
                  <n-form-item
                    :label="$t(`documentPage.command.form.confirm`)"
                    path="confirmations"
                    :rule-path="validationRules.rulesNames.requiredMultiSelectField"
                  >
                    <SuperSelect
                      multiple
                      v-model:value="store.payload.confirmations"
                      v-model:search="store.confirmation.params.search"
                      :options="store.confirmation.list"
                      :loading="store.confirmation.loading"
                      :total-count="store.confirmation.totalItems"
                      :per-page="store.confirmation.params.per_page"
                      :clearable="true"
                      @onScrollEv="confirmationAction.onScroll"
                      @onSearch="confirmationAction.onSearch"
                    />
                  </n-form-item>
                </div>
              </div>
            </div>
            <div class="col-span-12">
              <div class="flex justify-between items-center mb-2">
              </div>
              <div class="mb-4 pl-2 pt-2  bg-surface-ground/20 border border-surface-line rounded-xl">
                <div class="flex justify-end pr-4">
                  <n-checkbox
                    class="ml-auto"
                    :checked="isAllDepartmentsSelected"
                    :disabled="!store.payload.organization_id || store.positions.length === 0"
                    @update:checked="toggleSelectAllDepartments"
                  >
                    {{ $t('content.selectAll') }}
                  </n-checkbox>
                </div>
                <n-checkbox-group v-model:value="store.payload.department_positions">
                  <div
                    class="w-full h-[400px] overflow-y-auto [scrollbar-gutter:stable] mt-2"
                    :class="{ 'opacity-50 pointer-events-none': !store.payload.organization_id }"
                  >
                    <template v-for="item in store.positions" :key="item.id">
                      <DepartmentItem
                        :item="item"
                        :expanded="expandedSet.has(item.id)"
                        :selected-ids="store.payload.department_positions"
                        @toggle="toggleExpand(item.id)"
                        @selectAll="onSelectAll"
                        @unselectAll="onUnselectAll"
                      />
                    </template>
                  </div>
                </n-checkbox-group>
              </div>
            </div>

            <div
              class="col-span-12 grid grid-cols-12 gap-x-4 border border-surface-line p-2 rounded-xl"
            >
              <div class="col-span-6">
                <n-form-item :label="$t(`staffingApproval.form.confirmOrganization`)">
                  <SuperSelect
                    v-model:value="store.leader.params.parent_id"
                    :options="store.parent.list"
                    :loading="store.parent.loading"
                    :clearable="true"
                    @update:value="onChangeParent"
                  />
                </n-form-item>
              </div>
              <div class="col-span-6">
                <n-form-item
                  :label="$t(`staffingApproval.form.director_id`)"
                  path="director_id"
                  :rule-path="validationRules.rulesNames.requiredNumberField"
                >
                  <SuperSelect
                    v-model:value="store.payload.director_id"
                    v-model:search="store.leader.params.search"
                    :options="store.leader.list"
                    :loading="store.leader.loading"
                    :total-count="store.leader.totalItems"
                    :per-page="store.leader.params.per_page"
                    :clearable="true"
                    @onScrollEv="leaderAction.onScroll"
                    @onSearch="leaderAction.onSearch"
                  />
                </n-form-item>
              </div>
            </div>
          </div>
        </div>
      </n-spin>
      <div class="grid grid-cols-12 gap-4">
        <n-button class="col-span-6" @click="store.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button class="col-span-6" @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
