<script setup>
  import {
    NoDataPicture,
    UIMenuButton,
    UIPagination,
    UIUser,
    UIMore
  } from '@/components/index.js'
  import { useNationalityStore, useLearningCenterStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import utils from '@/utils/Utils.js'
  import Utils from '@/utils/Utils.js'
  const accStore = useAccountStore()

  const store = useLearningCenterStore()

  const onEdit = (v) => {
    store.payload.name = v.name
    store.payload.name_ru = v.name_ru
    store.payload.name_en = v.name_en

    // store.visibleType = false
    // store.elementId = v.id
    // store.payload.name = v.name
    // store.visible = true
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onSelectEv = (v) => {
    store.elementId = v.data.id
    if (v.key === utils.ActionTypes.delete) {
      if (!accStore.checkAction(accStore.pn.learningCentersWrite)) return
      store._delete()
    } else if (v.key === utils.ActionTypes.edit) {
      if (!accStore.checkAction(accStore.pn.learningCentersWrite)) return

      store.payload.name = v.data.name
      store.payload.name_ru = v.data.name_ru
      store.payload.name_en = v.data.name_en
      store.payload.code = v.data.code
      store.payload.users = v.data.users.map((x) => x.id)
      store.userList = v.data?.users.map((z) => ({
        id: z.id,
        name: Utils.combineFullName(z.worker),
        position: z.worker.id
      }))
      store.visibleType = false
      store.visible = true
    }
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-5" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">{{ $t('content.nameUz') }}</th>
            <th class="min-w-[200px]">{{ $t('content.nameRu') }}</th>
            <th class="min-w-[200px]">{{ $t('content.nameEn') }}</th>
            <th class="w-[120px]">{{ $t('content.code') }}</th>
            <th class="w-[200px]">{{ $t('content.users') }}</th>
            <th class="w-[40px] text-center!"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{
                (store.params.page - 1) * store.params.per_page + idx + 1
              }}</span>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.name_ru }}</td>
            <td>{{ item.name_en }}</td>
            <td>{{ item?.code }}</td>
            <td>
              <div class="flex justify-center">
                <UIMore width="250" :data="item.users">
                  <template #content="{ data }">
                    <UIUser
                      :hide-tooltip="true"
                      :data="{
                        photo: data.worker.photo,
                        lastName: data.worker.last_name,
                        firstName: data.worker.first_name,
                        middleName: data.worker.middle_name,
                        position: data.phone
                      }"
                    />
                  </template>
                </UIMore>
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
