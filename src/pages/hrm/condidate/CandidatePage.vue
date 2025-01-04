<script setup>
import {UIPageContent, UIDConfirm} from "@/components/index.js"
import PersonalForm from "./ui/PersonalForm.vue"
import PassportFrom from "./ui/PassportFrom.vue"
import PhotoForm from "./ui/PhotoForm.vue"
import PhoneForm from "./ui/PhoneForm.vue"
import {useComponentStore, useCreateWorkerStore} from "@/store/modules/index.js"
import {ArrowLeft12Regular, Save16Regular} from "@vicons/fluent"
import router from "@/router/index.js"

const store = useCreateWorkerStore()
const componentStore = useComponentStore()
const personalFormRef = ref(null)

const save = ()=>{
  personalFormRef.value.onSubmit()
}

const onClose = ()=>{
  store.warningVisible = false
  store.successVisible = false
}

const onSave = ()=>{
    store.successVisible = false
}


</script>

<template>
  <UIPageContent>
    <div class="col-span-12 flex mb-4">
      <n-button
          @click="router.go(-1)"
          :loading="store.saveLoading"
          quaternary
          icon-placement="left"
          class="bg-[transparent]"
          size="small"
      >
        <template #icon>
          <n-icon>
            <ArrowLeft12Regular/>
          </n-icon>
        </template>
        {{$t('content.back')}}
      </n-button>
    </div>
    <n-steps vertical>
      <n-step
          :title="$t('createWorkerPage.step.personal')"
      >
        <template #default>
          <PersonalForm ref="personalFormRef" />
        </template>

      </n-step>
      <n-step
          :title="$t('createWorkerPage.step.pasport')"
      >
        <template #default>
          <PassportFrom/>
        </template>
      </n-step>
      <n-step
          :title="$t('createWorkerPage.step.photo')"
      >
        <template #default>
          <PhotoForm
              v-model:images="store.candidatePhotos"
              v-model:main-image-id="store.mainImageId"
          />
          <span class="text-xs text-gray-400">{{$t('createWorkerPage.ui.image')}}</span>
        </template>
      </n-step>
      <n-step :title="$t('createWorkerPage.step.phone')">
        <template #default>
          <PhoneForm
              v-model:phones="store.candidatePhones"
          />
        </template>
      </n-step>

    </n-steps>
    <UIDConfirm
        v-model:visible="store.warningVisible"
        type="warning"
        @onClose="onClose"
    >
      <div>
        <h3 class="text-center text-2xl font-semibold uppercase">{{$t('createWorkerPage.toast.warning.title')}}</h3>
        <p class="text-gray-400 text-center">{{$t('createWorkerPage.toast.warning.subtitle')}}</p>

      </div>
    </UIDConfirm>
    <UIDConfirm
        v-model:visible="store.successVisible"
        type="success"
        @onClose="onClose"
        @onSave="onSave"
        :submit-btn-text="'content.continue'"
        :close-btn-text="'content.closeAndClear'"
    >
      <div>
        <h3 class="text-center text-2xl font-semibold uppercase">{{$t('createWorkerPage.toast.success.title')}}</h3>
        <p class="text-gray-400 text-center mt-2 text-xs leading-3">{{$t('createWorkerPage.toast.success.subtitle')}}</p>

      </div>
    </UIDConfirm>


    <div class="col-span-12 flex justify-end">
      <n-button
          type="primary"
          icon-placement="right"
          @click="save"
          :loading="store.saveLoading"
      >
        <template #icon>
          <n-icon>
            <Save16Regular/>
          </n-icon>
        </template>
        {{$t('content.save')}}
      </n-button>
    </div>

  </UIPageContent>
</template>