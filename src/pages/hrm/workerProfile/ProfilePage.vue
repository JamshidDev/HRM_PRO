<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import Tabs from './ui/Tabs.vue'
  import ProfileTabs from './ui/ProfileTabs.vue'
  import { useWorkerProfileStore, useComponentStore } from '@/store/modules/index.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const route = useRoute()
  const router = useRouter()
  const store = useWorkerProfileStore()
  const componentStore = useComponentStore()

  // Figma "Status Toggle" (node 2584:199893) — har bobning o'z ikonkasi bor
  const tabIcons = {
    personal: icons.figUserAlt,
    career: icons.figBriefcase,
    education: icons.figGraduationHat,
    relative: icons.figUsers,
    others: icons.figDotsHorizontal
  }

  const tabList = computed(() =>
    store.tabs.map((item) => ({
      id: item.id,
      name: t(item.name),
      icon: tabIcons[item.key]
    }))
  )

  const goBack = () => router.back()

  // Boblar lazy mount bo'lgani uchun xodim ma'lumoti sahifa darajasida yuklanadi —
  // aks holda 1-bobga kirmasdan 2-bobga o'tilganda lavozim ro'yxati bo'sh qolardi.
  onMounted(() => {
    store.anotherProfile = null
    store.isExistAccount = false
    store.photos = []
    store.activeTab = 1

    store.elementId = route.query.id
    store._index()
    store._indexPassport()
    store._indexForeignPassport()
    componentStore._enums()
    componentStore._nationality()
  })
</script>

<template>
  <div class="profile-page flex flex-col gap-5">
    <!-- Orqaga va boblar bitta qatorda; skroll paytida tepada yopishib turadi -->
    <div class="profile-header">
      <button type="button" class="profile-back" @click="goBack">
        <n-icon :size="18" class="shrink-0">
          <component :is="icons.figArrowLeft" />
        </n-icon>
        {{ $t('content.back') }}
      </button>

      <ProfileTabs :tabs="tabList" v-model="store.activeTab" />
    </div>

    <Tabs />
  </div>
</template>

<style lang="scss" scoped>
  // Maketda tana 16px chetdan turadi va sahifa foni kartalardan ochroq.
  // Tepa padding sarlavha panelining o'zida — u chetdan chetgacha yopishib turadi.
  .profile-page {
    width: 100%;
    padding: 0 16px 16px;
    background: var(--surface-ground);
  }

  // Manfiy margin sahifa gorizontal paddingini qoplaydi, shunda yopishgan panel
  // ostidan skroll qilinayotgan kartalarning chetlari ko'rinib qolmaydi.
  .profile-header {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin: 0 -16px;
    padding: 16px;
    background: var(--surface-ground);
  }

  .profile-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 36px;
    padding: 10px 16px 10px 12px;
    border: none;
    border-radius: 8px;
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.85;
    }
  }
</style>
