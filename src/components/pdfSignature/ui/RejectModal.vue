<script setup>
import {UIModal} from "@/components/index.js"
import {usePdfViewerStore, useSignatureStore} from "@/store/modules/index.js"

const store = usePdfViewerStore()
const signatureStore = useSignatureStore()

const emits = defineEmits(['onSuccessEv'])

const onSubmit = ()=>{
  store.documentVisible = false
  const data = {
    status:4,
    comment:store.documentComment,
    confirmation_id:store.signatureId,
    model: store.model,
  }
  signatureStore._rejectDocument(data, ()=>{

    emits('onSuccessEv')
  })

}
</script>

<template>
  <UIModal
      :width="500"
      :visible="store.documentVisible"
      @update:visible="(v)=>store.documentVisible = v"
      :title="$t('signature.rejectApplication')"
  >
    <template #default>
      <n-form
          ref="formRef"
          class="w-full grid grid-cols-12 gap-x-4 px-2"
      >
        <n-form-item
            class="col-span-12"
            :label="$t(`signature.comment`)"
            path="first_name">
          <n-input
              class="w-full"
              type="textarea"

              v-model:value="store.documentComment"
          />
        </n-form-item>

        <div class="col-span-12 mt-[10px]">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <n-button
                  @click="store.documentVisible=false"
                  :loading="signatureStore.rejectLoading"
                  type="error"
                  style="width: 100%"
                  ghost>
                {{ $t('content.cancel') }}
              </n-button>
            </div>
            <div class="col-span-6">
              <n-button
                  style="width: 100%"
                  @click="onSubmit"
                  :loading="signatureStore.rejectLoading"
                  type="primary">
                {{ $t('content.save') }}
              </n-button>
            </div>

          </div>
        </div>

      </n-form>
    </template>
  </UIModal>
</template>

<style scoped>

</style>