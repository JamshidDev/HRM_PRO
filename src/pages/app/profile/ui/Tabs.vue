<script setup>
import {useAccountStore} from "@/store/modules/app/accountStore.js";
import Form from "./Form.vue"
import OrgForm from "./OrgForm.vue"
const store = useAccountStore()
</script>

<template>
  <n-tabs animated v-model:value="store.activeTab" type="bar">
    <n-tab-pane :name="store.tabs[0]" :tab="$t('profilePage.tabs.profileInfo')">
      <div class="w-full border border-surface-line shadow bg-surface-section rounded-xl p-4 form--min-height">
        <div class=" border border-surface-line border-dashed p-4 mb-4 rounded-lg bg-surface-ground">
          <Form/>
        </div>
        <div class=" border border-surface-line border-dashed p-4 mb-2 rounded-lg bg-surface-ground">
          <h2 class="mb-4 text-xl text-primary text-center">
            {{$t('profilePage.org.title')}}
          </h2>
          <OrgForm/>
        </div>
      </div>
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[1]" :tab="$t('profilePage.tabs.notification')">
      <template #tab>
        <n-badge type="info" :value="9" :offset="[12,0]">
          {{$t('profilePage.tabs.notification')}}
        </n-badge>
      </template>
      <div class="w-full border border-surface-line shadow bg-surface-section rounded-xl p-4 form--min-height">
        {{$t('profilePage.tabs.notification')}}
      </div>
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[2]" :tab="$t('profilePage.tabs.secure')">
      <div class="w-full border border-surface-line shadow bg-surface-section rounded-xl p-4 form--min-height">
        {{$t('profilePage.tabs.secure')}}
      </div>
    </n-tab-pane>
    <n-tab-pane :name="store.tabs[3]" :tab="$t('profilePage.tabs.actionHistory')">
      <div class="w-full border border-surface-line shadow bg-surface-section rounded-xl p-4 form--min-height">
        {{$t('profilePage.tabs.actionHistory')}}
      </div>
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>
  .form--min-height {
    min-height:calc(100vh - 340px)
  }
</style>