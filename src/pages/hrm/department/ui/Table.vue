x
<script setup>
  import { NoDataPicture, UIPagination, UIMenuButton } from '@components'
  import { useDepartmentStore, useAccountStore } from '@stores'
  import { ChevronRight12Regular, Eye16Regular } from '@vicons/fluent'
  import { Utils } from '@utils'
  import i18n from '@/i18n/index.js'

  const store = useDepartmentStore()
  const accStore = useAccountStore()
  const t = i18n.global.t

  const props = defineProps({
    data: {
      type: Array,
      default: []
    },
    deep: {
      type: Number,
      default: null
    },
    loading: {
      type: Number,
      default: null
    },
    parentId: {
      type: Number,
      default: null
    }
  })

  const emits = defineEmits(['onDeep', 'onEdit', 'onDelete', 'onChangePage', 'onAdd'])
  const hasWritePermission = computed(() => !accStore.checkAction(accStore.pn.hrDepartmentsWrite))

  const onDeep = (id) => {
    emits('onDeep', { deep: props.deep, id })
  }

  const onEdit = (v) => {
    store.activeDeep = props.deep
    store.activeParentId = props.parentId
    emits('onEdit', v)
  }

  const onDelete = (v) => {
    store.activeDeep = props.deep
    store.activeParentId = props.parentId
    emits('onDelete', v)
  }

  const onAdd = (v) => {
    store.activeDeep = props.deep
    store.activeParentId = props.parentId
    emits('onAdd', v)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onPreview = (v) => {
    store.previewVisible = true
    store.elementId = v.id
    store.previewParams.page = 1
    store.previewList = []
    store.previewTotal = 0
    store._preview()
  }

  const onSelectEv = (v) => {
    if (v.key === Utils.ActionTypes.edit) {
      if (hasWritePermission.value) return
      onEdit(v.data)
    } else if (v.key === Utils.ActionTypes.delete) {
      if (hasWritePermission.value) return
      onDelete(v.data)
    } else if (v.key === Utils.ActionTypes.attachment) {
      if (hasWritePermission.value) return
      onAdd(v.data)
    } else if (v.key === Utils.ActionTypes.view) {
      onPreview(v.data)
    }
  }

  const headerOption = [
    {
      name: t('content.nameUz'),
      id: 'uz'
    },
    {
      name: t('content.nameRu'),
      id: 'ru'
    },
    {
      name: t('content.nameEn'),
      id: 'en'
    }
  ]
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="data.length > 0">
      <n-table :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[30px] w-[30px]"></th>
            <th class="min-w-[200px]">
              <n-select
                v-model:value="store.headerLang"
                :options="headerOption"
                value-field="id"
                label-field="name"
              />
            </th>
            <th class="min-w-[100px] w-[300px]">{{ $t('content.organization') }}</th>
            <th class="min-w-[100px] w-[160px]">{{ $t('departmentPage.form.level') }}</th>
            <th class="min-w-[40px] w-[40px]">{{ $t('departmentPositionPage.table.fact') }}</th>
            <th class="min-w-[100px] w-[160px]">{{ $t('content.comment') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in data" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>
              <n-button
                v-if="item.children"
                :loading="loading === item.id"
                quaternary
                circle
                type="primary"
                @click="onDeep(item.id)"
              >
                <template #icon>
                  <n-icon size="20">
                    <ChevronRight12Regular />
                  </n-icon>
                </template>
              </n-button>
            </td>
            <td>{{ item?.[store.headerLang] }}</td>
            <td>{{ item.organization.name }}</td>
            <td>{{ item.level?.name }}</td>
            <td>
              <n-button class="mx-auto" v-if="item.worker_rate" size="small" circle>{{
                item.worker_rate
              }}</n-button>
            </td>
            <td>
              <div class="text-xs line-clamp-3">{{ item.comment }}</div>
            </td>
            <td>
              <UIMenuButton
                :data="item"
                :show-edit="true"
                :show-attachment="true"
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
      <UIPagination
        v-if="deep === 1"
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="data.length === 0 && !store.loading" />
  </n-spin>
</template>
