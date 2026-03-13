<script setup>
  import { NoDataPicture, UIPagination, UIMenuButton } from '@components'
  import { useAccountStore, useComponentStore, useDepartmentPositionStore } from '@stores'
  import { Utils } from '@utils'
  import { Eye16Regular } from '@vicons/fluent'

  const store = useDepartmentPositionStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (v) => {
    componentStore.depParams.organizations = [v.organization?.id]
    if (componentStore.educationList.length === 0) {
      componentStore._enums()
    }
    componentStore._structures()
    componentStore.getDepartmentState(store.depParams.key)
    componentStore.departments[store.depParams.key].list = [v.department]
    componentStore._positions()
    store.visibleType = false
    store.elementId = v.id
    Object.assign(store.payload, {
      organization_id: [v.organization],
      position_id: v.position?.id,
      department_id: v.department?.id,
      group: v.group?.id,
      rank: v.rank?.id,
      max_rank: v.max_rank?.id,
      education: v.education?.id,
      rate: v.rate,
      salary: v.salary.toString(),
      experience: v.experience.toString()
    })

    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onPreview = (v) => {
    store.preview.visible = true
    store.elementId = v.id
    store.preview.params.page = 1
    store.preview.list = []
    store._preview()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = (v) => {
    if (!accStore.checkAction(accStore.pn.hrPositionsWrite)) return
    if (Utils.ActionTypes.edit === v.key) {
      onEdit(v.data)
    } else if (Utils.ActionTypes.delete === v.key) {
      onDelete(v.data)
    } else if (Utils.ActionTypes.view === v.key) {
      onPreview(v.data)
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
            <th class="min-w-[200px]">{{ $t('departmentPositionPage.table.position') }}</th>
            <th class="min-w-[200px] w-[300px]">
              {{ $t('departmentPositionPage.table.department') }}
            </th>
            <th class="min-w-[300px] w-[300px]">
              {{ $t('departmentPositionPage.table.organization') }}
            </th>

            <th class="min-w-[120px] w-[120px]">
              {{ $t('departmentPositionPage.table.education') }}
            </th>
            <th class="min-w-[40px] w-[40px]">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <p
                    class="cursor-pointer text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate"
                  >
                    {{ $t('departmentPositionPage.table.group') }}
                  </p>
                </template>
                {{ $t('departmentPositionPage.form.group') }}
              </n-tooltip>
            </th>
            <th class="min-w-[40px] w-[40px]">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <p
                    class="cursor-pointer text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate"
                  >
                    {{ $t('departmentPositionPage.table.rank') }}
                  </p>
                </template>
                {{ $t('departmentPositionPage.form.rank') }}
              </n-tooltip>
            </th>
            <th class="min-w-[40px] w-[40px]">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <p
                    class="cursor-pointer text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate"
                  >
                    {{ $t('departmentPositionPage.table.rate') }}
                  </p>
                </template>
                {{ $t('departmentPositionPage.form.rate') }}
              </n-tooltip>
            </th>
            <th class="min-w-[40px] w-[40px]">
              <n-tooltip trigger="hover">
                <template #trigger>
                  <p
                    class="cursor-pointer text-sm text-textColor2 line-clamp-1 w-full leading-[1.2] truncate"
                  >
                    {{ $t('departmentPositionPage.table.fact') }}
                  </p>
                </template>
                {{ $t('departmentPositionPage.form.fact') }}
              </n-tooltip>
            </th>
            <th class="min-w-[60px] w-[60px]">
              {{ $t('departmentPositionPage.table.experience') }}
            </th>
            <th class="min-w-[60px] w-[100px]">{{ $t('departmentPositionPage.table.salary') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>{{ item.position?.name }}</td>
            <td>{{ item.department?.name }}</td>
            <td>{{ item.organization?.name }}</td>

            <td>{{ item.education?.name }}</td>
            <td>
              <div class="w-full flex justify-center">
                <n-button size="small" circle secondary>{{ item.group?.name }}</n-button>
              </div>
            </td>
            <td>
              <div class="w-full flex justify-center">
                <n-button size="small" circle secondary>{{ item.rank?.name }}</n-button>
              </div>
            </td>
            <td>
              <div class="w-full flex justify-center">
                <n-button :type="item.colorType" secondary size="small" circle>{{
                  item.rate
                }}</n-button>
              </div>
            </td>
            <td>
              <div class="w-full flex justify-center">
                <n-button
                  :type="item.colorType"
                  secondary
                  v-if="item.worker_rate"
                  size="small"
                  circle
                  >{{ item.worker_rate }}</n-button
                >
              </div>
            </td>
            <td>
              <div class="w-full flex justify-center">
                <n-button v-if="item.experience" circle size="small"
                  >{{ item.experience }}
                </n-button>
              </div>
            </td>
            <td>
              {{ Utils.formatNumberToMoney(item.salary) }}
            </td>
            <td>
              <UIMenuButton
                :data="item"
                :show-edit="true"
                @selectEv="onSelectEv"
                :extra-options="[
                  {
                    label: $t('content.worker'),
                    key: Utils.ActionTypes.view,
                    icon: Eye16Regular
                  }
                ]"
              />
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <UIPagination
      v-if="store.totalItems > 0"
      :page="store.params.page"
      :per_page="store.params.per_page"
      :total="store.totalItems"
      @change-page="changePage"
    />
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
