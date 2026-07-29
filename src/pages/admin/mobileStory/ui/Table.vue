<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { NoDataPicture, UIMenuButton, UIPagination } from '@/components/index.js'
  import { useMobileStoryStore } from '@/store/modules/index.js'
  import { AppPaths } from '@/utils/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMobileStoryStore()
  const router = useRouter()

  const headerLang = ref('uz')
  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const openStory = (id) => {
    router.push(Utils.routePathMaker(`${AppPaths.MobileStories}/${id}`))
  }

  const onSelectEv = (v) => {
    if (v.key === 'edit') {
      openStory(v.data.id)
    } else if (v.key === 'delete') {
      store._delete(v.data.id)
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
            <th class="min-w-[220px]">
              <n-select v-model:value="headerLang" :options="headerOption" value-field="id" label-field="name" />
            </th>
            <th class="min-w-[120px]">{{ $t('mobileStoryPage.table.status') }}</th>
            <th class="min-w-[140px]">{{ $t('mobileStoryPage.form.publishedAt') }}</th>
            <th class="text-center min-w-[70px]">{{ $t('mobileStoryPage.table.views') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">
                {{ (store.params.page - 1) * store.params.per_page + idx + 1 }}
              </span>
            </td>
            <td>
              <span class="cursor-pointer text-primary hover:underline" @click="openStory(item.id)">
                {{ item?.title?.[headerLang] ?? item?.title?.uz }}
              </span>
            </td>
            <td>
              <n-tag :type="item.status === 2 ? 'success' : 'default'" size="small" round>
                {{ item.status === 2 ? $t('mobileStoryPage.status.published') : $t('mobileStoryPage.status.draft') }}
              </n-tag>
            </td>
            <td class="text-[12px]">{{ item.published_at ?? '—' }}</td>
            <td class="text-center">{{ item.views_count ?? 0 }}</td>
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
