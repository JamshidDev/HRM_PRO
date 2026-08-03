<script setup>
  import { Briefcase16Regular, Dismiss24Regular } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import OrgSwitchIllustration from '@/assets/images/content/organization-switch.png'

  const store = useAccountStore()
</script>

<template>
  <UIModal v-model:visible="store.organizationVisible" :width="640" :persistent="false">
    <template #header>
      <div class="flex items-center justify-between px-4 py-2">
        <h3 class="text-2xl font-bold text-textColor0">{{ $t('content.changeAccount') }}</h3>
        <div
          @click="store.organizationVisible = false"
          class="w-9 h-9 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
        >
          <n-icon size="18" class="text-textColor2">
            <Dismiss24Regular />
          </n-icon>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div
        v-for="(item, idx) in store.roleList"
        :key="idx"
        class="relative overflow-hidden rounded-2xl bg-surface-ground p-5 cursor-pointer transition-colors hover:bg-surface-line/60"
        @click="store.changeAccount(item)"
      >
        <img
          :src="OrgSwitchIllustration"
          alt=""
          class="pointer-events-none select-none absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 object-contain"
        />
        <div class="relative z-10 flex items-center gap-2">
          <span class="text-lg font-semibold text-textColor0">{{ item.name }}</span>
          <span class="text-sm font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
            {{ item.role }}
          </span>
        </div>
        <div class="relative z-10 flex items-center gap-2 mt-1.5 text-sm text-textColor3">
          <n-icon size="16" class="shrink-0">
            <Briefcase16Regular />
          </n-icon>
          <span>{{ item.full_name }}</span>
        </div>
      </div>
    </div>
  </UIModal>
</template>
