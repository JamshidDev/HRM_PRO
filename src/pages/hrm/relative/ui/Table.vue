<script setup>
  import { UIMenuButton, UIBadge } from '@/components/index.js'
  import { useRelativeStore } from '@/store/modules/index.js'
  import { AddCircle28Regular, Drag24Regular, Add16Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import { VueDraggable } from 'vue-draggable-plus'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useRelativeStore()

  const levelLabels = {
    1: t('relativePage.disability.level1'),
    2: t('relativePage.disability.level2'),
    3: t('relativePage.disability.level3')
  }

  const getLevelLabel = (level) => levelLabels[level] || level

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.activeTab = 1
    store.visibleType = false
    store.elementId = v.id
    store.payload.relative = v.relative.id
    store.payload.last_name = v.last_name
    store.payload.first_name = v.first_name
    store.payload.middle_name = v.middle_name
    store.payload.birthday = v.birthday ? new Date(v.birthday).getTime() : null
    store.payload.birth_place = v.birth_place
    store.payload.address = v.address
    store.payload.post_name = v.post_name
    store.payload.sort = v.sort

    store.visible = true
  }

  const onSelectEv = (v) => {
    if (v.key === Utils.ActionTypes.edit) {
      onEdit(v.data)
    } else if (v.key === Utils.ActionTypes.delete) {
      onDelete(v.data)
    }
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onUpdate = (v) => {
    const data = store.list.map((v, idx) => ({
      position: idx,
      worker_relative_id: v.id
    }))
    store._sortable({ orders: data })
  }

  const onAddDisability = (item) => {
    store.resetDisabilityForm()
    store.disabilityPayload.worker_relative_id = item.id
    store.disabilityVisibleType = true
    store.disabilityVisible = true
  }

  const onEditDisability = (item, disability) => {
    store.resetDisabilityForm()
    store.disabilityElementId = disability.id
    store.disabilityPayload.worker_relative_id = item.id
    store.disabilityPayload.number = disability.number
    store.disabilityPayload.level = disability.level
    store.disabilityPayload.from = disability.from ? new Date(disability.from).getTime() : null
    store.disabilityPayload.to = disability.to ? new Date(disability.to).getTime() : null
    store.disabilityPayload.comment = disability.comment
    store.disabilityPayload.is_lifelong = !disability.to
    store.disabilityVisibleType = false
    store.disabilityVisible = true
  }
</script>

<template>
  <n-spin :show="store.loading">
    <div
      class="w-full flex justify-between items-end border-surface-line border-dashed pb-2"
      :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length > 0">{{
        $t('relativePage.title')
      }}</span>
      <span v-else class="text-sm text-gray-300">{{ $t('relativePage.no-data') }}</span>

      <n-button round @click="onAdd">
        <template #icon>
          <AddCircle28Regular />
        </template>
        {{ $t(`content.add`) }}</n-button
      >
    </div>
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <VueDraggable
        v-model="store.list"
        :animation="150"
        handle=".handle"
        target=".sort-target"
        @end="onUpdate"
      >
        <n-table class="mt-4" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="text-center! min-w-[40px] w-[40px] handle"></th>
              <th class="w-[100px]">{{ $t('relativePage.form.relative') }}</th>
              <th class="min-w-[100px]">{{ $t('content.fullName') }}</th>
              <th class="min-w-[100px] w-[200px]">{{ $t('relativePage.form.post_name') }}</th>
              <th class="min-w-[120px] w-[120px]">{{ $t('relativePage.form.birthday') }}</th>
              <th class="min-w-[150px] w-[200px]">{{ $t('relativePage.form.birthdayPlace') }}</th>
              <th class="min-w-[150px] w-[300px]">{{ $t('createWorkerPage.form.address') }}</th>
              <th class="min-w-[120px] w-[150px]">{{ $t('relativePage.form.disability') }}</th>
              <th class="min-w-[40px] w-[40px]"></th>
            </tr>
          </thead>
          <tbody class="sort-target">
            <tr v-for="(item, idx) in store.list" :key="idx">
              <td>
                <span class="text-center text-[12px] text-gray-600 block">{{
                  (store.params.page - 1) * store.params.per_page + idx + 1
                }}</span>
              </td>
              <td>
                <n-button secondary type="primary" size="small" class="handle">
                  <template #icon>
                    <n-icon>
                      <Drag24Regular />
                    </n-icon>
                  </template>
                </n-button>
              </td>
              <td>
                <span class="text-sm">{{ item.relative.name }}</span>
              </td>
              <td>{{ [item.last_name, item.first_name, item.middle_name].filter(Boolean).join(' ') }}</td>
              <td>{{ item.post_name }}</td>
              <td>{{ Utils.timeOnlyDate(item.birthday) }}</td>
              <td>{{ item.birth_place }}</td>
              <td>{{ item.address }}</td>
              <td>
                <div class="flex flex-wrap gap-1 items-center justify-center">
                  <UIBadge
                    v-for="disability in item.disabilities"
                    :key="disability.id"
                    :label="getLevelLabel(disability.level)"
                    :type="Utils.colorTypes.error"
                    :show-icon="false"
                    class="cursor-pointer"
                    @click="onEditDisability(item, disability)"
                  />
                  <n-button
                    size="tiny"
                    type="default"
                    @click="onAddDisability(item)"
                  >
                    {{ $t('content.add') }}
                  </n-button>
                </div>
              </td>
              <td>
                <UIMenuButton :data="item" :show-edit="true" @selectEv="onSelectEv" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </VueDraggable>
    </div>
  </n-spin>
</template>

<style scoped></style>
