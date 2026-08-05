<script setup>
  import { UIBadge, UIModal, UITable, UIUser } from '@components'
  import { useAccountStore, useWorkerProfileStore } from '@stores'
  import Utils from '@utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import RoleForm from '@pages/hrm/workerProfile/ui/RoleForm.vue'
  import {
    AddCircle28Regular,
    ArrowClockwise20Regular,
    Checkmark16Regular,
    Delete20Regular,
    Delete28Regular,
    Dismiss16Regular,
    LockClosed16Filled,
    Phone24Regular,
    RibbonStar24Filled
  } from '@vicons/fluent'
  import { v4 as uuidv4 } from 'uuid'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useWorkerProfileStore()
  const accStore = useAccountStore()

  const deleteRoleVisible = ref(false)
  const selectedItem = ref(null)
  const selectedRoleId = ref(null)

  // Password form
  const confirmPass = ref('')
  const passwordRules = computed(() => [
    {
      key: 'minLength',
      label: t('passwordForm.rules.minLength'),
      valid: (store.passwordPayload.password || '').length >= 8
    },
    {
      key: 'uppercase',
      label: t('passwordForm.rules.uppercase'),
      valid: /[A-Z]/.test(store.passwordPayload.password || '')
    },
    {
      key: 'lowercase',
      label: t('passwordForm.rules.lowercase'),
      valid: /[a-z]/.test(store.passwordPayload.password || '')
    },
    {
      key: 'number',
      label: t('passwordForm.rules.number'),
      valid: /[0-9]/.test(store.passwordPayload.password || '')
    },
    {
      key: 'special',
      label: t('passwordForm.rules.special'),
      valid: /[@!#$%^&*()_+\-=[\]{}|;':",.<>?/`~\\]/.test(store.passwordPayload.password || '')
    },
    {
      key: 'match',
      label: t('passwordForm.rules.match'),
      valid:
        (store.passwordPayload.password || '').length > 0 &&
        store.passwordPayload.password === confirmPass.value
    }
  ])
  const passwordAllValid = computed(() => passwordRules.value.every((r) => r.valid))

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const special = '@!#$%^&*'
    const all = upper + lower + digits + special
    const chars = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)]
    ]
    for (let i = 4; i < 8; i++) {
      chars.push(all[Math.floor(Math.random() * all.length)])
    }
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    const generated = chars.join('')
    store.passwordPayload.password = generated
    confirmPass.value = generated
  }

  // Phone modal
  const phoneVisible = ref(false)
  const phoneLoading = ref(false)
  const phoneList = ref([])
  const phoneErrors = ref({})
  const selectedUserUuid = ref(null)

  // Har option o'z ruxsatiga bog'landi — ruxsat bo'lmasa menyuда ko'rinmaydi
  // (backend ham mos slug bilan enforce qiladi).
  const actions = computed(() =>
    [
      {
        label: t('workerRole.attachRole'),
        key: 'attach_role',
        icon: UIHelper.renderIcon(RibbonStar24Filled),
        action: onAttachRole,
        perm: accStore.pn.hrUsersAttachRole
      },
      {
        label: t('workerRole.deleteRole'),
        key: 'delete_role',
        icon: UIHelper.renderIcon(Delete20Regular),
        action: onDeleteRoleClick,
        perm: accStore.pn.hrUsersDetachRole
      },
      {
        label: t('workerRole.updatePassword'),
        key: 'update_password',
        icon: UIHelper.renderIcon(LockClosed16Filled),
        action: onUpdatePasswordClick,
        perm: accStore.pn.hrUsersPassword
      },
      {
        label: t('workerRole.phoneNumber'),
        key: 'phone_number',
        icon: UIHelper.renderIcon(Phone24Regular),
        action: onPhoneNumberClick,
        perm: accStore.pn.hrUsersUpdate
      }
    ].filter((o) => accStore.checkPermission(o.perm) || accStore.isModeDev)
  )

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
    confirmPass.value = ''
    store.passwordVisible = true
  }

  const onPhoneNumberClick = (row) => {
    selectedUserUuid.value = row.uuid
    phoneErrors.value = {}
    const mainPhone = row.phone ? String(row.phone) : null
    phoneList.value = (row.phones || []).map((p) => ({
      id: uuidv4(),
      phone: '+998' + String(p).slice(-9),
      main: mainPhone ? String(p) === mainPhone : false,
      exist: true
    }))
    if (phoneList.value.length === 0) {
      phoneList.value.push({
        id: uuidv4(),
        phone: '+998',
        main: true,
        exist: false
      })
    }
    phoneVisible.value = true
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

  // Phone functions
  const formatPhone = (phone) => {
    const digits = phone.replace(/\D/g, '')
    return digits.startsWith('998') ? digits.slice(3) : digits
  }

  const clearPhoneError = (id) => {
    delete phoneErrors.value[id]
  }

  const validatePhones = () => {
    const phones = phoneList.value
    phoneErrors.value = {}
    let isValid = true

    // Kamida bitta raqam
    if (phones.length === 0) {
      $Toast.warning(t('message.minimumOneItem'))
      return false
    }

    // Har bir raqamni tekshirish
    const phoneNumbers = phones.map((p) => formatPhone(p.phone))

    phones.forEach((p, index) => {
      const formatted = formatPhone(p.phone)

      // Bo'sh raqam tekshiruvi
      if (!p.phone || formatted.length === 0) {
        phoneErrors.value[p.id] = t('workerRole.validation.emptyPhone')
        isValid = false
        return
      }

      // Format tekshiruvi - 9 ta raqam bo'lishi kerak
      if (formatted.length !== 9) {
        phoneErrors.value[p.id] = t('workerRole.validation.invalidFormat')
        isValid = false
        return
      }

      // Dublikat tekshiruvi
      if (phoneNumbers.indexOf(formatted) !== index) {
        phoneErrors.value[p.id] = t('workerRole.validation.duplicate')
        isValid = false
      }
    })

    return isValid
  }

  const addPhone = () => {
    if (phoneList.value.length >= 3) return
    phoneList.value.push({
      id: uuidv4(),
      phone: '+998',
      main: false,
      exist: false
    })
  }

  const removePhone = (item) => {
    if (phoneList.value.length <= 1) return
    phoneList.value = phoneList.value.filter((p) => p.id !== item.id)
    delete phoneErrors.value[item.id]
    // Agar asosiy raqam o'chirilsa, birinchisini asosiy qilamiz
    if (item.main && phoneList.value.length > 0) {
      phoneList.value[0].main = true
    }
  }

  const setMainPhone = (item) => {
    phoneList.value.forEach((p) => {
      p.main = p.id === item.id
    })
  }

  const savePhones = async () => {
    if (!validatePhones()) return

    const validPhones = phoneList.value
    const mainPhone = validPhones.find((p) => p.main)
    const userPhone = mainPhone ? formatPhone(mainPhone.phone) : formatPhone(validPhones[0].phone)

    phoneLoading.value = true
    try {
      await $ApiService.workerService._updateUserPhones({
        data: {
          uuid: selectedUserUuid.value,
          phones: validPhones.map((p) => Number(formatPhone(p.phone))),
          user_phone: userPhone
        }
      })
      phoneVisible.value = false
      store._userRole()
    } finally {
      phoneLoading.value = false
    }
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

  <!-- Parolni yangilash modal -->
  <UIModal
    :width="420"
    :visible="store.passwordVisible"
    @update:visible="(v) => (store.passwordVisible = v)"
    :title="$t('workerRole.updatePassword')"
  >
    <div class="flex flex-col gap-3 pb-4">
      <!-- Yangi parol -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs text-textColor3">{{ $t('passwordForm.newPassword') }}</label>
          <n-button size="tiny" type="primary" text @click="generatePassword">
            <template #icon>
              <n-icon size="14"><ArrowClockwise20Regular /></n-icon>
            </template>
            {{ $t('passwordForm.generatePassword') }}
          </n-button>
        </div>
        <n-input
          v-model:value="store.passwordPayload.password"
          type="password"
          show-password-on="click"
          :placeholder="$t('passwordForm.newPasswordPlaceholder')"
        />
      </div>

      <!-- Tasdiqlash -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{
          $t('passwordForm.confirmPassword')
        }}</label>
        <n-input
          v-model:value="confirmPass"
          type="password"
          show-password-on="click"
          :placeholder="$t('passwordForm.confirmPasswordPlaceholder')"
        />
      </div>

      <!-- Talablar -->
      <div class="border border-surface-line rounded-xl px-4 py-3 bg-surface-ground">
        <p class="text-xs font-semibold text-textColor2 mb-2">
          {{ $t('passwordForm.requirements') }}
        </p>
        <div class="flex flex-col gap-2">
          <div
            v-for="rule in passwordRules"
            :key="rule.key"
            class="flex items-center gap-2 text-xs transition-colors duration-200"
            :class="rule.valid ? 'text-success' : 'text-textColor3'"
          >
            <n-icon size="14" class="shrink-0">
              <Checkmark16Regular v-if="rule.valid" />
              <Dismiss16Regular v-else />
            </n-icon>
            <span>{{ rule.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.passwordVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
        @click="store._updateUserPassword()"
        :loading="store.passwordLoading"
        :disabled="!passwordAllValid"
        type="primary"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>

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

  <!-- Telefon raqamlar modal -->
  <UIModal
    :width="400"
    :visible="phoneVisible"
    @update:visible="(v) => (phoneVisible = v)"
    :title="$t('workerRole.phoneNumber')"
  >
    <div class="pb-6">
      <div class="mb-4 text-primary text-xs bg-primary/10 p-2 rounded-lg">
        {{ $t('workerRole.phoneInfo') }}
      </div>
      <div class="flex flex-col gap-3">
        <div v-for="(item, idx) in phoneList" :key="item.id">
          <n-input-group>
            <n-button v-if="phoneList.length > 1" @click="removePhone(item)" type="error">
              <template #icon>
                <n-icon><Delete28Regular /></n-icon>
              </template>
            </n-button>
            <n-button @click="setMainPhone(item)">
              <n-checkbox :checked="item.main" />
            </n-button>
            <n-input
              v-model:value="item.phone"
              v-mask="'+998##-###-##-##'"
              :status="phoneErrors[item.id] ? 'error' : undefined"
              @update:value="clearPhoneError(item.id)"
            />
            <n-button
              v-if="idx === phoneList.length - 1 && phoneList.length < 3"
              @click="addPhone"
              type="primary"
            >
              <template #icon>
                <n-icon><AddCircle28Regular /></n-icon>
              </template>
            </n-button>
          </n-input-group>
          <div v-if="phoneErrors[item.id]" class="text-danger text-xs mt-1">
            {{ phoneErrors[item.id] }}
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 mt-6">
      <n-button @click="phoneVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="savePhones" :loading="phoneLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped>
  .role-badges-cell :deep(.w-full) {
    width: auto;
  }
</style>
