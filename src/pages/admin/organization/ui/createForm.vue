<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  import { UIMultipleLangItems, UIDConfirm } from '@/components/index.js'
  import { useOrganizationStore, useComponentStore, useAccountStore } from '@/store/modules/index.js'
  import BasisFields from './BasisFields.vue'

  const store = useOrganizationStore()
  const componentStore = useComponentStore()
  const accStore = useAccountStore()
  // Panelda korxona tanlanganda forma darhol ochiladi — yozish huquqi bo'lmasa faqat ko'rish.
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.organizationsWrite))

  // Yaratishda asos majburiy; tahrirda faqat ota korxona o'zgarsa ko'chirish izohi so'raladi.
  const parentChanged = computed(
    () => !store.isCreate && (store.payload.parent_id ?? null) !== store.originalParentId
  )
  const basisMissing = computed(
    () => store.isCreate && !(store.payload.basis_comment?.trim() || store.payload.basis_file)
  )

  // Tahrirlashda o'zgargan maydonlar (null va bo'sh satr bir xil hisoblanadi).
  const FIELD_LABELS = {
    name: () => `${t('organizationPage.form.name')} (UZ)`,
    name_ru: () => `${t('organizationPage.form.name')} (RU)`,
    name_en: () => `${t('organizationPage.form.name')} (EN)`,
    full_name: () => `${t('organizationPage.form.full_name')} (UZ)`,
    full_name_ru: () => `${t('organizationPage.form.full_name')} (RU)`,
    full_name_en: () => `${t('organizationPage.form.full_name')} (EN)`,
    level: () => t('organizationPage.form.level'),
    city_id: () => t('organizationPage.form.city_id'),
    parent_id: () => t('organizationPage.form.parent_id'),
    code: () => t('organizationPage.form.code'),
    ones_org_code: () => t('organizationPage.form.ones_org_code'),
    inn: () => t('organizationPage.form.inn'),
    gateway_id: () => t('organizationPage.form.gateway_id'),
    group: () => t('organizationPage.form.group')
  }
  const norm = (v) => (v === '' || v === undefined ? null : typeof v === 'boolean' ? Number(v) : v)
  const changedFields = computed(() => {
    const before = store.originalPayload
    if (store.isCreate || !before) return []
    return Object.keys(FIELD_LABELS)
      .filter((k) => norm(store.payload[k]) !== norm(before[k]))
      .map((k) => FIELD_LABELS[k]())
  })
  const hasChanges = computed(() => store.isCreate || changedFields.value.length > 0)

  // Tahrirlashda saqlashdan oldin kichik tasdiq oynasi (UIDConfirm) ochiladi.
  const confirming = ref(false)
  watch(changedFields, (v) => {
    if (!v.length) confirming.value = false
  })
  watch(
    () => store.saveLoading,
    (v, old) => {
      if (old && !v) confirming.value = false
    }
  )

  const onSubmit = () => {
    if (!accStore.checkAction(accStore.pn.organizationsWrite)) return
    if (basisMissing.value) {
      $Toast.error(t('organizationPage.basis.required'))
      return
    }
    formRef.value?.validate((error) => {
      if (error) return
      if (store.isCreate) store._create()
      else confirming.value = true
    })
  }

  const onFocusCity = () => {
    if (componentStore.allCityList.length === 0) {
      componentStore._allCities()
    }
  }
</script>

<template>
  <n-form
    ref="formRef"
    :rules="validationRules.organizationPage"
    :model="store.payload"
    :disabled="!canWrite"
  >
    <div>
      <div
        v-if="store.parentElement"
        class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col"
      >
        <span class="text-xs text-gray-500">{{ $t(`organizationPage.selectedOrg`) }}</span>
        <span class="text-primary font-bold">{{ store.parentElement?.name }}</span>
      </div>
      <n-form-item :label="$t(`organizationPage.form.name`)" path="name" :rule-path="validationRules.rulesNames.requiredStringField">
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="text" v-model:value="store.payload.name" />
          </template>
          <template #ru-content>
            <n-input class="skip-format" type="text" v-model:value="store.payload.name_ru" />
          </template>
          <template #en-content>
            <n-input type="text" v-model:value="store.payload.name_en" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.full_name`)" path="full_name" :rule-path="validationRules.rulesNames.requiredStringField">
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="text" v-model:value="store.payload.full_name" />
          </template>
          <template #ru-content>
            <n-input class="skip-format" type="text" v-model:value="store.payload.full_name_ru" />
          </template>
          <template #en-content>
            <n-input type="text" v-model:value="store.payload.full_name_en" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.level`)" path="level">
        <n-select
          v-model:value="store.payload.level"
          clearable
          filterable
          :options="componentStore.organizationLevelList"
          label-field="name"
          value-field="id"
          :loading="componentStore.organizationLevelLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.city_id`)" path="city_id">
        <n-select
          v-model:value="store.payload.city_id"
          clearable
          filterable
          @focus="onFocusCity"
          :options="componentStore.allCityList"
          label-field="name"
          value-field="id"
          :loading="componentStore.allCityLoading"
        />
      </n-form-item>
      <n-form-item
        v-if="!Boolean(store.parentElement)"
        :label="$t(`organizationPage.form.parent_id`)"
        path="parent_id"
      >
        <n-select
          v-model:value="store.payload.parent_id"
          clearable
          filterable
          :options="componentStore.organizationList"
          label-field="name"
          value-field="id"
          :loading="componentStore.organizationLoading"
        />
      </n-form-item>
      <div class="grid grid-cols-2 gap-2">
        <n-form-item :label="$t(`organizationPage.form.code`)" path="code">
          <n-input type="text" v-model:value="store.payload.code" />
        </n-form-item>
        <n-form-item :label="$t(`organizationPage.form.ones_org_code`)" path="ones_org_code">
          <n-input
            class="skip-format"
            type="text"
            v-model:value="store.payload.ones_org_code"
            :placeholder="$t('salary1c.orgCodePh')"
          />
        </n-form-item>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <n-form-item :label="$t(`organizationPage.form.inn`)" path="inn">
          <n-input-number class="w-full" :show-button="false" v-model:value="store.payload.inn"
            :min="0" :precision="0" clearable />
        </n-form-item>
        <n-form-item :label="$t(`organizationPage.form.gateway_id`)" path="gateway_id">
          <n-input-number class="w-full" :show-button="false" v-model:value="store.payload.gateway_id"
            :min="0" :precision="0" clearable />
        </n-form-item>
      </div>
      <n-form-item path="code">
        <n-checkbox
          :label="$t(`organizationPage.form.group`)"
          v-model:checked="store.payload.group"
        />
      </n-form-item>
      <BasisFields
        v-if="store.isCreate"
        v-model:comment="store.payload.basis_comment"
        v-model:file="store.payload.basis_file"
        v-model:file-name="store.payload.basis_file_name"
      />
      <n-form-item v-else-if="parentChanged" :label="$t('organizationPage.moveComment')">
        <n-input
          v-model:value="store.payload.basis_comment"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          :maxlength="2000"
        />
      </n-form-item>
    </div>

    <div class="sticky bottom-0 -mx-4 -mb-3 mt-4 grid grid-cols-2 gap-2 border-t border-surface-line bg-surface-section px-4 py-3">
      <n-button @click="store.backToView()" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
        v-if="canWrite"
        @click="onSubmit"
        :disabled="!hasChanges"
        :loading="store.saveLoading"
        type="primary"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>

    <!-- Tahrirlashni saqlash tasdig'i — loyihadagi umumiy kichik oyna -->
    <UIDConfirm
      v-model:visible="confirming"
      type="success"
      close-btn-text="content.cancel"
      submit-btn-text="organizationPage.saveConfirm.confirm"
      :save-loading="store.saveLoading"
      @on-close="confirming = false"
      @on-save="store._update()"
    >
      <div class="text-lg text-center font-medium text-textColor0">
        {{ $t('organizationPage.saveConfirm.title') }}
      </div>
      <div v-if="changedFields.length" class="mt-3 flex flex-wrap justify-center gap-1.5">
        <span
          v-for="f in changedFields"
          :key="f"
          class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
        >
          {{ f }}
        </span>
      </div>
    </UIDConfirm>
  </n-form>
</template>

<style scoped></style>
