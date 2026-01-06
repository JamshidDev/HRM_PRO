<script setup>
  import { LockShield20Filled } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  const store = useAccountStore()
</script>

<template>
  <n-modal v-model:show="store.organizationVisible">
    <n-card
      style="width: 600px"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="bg-surface-ground!"
    >
      <div class="flex justify-center items-center mb-4">
        <span
          class="border-2 bg-indigo-200 border-primary shadow rounded-full flex justify-center items-center p-1"
        >
          <n-icon size="38" class="text-primary font-bold">
            <LockShield20Filled />
          </n-icon>
        </span>
      </div>
      <!--      <div class="py-2">-->
      <!--        <span class="text-xs text-secondary text-center">{{$t('account.changeRoleConfirm')}}</span>-->
      <!--      </div>-->
      <n-radio-group v-model:value="store.activeRole" class="w-full">
        <template v-for="(item, idx) in store.roleList" :key="idx">
          <div
            @click="store.changeAccount(item.id)"
            class="w-full border border-primary/30 rounded-sm mb-2 p-2 flex cursor-pointer relative bg-gradient-to-b from-primary/10 to-success/3"
          >
            <span style="width: 30px" class="flex justify-center items-center">
              <n-radio size="large" :value="item.id" class="pointer-events-none" />
            </span>
            <span class="flex flex-col pl-1" style="width: calc(100% - 30px)">
              <span class="text-sm font-semibold text-textColor2">{{ item.name }}</span>
              <span class="text-xs text-secondary">{{ item.full_name }}</span>
            </span>
            <span
              class="absolute text-xs right-[4px] top-[2px] border border-indigo-300 px-1 rounded-2xl text-primary bg-indigo-200 uppercase shadow"
              >{{ item.role }}</span
            >
          </div>
        </template>
      </n-radio-group>
    </n-card>
  </n-modal>
</template>
