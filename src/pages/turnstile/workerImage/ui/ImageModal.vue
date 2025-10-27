<script setup>
import {UIModal} from "@/components/index.js"
import {useWorkerImageStore} from "@/store/modules/index.js"

const store = useWorkerImageStore()
</script>

<template>
  <UIModal
      :width="400"
      :visible="store.imageVisible"
      @update:visible="(v)=>store.imageVisible = v"
      :title="$t('workerImage.viewPhoto')"
  >
    <template #default>
      <div class="flex justify-center">
        <img
            v-if="store.selectedImage"
            :src="store.selectedImage"
            alt="photo"
            class="rounded w-full"
            style="object-fit: contain;"
        />
      </div>
      <div v-if="store.isConfirmModal" class="grid grid-cols-2 gap-2 mt-6">
        <n-button @click="store.updateStatus(3)" :loading="store.confirmLoading" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="store.updateStatus(2)" :loading="store.confirmLoading" type="primary">
          {{ $t('content.confirm') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
