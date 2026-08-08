<script setup>
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import {
    History20Regular,
    ChevronUp48Filled,
    DocumentArrowDown16Regular,
    Add16Filled,
    MailAttach16Regular
  } from '@vicons/fluent'
  import Utils from '../../../utils/Utils.js'
  import { UIUser } from '@/components/index.js'
  import { useRoute } from 'vue-router'
  import FilePreviewModal from './FilePreviewModal.vue'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import FileContractIcon from '@/assets/icons/fileContractIcon.svg'
  import CloudArrowDownIcon from '@/assets/icons/cloudArrowDownIcon.svg'
  import EyeIcon from '@/assets/icons/eyeIcon.svg'

  const route = useRoute()
  const store = usePdfViewerStore()

  const previewVisible = ref(false)
  const previewFile = ref(null)

  const getHistory = () => {
    if (!store.show && store.document?.histories > 0) {
      store._history()
    } else {
      store.show = false
    }
  }

  const onOpenAttach = () => {
    store.workerApplications = []
    store.attachFiles = []
    store.attachVisible = true
  }

  const onDownload = (url) => {
    window.open(url, '_blank')
  }

  const onPreview = (item) => {
    previewFile.value = item
    previewVisible.value = true
  }

  onMounted(() => {
    store.show = false
  })

  watch(
    () => store.document,
    (doc) => {
      if (doc?.files > 0) store._files()
    },
    { immediate: true }
  )

  const showDocumentFiles = computed(() => {
    const allowedPaths = [
      '/hrm/contract',
      '/hrm/command',
      '/hrm/ad-contract',
      '/hrm/application',

      '/docflow/conf-contract',
      '/docflow/conf-command',
      '/docflow/conf-ad-contract',
      '/docflow/conf-application'
    ]
    return allowedPaths.includes(route.path)
  })
</script>

<template>
  <SectionHeader
    full-height
    tight-body
    :title="$t('documentPage.signature.attachedDocuments')"
    class="w-full"
  >
    <div class="flex flex-col gap-4">
      <div v-if="store.fileList.length" class="flex flex-col gap-2">
        <template v-for="(item, idx) in store.fileList" :key="idx">
          <div class="flex items-center gap-2 p-2 -mx-2 rounded-lg hover:bg-surface-ground">
            <div
              class="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              :class="item?.file ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'"
            >
              <n-icon size="16">
                <FileContractIcon v-if="item?.file" />
                <MailAttach16Regular v-else />
              </n-icon>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-medium text-textColor1 truncate">
                {{ item?.file ? item.original_name : item?.worker_application?.number }}
              </div>
              <div class="text-[10px] text-gray-400">{{ Utils.timeOnlyDate(item.created_at) }}</div>
            </div>
            <n-icon
              size="16"
              class="cursor-pointer text-textColor3 hover:text-primary shrink-0"
              @click="onDownload(item?.file || item?.worker_application?.confirmation_file)"
            >
              <CloudArrowDownIcon />
            </n-icon>
            <n-icon
              v-if="item?.file"
              size="16"
              class="cursor-pointer text-textColor3 hover:text-primary shrink-0"
              @click="onPreview(item)"
            >
              <EyeIcon />
            </n-icon>
          </div>
        </template>
      </div>

      <div class="flex flex-col gap-4">
        <n-button v-if="showDocumentFiles" @click="onOpenAttach" type="primary" text>
          <template #icon>
            <n-icon size="16">
              <Add16Filled />
            </n-icon>
          </template>
          {{ $t('documentPage.signature.attachDocument') }}
        </n-button>

        <FilePreviewModal v-model:visible="previewVisible" :file="previewFile" />

        <n-badge :value="store.show ? 0 : store.document?.histories" :offset="[-10, 8]">
          <n-button
            type="tertiary"
            secondary
            style="width: 100%"
            @click="getHistory"
            :loading="store.historyLoading"
          >
            <template #icon>
              <n-icon size="20">
                <ChevronUp48Filled v-if="store.show" />
                <History20Regular v-else />
              </n-icon>
            </template>
            {{ store.show ? $t('content.hide') : $t('documentPage.signature.history') }}
          </n-button>
        </n-badge>
      </div>

      <n-collapse-transition
        :show="store.show"
        class="bg-surface-ground p-2 rounded-sm overflow-hidden"
      >
        <template v-for="(item, idx) in store.historyList" :key="idx">
          <div
            class="flex flex-col justify-between w-full py-1 border-b border-dashed border-surface-line"
          >
            <div class="flex">
              <UIUser
                :short="false"
                :data="{
                  photo: item.user?.worker?.photo,
                  lastName: item.user?.worker?.last_name,
                  firstName: item.user?.worker?.first_name,
                  middleName: item.user?.worker?.middle_name,
                  position: null
                }"
              >
                <template #position>
                  <span
                    @click="onDownload(item)"
                    class="text-[10px] text-end text-primary underline flex items-center cursor-pointer hover:text-primary"
                  >
                    <n-icon class="mr-1" size="16"><DocumentArrowDown16Regular /></n-icon>
                    {{ item.status?.name }}
                  </span>
                </template>
              </UIUser>
              <!--            <n-avatar size="small" round :src="item.user.photo"/>-->
              <!--            <div class="flex items-center">-->
              <!--              <span class=" text-gray-600 font-medium">{{`${item.user.last_name}.${item.user.first_name[0]}`}}</span>-->
              <!--            </div>-->
            </div>
            <div class="flex flex-col justify-end">
              <span class="text-xs text-gray-400 text-end">{{
                Utils.timeWithMonth(item.created_at)
              }}</span>
            </div>
          </div>
        </template>
      </n-collapse-transition>
    </div>
  </SectionHeader>
</template>

<style scoped></style>
