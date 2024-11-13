<script setup>
import {BranchCompare16Filled} from "@vicons/fluent"
import {useAccountStore} from "@/store/modules/index.js"
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
        class="!bg-gradient-to-t from-blue-300 to-surface-50"
    >
      <div class="flex justify-center items-center">
        <span class=" border-2 bg-indigo-200 border-indigo-200 shadow rounded-full flex justify-center items-center p-1">
          <n-icon size="38" class="text-indigo-800 font-bold">
          <BranchCompare16Filled/>
        </n-icon>
        </span>

      </div>
      <div class="py-2">
        <span class="text-xs text-gray-500 text-center">{{$t('account.changeRoleConfirm')}}</span>
      </div>
      <n-radio-group
          v-model:value="store.activeRole"
          class="w-full"
      >
        <template v-for="(item, idx) in store.roleList" :key="idx">
          <div
              @click="store.changeAccount(item.id)"
              class="w-full border border-indigo-200 rounded mb-2 p-2 flex cursor-pointer relative bg-indigo-100">
          <span style="width:30px" class="flex justify-center items-center">
            <n-radio size="large" :value="item.id" class="pointer-events-none" />
          </span>
            <span
                class="flex flex-col pl-1"
                style="width: calc(100% - 30px)">
              <span class="text-sm font-bold text-gray-600">{{item.name}}</span>
              <span class="text-xs text-gray-400">{{item.full_name}}</span>
          </span>
            <span class="absolute text-xs right-[4px] top-[2px] border border-indigo-300 px-1 rounded-2xl text-primary bg-indigo-200 uppercase shadow">{{item.role}}</span>
          </div>
        </template>
      </n-radio-group>


    </n-card>
  </n-modal>
</template>
