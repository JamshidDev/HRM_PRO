<!-- ui/Edocument/Edocument.vue -->
<script setup>
import { ref, computed } from "vue"

import photo from "@/assets/images/content/profilePhoto.avif"
import IdCardIcon from "@/assets/icons/jshirIcon.svg"
import DocumentTab from "./shared/DocumentTab.vue"
import IdCard from "../../ui/IdCard.vue"
import IdForeign from "../../ui/IdForeign.vue"
import IdRailWay from "../../ui/IdRailWay.vue"

const activeId = ref(1)

const tabList = computed(() => [
  { id: 1, label: "Shaxsiy guvohnoma", icon: IdCardIcon },
  { id: 3, label: "Temiryol guvohnoma", icon: IdCardIcon },
  { id: 2, label: "Qizil guvohnoma", icon: IdCardIcon }

])


const idCardData = {
  photoUrl: photo,
  surname: "MANNONOV",
  givenName: "SHAHRIYOR",
  patronymic: "ABDURASHID OGLI",
  nationality: "O'ZBEKISTON",
  sex: "M",
  birthDate: "2005-01-10",
  issueDate: "2021-02-12",
  expiryDate: "2031-02-12",
  cardNumber: "AD0131718",
  personalNumber: "50208037340059",
  birthPlace: "TOSHKENT",
  issuePlace: "TOSHKENT SHAHRI",
  birthCountry: "O'ZBEKISTON"
}

const activeDocument = computed(() => documents.value.find((d) => d.id === activeId.value))


</script>

<template>
  <div>
    <h2 class="text-2xl font-bold text-textColor0 mb-4">Hujjatlar</h2>
    <DocumentTab
      class="mb-6"
      :tabs="tabList"
      :active-id="activeId"
      @update:active-id="activeId = $event"
    />
        <div class=" flex justify-center  ">
            <IdCard v-if="activeId === 1" :data="idCardData" />
            <IdForeign v-else-if="activeId === 2" :data="idForeignData" />
            <IdRailWay v-else-if="activeId === 3" :data="idRailWayData" />
        </div>
  </div>
</template>