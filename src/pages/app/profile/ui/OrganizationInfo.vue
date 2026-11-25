<script setup>
  // Profil «Korxona ma'lumotlari» (profile-organization-info-read) — faol roldagi korxona rekvizitlari.
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import InfoBox from '@/components/worker/ui/shared/InfoBox.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  import BriefcaseIcon from '@/assets/icons/figBriefcase.svg'
  import i18n from '@/i18n/index.js'

  const store = useAccountStore()
  const org = ref(null)
  const loading = ref(false)

  const localName = computed(() => {
    const o = org.value
    if (!o) return null
    const lang = i18n.global.locale
    return (lang === 'ru' && o.name_ru) || (lang === 'en' && o.name_en) || o.name
  })
  const regionText = computed(() => [org.value?.region, org.value?.city].filter(Boolean).join(', ') || null)

  const load = () => {
    loading.value = true
    $ApiService.accountService
      ._myOrganization()
      .then((res) => (org.value = res.data.data))
      .finally(() => (loading.value = false))
  }

  onMounted(load)
  // Akkaunt (rol/korxona) almashsa — qayta yuklanadi.
  watch(() => store.activeRole, load)
</script>

<template>
  <SectionHeader :title="$t('profilePage.orgInfo.title')" :icon="BriefcaseIcon" large>
    <n-spin :show="loading">
      <div v-if="org" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoBox :label="$t('profilePage.orgInfo.name')" :value="localName" />
        <InfoBox :label="$t('profilePage.orgInfo.code')" :value="org.code" />
        <InfoBox class="md:col-span-2" :label="$t('profilePage.orgInfo.fullName')" :value="org.full_name" />
        <InfoBox :label="$t('profilePage.orgInfo.inn')" :value="org.inn" />
        <InfoBox :label="$t('profilePage.orgInfo.region')" :value="regionText" />
        <InfoBox class="md:col-span-2" :label="$t('profilePage.orgInfo.address')" :value="org.address" />
        <InfoBox class="md:col-span-2" :label="$t('profilePage.orgInfo.parent')" :value="org.parent?.full_name || org.parent?.name" />
      </div>
      <div v-else-if="!loading" class="py-8 text-center text-sm text-textColor3">
        {{ $t('profilePage.orgInfo.empty') }}
      </div>
    </n-spin>
  </SectionHeader>
</template>
