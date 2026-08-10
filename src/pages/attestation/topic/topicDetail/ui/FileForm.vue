<script setup>
  import { useTopicFileStore } from '@/store/modules/index.js'
  import validationRules from '@/utils/validationRules.js'
  import { UIUpload } from '@/components/index.js'
  import { Delete48Filled, DocumentLink24Regular } from '@vicons/fluent'

  const formRef = ref(null)
  const store = useTopicFileStore()

  // `topicId` ni formani ochuvchi qo'yadi (TopicDetailPage.onAddFile) — bu yerda
  // marshrutdan o'qib bo'lmaydi, chunki /attestation/topic da `:id` parametri yo'q.

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  // Saqlash tugmasi modal footer'ida (TopicDetailPage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :model="store.payload" :rules="validationRules.topicFilePage">
    <n-form-item>
      <div class="border-surface-line border flex w-full justify-between rounded-md p-1">
        <p>{{ $t('topicFiles.isActive') }}</p>
        <n-switch v-model:value="store.payload.active" />
      </div>
    </n-form-item>
    <n-form-item path="fileObjects" rule-path="filesField" :show-label="false">
      <UIUpload
        :accept="store.accept"
        v-model:files="store.payload.fileObjects"
        :multiple="false"
        @on-delete="store.payload.fileObjects = []"
      >
        <template v-slot:content="{ files, onDelete }">
          <div class="mt-3">
            <div
              v-for="(item, idx) in files"
              class="flex items-center gap-2 p-2 border group border-surface-line rounded-md cursor-pointer bg-white hover:bg-surface-100 relative overflow-hidden pr-6"
              :key="idx"
            >
              <n-icon class="text-surface-400" size="18">
                <DocumentLink24Regular />
              </n-icon>
              <span class="text-xs line-clamp-1">{{ item.name }}</span>
              <span
                class="inline-block absolute right-[4px] top-[6px] opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <n-icon class="text-danger" size="20" @click="onDelete(item)">
                  <Delete48Filled />
                </n-icon>
              </span>
            </div>
          </div>
        </template>
      </UIUpload>
    </n-form-item>
  </n-form>
</template>
