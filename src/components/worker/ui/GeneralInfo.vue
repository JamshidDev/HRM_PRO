<script setup>
  import { Airplane20Regular, HatGraduation20Filled } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import UserIcon from '@/assets/icons/userIcon.svg'
  import JshirIcon from '@/assets/icons/jshirIcon.svg'
  import InfoBox from './shared/InfoBox.vue'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div v-if="store.workerPreview" class="w-full">
    <SectionHeader :title="$t('workerView.general.name')" :icon="UserIcon">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoBox
          :label="$t('workerView.general.fullName')"
          :value="Utils.combineFullName(store.workerPreview?.worker)"
        />
        <InfoBox
          :label="$t('workerView.general.country')"
          :value="store.workerPreview?.worker.country.name"
        />
        <InfoBox
          :label="$t('workerView.general.birthday')"
          :value="Utils.timeOnlyDate(store.workerPreview?.worker?.birthday)"
        />
        <InfoBox
          :label="$t('workerView.general.birthdayRegion')"
          :value="store.workerPreview?.worker.region.name"
        />
        <InfoBox
          :label="$t('workerView.general.nationality')"
          :value="store.workerPreview?.worker.nationality.name"
        />
        <InfoBox
          :label="$t('workerView.general.birthdayCity')"
          :value="store.workerPreview?.worker.city.name"
        />
        <InfoBox
          :label="$t('workerView.general.maritalStatus')"
          :value="store.workerPreview?.worker.marital_status.name"
        />
        <InfoBox
          :label="$t('workerView.general.address')"
          :value="store.workerPreview?.worker.address"
        />
      </div>
    </SectionHeader>

    <SectionHeader :title="$t('workerView.general.passportName')" :icon="JshirIcon">
      <div class="space-y-3">
        <div
          v-for="(item, idx) in store.workerPreview?.worker.passports"
          :key="idx"
          class="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <InfoBox :label="$t('workerView.general.passportJSHSHIR')" :value="store.workerPreview?.worker.pin" />
          <InfoBox :label="$t('workerView.general.fromDate')" :value="Utils.timeOnlyDate(item.from_date)" />
          <InfoBox :label="$t('workerView.general.toDate')">
            <template #value>
              <div class="flex items-center gap-2">
                {{ Utils.timeOnlyDate(item.to_date) }}
                <UIBadge
                  :label="$t('workerView.general.passportValid')"
                  :type="Utils.colorTypes.success"
                  :show-icon="false"
                  class="!w-auto"
                />
              </div>
            </template>
          </InfoBox>
          <InfoBox :label="$t('workerView.general.passportNumber')" :value="item.serial_number" />
          <InfoBox
            :label="$t('workerView.general.citizenship')"
            :value="store.workerPreview?.worker.country.name"
          />
        </div>
      </div>
    </SectionHeader>

    <SectionHeader
      v-if="store.workerPreview?.worker.foreign_passports?.length"
      :title="$t('workerView.general.foreignPassport')"
      :icon="Airplane20Regular"
    >
      <div class="space-y-3">
        <div
          v-for="(item, idx) in store.workerPreview?.worker.foreign_passports"
          :key="idx"
          class="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <InfoBox :label="$t('workerView.general.passportJSHSHIR')" :value="store.workerPreview?.worker.pin" />
          <InfoBox :label="$t('workerView.general.passportNumber')" :value="item.serial_number" />
          <InfoBox :label="$t('workerView.general.fromDate')" :value="Utils.timeOnlyDate(item.from_date)" />
          <InfoBox :label="$t('workerView.general.toDate')" :value="Utils.timeOnlyDate(item.to_date)" />
          <InfoBox :label="$t('workerView.general.who')" :value="item.given_place" />
        </div>
      </div>
    </SectionHeader>

    <SectionHeader :title="$t('workerView.general.university')" :icon="HatGraduation20Filled">
      <div v-if="store.workerPreview?.worker.universities.length" class="space-y-3">
        <div
          v-for="(item, idx) in store.workerPreview?.worker.universities"
          :key="idx"
          class="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <InfoBox
            :label="$t('content.name')"
            :value="`${item.university.name} (${item?.university?.education?.name})`"
          />
          <InfoBox :label="$t('workerView.general.specialty')" :value="item.speciality?.name" />
          <InfoBox
            :label="$t('workerView.general.educationPeriod')"
            :value="`${Utils.timeOnlyDate(item.from_date)} - ${Utils.timeOnlyDate(item.to_date)}`"
          />
          <InfoBox :label="$t('content.organization')" :value="item.university?.type?.name" />
        </div>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>
  </div>
</template>
