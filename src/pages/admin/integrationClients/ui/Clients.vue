<script setup>
  import { useIntegrationClientsStore, useComponentStore } from '@/store/modules/index.js'
  import { UIModal, UISelect, UIMenuButton, UIPagination } from '@/components/index.js'
  import {
    Checkmark16Regular,
    Dismiss16Regular,
    Add20Filled,
    Key20Regular,
    Copy20Regular
  } from '@vicons/fluent'
  import { useMessage, useDialog } from 'naive-ui'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/AppSetting.js'
  import i18n from '@/i18n/index.js'

  const store = useIntegrationClientsStore()
  const componentStore = useComponentStore()
  const message = useMessage()
  const dialog = useDialog()
  const { t } = i18n.global

  const loadStructure = () => {
    if (componentStore.structureList.length === 0) componentStore._structures()
  }

  // Yopiq kalit uzunligi = 64 (backend randomBytes(32).toString('hex')). Ochiq
  // ko'rsatib bo'lmaganda shu uzunlikda niqoblab ko'rsatamiz.
  const SECRET_MASK = '•'.repeat(64)

  // ---- amallar menyusi (UIMenuButton — delete confirm ichida) ----
  const keysOption = computed(() => [
    { label: t('integrationClients.keys.title'), key: 'keys', icon: Key20Regular }
  ])
  const onSelect = (v) => {
    if (v.key === Utils.ActionTypes.edit) openEdit(v.data)
    else if (v.key === 'keys') openKeys(v.data)
    else if (v.key === Utils.ActionTypes.delete) store._delete(v.data.id).then(() => store._clients())
  }

  const changePage = (v) => {
    store.clientsParams.page = v.page
    store.clientsParams.per_page = v.per_page
    store._clients()
  }

  const scopeModeOptions = computed(() =>
    (store.meta.scope_modes ?? ['all', 'subtree', 'exact']).map((v) => ({
      label: t(`integrationClients.scope.${v}`),
      value: v
    }))
  )
  const roleOptions = computed(() =>
    (store.meta.roles ?? []).map((r) => ({ label: r.name, value: r.id }))
  )

  const scopeBadge = (mode) => {
    const map = {
      all: 'bg-primary/10 text-primary',
      subtree: 'bg-info/10 text-info',
      exact: 'bg-warning/10 text-warning'
    }
    return map[mode] ?? 'bg-surface-ground text-textColor2'
  }

  // ---- create / edit form ----
  const showForm = ref(false)
  const isEdit = ref(false)
  const formRef = ref(null)
  const form = ref({})
  const formOrgs = ref([]) // UISelect modelV — org obyektlari {id, name}
  const formOrgChecked = ref([]) // daraxt ochilish holati

  const rules = {
    name: {
      required: true,
      message: () => t('integrationClients.validation.name'),
      trigger: ['blur', 'input']
    },
    role_id: {
      required: true,
      type: 'number',
      message: () => t('integrationClients.validation.role'),
      trigger: ['change', 'blur']
    },
    scope_mode: {
      required: true,
      message: () => t('integrationClients.validation.scope'),
      trigger: ['change', 'blur']
    }
  }

  const emptyForm = () => ({
    id: null,
    name: '',
    description: '',
    role_id: null,
    scope_mode: 'exact',
    expires_at: null,
    is_active: true
  })

  const openCreate = () => {
    isEdit.value = false
    form.value = emptyForm()
    formOrgs.value = []
    formOrgChecked.value = []
    store._meta()
    loadStructure()
    showForm.value = true
  }

  const openEdit = (item) => {
    isEdit.value = true
    form.value = {
      id: item.id,
      name: item.name,
      description: item.description,
      role_id: item.role?.id ?? null,
      scope_mode: item.scope_mode,
      expires_at: item.expires_at ? new Date(item.expires_at).getTime() : null,
      is_active: item.is_active
    }
    formOrgs.value = []
    formOrgChecked.value = []
    store._meta()
    loadStructure()
    // Tanlangan korxonalarni detaldan yuklaymiz ({id, name}) — edit'da tahrirlash uchun.
    $ApiService.integrationClientsService._show(item.id).then((res) => {
      formOrgs.value = res.data.data.organizations ?? []
    })
    showForm.value = true
  }

  const toIsoDate = (ts) => (ts ? new Date(ts).toISOString().slice(0, 19).replace('T', ' ') : null)

  const onSubmit = () => {
    formRef.value?.validate((errors) => {
      if (errors) return
      // scope != all bo'lsa kamida bitta korxona tanlanishi shart.
      if (form.value.scope_mode !== 'all' && formOrgs.value.length === 0) {
        message.error(t('integrationClients.validation.organizations'))
        return
      }
      const orgIds = form.value.scope_mode === 'all' ? [] : formOrgs.value.map((o) => o.id)

      if (isEdit.value) {
        const payload = {
          name: form.value.name,
          description: form.value.description,
          role_id: form.value.role_id,
          scope_mode: form.value.scope_mode,
          expires_at: toIsoDate(form.value.expires_at),
          is_active: form.value.is_active
        }
        store._update(form.value.id, payload).then(() => {
          const done = () => {
            showForm.value = false
            store._clients()
          }
          // scope != all bo'lsa korxonalarni ham yangilaymiz.
          if (form.value.scope_mode !== 'all') {
            store._setOrganizations(form.value.id, orgIds).then(done)
          } else {
            done()
          }
        })
      } else {
        const payload = {
          name: form.value.name,
          description: form.value.description || undefined,
          role_id: form.value.role_id,
          scope_mode: form.value.scope_mode,
          expires_at: toIsoDate(form.value.expires_at) || undefined
        }
        if (form.value.scope_mode !== 'all') payload.organization_ids = orgIds
        store._create(payload).then((created) => {
          showForm.value = false
          openKeysRevealed(created.id, form.value.name, created.public_key, created.secret_key)
          store._clients()
        })
      }
    })
  }

  // ---- Kalitlar modali (public ko'rinadi; secret faqat almashtirilganda ochiladi) ----
  const showKeys = ref(false)
  const keyView = ref({ id: null, name: '', public_key: '', secret_key: null, revealed: false })

  // Menyudan "Kalitlar": public + secret (backend deshifrlab qaytaradi) ko'rsatiladi.
  const openKeys = (item) => {
    keyView.value = {
      id: item.id,
      name: item.name,
      public_key: item.public_key,
      secret_key: null,
      revealed: false
    }
    showKeys.value = true
    $ApiService.integrationClientsService._secret(item.id).then((res) => {
      keyView.value.secret_key = res.data.data.secret_key
      keyView.value.revealed = true
    })
  }

  // Create/rotate'dan keyin: yangi secret BIR MARTA ochiq ko'rsatiladi.
  const openKeysRevealed = (id, name, publicKey, secretKey) => {
    keyView.value = { id, name, public_key: publicKey, secret_key: secretKey, revealed: true }
    showKeys.value = true
  }

  const onChangeKey = () => {
    dialog.warning({
      title: t('integrationClients.rotate.title'),
      content: t('integrationClients.rotate.confirm', { name: keyView.value.name }),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => {
        return store._rotate(keyView.value.id).then((res) => {
          keyView.value.secret_key = res.secret_key
          keyView.value.revealed = true
          store._clients()
        })
      }
    })
  }

  // Name + public + secret'ni labellar bilan formatlangan holda BITTA nusxaga oladi.
  // secret faqat ochilgan holatda (create/rotate'dan keyin) haqiqiy qiymat bilan,
  // aks holda izoh matni bilan qo'shiladi (o'qib bo'lmaydi).
  const copyAll = () => {
    const lines = [
      `${t('integrationClients.clients.name')}: ${keyView.value.name}`,
      `${t('integrationClients.clients.publicKey')}: ${keyView.value.public_key}`
    ]
    // Ekranly niqoblangan bo'lsa ham, nusxaga OCHIQ yopiq kalit tushadi.
    if (keyView.value.secret_key) {
      lines.push(`${t('integrationClients.clients.secretKey')}: ${keyView.value.secret_key}`)
    }
    navigator.clipboard.writeText(lines.join('\n'))
    message.success(t('integrationClients.keys.copied'))
  }
</script>

<template>
  <div class="flex items-center justify-end mt-4 mb-2">
    <n-button type="primary" @click="openCreate">
      <template #icon><n-icon><Add20Filled /></n-icon></template>
      {{ $t('integrationClients.create.button') }}
    </n-button>
  </div>

  <n-spin :show="store.clientsLoading" style="min-height: 200px">
    <n-table class="mt-1" :single-line="false" size="small" v-if="store.clients.length">
      <thead>
        <tr>
          <th class="text-center! w-[40px]">{{ $t('content.number') }}</th>
          <th>{{ $t('integrationClients.clients.name') }}</th>
          <th>{{ $t('integrationClients.clients.publicKey') }}</th>
          <th>{{ $t('integrationClients.clients.role') }}</th>
          <th class="text-center!">{{ $t('integrationClients.clients.scope') }}</th>
          <th class="text-center! w-[100px]">{{ $t('integrationLog.clients.isActive') }}</th>
          <th class="text-center! w-[40px]">{{ $t('content.action') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in store.clients" :key="item.id">
          <td class="text-center text-xs text-textColor3">
            {{ (store.clientsParams.page - 1) * store.clientsParams.per_page + idx + 1 }}
          </td>
          <td>
            <p class="text-sm font-semibold text-textColor0">{{ item.name }}</p>
            <p v-if="item.description" class="text-[11px] text-textColor3">{{ item.description }}</p>
          </td>
          <td>
            <span class="text-xs font-mono font-semibold text-textColor1">{{ item.public_key }}</span>
          </td>
          <td>
            <n-tag v-if="item.role" type="info" size="small" round :bordered="false">
              {{ item.role.name }}
            </n-tag>
            <span v-else class="text-xs text-textColor3">—</span>
          </td>
          <td class="text-center">
            <span :class="scopeBadge(item.scope_mode)"
              class="text-[11px] font-semibold px-2 py-0.5 rounded capitalize">
              {{ $t(`integrationClients.scope.${item.scope_mode}`) }}
            </span>
          </td>
          <td class="text-center">
            <n-tag :type="item.is_active ? 'success' : 'default'" size="small" round>
              <template #icon>
                <n-icon :component="item.is_active ? Checkmark16Regular : Dismiss16Regular" />
              </template>
              {{ item.is_active ? $t('content.active') : $t('content.noActive') }}
            </n-tag>
          </td>
          <td class="text-center">
            <UIMenuButton
              :data="item"
              :show-edit="true"
              :show-delete="true"
              :extra-options="keysOption"
              :delete-warning="$t('integrationClients.delete.confirm', { name: item.name })"
              @selectEv="onSelect"
            />
          </td>
        </tr>
      </tbody>
    </n-table>
    <UIPagination
      v-if="store.clients.length"
      :page="store.clientsParams.page"
      :per_page="store.clientsParams.per_page"
      :total="store.clientsTotalItems"
      @change-page="changePage"
    />
  </n-spin>

  <!-- Create / Edit modal -->
  <UIModal v-model:visible="showForm"
    :title="isEdit ? $t('integrationClients.create.editTitle') : $t('integrationClients.create.title')"
    width="560">
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top" class="py-1">
      <n-form-item :label="$t('integrationClients.clients.name')" path="name">
        <n-input v-model:value="form.name" :placeholder="$t('integrationClients.clients.name')" />
      </n-form-item>
      <div class="grid grid-cols-2 gap-3">
        <n-form-item :label="$t('integrationClients.clients.role')" path="role_id">
          <n-select v-model:value="form.role_id" :options="roleOptions" filterable
            :placeholder="$t('integrationClients.clients.role')" />
        </n-form-item>
        <n-form-item :label="$t('integrationClients.clients.scope')" path="scope_mode">
          <n-select v-model:value="form.scope_mode" :options="scopeModeOptions" />
        </n-form-item>
      </div>

      <n-form-item v-if="form.scope_mode !== 'all'" class="!mb-5"
        :label="$t('integrationClients.clients.organizations')" :show-feedback="false">
        <div class="w-full">
          <UISelect
            :options="componentStore.structureList"
            :modelV="formOrgs"
            :checkedVal="formOrgChecked"
            :multiple="true"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @updateModel="(v) => (formOrgs = v)"
            @updateCheck="(v) => (formOrgChecked = v)"
            @onSearch="componentStore._structures"
          />
        </div>
      </n-form-item>

      <!-- Muddat + faollik: yonma-yon (col-6) -->
      <div class="grid grid-cols-2 gap-3">
        <n-form-item :label="$t('integrationClients.clients.expiresAt')" path="expires_at" :show-feedback="false">
          <n-date-picker v-model:value="form.expires_at" type="date" clearable class="w-full"
            :format="useAppSetting.datePicketFormat"
            :placeholder="$t('integrationClients.clients.expiresPlaceholder')" />
        </n-form-item>
        <n-form-item :label="$t('integrationLog.clients.isActive')" :show-feedback="false">
          <div class="flex items-center h-[34px] px-3 border border-surface-line rounded-lg w-full justify-between">
            <span class="text-xs text-textColor3">{{ form.is_active ? $t('content.active') : $t('content.noActive') }}</span>
            <n-switch v-model:value="form.is_active" />
          </div>
        </n-form-item>
      </div>

      <n-form-item :label="$t('integrationClients.clients.description')" path="description">
        <n-input v-model:value="form.description" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button @click="showForm = false" :disabled="store.saveLoading" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" :loading="store.saveLoading" @click="onSubmit">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>

  <!-- Kalitlar modali -->
  <UIModal v-model:visible="showKeys" :title="$t('integrationClients.keys.title')" width="520">
    <div class="flex flex-col gap-3 py-1">
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationClients.clients.name') }}</label>
        <code class="block text-xs font-mono bg-surface-ground rounded px-2 py-1.5 break-all">{{ keyView.name }}</code>
      </div>

      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationClients.clients.publicKey') }}</label>
        <code class="block text-xs font-mono bg-surface-ground rounded px-2 py-1.5 break-all">{{ keyView.public_key }}</code>
      </div>

      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('integrationClients.clients.secretKey') }}</label>
        <code class="block text-xs font-mono bg-surface-ground rounded px-2 py-1.5 break-all text-textColor3">
          {{ SECRET_MASK }}
        </code>
      </div>
    </div>
    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button secondary type="primary" @click="copyAll">
          <template #icon><n-icon><Copy20Regular /></n-icon></template>
          {{ $t('integrationClients.keys.copyAll') }}
        </n-button>
        <n-button type="warning" :loading="store.saveLoading" @click="onChangeKey">
          <template #icon><n-icon><Key20Regular /></n-icon></template>
          {{ $t('integrationClients.rotate.title') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
