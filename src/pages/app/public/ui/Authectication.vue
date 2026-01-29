<script setup>
  import { usePublicStore } from '@/store/modules/index.js'
  import {
    DismissCircle48Filled,
    Call16Filled,
    Eye24Regular,
    EyeOff20Filled,
    LockClosed16Filled,
    LockMultiple24Filled
  } from '@vicons/fluent'
  import validationRules from '@/utils/validationRules.js'
  import { UIModal } from '@/components/index.js'

  const store = usePublicStore()
  const formRef = ref(null)
  const route = useRoute()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store._loginToSystem()
      }
    })
  }

  const closeQuizEv = () => {
    store.list = []
  }

  const showAnswer = computed(() => {
    return route.path.includes('worker-exams') && store.existFile
  })
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="flex justify-center" v-if="showAnswer">
      <n-button
        @click="closeQuizEv"
        v-if="store.list.length > 0"
        type="error"
        :loading="store.detailLoading"
      >
        <template #icon>
          <n-icon size="26">
            <DismissCircle48Filled />
          </n-icon>
        </template>
        {{ $t('publicPage.closeQuestion') }}</n-button
      >
      <n-button v-else type="primary" @click="store._getDetailExam" :loading="store.detailLoading">
        <template #icon>
          <n-icon size="26">
            <LockMultiple24Filled />
          </n-icon>
        </template>
        {{ $t('publicPage.authentication') }}</n-button
      >
    </div>
    <UIModal :width="400" v-model:visible="store.loginVisible">
      <template #header>
        <div></div>
      </template>
      <n-form
        ref="formRef"
        :rules="validationRules.login"
        :model="store.loginPayload"
        class="flex flex-col mt-4"
      >
        <n-form-item class="text-textColor2!" :label="$t(`loginPage.phone`)" path="phone">
          <n-input
            size="large"
            name="phone"
            id="phone"
            type="text"
            v-mask="'+998(##)#######'"
            @paste="
              (e) => {
                let a = e.clipboardData.getData('text').replaceAll(' ', '')
                if (a.length > 9) store.phone = ''
              }
            "
            v-model:value="store.loginPayload.phone"
          >
            <template #prefix>
              <n-icon class="text-textColor3!" size="24" :component="Call16Filled" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item
          :label="$t(`loginPage.password`)"
          path="password"
          class="m6-8 text-textColor2!"
        >
          <n-input
            size="large"
            name="password"
            id="password"
            type="password"
            show-password-on="click"
            :maxlength="16"
            v-model:value="store.loginPayload.password"
          >
            <template #prefix>
              <n-icon class="text-textColor3!" size="24" :component="LockClosed16Filled" />
            </template>

            <template #password-visible-icon>
              <n-icon :size="20" :component="EyeOff20Filled" />
            </template>
            <template #password-invisible-icon>
              <n-icon :size="20" :component="Eye24Regular" />
            </template>
          </n-input>
        </n-form-item>
        <div class="grid">
          <n-button type="primary" size="large" :loading="store.loginLoading" @click="onSubmit"
            >{{ $t(`loginPage.login`) }}
          </n-button>
        </div>
      </n-form>
    </UIModal>
  </div>
</template>
