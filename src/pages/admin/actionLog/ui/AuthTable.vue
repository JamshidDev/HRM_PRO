<script setup>
  import { CodeCircle20Regular, DismissCircle24Regular } from '@vicons/fluent'
  import { UITable, UIUser } from '@/components/index.js'
  import { useActionLogStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useActionLogStore()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._getAuthLog()
  }

  const openCode = (id) => {
    store.authActiveCol = id
  }

  const columns = computed(() => [
    {
      key: 'user',
      title: t('actionLog.table.owner'),
      width: 300
    },
    {
      key: 'detail',
      title: t('actionLog.table.detail'),
      minWidth: 200
    },
    {
      key: 'login_at',
      title: t('actionLog.table.loginAt'),
      width: 160,
      align: 'center'
    },
    {
      key: 'logout_at',
      title: t('actionLog.table.logoutAt'),
      width: 200,
      align: 'center'
    },
    {
      key: 'ip_address',
      title: t('actionLog.table.ip'),
      width: 120,
      align: 'center'
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.authList"
    :loading="store.authLoading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.authTotalItems"
    storage-key="admin-auth-log"
    @change-page="changePage"
  >
    <template #cell-user="{ row }">
      <UIUser
        :data="{
          photo: row?.user?.worker?.photo,
          lastName: row?.user?.worker?.last_name,
          firstName: row?.user?.worker?.first_name,
          middleName: row?.user?.worker?.middle_name,
          position: row?.user?.worker?.phone
        }"
      />
    </template>

    <template #cell-detail="{ row }">
      <div class="flex items-center justify-between">
        <span class="truncate w-full max-w-[400px] pb-1">
          {{ store.authActiveCol === row.id ? ' ' : row }}
        </span>
        <n-icon
          v-if="store.authActiveCol === row.id"
          @click="openCode(null)"
          size="24"
          class="text-danger font-bold cursor-pointer"
        >
          <DismissCircle24Regular />
        </n-icon>
        <n-icon
          v-else
          @click="openCode(row.id)"
          size="24"
          class="text-primary font-bold cursor-pointer"
        >
          <CodeCircle20Regular />
        </n-icon>
      </div>

      <n-collapse-transition
        class="text-xs bg-dark text-white rounded-xl shadow p-2 max-w-full overflow-x-auto"
        :show="store.authActiveCol === row.id"
      >
        <pre class="whitespace-pre-wrap break-all">{{ row }}</pre>
      </n-collapse-transition>
    </template>

    <template #cell-login_at="{ row }">
      <div class="w-full text-center">{{ Utils.timeWithMonth(row?.login_at) }}</div>
    </template>

    <template #cell-logout_at="{ row }">
      <div class="w-full text-center text-sm">
        {{ row?.logout_at ? Utils.timeWithMonth(row?.logout_at) : '' }}
      </div>
    </template>

    <template #cell-ip_address="{ row }">
      <div class="w-full text-center uppercase font-medium">{{ row?.ip_address }}</div>
    </template>
  </UITable>
</template>
