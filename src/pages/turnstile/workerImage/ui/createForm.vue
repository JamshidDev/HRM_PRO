<script setup>
  import { useWorkerImageStore } from '@/store/modules/index.js'
  import { UINSelect } from '@/components/index.js'

  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@/utils/Utils'
  import { SuperSelect } from '@components'

  const formRef = ref(null)
  const store = useWorkerImageStore()

  const onSubmit = (status) => {
    formRef.value?.validate((error) => {
      if ((!error && status === 2) || status === 3) {
        const data = {
          ids: [store.elementId],
          status: status,
          access_level_ids: status === 3 ? undefined : store.payload.access_level_ids,
          end_time:
            status === 3
              ? undefined
              : store.payload.end_time
                ? Utils.timeToZone(store.payload.end_time)
                : null,
          comment: status === 2 ? undefined : store.payload.comment
        }

        store.updateStatus(data)
      }
    })
  }
</script>

<template>
  <div class="overflow-y-auto">
    <n-form
      ref="formRef"
      :model="store.payload"
      :rules="validationRules.common"
      class="flex flex-col"
    >
      <div class="p-4 border border-surface-line rounded-lg mb-4">
        <div class="flex justify-center bg-patter rounded-2xl">
          <img
            v-if="store.payload.photo"
            :src="store.payload.photo"
            alt="photo"
            class="rounded max-w-full h-[360px]"
            style="object-fit: contain"
          />
        </div>
      </div>

      <n-collapse-transition v-if="!store.personId && !store.showCommentArea">
        <n-form-item
          rule-path="requiredMultiSelectField"
          :label="$t('turnstile.hcWorkersPage.access_levels')"
          path="access_level_ids"
        >
          <SuperSelect
            multiple
            v-model:value="store.payload.access_level_ids"
            :options="store.accessLevels"
            :loading="store.accessLevelsLoading"
          />
        </n-form-item>

        <n-form-item :label="$t('content.deadline')" path="end_time" rule-path="requiredDateField">
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
      </n-collapse-transition>

      <n-collapse-transition :show="store.showCommentArea">
        <n-form-item
          path="comment"
          rule-path="requiredStringField"
          :label="$t('workerImage.requiredCommentForRejection')"
        >
          <n-input
            v-model:value="store.payload.comment"
            type="textarea"
            :placeholder="$t('content.commentPlaceholder')"
            :rows="3"
            :maxlength="500"
          />
        </n-form-item>
      </n-collapse-transition>
    </n-form>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <n-button
      :loading="store.confirmLoading"
      @click="store.showCommentArea = !store.showCommentArea"
      type="error"
    >
      {{ $t(store.showCommentArea ? 'content.back' : 'content.reject') }}
    </n-button>
    <n-button
      v-if="!store.showCommentArea"
      :loading="store.confirmLoading"
      type="primary"
      @click="onSubmit(2)"
    >
      {{ $t('content.confirm') }}
    </n-button>
    <n-button
      v-if="store.showCommentArea"
      :loading="store.confirmLoading"
      type="primary"
      @click="onSubmit(3)"
    >
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>
