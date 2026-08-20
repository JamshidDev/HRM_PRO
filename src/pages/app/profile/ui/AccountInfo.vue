<script setup>
  // Foydalanuvchining o'z hisob ma'lumotlari — faqat o'qish uchun.
  // Manba: accountStore.account (GET /v1/user/profile). Tahrirlash bu yerda yo'q:
  // FIO/JSHSHIR kadrlar bo'limi tomonidan xodim kartochkasida boshqariladi.
  import { CheckmarkCircle16Filled, Copy16Regular } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { UIPhoneNumber } from '@/components/index.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import InfoBox from '@/components/worker/ui/shared/InfoBox.vue'
  import UserIcon from '@/assets/icons/user.svg'
  import BriefcaseIcon from '@/assets/icons/figBriefcase.svg'

  const { t } = i18n.global
  const store = useAccountStore()

  // Telefon/JSHSHIR ko'pincha ariza yoki murojaatga ko'chiriladi — qo'lda terish
  // o'rniga nusxalash tugmasi. Xatolik toast'ini Utils o'zi chiqaradi.
  const copy = (value) => {
    if (!value) return
    Utils.copyToClipboard(String(value), () => $Toast.success(t('profilePage.copied')))
  }

  const worker = computed(() => store.account?.worker ?? null)

  // Rollar profil javobida yo'q (u faqat JORIY rolni qaytaradi), shuning uchun
  // barcha rol+korxona juftliklari alohida endpointdan olinadi — hisoblar
  // almashtirish modali ishlatadigan o'sha ro'yxat (`GET /v1/user/roles`).
  onMounted(() => {
    store._roles()
  })
</script>

<template>
  <div class="flex flex-col gap-4">
    <SectionHeader :title="$t('profilePage.account.title')" :icon="UserIcon" large>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InfoBox :label="$t('profilePage.form.lastName')" :value="worker?.last_name" />
        <InfoBox :label="$t('profilePage.form.firstName')" :value="worker?.first_name" />
        <InfoBox :label="$t('profilePage.form.middleName')" :value="worker?.middle_name" />
        <InfoBox :label="$t('profilePage.form.phone')">
          <template #value>
            <span class="flex items-center gap-2">
              <UIPhoneNumber :phone="store.account?.phone" fallback="—" />
              <n-tooltip v-if="store.account?.phone" trigger="hover">
                <template #trigger>
                  <n-icon
                    size="16"
                    class="text-textColor3 hover:text-primary cursor-pointer shrink-0"
                    @click="copy(store.account?.phone)"
                  >
                    <Copy16Regular />
                  </n-icon>
                </template>
                {{ $t('profilePage.copy') }}
              </n-tooltip>
            </span>
          </template>
        </InfoBox>
        <InfoBox :label="$t('profilePage.form.pin')">
          <template #value>
            <span class="flex items-center gap-2">
              <span>{{ worker?.pin ?? '—' }}</span>
              <n-tooltip v-if="worker?.pin" trigger="hover">
                <template #trigger>
                  <n-icon
                    size="16"
                    class="text-textColor3 hover:text-primary cursor-pointer shrink-0"
                    @click="copy(worker?.pin)"
                  >
                    <Copy16Regular />
                  </n-icon>
                </template>
                {{ $t('profilePage.copy') }}
              </n-tooltip>
            </span>
          </template>
        </InfoBox>
      </div>
    </SectionHeader>

    <SectionHeader :title="$t('profilePage.roles.title')" :icon="BriefcaseIcon" large>
      <n-spin :show="store.roleLoading">
        <div v-if="store.roleList.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="item in store.roleList"
            :key="item.key"
            class="role-row flex flex-col gap-1.5 rounded-3xl px-4 py-3"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="text-sm font-semibold text-primary bg-primary/10 rounded-full px-3 py-1"
              >
                {{ item.role }}
              </span>
              <n-tooltip v-if="item.key === store.activeRole" trigger="hover">
                <template #trigger>
                  <n-icon size="18" class="text-success">
                    <CheckmarkCircle16Filled />
                  </n-icon>
                </template>
                {{ $t('profilePage.roles.current') }}
              </n-tooltip>
            </div>
            <span class="text-xs text-textColor3 break-words">{{ item.name }}</span>
          </div>
        </div>
        <n-empty v-else-if="!store.roleLoading" :description="$t('profilePage.roles.empty')" class="py-6" />
      </n-spin>
    </SectionHeader>
  </div>
</template>

<style scoped>
  /* InfoBox bilan bir xil fon — rollar qatori qo'shni kartochkalardan ajralib
     turmasligi uchun (InfoBox'ning o'zi bu yerda ishlamaydi: unda `label` doim
     alohida qator egallaydi, bizga esa nom va korxona bitta qatorda kerak). */
  .role-row {
    background-color: #f9fafb;
  }

  [data-theme='dark'] .role-row {
    background-color: var(--surface-ground);
  }
</style>
