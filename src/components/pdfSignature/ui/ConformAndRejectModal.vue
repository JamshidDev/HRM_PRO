<script setup>
import {UIModal} from "@/components/index.js"
import {usePdfViewerStore, useApplicationStore} from "@/store/modules/index.js"

const store = usePdfViewerStore()
const applicationStore = useApplicationStore()


const onSubmit = ()=>{
  store.applicationVisible = false

  const data = {
    status:store.appButtonType,
    comment:store.applicationComment,
  }
  const id = store.document_id
  applicationStore._accept(data,id)

}
</script>

<template>
  <UIModal
      :width="500"
      :visible="store.applicationVisible"
      @update:visible="(v)=>store.applicationVisible = v"
      :title="store.appButtonType? $t('signature.acceptApplication') : $t('signature.rejectApplication')"
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

              v-model:value="store.applicationComment"
          />
        </n-form-item>

        <div class="col-span-12 mt-[10px]">
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <n-button
                  @click="store.applicationVisible=false"
                  :loading="applicationStore.acceptLoading"
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
                  :loading="applicationStore.acceptLoading"
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