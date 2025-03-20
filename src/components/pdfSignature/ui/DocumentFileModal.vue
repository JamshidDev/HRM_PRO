<script setup>
import {UIModal, UIUpload} from "@/components/index.js"
import {MailAttach16Regular, AttachText20Regular, Save16Filled, ArrowCircleLeft24Regular} from "@vicons/fluent"
import {usePdfViewerStore} from "@/store/modules/index.js"


const store = usePdfViewerStore()

const emits = defineEmits(['onUpdate'])

const onSubmit = ()=>{
  store.documentVisible = false

  const formData = new FormData()


  formData.append('document_id', store.document_id)
  formData.append('model', store.model)

  if(store.typeAttach === 2 && store.attachFiles.length>0){
    store.attachFiles.forEach(v=>{
      formData.append('files',v.file)
    })
    store._attachFile(formData, ()=>{
      emits("onUpdate")
    })


  }else if(store.typeAttach === 1 && store.workerApplications.length>0){
    formData.append('status', 'application')
    formData.append('worker_applications', store.workerApplications?.toString())
    store._attachFile(formData, ()=>{
      emits("onUpdate")
    })
  }





  // signatureStore._rejectDocument(data, ()=>{
  //   emits('onSuccessEv')
  // })
}

const onNext = (v)=>{
  if(v ===1){
    const params = {
      model:store.model,
      document_id:store.document_id,
      per_page:100,
    }
    store._documentApplications(params)
  }
  store.typeAttach = v
  store.attachActiveTab = 2

}
</script>

<template>
  <UIModal
      :width="500"
      :visible="store.attachVisible"
      @update:visible="(v)=>store.attachVisible = v"
      :title="$t('documentPage.attach.title')"
  >
    <template #default>
      <n-form
          ref="formRef"
          class="w-full"
      >
        <n-tabs animated v-model:value="store.attachActiveTab" class="hidden-tab-header" type="segment">
          <n-tab-pane :name="store.attachTabs[0].id">
            <div class="flex flex-col mb-6 gap-4 h-[120px]">
              <div
                  @click="onNext(1)"
                  class="flex border border-surface-line p-2 rounded-lg items-center gap-4 cursor-pointer">
                <div class="w-[30px] h-[30px] flex justify-center items-center cursor-pointer rounded-md bg-warning">
                  <n-icon size="24" class="text-white">
                    <MailAttach16Regular/>
                  </n-icon>
                </div>
                <div class="text-textColor1 font-semibold" style="width: calc(100% - 40px)">
                  {{$t('documentPage.attach.attachApplication')}}
                </div>
              </div>

              <div
                  @click="onNext(2)"
                  class="flex border border-surface-line p-2 rounded-lg items-center gap-4 cursor-pointer">
                <div class="w-[30px] h-[30px] flex justify-center items-center cursor-pointer rounded-md bg-primary">
                  <n-icon size="24" class="text-white">
                    <AttachText20Regular/>
                  </n-icon>
                </div>
                <div class="text-textColor1 font-semibold" style="width: calc(100% - 40px)">
                  {{$t('documentPage.attach.attachFile')}}
                </div>
              </div>
            </div>

          </n-tab-pane>


          <n-tab-pane :name="store.attachTabs[1].id">


            <template v-if="store.typeAttach === 1">
              <n-select
                  size="large"
                  multiple
                  v-model:value="store.workerApplications"
                  filterable
                  :placeholder="$t(`content.choose`)"
                  :options="store.documentApplications"
                  label-field="name"
                  value-field="id"
                  :loading="store.docApplicationLoading"
              />
            </template>
            <template v-else>
              <UIUpload v-model:files="store.attachFiles"/>
            </template>


            <div class="grid grid-cols-12 gap-4 mt-8">
              <div class="col-span-6">
                <n-button
                    style="width: 100%"
                    @click="store.attachActiveTab = 1"
                    secondary
                    :loading="store.attachLoading"
                    type="error">
                  <template #icon>
                    <ArrowCircleLeft24Regular/>
                  </template>
                  {{$t('content.back')}}
                </n-button>
              </div>
              <div class="col-span-6">
                <n-button
                    @click="onSubmit"
                    style="width: 100%"
                    secondary
                    icon-placement="right"
                    :loading="store.attachLoading"
                    type="primary">
                  <template #icon>
                    <Save16Filled/>
                  </template>
                  {{$t('content.save')}}
                </n-button>
              </div>

            </div>
          </n-tab-pane>
        </n-tabs>
      </n-form>
    </template>
  </UIModal>
</template>

<style scoped>

</style>