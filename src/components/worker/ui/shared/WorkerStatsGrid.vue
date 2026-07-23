<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
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
  <div class="grid grid-cols-2 lg:flex lg:divide-x lg:divide-surface-line gap-4 lg:gap-0 ">
    <!-- TODO: backend real field qo'shilganda ulanadi — hozircha statik placeholder -->
    <div class="min-w-0 lg:flex-1 lg:pr-4">
      <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14">
          <CertificateIcon />
        </n-icon>
        {{ $t('workerView.header.serviceCertificate') }}
      </div>
      <div class="font-semibold break-words">000000</div>
    </div>

    <div class="min-w-0 lg:flex-1 lg:px-4">
      <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14">
          <JshirIcon />
        </n-icon>
        {{ $t('workerView.general.passportJSHSHIR') }}
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

    <div class="min-w-0 lg:flex-1 lg:px-4">
      <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14">
          <PhoneIcon />
        </n-icon>
        {{ $t('workerView.general.phone') }}
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
    <div class="min-w-0 lg:flex-1 lg:pl-4">
      <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14">
          <WorkerPhoneIcon />
        </n-icon>
        {{ $t('workerView.header.workNumber') }}
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
