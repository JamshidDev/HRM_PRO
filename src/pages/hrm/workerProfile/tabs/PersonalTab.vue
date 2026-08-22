<script setup>
  import { v4 as uuidv4 } from 'uuid'
  import icons from '@/assets/icons'
  import { UIProfileButton, UIProfileEmpty, UIFigBlock } from '@/components/index.js'
  import { useWorkerProfileStore } from '@/store/modules/index.js'
  import PhotoBlock from '../ui/blocks/PhotoBlock.vue'
  import PersonalInfoBlock from '../ui/blocks/PersonalInfoBlock.vue'
  import PhoneBlock from '../ui/blocks/PhoneBlock.vue'
  import PassportBlock from '../ui/blocks/PassportBlock.vue'

  /** Figma "Shaxsiy" bobi (node 2584:199394) — ma'lumot ProfilePage'da yuklanadi */
  const store = useWorkerProfileStore()

  const MAX_PASSPORTS = 3

  // Saqlanmagan yozuv turgan bo'lsa yangisini qo'shishga yo'l qo'yilmaydi
  const canAddPassport = computed(
    () =>
      store.passportList.filter((v) => !v.exist).length === 0 &&
      store.passportList.length < MAX_PASSPORTS
  )
  const canAddForeign = computed(
    () =>
      store.foreignPassportList.filter((v) => !v.exist).length === 0 &&
      store.foreignPassportList.length < MAX_PASSPORTS
  )

  const onAddPassport = () => {
    store.passportList.push({
      id: uuidv4(),
      serial_number: null,
      address: null,
      from_date: null,
      to_date: null,
      file: null,
      exist: false
    })
  }

  const onAddForeign = () => {
    store.foreignPassportList.push({
      id: uuidv4(),
      serial_number: null,
      given_place: null,
      from_date: null,
      to_date: null,
      file: null,
      exist: false
    })
  }
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <PhotoBlock />
    <PersonalInfoBlock />
    <PhoneBlock />

    <n-spin :show="store.passportLoading">
      <div class="flex flex-col gap-4">
        <template v-if="store.passportList.length">
          <PassportBlock v-for="item in store.passportList" :key="item.id" :item="item" />
          <div v-if="canAddPassport" class="flex justify-end">
            <UIProfileButton variant="brand" size="sm" :icon="icons.figPlus" @click="onAddPassport">
              {{ $t('workerProfile.personal.addPassport') }}
            </UIProfileButton>
          </div>
        </template>

        <!-- Ro'yxat bo'sh: karta sarlavhasi joyida qoladi, ichida bo'sh holat ko'rinadi -->
        <UIFigBlock
          v-else
          :title="$t('createWorkerPage.form.passportTitle')"
          :icon="icons.figIdCard"
        >
          <UIProfileEmpty bare />
          <template #actions>
            <UIProfileButton variant="brand" size="sm" :icon="icons.figPlus" @click="onAddPassport">
              {{ $t('content.add') }}
            </UIProfileButton>
          </template>
        </UIFigBlock>
      </div>
    </n-spin>

    <n-spin :show="store.foreignPassportLoading">
      <div class="flex flex-col gap-4">
        <template v-if="store.foreignPassportList.length">
          <PassportBlock
            v-for="item in store.foreignPassportList"
            :key="item.id"
            :item="item"
            foreign
          />
          <div v-if="canAddForeign" class="flex justify-end">
            <UIProfileButton variant="brand" size="sm" :icon="icons.figPlus" @click="onAddForeign">
              {{ $t('workerProfile.personal.addForeignPassport') }}
            </UIProfileButton>
          </div>
        </template>

        <UIFigBlock
          v-else
          :title="$t('createWorkerPage.form.foreignPassportTitle')"
          :icon="icons.figIdCard"
        >
          <UIProfileEmpty bare />
          <template #actions>
            <UIProfileButton variant="brand" size="sm" :icon="icons.figPlus" @click="onAddForeign">
              {{ $t('content.add') }}
            </UIProfileButton>
          </template>
        </UIFigBlock>
      </div>
    </n-spin>
  </div>
</template>
