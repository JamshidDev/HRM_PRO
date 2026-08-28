<script setup>
  import { PasswordUpdateModal, UIBadge, UIModal, UITable, UIUser } from '@components'
  import { useAccountStore, useWorkerProfileStore } from '@stores'
  import Utils from '@utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import RoleForm from '@pages/hrm/workerProfile/ui/RoleForm.vue'
  import {
    Delete20Regular,
    LockClosed16Filled,
    PersonAdd24Regular,
    RibbonStar24Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useWorkerProfileStore()
  const accStore = useAccountStore()

  const deleteRoleVisible = ref(false)
  const createAccountError = ref(null)
  const selectedItem = ref(null)
  const selectedRoleId = ref(null)

  const onPasswordSubmit = (password) => {
    store.passwordPayload.password = password
    store._updateUserPassword()
  }

  // Phone modal

  // Har option o'z ruxsatiga bog'langan. Ruxsat bo'lmasa band YASHIRILMAYDI, balki
  // kulrang (disabled) bo'ladi — foydalanuvchi imkoniyat borligini ko'radi va admindan
  // so'rashi mumkin. Backend ham mos slug bilan enforce qiladi.
  const actions = computed(() =>
    [
      {
        // Faqat hisobi YO'Q qatorlarda — qolgan amallar user uuid talab qiladi.
        label: t('workerRole.createAccount'),
        key: 'create_account',
        icon: UIHelper.renderIcon(PersonAdd24Regular),
        action: onCreateAccount,
        perm: accStore.pn.hrUsersCreate,
        visible: (row) => !row.has_account
      },
      {
        label: t('workerRole.attachRole'),
        key: 'attach_role',
        icon: UIHelper.renderIcon(RibbonStar24Filled),
        action: onAttachRole,
        perm: accStore.pn.hrUsersAttachRole,
        visible: (row) => row.has_account
      },
      {
        label: t('workerRole.deleteRole'),
        key: 'delete_role',
        icon: UIHelper.renderIcon(Delete20Regular),
        action: onDeleteRoleClick,
        perm: accStore.pn.hrUsersDetachRole,
        visible: (row) => row.has_account
      },
      {
        label: t('workerRole.updatePassword'),
        key: 'update_password',
        icon: UIHelper.renderIcon(LockClosed16Filled),
        action: onUpdatePasswordClick,
        perm: accStore.pn.hrUsersPassword,
        visible: (row) => row.has_account
      }
    ].map((o) => ({ ...o, disabled: !accStore.checkPermission(o.perm) }))
  )

  const onCreateAccount = (row) => {
    store.createUserPayload.worker_uuid = row?.worker?.uuid
    // Xodim kartochkasidagi birinchi raqam taklif qilinadi (band bo'lsa backend 422 beradi).
    store.createUserPayload.phone = row?.phones?.length ? '+998' + String(row.phones[0]).slice(-9) : '+998'
    store.createUserPayload.password = null
    store.createUserWorker = row?.worker ?? null
    createAccountError.value = null
    store.createUserVisible = true
  }

  // `+998 90-123-45-67` -> `901234567`. Telefon TAHRIRI bu sahifadan olib
  // tashlangan (faqat «Xodimlar → shaxsiy ma'lumotlar»da), bu faqat yangi
  // hisob ochishdagi raqam uchun.
  const formatPhone = (v) => String(v || '').replace(/\D/g, '').slice(-9)

  const onCreateAccountSubmit = () => {
    const phone = formatPhone(store.createUserPayload.phone || '')
    if (phone.length !== 9) {
      createAccountError.value = t('workerRole.validation.invalidFormat')
      return
    }
    store.createUserPayload.phone = phone
    store._createUser()
  }

  const onAttachRole = (row) => {
    store.roleWorkerPositionId = row.uuid
    store.rolePayload.role = null
    store.rolePayload.organization_id = []
    store.roleVisible = true
  }

  const onDeleteRoleClick = (row) => {
    if (row.roles?.length >= 1) {
      selectedItem.value = row
      selectedRoleId.value = row.roles.length === 1 ? row.roles[0].id : null
      deleteRoleVisible.value = true
    }
  }

  const onUpdatePasswordClick = (row) => {
    store.passwordPayload.uuid = row.uuid
    store.passwordPayload.password = null
    store.passwordVisible = true
  }

  const onDeleteRole = () => {
    if (!selectedRoleId.value || !selectedItem.value) return
    const role = selectedItem.value.roles.find((r) => r.id === selectedRoleId.value)
    store
      ._detachUserRole({
        uuid: selectedItem.value.uuid,
        role_id: role.id,
        role: role.name,
        organization_id: role?.organizations?.[0]?.id
      })
      .then(() => {
        deleteRoleVisible.value = false
        selectedItem.value = null
        selectedRoleId.value = null
      })
  }

  const changePage = (v) => {
    store.userRoleParams.page = v.page
    store.userRoleParams.per_page = v.per_page
    store._userRole()
  }

  const columns = computed(() => [
    {
      key: 'worker',
      title: t('confirmationPage.table.worker'),
      minWidth: 300
    },
    {
      key: 'worker.pin',
      title: 'PIN',
      width: 200
    },
    {
      key: 'roles',
      title: t('workerRole.from.role'),
      minWidth: 260
    },
    {
      key: 'current_organization.name',
      title: t('workerRole.from.activeOrganization'),
      minWidth: 260
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :actions="actions"
    :data="store.userRoleList"
    :loading="store.userRoleLoading"
    :page="store.userRoleParams.page"
    :per-page="store.userRoleParams.per_page"
    :total="store.userRoleTotal"
    storage-key="extra-user-role"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        :short="false"
        :data="{
          photo: row?.worker?.photo,
          firstName: row?.worker?.first_name,
          middleName: row?.worker?.middle_name,
          lastName: row?.worker?.last_name,
          position: row?.phone
        }"
      />
    </template>

    <template #[`cell-worker.pin`]="{ row }">
      <span class="text-[13px]">{{ row?.worker?.pin }}</span>
    </template>

    <template #cell-roles="{ row }">
      <div class="flex flex-wrap gap-1 role-badges-cell">
        <UIBadge
          v-if="!row.has_account"
          :label="$t('workerRole.noAccount')"
          :type="Utils.colorTypes.error"
        />
        <template v-for="(role, rIdx) in row.roles" :key="rIdx">
          <UIBadge v-if="role.name" :label="role.name" :type="Utils.colorTypes.dark">
            <template #icon>
              <n-icon size="16">
                <RibbonStar24Filled />
              </n-icon>
            </template>
          </UIBadge>
        </template>
      </div>
    </template>
  </UITable>

  <!-- Rol biriktirish modal -->
  <UIModal
    :width="600"
    :visible="store.roleVisible"
    @update:visible="(v) => (store.roleVisible = v)"
    :title="$t('content.attachment')"
  >
    <RoleForm />
  </UIModal>

  <!-- Hisob yaratish modal — faqat `has_account: false` qatorlar uchun -->
  <UIModal
    :width="450"
    :visible="store.createUserVisible"
    @update:visible="(v) => (store.createUserVisible = v)"
    :title="$t('workerRole.createAccount')"
  >
    <div class="pb-6">
      <div class="mb-4 text-primary text-xs bg-primary/10 p-2 rounded-lg">
        {{ $t('workerRole.createAccountInfo') }}
      </div>

      <div v-if="store.createUserWorker" class="mb-4 text-sm font-medium">
        {{ store.createUserWorker.last_name }} {{ store.createUserWorker.first_name }}
        {{ store.createUserWorker.middle_name }}
      </div>

      <div class="flex flex-col gap-3">
        <div>
          <div class="text-xs text-textColor2 mb-1">{{ $t('workerRole.loginPhone') }}</div>
          <n-input
            v-model:value="store.createUserPayload.phone"
            v-mask="'+998##-###-##-##'"
            :status="createAccountError ? 'error' : undefined"
            @update:value="createAccountError = null"
          />
          <div v-if="createAccountError" class="text-danger text-xs mt-1">
            {{ createAccountError }}
          </div>
        </div>

        <div>
          <div class="text-xs text-textColor2 mb-1">{{ $t('workerRole.newPassword') }}</div>
          <n-input
            v-model:value="store.createUserPayload.password"
            type="password"
            show-password-on="click"
            :placeholder="$t('workerRole.enterPassword')"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.createUserVisible = false" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onCreateAccountSubmit" :loading="store.createUserLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>

  <!-- Parolni yangilash modal — HR «Xodimlar» menyusi bilan bitta komponent -->
  <PasswordUpdateModal
    v-model:visible="store.passwordVisible"
    :loading="store.passwordLoading"
    @submit="onPasswordSubmit"
  />

  <!-- Rol o'chirish modal -->
  <UIModal
    :width="450"
    :visible="deleteRoleVisible"
    @update:visible="(v) => (deleteRoleVisible = v)"
    :title="$t('workerRole.selectRoleToDelete')"
  >
    <div class="pb-[60px]">
      <div class="flex flex-col gap-2">
        <div
          v-for="role in selectedItem?.roles"
          :key="role.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all"
          :class="
            selectedRoleId === role.id
              ? 'border-primary bg-primary/5'
              : 'border-surface-line hover:border-primary/50'
          "
          @click="selectedRoleId = role.id"
        >
          <n-radio :checked="selectedRoleId === role.id" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium">{{ role.name }}</div>
            <div v-if="role.organizations?.length" class="text-xs text-textColor2 truncate mt-0.5">
              {{ role.organizations.map((o) => o.name).join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="deleteRoleVisible = false" ghost> {{ $t('content.cancel') }} </n-button>
      <n-button @click="onDeleteRole" type="error" :disabled="!selectedRoleId">
        {{ $t('content.delete') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped>
  .role-badges-cell :deep(.w-full) {
    width: auto;
  }
</style>
