<script setup>
  import { Add20Regular, Delete20Regular } from '@vicons/fluent'
  import { useEmployeeDocumentStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  // Manfaatlar to'qnashuvi deklaratsiyasiga xos maydonlar (`payload.data`); ro'yxatlar qator qo'shib to'ldiriladi.
  const store = useEmployeeDocumentStore()
  const { t } = i18n.global
  const data = computed(() => store.payload.data)

  const reasonOptions = computed(() =>
    ['annual', 'hiring', 'transfer'].map((id) => ({
      id,
      name: t(`employeeDocumentsPage.declaration.reasons.${id}`)
    }))
  )

  const LISTS = {
    relatives: {
      title: 'employeeDocumentsPage.declaration.relatives',
      fields: [
        { key: 'full_name', label: 'employeeDocumentsPage.declaration.fullName' },
        { key: 'passport', label: 'employeeDocumentsPage.declaration.passport' },
        { key: 'pin', label: 'employeeDocumentsPage.declaration.pin' }
      ]
    },
    worker_companies: {
      title: 'employeeDocumentsPage.declaration.workerCompanies',
      fields: [
        { key: 'name', label: 'employeeDocumentsPage.declaration.companyName' },
        { key: 'stir', label: 'employeeDocumentsPage.declaration.stir' }
      ]
    },
    relative_companies: {
      title: 'employeeDocumentsPage.declaration.relativeCompanies',
      fields: [
        { key: 'name', label: 'employeeDocumentsPage.declaration.companyName' },
        { key: 'stir', label: 'employeeDocumentsPage.declaration.stir' }
      ]
    }
  }

  const addRow = (key) => {
    const row = Object.fromEntries(LISTS[key].fields.map((f) => [f.key, null]))
    store.payload.data[key] = [...(store.payload.data[key] ?? []), row]
  }
  const removeRow = (key, idx) => {
    store.payload.data[key] = store.payload.data[key].filter((_, i) => i !== idx)
  }
</script>

<template>
  <div class="col-span-12 md:col-span-4">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.reason')" path="data.reason">
      <n-select
        v-model:value="store.payload.data.reason"
        :options="reasonOptions"
        label-field="name"
        value-field="id"
      />
    </n-form-item>
  </div>
  <div class="col-span-12 md:col-span-4">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.workerPassport')">
      <n-input
        v-model:value="store.payload.data.passport_info"
        :maxlength="255"
        :placeholder="$t('employeeDocumentsPage.declaration.fromProfile')"
      />
    </n-form-item>
  </div>
  <div class="col-span-12 md:col-span-4">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.workerPin')">
      <n-input
        v-model:value="store.payload.data.worker_pin"
        :maxlength="255"
        :placeholder="$t('employeeDocumentsPage.declaration.fromProfile')"
      />
    </n-form-item>
  </div>

  <div v-for="(list, key) in LISTS" :key="key" class="col-span-12 mb-3">
    <div class="flex items-center justify-between mb-2">
      <div class="text-sm font-medium text-textColor1">{{ $t(list.title) }}</div>
      <n-button size="small" secondary type="primary" @click="addRow(key)">
        <template #icon>
          <n-icon><Add20Regular /></n-icon>
        </template>
        {{ $t('content.add') }}
      </n-button>
    </div>
    <div v-if="!data[key]?.length" class="text-xs text-textColor3 px-1">
      {{ $t('employeeDocumentsPage.declaration.emptyList') }}
    </div>
    <div v-for="(row, idx) in data[key]" :key="idx" class="flex gap-2 items-start mb-2">
      <div class="w-6 pt-2 text-xs text-textColor3 text-center">{{ idx + 1 }}</div>
      <div class="grid grid-cols-12 gap-2 flex-1">
        <n-input
          v-for="f in list.fields"
          :key="f.key"
          v-model:value="row[f.key]"
          :class="list.fields.length === 3 ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-6'"
          :maxlength="f.key === 'name' ? 500 : 255"
          :placeholder="$t(f.label)"
        />
      </div>
      <n-button quaternary circle type="error" @click="removeRow(key, idx)">
        <template #icon>
          <n-icon><Delete20Regular /></n-icon>
        </template>
      </n-button>
    </div>
  </div>

  <div class="col-span-12">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.conflictInfo')">
      <n-input
        v-model:value="store.payload.data.conflict_info"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :maxlength="5000"
        :placeholder="$t('employeeDocumentsPage.declaration.noneHint')"
      />
    </n-form-item>
  </div>
  <div class="col-span-12">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.additionalInfo')">
      <n-input
        v-model:value="store.payload.data.additional_info"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 6 }"
        :maxlength="5000"
        :placeholder="$t('employeeDocumentsPage.declaration.noneHint')"
      />
    </n-form-item>
  </div>
  <div class="col-span-12 md:col-span-6">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.registryDate')">
      <n-date-picker
        class="w-full"
        v-model:value="store.payload.data.registry_date"
        type="date"
        clearable
        :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
  </div>
  <div class="col-span-12 md:col-span-6">
    <n-form-item :label="$t('employeeDocumentsPage.declaration.registryNumber')">
      <n-input v-model:value="store.payload.data.registry_number" :maxlength="50" />
    </n-form-item>
  </div>
</template>
