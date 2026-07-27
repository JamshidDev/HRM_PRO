<script setup>
  import { useAccountStore, useWorkerProfileStore, useComponentStore } from '@/store/modules/index.js'

  import Filter from '@pages/extra/UserRole/ui/Filter.vue'
  import Utils from '@/utils/Utils.js'
  import { UIBadge, UITable, UIUser } from '@/components/index.js'
  import { RibbonStar24Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useWorkerProfileStore()
  const accStore = useAccountStore()
  const compStore = useComponentStore()

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 200,
      width: 360
    },
    {
      key: 'roles',
      title: t('workerRole.from.role'),
      minWidth: 100
    },
    {
      key: 'current_organization.name',
      title: t('workerRole.from.activeOrganization'),
      minWidth: 200,
      width: 300
    }
  ])

  const onEdit = (v) => {
    store.elementId = v.id
    store.visibleType = false
    store.visible = true
    store._show((v) => {
      store.payload.from = Utils.datePickerFormatter(v.from)
      store.payload.to = Utils.datePickerFormatter(v.to)
      store.payload.comment = v.comment
      store.payload.status = v.status.id
      if (v?.file) {
        store.payload.file = [
          {
            id: 1,
            name: Utils.fileNameFromUrl(v?.file),
            file: null
          }
        ]
      }

      if (compStore.medStatus.length === 0) {
        compStore._enums()
      }

      if (v.worker_position) {
        store.payload.organization_id = [v.organization]
        store.payload.worker_position_id = v.worker_position.id
        store.activeTab = 1
        store.payload.pin = null
        compStore.selectedWorker = null
        compStore.workerParams.organization_id = v.organization?.id
        compStore._workers()
      } else {
        compStore.selectedWorker = {
          lastName: v.worker.last_name,
          firstName: v.worker.first_name,
          middleName: v.worker.middle_name,
          position: v?.position,
          photo: v.worker.photo || Utils.noAvailableImage,
          pin: v.worker.uuid
        }
        store.payload.pin = v.worker.id.toString()
        store.activeTab = 2
        store.payload.worker_position_id = null
        store.payload.organization_id = []
      }
    })
    compStore.selectedWorker = {
      lastName: v.worker.last_name,
      firstName: v.worker.first_name,
      middleName: v.worker.middle_name,
      position: v.position,
      photo: v.worker.photo || Utils.noAvailableImage,
      pin: v.worker.uuid
    }
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const changePage = (v) => {
    store.userRoleParams.page = v.page
    store.userRoleParams.per_page = v.per_page
    store._userRole()
  }

  const onSelectEv = (v) => {
    if (Utils.ActionTypes.edit === v.key) {
      onEdit(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      onDelete(v.data)
    }
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrUsersRead)) return
    store._userRole()
  })
</script>

<template>
  <div class="w-full">
    <Filter />
    <div class="h-[calc(100vh-200px)] overflow-y-auto mt-4">
      <UITable
        :columns="columns"
        :data="store.userRoleList"
        :loading="store.userRoleLoading"
        :page="store.userRoleParams.page"
        :per-page="store.userRoleParams.per_page"
        :total="store.userRoleTotal"
        @change-page="changePage"
      >
        <template #cell-worker="{ row }">
          <UIUser
            :hide-tooltip="true"
            :short="false"
            :data="{
              photo: row?.worker.photo,
              firstName: row?.worker.first_name,
              middleName: row?.worker.middle_name,
              lastName: row?.worker.last_name,
              position: row?.position
            }"
          />
        </template>

        <template #cell-roles="{ row }">
          <div class="flex flex-wrap gap-2">
            <template v-for="(role, idx) in row.roles" :key="idx">
              <div>
                <UIBadge :label="role.name" :type="Utils.colorTypes.dark">
                  <template #icon>
                    <n-icon size="20">
                      <RibbonStar24Filled />
                    </n-icon>
                  </template>
                </UIBadge>
              </div>
            </template>
          </div>
        </template>
      </UITable>
    </div>
  </div>
</template>
