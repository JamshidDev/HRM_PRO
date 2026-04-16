<script setup>
  import { NoDataPicture, UIPagination, UIBadge, UIMenuButton } from '@/components/index.js'
  import { useDepartmentLocationStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useDepartmentLocationStore()

  const onEdit = (v) => {
    store._show(v.id)
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
      onEdit(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      onDelete(v.data)
    }
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
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
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
