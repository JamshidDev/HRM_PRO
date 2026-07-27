<script setup>
  import { ref, computed } from 'vue'
  import i18n from '@/i18n/index.js'

  import photo from '@/assets/images/content/profilePhoto.avif'
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

  const { t } = i18n.global

  const activeId = ref(1)

  const tabList = computed(() => [
    { id: 1, label: t('workerView.Edocument.pasport'), icon: IdCardIcon },
    { id: 2, label: t('workerView.Edocument.railway_pasport'), icon: IdCardIcon },
    { id: 3, label: t('workerView.Edocument.foreign_pasport'), icon: IdCardIcon }
  ])

  const idCardData = {
    photoUrl: photo,
    surname: 'ABDUSAMADOV',
    givenName: 'SHAXZODBEK',
    patronymic: 'OLIMJON OGLI',
    nationality: "O'ZBEKISTON",
    sex: 'M',
    birthDate: '2006-01-10',
    issueDate: '2022-02-12',
    expiryDate: '2032-02-12',
    cardNumber: 'AD0131718',
    personalNumber: '50978037640051',
    birthPlace: 'JIZZAX',
    issuePlace: 'JIZZAX VILOYATI',
    birthCountry: "O'ZBEKISTON"
  }

  const idRailWayData = {
    photoUrl: photo,
    surname: 'ABDUSAMADOV',
    givenName: 'SHAXZODBEK',
    patronymic: 'OLIMJON OGLI',
    sex: 'M',
    cardNumber: 'UTA-165876',
    issueDate: '18.09.2025',
    expiryDate: '18.09.2025',
    personalNumber: '65978451212',
    issuePlace: 'Qo’qon MTU'
  }

  const idForeignData = {
    photoUrl: photo,
    surname: 'ABDUSAMADOV',
    givenName: 'SHAXZODBEK',
    patronymic: 'OLIMJON OGLI',
    sex: 'M',
    cardNumber: 'FA1234567',
    birthDate: '2006-01-10',
    birthPlace: 'JIZZAX',
    issueDate: '2025-09-18',
    issuePlace: 'JIZZAX IIB',
    expiryDate: '2030-09-18'
  }
  
</script>

<template>
  <div>
    <!-- <h2 class="text-xl sm:text-xl font-bold text-textColor0 mb-4">Hujjatlar</h2> -->

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
          <IdRailWay :data="idRailWayData" class="w-[100%] lg:w-[55%]" />
          <IdRailWayDetail :data="idRailWayData" class="w-[100%] h-[100%] lg:w-[45%]" />
        </template>

        <template v-else-if="activeId === 3">
          <IdForeign :data="idForeignData" class="w-[100%] lg:w-[55%]" />
          <IdForeignDetail :data="idForeignData" class="w-[100%] h-[100%] lg:w-[45%]" />
        </template>
      </div>
    </SectionHeader>
  </div>
</template>
