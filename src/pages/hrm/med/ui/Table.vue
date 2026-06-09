<script setup>
  import {
    NoDataPicture,
    UIPagination,
    UIUser,
    UIMenuButton,
    UIStatus,
    UIBadge
  } from '@/components/index.js'
  import { useComponentStore, useMedStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()

  const store = useMedStore()

  const onEdit = (v) => {
    store.resetForm()
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

      store.activeTab = 1
      store.payload.organization_id = [v.organization]
    })
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = (v) => {
    if (Utils.ActionTypes.edit === v.key) {
      if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
      onEdit(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      if (!accStore.checkAction(accStore.pn.hrMedWrite)) return
      onDelete(v.data)
    }
  }

  const openFileNewTab = (url) => {
    window.open(url, '_blank')
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px] w-[250px]">{{ $t('confirmationPage.table.worker') }}</th>
            <th class="min-w-[100px] w-[100px]">{{ $t('medPage.form.status') }}</th>
            <th class="min-w-[100px] w-[200px]">{{ $t('date.day') }}</th>
            <th class="min-w-[100px]">{{ $t('medPage.form.organization') }}</th>
            <th class="min-w-[90px] w-[90px]">{{ $t('medPage.form.from') }}</th>
            <th class="min-w-[90px] w-[90px]">{{ $t('medPage.form.to') }}</th>
            <th class="min-w-[90px] w-[90px]">{{ $t('content.file') }}</th>
            <th class="min-w-[200px] w-[200px]">{{ $t('medPage.form.comment') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="block text-center text-gray-600 text-[12px]">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <div>
                <UIUser
                  :data="{
                    photo: item?.worker.photo,
                    firstName: item?.worker.first_name,
                    middleName: item?.worker.middle_name,
                    lastName: item?.worker.last_name,
                    position: item?.position
                  }"
                />
              </div>
            </td>
            <td>
              <div>
                <UIStatus
                  :status="{
                    name: item.status.name,
                    id: item.status.id === 1 ? 6 : 5
                  }"
                />
              </div>
            </td>
            <td>
              <div class="flex flex-col gap-1">
                <UIBadge
                  class="!text-xs"
                  v-if="item.vacation"
                  :show-icon="false"
                  :label="Utils.timeOnlyDate(item.vacation) + ' ' + $t('medPage.form.onVacation')"
                  :type="Utils.colorTypes.info"
                />
                <UIBadge
                  :class="[item.vacation && '!text-xs']"
                  :show-icon="false"
                  :label="Math.abs(item.days) + ' ' + $t('date.day')"
                  :type="item.days < 0 ? Utils.colorTypes.error : Utils.colorTypes.success"
                />
              </div>
            </td>
            <td>{{ item.organization?.name }}</td>
            <td>
              <UIBadge
                :show-icon="false"
                :type="Utils.colorTypes.dark"
                :label="Utils.timeOnlyDate(item.from)"
              />
            </td>
            <td>
              <UIBadge
                :show-icon="false"
                :type="Utils.colorTypes.dark"
                :label="Utils.timeOnlyDate(item.to)"
              />
            </td>
            <td>
              <n-button size="small" v-if="item.file" @click="openFileNewTab(item.file)">
                {{ $t('content.download') }}
              </n-button>
            </td>
            <td>
              <div class="text-xs line-clamp-3 leading-[1.2]">
                {{ item.comment }}
              </div>
            </td>
            <td>
              <UIMenuButton :data="item" :show-edit="true" @selectEv="onSelectEv" />
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

<style scoped></style>
