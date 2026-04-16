<script setup>
  import { NoDataPicture, UIPagination, UIBadge, UIMenuButton } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { Add16Filled } from '@vicons/fluent'

  const store = useDepartmentLocationStore()

  const onAdd = () => {
    if (store.selectedDepartment) {
      store.openLocationModal(store.selectedDepartment)
    }
  }

  const onEdit = (item) => {
    store.openEditModal(item)
  }

  const onDelete = (item) => {
    store.elementId = item.id
    store._delete()
  }

  const changePage = (v) => {
    store.locationParams.page = v.page
    store.locationParams.per_page = v.per_page
    store._locationIndex()
  }

  const onSelectEv = (v) => {
    if (Utils.ActionTypes.edit === v.key) {
      onEdit(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      onDelete(v.data)
    }
  }
</script>

<template>
  <n-spin :show="store.locationLoading" style="min-height: 200px">
    <!-- Qo'shish tugmasi (tanlangan bo'lim uchun) -->
    <div v-if="store.selectedDepartment && store.locationList.length === 0 && !store.locationLoading" class="flex justify-center py-4">
      <n-button type="primary" @click="onAdd">
        <template #icon>
          <n-icon>
            <Add16Filled />
          </n-icon>
        </template>
        {{ $t('departmentLocationPage.addLocation') }}
      </n-button>
    </div>
    <div class="w-full overflow-x-auto" v-if="store.locationList.length > 0">
      <n-table class="mt-1" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('departmentLocationPage.table.department') }}</th>
            <th class="min-w-[150px]">{{ $t('departmentLocationPage.table.organization') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('departmentLocationPage.table.geoType') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('departmentLocationPage.table.lat') }}</th>
            <th class="min-w-[100px] w-[120px]">{{ $t('departmentLocationPage.table.lng') }}</th>
            <th class="min-w-[80px] w-[100px]">{{ $t('departmentLocationPage.table.radius') }}</th>
            <th class="min-w-[80px] w-[100px]">{{ $t('departmentLocationPage.table.accuracy') }}</th>
            <th class="min-w-[80px] w-[100px]">{{ $t('content.date') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.locationList" :key="idx">
            <td>
              <span class="text-center block">{{
                (store.locationParams.page - 1) * store.locationParams.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <span class="font-medium">{{ item.department?.name }}</span>
            </td>
            <td>
              <span>{{ item.department?.organization_name }}</span>
            </td>
            <td>
              <UIBadge
                :show-icon="false"
                :label="item.geo_type ? $t('departmentLocationPage.form.area') : $t('departmentLocationPage.form.coordinate')"
                :type="item.geo_type ? Utils.colorTypes.dark : Utils.colorTypes.primary"
              />
            </td>
            <td>
              <span>{{ item.lat }}</span>
            </td>
            <td>
              <span>{{ item.lng }}</span>
            </td>
            <td>
              <UIBadge
                :show-icon="false"
                :label="item.radius + ' m'"
                :type="Utils.colorTypes.info"
              />
            </td>
            <td>
              <span>{{ item.accuracy_limit }}</span>
            </td>
            <td>
              <span>{{ Utils.timeOnlyDate(item?.create_at) }}</span>
            </td>
            <td>
              <UIMenuButton
                :data="item"
                :show-edit="true"
                :show-delete="true"
                @selectEv="onSelectEv"
              />
            </td>
          </tr>
        </tbody>
      </n-table>
      <UIPagination
        :page="store.locationParams.page"
        :per_page="store.locationParams.per_page"
        :total="store.locationTotalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.locationList.length === 0 && !store.locationLoading && !store.selectedDepartment" />
  </n-spin>
</template>
