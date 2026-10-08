<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global
  import { UIMultipleLangItems } from '@/components/index.js'
  import { useOrganizationStore, useComponentStore } from '@/store/modules/index.js'
  import BasisFields from './BasisFields.vue'

  const store = useOrganizationStore()
  const componentStore = useComponentStore()

  // Yaratishda asos majburiy; tahrirda faqat ota korxona o'zgarsa ko'chirish izohi so'raladi.
  const parentChanged = computed(
    () => !store.visibleType && (store.payload.parent_id ?? null) !== store.originalParentId
  )
  const basisMissing = computed(
    () => store.visibleType && !(store.payload.basis_comment?.trim() || store.payload.basis_file)
  )

  const onSubmit = () => {
    if (basisMissing.value) {
      $Toast.error(t('organizationPage.basis.required'))
      return
    }
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  const onFocusCity = () => {
    if (componentStore.allCityList.length === 0) {
      componentStore._allCities()
    }
  }
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.organizationPage" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <div
        v-if="store.parentElement"
        class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col cursor-pointer"
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
      <n-form-item :label="$t(`organizationPage.form.code`)" path="code">
        <n-input type="text" v-model:value="store.payload.code" />
      </n-form-item>
      <n-form-item :label="$t(`organizationPage.form.ones_org_code`)" path="ones_org_code">
        <n-input class="skip-format" type="text" v-model:value="store.payload.ones_org_code"
          :placeholder="$t('salary1c.orgCodePh')" />
      </n-form-item>
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
        v-if="store.visibleType"
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

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
