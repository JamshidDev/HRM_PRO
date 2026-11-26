<script setup>
  import { UITable, UIUser, UIBadge, UIChip } from '@/components/index.js'
  import { useUserStore, useAccountStore } from '@/store/modules/index.js'
  import {
    RibbonStar24Filled,
    LockClosed12Filled,
    LockOpen16Filled,
    Add20Regular,
    OpenFolder24Filled,
    Delete20Regular,
    Edit20Regular,
    Phone20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUserStore()
  const accStore = useAccountStore()

  const onAttachment = (row) => {
    if (!accStore.checkAction(accStore.pn.usersWrite)) return
    store.elementId = row.uuid
    store._myRoles()
    store.visibleType = true
    store.visible = true
  }

  // JSHSHIR tahriri — modal ochiladi, maydon joriy qiymat bilan to'ladi.
  const onEditPin = (row) => {
    if (!accStore.checkAction(accStore.pn.usersWrite)) return
    store.openPinEdit(row)
  }

  const onEditPhone = (row) => {
    if (!accStore.checkAction(accStore.pn.usersWrite)) return
    store.openPhoneEdit(row)
  }

  const onDelete = (row) => {
    // Faqat Nomzod/Arxiv (organization null) qatorlarida ko'rinadi. Soft-delete.
    if (!accStore.checkAction(accStore.pn.usersWrite)) return
    store.elementId = row.uuid
    store.elementId = row.id
    store._delete()
  }

  const onSpam = (row) => {
    store.elementId = row.uuid
    store.isSpam = !row.status
    store.confirmVisible = true
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const clickPermissionsEv = (row) => {
    if (!accStore.checkAction(accStore.pn.usersWrite)) return
    store.elementId = row.uuid
    store._userPermissions()
    store.isPermissionsVisible = true
  }

  // Shaxsan ozod qilish; rol orqali ozod bo'lsa switch qulflangan (yoqilgan holda).
  const onEimzoSkip = (row, value) => {
    if (!accStore.checkAction(accStore.pn.usersWrite)) return
    store._eimzoSkip(row, value)
  }

  const daysSince = (row) =>
    row?.password_changed_at
      ? Math.floor((Date.now() - new Date(row.password_changed_at)) / 86400000)
      : null

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('content.worker'),
      minWidth: 200
    },
    {
      key: 'workplace',
      title: t('content.workplace'),
      minWidth: 200,
      width: 300
    },
    {
      key: 'role',
      title: t('userPage.form.role'),
      width: 140
    },
    {
      key: 'permissions',
      title: t('userPage.permissions'),
      width: 120,
      align: 'center'
    },
    {
      key: 'eimzo',
      title: t('userPage.eimzoSkip'),
      width: 90,
      align: 'center'
    },
    {
      key: 'phone',
      title: t('content.phone'),
      width: 150
    },
    {
      key: 'passwordChangedAt',
      title: t('userPage.passwordChangedAt'),
      width: 130
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      action: onAttachment
    },
    {
      label: t('userPage.editPhone'),
      key: 'edit-phone',
      icon: UIHelper.renderIcon(Phone20Regular),
      action: onEditPhone
    },
    {
      label: t('userPage.editPin'),
      key: 'edit-pin',
      icon: UIHelper.renderIcon(Edit20Regular),
      action: onEditPin
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete,
      visible: (row) => !row?.organization
    },
    {
      label: (row) => t(row.status ? 'content.spam' : 'content.noSpam'),
      key: Utils.ActionTypes.finish,
      icon: (row) => UIHelper.renderIcon(row.status ? LockClosed12Filled : LockOpen16Filled),
      action: onSpam
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="users"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems > 10 ? store.totalItems : null"
    :delete-warning="$t('content.deleteConfirm')"
    storage-key="admin-user"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker.photo,
          firstName: row?.worker.first_name,
          middleName: row?.worker.middle_name,
          lastName: row?.worker.last_name,
          position: row?.phone
        }"
      >
        <template #position>
          <div class="text-xs w-full text-secondary">
            <template v-if="row.status">
              {{ row?.phone }}
            </template>
            <template v-else>
              <span class="text-danger bg-danger/4 px-2 rounded-2xl font-medium">Bloklangan</span>
            </template>
          </div>
        </template>
      </UIUser>
    </template>


    <template #cell-workplace="{ row }">
      <template v-if="row?.organization">{{ row.organization.name }}</template>
      <UIChip v-else-if="row?.has_position" tone="warning">
        {{ $t('content.archive') }}
      </UIChip>
      <UIChip v-else tone="info">
        {{ $t('content.candidate') }}
      </UIChip>
    </template>

    <template #cell-role="{ row }">
      <div class="flex flex-wrap gap-1">
        <template v-for="role in row?.roles" :key="role.id">
          <UIBadge :label="role.name" :type="Utils.colorTypes.dark">
            <template #icon>
              <n-icon size="20">
                <RibbonStar24Filled />
              </n-icon>
            </template>
          </UIBadge>
        </template>
      </div>
    </template>

    <template #cell-permissions="{ row }">
      <div class="flex justify-center">
        <n-button @click="() => clickPermissionsEv(row)" size="small" dashed round type="primary">
          <span v-if="row?.permissions_count">{{ row?.permissions_count }}</span>
          <template #icon>
            <n-icon>
              <Add20Regular />
            </n-icon>
          </template>
        </n-button>
      </div>
    </template>

    <template #cell-eimzo="{ row }">
      <div class="flex justify-center">
        <n-tooltip placement="top">
          <template #trigger>
            <n-switch
              size="small"
              :value="Boolean(row?.eimzo_skip || row?.eimzo_skip_by_role)"
              :disabled="Boolean(row?.eimzo_skip_by_role)"
              :loading="Boolean(row?.eimzoLoading)"
              @update:value="(v) => onEimzoSkip(row, v)"
            />
          </template>
          {{
            row?.eimzo_skip_by_role
              ? $t('userPage.eimzoSkipByRole')
              : `${$t('userPage.eimzoSkipDirect')} · ${$t('userPage.eimzoSkipAdminOnly')}`
          }}
        </n-tooltip>
      </div>
    </template>

    <!-- Telefon + ostida JSHSHIR (bo'lmasa — bo'sh). -->
    <template #cell-phone="{ row }">
      <div class="leading-tight">
        <div class="text-textColor0">{{ row?.phone }}</div>
        <div class="text-[11px] tabular-nums text-textColor3">
          {{ row?.worker?.pin }}
        </div>
      </div>
    </template>

    <template #cell-passwordChangedAt="{ row }">
      <template v-if="daysSince(row) !== null && daysSince(row) > 0">
        <n-tooltip placement="top">
          <template #trigger>
            <span class="inline-flex">
              <UIChip :tone="daysSince(row) > 30 ? 'error' : 'default'">
                {{ daysSince(row) }} {{ $t('userPage.daysAgo') }}
              </UIChip>
            </span>
          </template>
          {{ row.password_changed_at?.slice(0, 10) }}
        </n-tooltip>
      </template>
    </template>
  </UITable>
</template>
