<script setup>
  import { useWorkerProfileStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import icons from '@/assets/icons'
  import { UIProfileButton } from '@/components/index.js'
  import ProfileBlock from '../ProfileBlock.vue'
  import ProfileField from '../ProfileField.vue'

  /** Figma "Shaxsiy ma'lumotlar" bloki (node 2586:200189) */
  const store = useWorkerProfileStore()
  const componentStore = useComponentStore()
  const editing = ref(false)

  const nameOf = (list, id) => list?.find((v) => v.id === id)?.name ?? null

  const onCountry = () => componentStore.countryList.length < 2 && componentStore._countries()
  const onRegion = () => componentStore.regionList.length < 3 && componentStore._regions()
  const onDistrict = () => store.districts.length < 2 && store._district()
  const onCurrentDistrict = () => store.currentDistricts.length < 2 && store._currentDistrict()

  const changeDistrict = () => {
    store.payload.city_id = null
    store.districts = []
    store._district()
  }

  const changeCurrentDistrict = () => {
    store.payload.current_city_id = null
    store.currentDistricts = []
  }

  const onCancel = () => {
    editing.value = false
    store._index()
  }

  const onSave = () => {
    store.savePersonalInfo()
    editing.value = false
  }
</script>

<template>
  <ProfileBlock :title="$t('workerProfile.personal.infoTitle')" :icon="icons.figUserAlt">
    <div class="flex flex-col gap-5 w-full">
      <div class="profile-grid">
        <ProfileField
          :label="$t('createWorkerPage.form.lastName')"
          :value="store.payload.last_name"
          :editing="editing"
        >
          <n-input v-model:value="store.payload.last_name" class="w-full" />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.firstName')"
          :value="store.payload.first_name"
          :editing="editing"
        >
          <n-input v-model:value="store.payload.first_name" class="w-full" />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.middleName')"
          :value="store.payload.middle_name"
          :editing="editing"
        >
          <n-input v-model:value="store.payload.middle_name" class="w-full" />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.birthday')"
          :value="Utils.timeOnlyDate(store.payload.birthday)"
          :editing="editing"
        >
          <n-date-picker
            v-model:value="store.payload.birthday"
            class="w-full"
            type="date"
            :format="useAppSetting.datePicketFormat"
          />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.nationality_id')"
          :value="nameOf(componentStore.nationalityList, store.payload.nationality_id)"
          :editing="editing"
        >
          <n-select
            v-model:value="store.payload.nationality_id"
            filterable
            :options="componentStore.nationalityList"
            label-field="name"
            value-field="id"
            :loading="componentStore.nationalityLoading"
          />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.sex')"
          :value="nameOf(componentStore.genderList, store.payload.sex)"
          :editing="editing"
        >
          <n-select
            v-model:value="store.payload.sex"
            filterable
            :options="componentStore.genderList"
            label-field="name"
            value-field="id"
          />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.marital_status')"
          :value="nameOf(componentStore.maritalList, store.payload.marital_status)"
          :editing="editing"
        >
          <n-select
            v-model:value="store.payload.marital_status"
            filterable
            :options="componentStore.maritalList"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumLoading"
          />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.pin')"
          :value="store.payload.pin"
          :editing="editing"
        >
          <n-input v-model:value="store.payload.pin" class="w-full" v-mask="`####-####-####-##`" />
        </ProfileField>

        <!-- Maketda yo'q, lekin mavjud maydonlar — tahrirlash imkoni yo'qolmasligi uchun saqlab qolindi -->
        <ProfileField
          :label="$t('createWorkerPage.form.work_experience')"
          :value="store.payload.work_experience"
          :editing="editing"
        >
          <n-input
            v-model:value="store.payload.work_experience"
            class="w-full"
            :allow-input="Utils.onlyAllowNumber"
          />
        </ProfileField>

        <ProfileField
          :label="$t('createWorkerPage.form.experience_date')"
          :value="Utils.timeOnlyDate(store.payload.experience_date)"
          :editing="editing"
        >
          <n-date-picker
            v-model:value="store.payload.experience_date"
            class="w-full"
            type="date"
            :format="useAppSetting.datePicketFormat"
          />
        </ProfileField>
      </div>

      <div class="profile-separator"></div>

      <div class="flex flex-col gap-4">
        <span class="profile-group-title">{{ $t('createWorkerPage.form.birthPlace') }}</span>
        <div class="profile-grid">
          <ProfileField
            :label="$t('createWorkerPage.form.country')"
            :value="nameOf(componentStore.countryList, store.payload.country_id)"
            :editing="editing"
          >
            <n-select
              v-model:value="store.payload.country_id"
              filterable
              :options="componentStore.countryList"
              label-field="name"
              value-field="id"
              :loading="componentStore.countryLoading"
              @focus="onCountry"
            />
          </ProfileField>

          <ProfileField
            :label="$t('createWorkerPage.form.region')"
            :value="nameOf(componentStore.regionList, store.payload.region_id)"
            :editing="editing"
          >
            <n-select
              v-model:value="store.payload.region_id"
              filterable
              :options="componentStore.regionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.regionLoading"
              @focus="onRegion"
              @update:value="changeDistrict"
            />
          </ProfileField>

          <ProfileField
            :label="$t('createWorkerPage.form.city')"
            :value="nameOf(store.districts, store.payload.city_id)"
            :editing="editing"
          >
            <n-select
              v-model:value="store.payload.city_id"
              filterable
              :options="store.districts"
              label-field="name"
              value-field="id"
              :loading="store.districtLoading"
              @focus="onDistrict"
            />
          </ProfileField>
        </div>
      </div>

      <div class="profile-separator"></div>

      <div class="flex flex-col gap-4">
        <span class="profile-group-title">{{ $t('createWorkerPage.form.livingPlace') }}</span>
        <div class="profile-grid">
          <ProfileField
            :label="$t('createWorkerPage.form.currentRegion')"
            :value="nameOf(componentStore.regionList, store.payload.current_region_id)"
            :editing="editing"
          >
            <n-select
              v-model:value="store.payload.current_region_id"
              filterable
              :options="componentStore.regionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.regionLoading"
              @focus="onRegion"
              @update:value="changeCurrentDistrict"
            />
          </ProfileField>

          <ProfileField
            :label="$t('createWorkerPage.form.currentCity')"
            :value="nameOf(store.currentDistricts, store.payload.current_city_id)"
            :editing="editing"
          >
            <n-select
              v-model:value="store.payload.current_city_id"
              filterable
              :options="store.currentDistricts"
              label-field="name"
              value-field="id"
              :loading="store.currentDistrictLoading"
              @focus="onCurrentDistrict"
            />
          </ProfileField>

          <ProfileField
            :label="$t('createWorkerPage.form.address')"
            :value="store.payload.address"
            :editing="editing"
          >
            <n-input v-model:value="store.payload.address" class="w-full" />
          </ProfileField>
        </div>
      </div>
    </div>

    <template #actions>
      <template v-if="editing">
        <UIProfileButton variant="danger" @click="onCancel">
          {{ $t('content.cancel') }}
        </UIProfileButton>
        <UIProfileButton :loading="store.loading" @click="onSave">
          {{ $t('content.save') }}
        </UIProfileButton>
      </template>
      <UIProfileButton v-else @click="editing = true">{{ $t('content.edit') }}</UIProfileButton>
    </template>
  </ProfileBlock>
</template>

<style lang="scss" scoped>
  // Maketda maydonlar 3 ustunli to'r, oraliq 12px
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  .profile-separator {
    width: 100%;
    height: 1px;
    border-radius: 9999px;
    background: var(--fig-br-disable);
  }

  .profile-group-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    color: var(--fig-text-primary);
  }

  @media (max-width: 976px) {
    .profile-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .profile-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
