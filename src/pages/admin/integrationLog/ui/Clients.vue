<script setup>
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import { Edit20Regular, Checkmark16Regular, Dismiss16Regular } from '@vicons/fluent'
  import { useMessage } from 'naive-ui'
  import i18n from '@/i18n/index.js'
  import { secretTypeBadge } from './cards/useHelpers.js'

  const store = useIntegrationLogStore()
  const message = useMessage()
  const { t } = i18n.global

  const showModal = ref(false)
  const form = ref({})

  const secretTypeOptions = [
    { label: 'Sanctum User', value: 'sanctum_user' },
    { label: 'Mobile Face', value: 'mobile_face' }
  ]

  const openEdit = (item) => {
    form.value = {
      id: item.id,
      name: item.name,
      public_key: item.public_key,
      secret_key: '',
      secret_type: item.secret_type,
      is_active: item.is_active
    }
    showModal.value = true
  }

  const onSave = () => {
    const { id, ...payload } = form.value
    if (!payload.secret_key) payload.secret_key = null
    store._updateUser(id, payload).then(() => {
      message.success(t('content.updated'))
      showModal.value = false
      store._users()
    })
  }
</script>

<template>
  <n-spin :show="store.usersLoading" style="min-height: 200px">
    <n-table class="mt-4" :single-line="false" size="small" v-if="store.users.length">
      <thead>
        <tr>
          <th class="text-center! w-[40px]">{{ $t('content.number') }}</th>
          <th>{{ $t('integrationLog.clients.name') }}</th>
          <th>{{ $t('integrationLog.clients.publicKey') }}</th>
          <th>{{ $t('integrationLog.clients.secretType') }}</th>
          <th class="text-center! w-[100px]">{{ $t('integrationLog.clients.isActive') }}</th>
          <th class="text-center! w-[80px]">{{ $t('content.action') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in store.users" :key="item.id">
          <td class="text-center text-xs text-textColor3">{{ idx + 1 }}</td>
          <td>
            <p class="text-sm font-semibold text-textColor0">{{ item.name }}</p>
          </td>
          <td>
            <span class="text-xs font-mono font-semibold text-textColor1">{{ item.public_key }}</span>
          </td>
          <td>
            <span
              :class="secretTypeBadge(item.secret_type)"
              class="text-[11px] font-semibold px-2 py-0.5 rounded capitalize"
            >
              {{ item.secret_type }}
            </span>
          </td>
          <td class="text-center">
            <n-tag
              :type="item.is_active ? 'success' : 'default'"
              size="small"
              round
            >
              <template #icon>
                <n-icon :component="item.is_active ? Checkmark16Regular : Dismiss16Regular" />
              </template>
              {{ item.is_active ? $t('content.active') : $t('content.noActive') }}
            </n-tag>
          </td>
          <td class="text-center">
            <n-button size="small" type="primary" secondary @click="openEdit(item)">
              <template #icon>
                <n-icon><Edit20Regular /></n-icon>
              </template>
              {{ $t('content.edit') }}
            </n-button>
          </td>
        </tr>
      </tbody>
    </n-table>
  </n-spin>

  <!-- Edit modal -->
  <UIModal
    v-model:visible="showModal"
    :title="$t('integrationLog.clients.edit')"
    width="480"
  >
    <div class="flex flex-col gap-3 py-1">
      <!-- Name -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationLog.clients.name') }}</label>
        <n-input v-model:value="form.name" />
      </div>
      <!-- Public key -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationLog.clients.publicKey') }}</label>
        <n-input v-model:value="form.public_key" />
      </div>
      <!-- Secret key -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationLog.clients.secretKey') }}</label>
        <n-input
          v-model:value="form.secret_key"
          type="password"
          show-password-on="click"
          :placeholder="$t('integrationLog.clients.secretKeyPlaceholder')"
        />
      </div>
      <!-- Secret type -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationLog.clients.secretType') }}</label>
        <n-select v-model:value="form.secret_type" :options="secretTypeOptions" />
      </div>
      <!-- Is active -->
      <div class="flex items-center justify-between border border-surface-line rounded-lg px-3 py-2">
        <label class="text-xs text-textColor3">{{ $t('integrationLog.clients.isActive') }}</label>
        <n-switch v-model:value="form.is_active" />
      </div>
    </div>
    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button @click="showModal = false" :disabled="store.updateLoading" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" :loading="store.updateLoading" @click="onSave">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
