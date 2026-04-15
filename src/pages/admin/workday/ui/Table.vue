<script setup>
  import { NoDataPicture, UIMenuButton, UIPagination } from '@/components/index.js'
  import { useWorkdayStore } from '@/store/modules/index.js'

  const store = useWorkdayStore()

  const format = (v) => {
    if (v) {
      const date = new Date()
      date.setHours(v.split(':')[0])
      date.setMinutes(v.split(':')[1])
      date.setSeconds(v.split(':')[2])
      return date.getTime()
    } else return null
  }

  const onSelectEv = (v) => {
    if (v.key === 'edit') {
      store.visibleType = false
      store.elementId = v.data.id
      store.payload.schedule_id = v.data.schedule.id
      store.payload.type = v.data.type.id
      store.payload.day_of_week = v.data.day_of_week.toString()
      store.payload.start_time = format(v.data.start_time)
      store.payload.end_time = format(v.data.end_time)
      store.visible = true
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
            <th class="min-w-[200px]">{{ $t('workdayPage.form.schedule_id') }}</th>
            <th class="min-w-[200px]">{{ $t('workdayPage.form.type') }}</th>
            <th class="min-w-[200px]">{{ $t('workdayPage.form.day_of_week') }}</th>
            <th class="min-w-[200px]">{{ $t('workdayPage.form.start_time') }}</th>
            <th class="min-w-[200px]">{{ $t('workdayPage.form.end_time') }}</th>
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
            <td>{{ item.schedule?.name }}</td>
            <td>{{ item.type?.name }}</td>
            <td>{{ item?.day_of_week }}</td>
            <td>{{ item.start_time }}</td>
            <td>{{ item.end_time }}</td>
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
