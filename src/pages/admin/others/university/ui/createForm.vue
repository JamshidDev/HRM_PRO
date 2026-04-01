<script setup>
  import validationRules from '@/utils/validationRules.js'
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

  onMounted(() => {
    store.existUniversities = []
    if (compStore.universityTypes.length === 0) {
      compStore._enumsAdmin()
    }
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.universityAdmin" :model="store.payload">
    <div style="height: calc(100vh - 120px)" class="overflow-y-auto">
      <n-collapse-transition :show="store.existUniversities.length > 0">
        <n-alert type="warning">
          {{ $t('othersPage.university.existName') }}
        </n-alert>
      </n-collapse-transition>
      <n-form-item class="mt-4" :label="$t(`othersPage.university.form.name`)" path="name">
        <n-input
          type="textarea"
          v-model:value="store.payload.name"
          :rows="2"
          :on-keyup="onSearchEv"
          @clear="onSearchEv"
        />
      </n-form-item>
      <n-form-item :label="$t(`othersPage.university.form.name_ru`)" path="name_ru">
        <n-input type="textarea" v-model:value="store.payload.name_ru" :rows="2" />
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

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
        @click="onSubmit"
        :loading="store.saveLoading || store.checkLoading"
        type="primary"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
