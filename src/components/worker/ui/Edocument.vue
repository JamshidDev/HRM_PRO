<script setup>
  import { ref, computed } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useComponentStore } from '@/store/modules/index.js'

  import defaultPhoto from '@/assets/images/content/profilePhoto.avif'
  import IdCardIcon from '@/assets/icons/jshirIcon.svg'
  import DocumentTab from './shared/DocumentTab.vue'
  import IdCard from '../../ui/IdCard.vue'
  import IdForeign from '../../ui/IdForeign.vue'
  import IdRailWay from '../../ui/IdRailWay.vue'
  import IdCardDetail from '../../ui/IdCardDetail.vue'
  import SectionHeader from './shared/SectionHeader.vue'
  import JshirIcon from '@/assets/icons/jshirIcon.svg'
  import IdRailWayDetail from '../../ui/IdRailWayDetail.vue'
  import IdForeignDetail from '../../ui/IdForeignDetail.vue'
  import IdRedCertificate from '../../ui/IdRedCertificate.vue'

  const { t } = i18n.global
  const store = useComponentStore()

  const activeId = ref(1)

  const tabList = computed(() => [
    { id: 1, label: t('workerView.Edocument.pasport'), icon: IdCardIcon },
    { id: 2, label: t('workerView.Edocument.railway_pasport'), icon: IdCardIcon },
    { id: 3, label: t('workerView.Edocument.foreign_pasport'), icon: IdCardIcon },
    { id: 4, label: t('workerView.Edocument.position_certificate'), icon: IdCardIcon }
  ])

  const worker = computed(() => store.workerPreview?.worker || {})

  const photoUrl = computed(() => {
    const w = worker.value
    const photos = w.photos || []
    return (
      photos.find((p) => p.current === 1 || p.current === true)?.photo ||
      photos[0]?.photo ||
      w.photo ||
      defaultPhoto
    )
  })

  const sex = computed(() => {
    const s = worker.value.sex
    if (s === true || s === 1 || s === '1') return 'M'
    if (s === false || s === 0 || s === '0') return 'F'
    return undefined
  })

  const idCardData = computed(() => {
    const w = worker.value
    const passport = w.passports?.[0] || {}
    return {
      photoUrl: photoUrl.value,
      surname: w.last_name,
      givenName: w.first_name,
      patronymic: w.middle_name,
      nationality: w.nationality?.name,
      sex: sex.value,
      birthDate: w.birthday,
      issueDate: passport.from_date,
      expiryDate: passport.to_date,
      cardNumber: passport.serial_number,
      personalNumber: w.pin,
      birthPlace: w.region?.name,
      issuePlace: passport.address,
      birthCountry: w.country?.name
    }
  })

  const hasCertificate = computed(() => Boolean(worker.value.digital_certificate))

  const idRailWayData = computed(() => {
    const w = worker.value
    const certificate = w.digital_certificate || {}
    return {
      photoUrl: photoUrl.value,
      surname: w.last_name,
      givenName: w.first_name,
      patronymic: w.middle_name,
      sex: sex.value,
      birthDate: w.birthday,
      cardNumber: certificate.serial,
      issueDate: certificate.issue_date,
      expiryDate: certificate.expiry_date,
      personalNumber: w.pin,
      issuePlace: certificate.issued_place
    }
  })

  const hasForeignPassport = computed(() => Boolean(worker.value.foreign_passports?.length))

  const idForeignData = computed(() => {
    const w = worker.value
    const foreignPassport = w.foreign_passports?.[0] || {}
    return {
      photoUrl: photoUrl.value,
      surname: w.last_name,
      givenName: w.first_name,
      patronymic: w.middle_name,
      sex: sex.value,
      cardNumber: foreignPassport.serial_number,
      birthDate: w.birthday,
      birthPlace: w.region?.name,
      issueDate: foreignPassport.from_date,
      issuePlace: foreignPassport.given_place,
      expiryDate: foreignPassport.to_date,
      personalNumber: w.pin
    }
  })

  const hasPositionCertificate = computed(() => Boolean(worker.value.certificates?.length))

  const positionCertificatesData = computed(() => {
    const w = worker.value
    return (w.certificates || []).map((certificate) => ({
      photoUrl: photoUrl.value,
      cardNumber: certificate.number,
      fullName: [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' '),
      postName: certificate.post_name,
      issueDate: certificate.issue_date,
      expiryDate: certificate.expiry_date,
      extendedDate: certificate.extended_date,
      managerName: certificate.director?.name
    }))
  })
</script>

<template>
  <div v-if="store.workerPreview" class="flex flex-col gap-4">
    <SectionHeader :title="$t('workerView.tabs.e_documents')" :icon="JshirIcon">
      <DocumentTab
        class="mb-6"
        :tabs="tabList"
        :active-id="activeId"
        @update:active-id="activeId = $event"
      />

      <div class="w-full flex flex-col lg:flex-row gap-3 sm:gap-4 items-start justify-center">
        <template v-if="activeId === 1">
          <IdCard :data="idCardData" class="w-[100%] lg:w-[55%]" />
          <IdCardDetail :data="idCardData" class="w-[100%] h-[100%] lg:w-[45%]" />
        </template>

        <template v-else-if="activeId === 2">
          <template v-if="hasCertificate">
            <IdRailWay :data="idRailWayData" class="w-[100%] lg:w-[55%]" />
            <IdRailWayDetail :data="idRailWayData" class="w-[100%] h-[100%] lg:w-[45%]" />
          </template>
          <h4 v-else class="w-full text-center text-secondary">
            {{ $t('content.no-data') }}
          </h4>
        </template>

        <template v-else-if="activeId === 3">
          <template v-if="hasForeignPassport">
            <IdForeign :data="idForeignData" class="w-[100%] lg:w-[55%]" />
            <IdForeignDetail :data="idForeignData" class="w-[100%] h-[100%] lg:w-[45%]" />
          </template>
          <h4 v-else class="w-full text-center text-secondary">
            {{ $t('content.no-data') }}
          </h4>
        </template>

        <template v-else-if="activeId === 4">
          <div v-if="hasPositionCertificate" class="w-full flex flex-col gap-4">
            <IdRedCertificate
              v-for="(certificate, index) in positionCertificatesData"
              :key="certificate.cardNumber ?? index"
              :data="certificate"
              class="w-full"
            />
          </div>
          <h4 v-else class="w-full text-center text-secondary">
            {{ $t('content.no-data') }}
          </h4>
        </template>
      </div>
    </SectionHeader>
  </div>
</template>
