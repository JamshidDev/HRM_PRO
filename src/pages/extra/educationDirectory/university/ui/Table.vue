<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination } from '@/components/index.js'
  import { useUniversityAdminStore, useComponentStore } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  const accStore = useAccountStore()

  const store = useUniversityAdminStore()
  const compStore = useComponentStore()

  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const onSelectEv = (v) => {
    if (!accStore.checkAction(accStore.pn.universitiesWrite)) return

    if (v.key === 'edit') {
      store.visibleType = false
      store.elementId = v.data.id
      store.payload.name = v.data.name
      store.payload.type = v.data.type?.id
      store.payload.name_ru = v.data.name_ru
      store.payload.name_en = v.data.name_en
      store.payload.region_id = v.data.city.region.id
      store.payload.city_id = v.data.city.id
      store.payload.education = v.data.education.id
      store.visible = true

      if (compStore.regionList.length === 0) {
        compStore._regions()
      }
      if (store.districtList.length === 0) {
        store._getDistrict()
      }

      if (compStore.universityTypes.length === 0) {
        compStore._enumsAdmin()
      }
    } else if (v.key === 'delete') {
      store.elementId = v.data.id
      store._delete()
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
      <n-table class="mt-10" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[200px]">
              <n-select
                v-model:value="store.headerLang"
                :options="headerOption"
                value-field="id"
                label-field="name"
              />
            </th>
            <th class="w-[200px]">{{ $t('othersPage.university.form.region_id') }}</th>
            <th class="min-[200px]">{{ $t('othersPage.university.form.education') }}</th>
            <th class="min-[200px]">{{ $t('othersPage.university.form.type') }}</th>
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
            <td>{{ item?.[store.headerLang] }}</td>
            <td>{{ item?.city.region?.name }}</td>
            <td>{{ item?.education.name }}</td>
            <td>{{ item?.type.name }}</td>
            <td>
              <UIMenuButton
                :data="item"
                :show-edit="true"
                :show-delete="true"
                :loading="item.id === store.elementId && store.deleteLoading"
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

<style scoped></style>
