<script setup>
import {UIPageContent} from "@/components/index.js"
import PersonalForm from "./ui/PersonalForm.vue"
import PassportFrom from "./ui/PassportFrom.vue"
import PhotoForm from "./ui/PhotoForm.vue"
import PhoneForm from "./ui/PhoneForm.vue"
import {useComponentStore, useCreateWorkerStore} from "@/store/modules/index.js"
import {ArrowLeft12Regular, Save16Regular} from "@vicons/fluent"

const store = useCreateWorkerStore()
const componentStore = useComponentStore()
const personalFormRef = ref(null)

const save = ()=>{
  personalFormRef.value.onSubmit()
  console.log(store.passport)
}

const currentStatus = ref('process')
const current = ref(1)

</script>

<template>
  <UIPageContent>
    <div class="col-span-12 flex mb-4">
      <n-button
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


    <div class="col-span-12 flex justify-end">
      <n-button
          type="primary"
          icon-placement="right"
          @click="save"
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