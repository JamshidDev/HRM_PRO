<script setup>
  import {
    NoDataPicture,
    UIPagination,
    UIMenuButton,
    UIUser,
    UIBadge,
    UIImageViewer
  } from '@/components/index.js'
  import { useWorkerImageStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  const { t } = i18n.global
  const store = useWorkerImageStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelect = (v) => {
    store.elementId = v.data.id
    if (v.key === Utils.ActionTypes.confirm) {
      store.payload.worker_id = v.data.worker?.id
      store.payload.photo = v.data.photo
      store.payload.end_time = null
      store.payload.access_level_ids = []
      store.payload.comment = null
      store.personId = Boolean(v?.data?.person_id)
      store.showCommentArea = false

      store._access_levels()
      store.visible = true
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 1:
        return 'Jarayonda'
      case 2:
        return 'Bajarildi'
      case 3:
        return 'Rad etildi'
      default:
        return 'Xatolik'
    }
  }

  const getStatusType = (status) => {
    switch (status) {
      case 1:
        return Utils.colorTypes.warning
      case 2:
        return Utils.colorTypes.success
      case 3:
        return Utils.colorTypes.warning
      default:
        return Utils.colorTypes.error
    }
  }

  const getDeviceStatusLabel = (personId) => {
    return personId ? "Qo'shilgan" : "Qo'shilmagan"
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('workerPage.name') }}</th>
            <th class="min-w-[100px]">{{ $t('workerImage.status') }}</th>
            <th class="min-w-[120px] w-[200px]">{{ $t('content.deviceStatus') }}</th>
            <th class="min-w-[150px]">{{ $t('content.error') }}/{{ $t('content.comment') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <UIUser
                v-if="item.worker"
                :short="false"
                :hide-tooltip="true"
                :data="{
                  photo: item?.photo,
                  firstName: item?.worker.first_name,
                  middleName: item?.worker.middle_name,
                  lastName: item?.worker.last_name,
                  position: item?.worker.id
                }"
              />
            </td>

            <td>
              <UIBadge
                :show-icon="false"
                :label="getStatusLabel(item.status)"
                :type="getStatusType(item.status)"
              />
            </td>
            <td>
              <UIBadge
                :show-icon="false"
                :label="getDeviceStatusLabel(item.person_id)"
                :type="item.person_id === null ? Utils.colorTypes.error : Utils.colorTypes.success"
              />
            </td>
            <td>
              <span
                :class="[item.status === 3 ? 'text-primary' : 'text-danger']"
                class="text-xs leading-[1.2] line-clamp-2"
                >{{ item.error }}</span
              >
            </td>
            <td>
              <UIMenuButton
                :show-delete="false"
                :show-confirm="true"
                :data="item"
                @selectEv="onSelect"
              />
            </td>
          </tr>
        </tbody>
      </n-table>
      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
