<script setup>
  /**
   * Backend endpointi hali yo'q kartalarning "Batafsil" jadvali.
   *
   * Ustunlar va qatorlar `mock.js` dagi `detailMock[mockKey]` dan olinadi
   * (`constants.js` da karta uchun `mockKey` beriladi). Sahifalash va qidiruv
   * `store._mockDetail()` da mijoz tomonida bajariladi.
   *
   * Endpoint paydo bo'lgach karta ro'yxatida `detail: MockDetail` o'rniga
   * o'ziga xos `XDetail.vue`, `mockKey` o'rniga esa `filterCallback` beriladi —
   * bu fayl butunlay o'chirilishi mumkin.
   */
  import { UIUser, UITable } from '@/components/index.js'
  import { useDashboardStore } from '@/store/modules/index.js'
  import { detailMock } from '../../mock.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useDashboardStore()

  const source = computed(() => detailMock[store.activeDetail?.mockKey] || { columns: [] })

  const filterEvent = () => {
    store._index_detail()
  }

  onMounted(() => {
    filterEvent()
  })

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    filterEvent()
  }

  const columns = computed(() =>
    // `enumPrefix` faqat qiymatni tarjima qilish uchun — ustun sozlamasiga kirmaydi
    source.value.columns.map(({ enumPrefix: _enumPrefix, title, ...rest }) => ({
      ...rest,
      title: t(title)
    }))
  )

  /** Enum qiymatli ustunlar (holat, sabab, tur) tarjima qilinadi. */
  const enumColumns = computed(() =>
    source.value.columns.filter((column) => column.enumPrefix)
  )

  const rows = computed(() =>
    (store.detailData || []).map((row) => {
      const next = { ...row }
      enumColumns.value.forEach((column) => {
        const value = row[column.key]
        if (value) next[column.key] = t(`${column.enumPrefix}${value}`)
      })
      return next
    })
  )
</script>

<template>
  <UITable
    :columns="columns"
    :data="rows"
    :loading="store.detailLoading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.detailDataTotal"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          lastName: row?.worker?.last_name,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name
        }"
      >
        <template #position>
          <span class="text-xs text-textColor3 w-full">{{ row?.position?.name }}</span>
        </template>
      </UIUser>
    </template>
  </UITable>
</template>
