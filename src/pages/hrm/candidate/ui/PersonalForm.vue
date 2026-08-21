<script setup>
  import { useComponentStore, useCreateWorkerStore } from '@/store/modules/index.js'
  import { UIFigBlock, UIFigField } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import icons from '@/assets/icons'

  /** Figma "Shaxsiy ma'lumotlar" bloki (node 3132:61807) */
  const store = useCreateWorkerStore()
  const componentStore = useComponentStore()
  const rules = validationRules.rulesNames

  onMounted(() => {
    componentStore._countries()
    componentStore._enums()
    componentStore._regions()
    componentStore._nationality()
  })
</script>

<template>
  <UIFigBlock :title="$t('workerProfile.personal.infoTitle')" :icon="icons.figUserAlt">
    <div class="flex flex-col gap-5 w-full">
      <div class="fig-grid">
        <UIFigField
          editing
          :label="$t('createWorkerPage.form.lastName')"
          path="last_name"
          :rule-path="rules.requiredStringField"
        >
          <n-input class="w-full" type="text" v-model:value="store.payload.last_name" />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.firstName')"
          path="first_name"
          :rule-path="rules.requiredStringField"
        >
          <n-input class="w-full" type="text" v-model:value="store.payload.first_name" />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.middleName')"
          path="middle_name"
          :rule-path="rules.requiredStringField"
        >
          <n-input class="w-full" type="text" v-model:value="store.payload.middle_name" />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.birthday')"
          path="birthday"
          :rule-path="rules.requiredDateTimeField"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.payload.birthday"
            type="date"
            :format="useAppSetting.datePicketFormat"
          />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.nationality_id')"
          path="nationality_id"
          :rule-path="rules.requiredNumberField"
        >
          <n-select
            v-model:value="store.payload.nationality_id"
            filterable
            :options="componentStore.nationalityList"
            label-field="name"
            value-field="id"
            :loading="componentStore.nationalityLoading"
          />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.sex')"
          path="sex"
          :rule-path="rules.requiredNumberField"
        >
          <n-select
            v-model:value="store.payload.sex"
            filterable
            :options="componentStore.genderList"
            label-field="name"
            value-field="id"
          />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.marital_status')"
          path="marital_status"
          :rule-path="rules.requiredNumberField"
        >
          <n-select
            v-model:value="store.payload.marital_status"
            filterable
            :options="componentStore.maritalList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.pin')"
          path="pin"
          :rule-path="rules.requiredPinField"
        >
          <n-input
            class="w-full"
            type="text"
            v-model:value="store.payload.pin"
            v-mask="`####-####-####-##`"
          />
        </UIFigField>

        <!-- Maketda yo'q, lekin validatsiya talab qiladigan maydonlar — shu to'rda qoldirildi -->
        <UIFigField
          editing
          :label="$t('createWorkerPage.form.work_experience')"
          path="work_experience"
          :rule-path="rules.requiredStringField"
        >
          <n-input
            class="w-full"
            type="text"
            v-model:value="store.payload.work_experience"
            :allow-input="Utils.onlyAllowNumber"
          />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.experience_date')"
          path="experience_date"
          :rule-path="rules.requiredDateTimeField"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.payload.experience_date"
            type="date"
            :format="useAppSetting.datePicketFormat"
          />
        </UIFigField>

        <UIFigField
          editing
          :label="$t('createWorkerPage.form.education')"
          path="education"
          :rule-path="rules.requiredNumberField"
        >
          <n-select
            v-model:value="store.payload.education"
            filterable
            clearable
            :options="componentStore.educationList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </UIFigField>
      </div>

      <div class="fig-separator"></div>

      <div class="flex flex-col gap-4">
        <span class="fig-group-title">{{ $t('createWorkerPage.form.birthPlace') }}</span>
        <div class="fig-grid">
          <UIFigField
            editing
            :label="$t('createWorkerPage.form.country')"
            path="country_id"
            :rule-path="rules.requiredNumberField"
          >
            <n-select
              v-model:value="store.payload.country_id"
              filterable
              :options="componentStore.countryList"
              label-field="name"
              value-field="id"
              :loading="componentStore.countryLoading"
            />
          </UIFigField>

          <UIFigField
            editing
            :label="$t('createWorkerPage.form.region')"
            path="region_id"
            :rule-path="rules.requiredNumberField"
          >
            <n-select
              v-model:value="store.payload.region_id"
              @update:value="store.changeRegion"
              filterable
              :options="componentStore.regionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.regionLoading"
            />
          </UIFigField>

          <UIFigField
            editing
            :label="$t('createWorkerPage.form.city')"
            path="city_id"
            :rule-path="rules.requiredNumberField"
          >
            <n-select
              :disabled="!store.payload.region_id"
              v-model:value="store.payload.city_id"
              filterable
              :options="store.districtList"
              label-field="name"
              value-field="id"
              :loading="store.districtLoading"
            />
          </UIFigField>
        </div>
      </div>

      <div class="fig-separator"></div>

      <div class="flex flex-col gap-4">
        <span class="fig-group-title">{{ $t('createWorkerPage.form.livingPlace') }}</span>
        <div class="fig-grid">
          <UIFigField
            editing
            :label="$t('createWorkerPage.form.currentRegion')"
            path="current_region_id"
            :rule-path="rules.requiredNumberField"
          >
            <n-select
              v-model:value="store.payload.current_region_id"
              @update:value="store.changeCurrentRegion"
              filterable
              :options="componentStore.regionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.regionLoading"
            />
          </UIFigField>

          <UIFigField
            editing
            :label="$t('createWorkerPage.form.currentCity')"
            path="current_city_id"
            :rule-path="rules.requiredNumberField"
          >
            <n-select
              :disabled="!store.payload.current_region_id"
              v-model:value="store.payload.current_city_id"
              filterable
              :options="store.currentDistrictList"
              label-field="name"
              value-field="id"
              :loading="store.currentDistrictLoading"
            />
          </UIFigField>

          <UIFigField
            editing
            :label="$t('createWorkerPage.form.address')"
            path="address"
            :rule-path="rules.requiredStringField"
          >
            <n-input class="w-full" type="text" v-model:value="store.payload.address" />
          </UIFigField>
        </div>
      </div>
    </div>
  </UIFigBlock>
</template>
