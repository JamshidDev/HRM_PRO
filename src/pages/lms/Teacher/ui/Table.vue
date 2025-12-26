<script setup>
  import { NoDataPicture, UIPagination, UIUser, UIBadge } from '@/components/index.js'
  import { useAccountStore, useComponentStore, useTeacherStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import MenuButton from '@/components/buttons/MenuButton.vue'

  const store = useTeacherStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    store.payload.subjects = v.subjects.map((i) => i.id)
    store.payload.learning_center_id = v?.learning_center?.id
    store.subjects = v.subjects
    store.payload.worker_id = v.worker?.id
    componentStore.workerPinList = [
      {
        id: v.worker.id,
        name: Utils.combineFullName(v.worker),
        position: '#worker'
      }
    ]
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onSelectEv = (v) => {
    if (!accStore.checkAction(accStore.pn.lmsTeachersWrite)) return
    if (v.key === Utils.ActionTypes.edit) {
      onEdit(v.data)
    } else if (v.key === Utils.ActionTypes.delete) {
      onDelete(v.data)
    }
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-5" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[260px] w-[400px]">{{ $t('content.worker') }}</th>
            <th class="min-w-[200px] w-[300px]">{{ $t('teacherPage.form.learningCenter') }}</th>
            <th class="min-w-[200px]">{{ $t('teacherPage.form.subjects') }}</th>
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
            <td>
              <UIUser
                :short="false"
                :data="{
                  photo: item?.worker.photo,
                  lastName: item?.worker.last_name,
                  firstName: item?.worker.first_name,
                  middleName: item?.worker.middle_name,
                  position: item?.position
                }"
              />
            </td>
            <td>
              {{ item?.learning_center?.name }}
            </td>
            <td>
              <template v-if="item.subjects.length > 0">
                <div class="flex flex-wrap gap-2">
                  <n-button
                    v-for="subject in item.subjects"
                    dashed
                    ghost
                    size="tiny"
                    type="primary"
                  >
                    {{ subject.name }}
                  </n-button>
                </div>
              </template>
            </td>
            <td>
              <MenuButton :data="item" @selectEv="onSelectEv" />
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
