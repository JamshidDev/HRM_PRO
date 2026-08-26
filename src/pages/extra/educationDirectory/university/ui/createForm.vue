<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { UIMultipleLangItems } from '@/components/index.js'
  import { useUniversityAdminStore, useComponentStore } from '@/store/modules/index.js'

  const formRef = ref(null)
  const store = useUniversityAdminStore()
  const compStore = useComponentStore()

  const onSubmit = () => {
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

  const onFocusRegion = () => {
    compStore._regions()
  }

  const onChangeRegion = (v) => {
    store.districtList = []
    if (v) {
      store._getDistrict()
    }
  }

  let timeout = null
  const onSearchEv = () => {
    if (!store.visibleType) return
    clearTimeout(timeout)

    if (!store.payload.name) {
      store.existUniversities = []
      return
    }
    timeout = setTimeout(() => {
      store._checkExistUniversity(store.payload.name)
    }, 1000)
  }

  defineExpose({ submit: onSubmit })

  onMounted(() => {
    store.existUniversities = []
    if (compStore.universityTypes.length === 0) {
      compStore._enumsAdmin()
    }
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <!-- Balandlik CHEKLOVI, qat'iy balandlik emas: modal kontent bo'yi bilan
         o'sadi, ekran yetmasa shu blokning o'zi skroll bo'ladi. -->
    <div class="max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
      <n-collapse-transition :show="store.existUniversities.length > 0">
        <n-alert type="warning">
          {{ $t('othersPage.university.existName') }}
        </n-alert>
      </n-collapse-transition>
      <n-form-item
        class="mt-4"
        :label="$t(`othersPage.university.form.name`)"
        path="name"
        :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input
              type="textarea"
              v-model:value="store.payload.name"
              :rows="2"
              :on-keyup="onSearchEv"
              @clear="onSearchEv"
            />
          </template>
          <template #ru-content>
            <n-input
              class="skip-format"
              type="textarea"
              v-model:value="store.payload.name_ru"
              :rows="2"
            />
          </template>
          <template #en-content>
            <n-input type="textarea" v-model:value="store.payload.name_en" :rows="2" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.region_id`)" path="region_id">
        <n-select
          @focus="onFocusRegion"
          v-model:value="store.payload.region_id"
          filterable
          :options="compStore.regionList"
          label-field="name"
          value-field="id"
          :loading="compStore.regionLoading"
          @update:value="onChangeRegion"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.city_id`)" path="city_id">
        <n-select
          :disabled="!store.payload.region_id"
          v-model:value="store.payload.city_id"
          filterable
          :options="store.districtList"
          label-field="name"
          value-field="id"
          :loading="store.districtLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.education`)" path="education">
        <n-select
          v-model:value="store.payload.education"
          filterable
          :options="compStore.educationTypes"
          label-field="name"
          value-field="id"
          :loading="compStore.enumAdminLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.education`)" path="education">
        <n-select
          v-model:value="store.payload.type"
          filterable
          :options="compStore.universityTypes"
          label-field="name"
          value-field="id"
          :loading="compStore.enumAdminLoading"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
