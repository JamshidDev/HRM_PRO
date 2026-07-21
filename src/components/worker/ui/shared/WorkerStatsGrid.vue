<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'
  import CertificateIcon from '@/assets/icons/certificateIcon.svg'
  import JshirIcon from '@/assets/icons/jshirIcon.svg'
  import PhoneIcon from '@/assets/icons/phoneIcon.svg'
  import WorkerPhoneIcon from '@/assets/icons/workerPhoneIcon.svg'
  import CopyIcon from '@/assets/icons/copyIcon.svg'

  defineProps({
    masked: {
      type: Boolean,
      default: true
    }
  })

  const { t } = i18n.global
  const store = useComponentStore()

  const onCopy = () => {
    $Toast.info(t('message.successDone'))
  }
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    <div class="min-w-0">
      <div class="flex items-start gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14" class="shrink-0 mt-0.5">
          <DepartmentIcon />
        </n-icon>
        <span class="break-words">{{ $t('workerView.general.department') }}</span>
      </div>
      <div class="font-semibold break-words">{{ store.workerPreview?.department?.name }}</div>
    </div>

    <!-- TODO: backend real field qo'shilganda ulanadi — hozircha statik placeholder -->
    <div class="min-w-0">
      <div class="flex items-start gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14" class="shrink-0 mt-0.5">
          <CertificateIcon />
        </n-icon>
        <span class="break-words">{{ $t('workerView.header.serviceCertificate') }}</span>
      </div>
      <div class="font-semibold break-words">000000</div>
    </div>

    <div class="min-w-0">
      <div class="flex items-start gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14" class="shrink-0 mt-0.5">
          <JshirIcon />
        </n-icon>
        <span class="break-words">{{ $t('workerView.general.passportJSHSHIR') }}</span>
      </div>
      <div class="font-semibold flex items-center gap-1 flex-wrap">
        <span class="break-words">{{
          masked ? Utils.maskText(store.workerPreview?.worker.pin, 3, 4) : store.workerPreview?.worker.pin
        }}</span>
        <n-icon
          size="16"
          class="cursor-pointer text-primary shrink-0"
          @click="Utils.copyToClipboard(store.workerPreview?.worker.pin, onCopy)"
        >
          <CopyIcon />
        </n-icon>
      </div>
    </div>

    <div class="min-w-0">
      <div class="flex items-start gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14" class="shrink-0 mt-0.5">
          <PhoneIcon />
        </n-icon>
        <span class="break-words">{{ $t('workerView.general.phone') }}</span>
      </div>
      <div class="font-semibold flex items-center gap-1 flex-wrap">
        <span class="break-words">{{
          masked
            ? Utils.maskText(store.workerPreview?.worker.phones[0].phone, 2, 2)
            : Utils.formatPhoneWithMask(store.workerPreview?.worker.phones[0].phone, '## ### ## ##')
        }}</span>
        <n-icon
          size="16"
          class="cursor-pointer text-primary shrink-0"
          @click="Utils.copyToClipboard(store.workerPreview?.worker.phones[0].phone, onCopy)"
        >
          <CopyIcon />
        </n-icon>
      </div>
    </div>

    <!-- TODO: backend real field qo'shilganda ulanadi — hozircha statik placeholder -->
    <div class="min-w-0">
      <div class="flex items-start gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14" class="shrink-0 mt-0.5">
          <WorkerPhoneIcon />
        </n-icon>
        <span class="break-words">{{ $t('workerView.header.workNumber') }}</span>
      </div>
      <div class="font-semibold flex items-center gap-1 flex-wrap">
        <span>00 000</span>
        <n-icon
          size="16"
          class="cursor-pointer text-primary shrink-0"
          @click="Utils.copyToClipboard('00 000', onCopy)"
        >
          <CopyIcon />
        </n-icon>
      </div>
    </div>
  </div>
</template>
