<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useComponentStore, useTurnstileHikCentralWorkerStore } from '@/store/modules/index.js'
  import { NoDataIllustration, UITransferSelect } from '@/components/index.js'
  import { Checkmark16Filled, AddCircle16Filled } from '@vicons/fluent'
  import { UICropper } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@/utils/Utils'

  const formRef = ref(null)
  const store = useTurnstileHikCentralWorkerStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.editPayload.photo = store.payload.photo
        store.editPayload.blob = store.payload.blob
        store.editPayload.photo_id = store.payload.photo_id
        store.editPayload.access_level_ids = store.payload.access_level_ids
        store.editPayload.to = store.payload.end_time
          ? Utils.timeToZone(store.payload.end_time)
          : null

        store._updateFace()
      }
    })
  }

  const toggleImage = (v) => {
    if (store.payload.photo_index === v) {
      store.payload.photo_id = null
      store.payload.photo = null
      store.payload.photo_index = null
    } else {
      if (store.photos[v]?.id) {
        store.payload.photo_id = store.photos[v]?.id
        store.payload.photo = null
        store.payload.blob = null
      } else {
        store.payload.photo = store.photos[v].photo
        store.payload.blob = store.photos[v].blob
        store.payload.photo_id = null
      }
      store.payload.photo_index = v
    }
  }

  const cropperRef = ref(null)

  const openCropper = () => {
    cropperRef.value.openFile()
  }

  const onResult = (v) => {
    store.photos.push({
      photo: v.imgUrl,
      blob: v.blob
    })
  }
</script>

<template>
  <n-spin :show="false">
    <div class="overflow-y-auto">
      <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
        class="flex flex-col"
      >
        <n-form-item
          :label="$t(`turnstile.hcWorkersPage.access_levels`)"
          path="access_level_ids"
          rule-path="requiredMultiSelectField"
        >
          <UITransferSelect
            multiple
            :loading="store.accessLevelsLoading || store.moreAccessLevelsLoading"
            v-model:value="store.payload.access_level_ids"
            :options="store.accessLevels"
            value-field="id"
          />
        </n-form-item>

        <n-form-item
          :label="$t(`content.photo`)"
          path="photo_index"
          rule-path="requiredSelectImageField"
        >
          <div
            class="h-[260px] max-h-[400px] p-2 border border-surface-line w-full rounded-md relative"
          >
            <n-spin class="h-full w-full overflow-y-auto pr-1" :show="store.photosLoading">
              <NoDataIllustration v-if="!store.photos.length" class="w-full h-full" />
              <div
                v-else
                class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(120px,1fr))] gap-[10px]"
              >
                <div
                  v-for="(photo, idx) in store.photos"
                  :key="idx"
                  class="rounded-md overflow-hidden relative"
                  @click="toggleImage(idx)"
                  style="box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px"
                >
                  <img
                    class="w-full h-full object-cover transition-all hover:scale-[1.1] cursor-pointer"
                    alt="worker-photo"
                    :src="photo.photo"
                  />
                  <n-icon-wrapper
                    class="absolute top-1 right-1"
                    v-if="store.payload.photo_index === idx"
                    :size="24"
                    :border-radius="10"
                  >
                    <n-icon :size="18" :component="Checkmark16Filled" />
                  </n-icon-wrapper>
                </div>
              </div>
            </n-spin>
            <div class="absolute bottom-[10px] right-[10px]">
              <n-button @click="openCropper" type="primary" size="tiny">
                {{ $t('content.upload') }}
                <template #icon>
                  <AddCircle16Filled />
                </template>
              </n-button>
            </div>
            <UICropper ref="cropperRef" @on-result="onResult" />
          </div>
        </n-form-item>

        <n-form-item
          :label="$t(`content.deadline`)"
          :feedback="$t('turnstile.terminalUser.deadline_feedback')"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.payload.end_time"
            type="date"
            update-value-on-close
            :actions="null"
            clearable
            :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </n-form>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-4">
      <n-button @click="store.editVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
        :loading="store.editLoading || store.photosLoading"
        type="primary"
        @click="onSubmit"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-spin>
</template>
