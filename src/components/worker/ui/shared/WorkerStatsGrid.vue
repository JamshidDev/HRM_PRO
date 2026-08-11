<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import CertificateIcon from '@/assets/icons/certificateIcon.svg'
  import PositionCertificateIcon from '@/assets/icons/certificats.svg'
  import JshirIcon from '@/assets/icons/jshirIcon.svg'
  import PhoneIcon from '@/assets/icons/phoneIcon.svg'
  import CopyIcon from '@/assets/icons/copyIcon.svg'

  defineProps({
    masked: {
      type: Boolean,
      default: true
    }
  })

  const { t } = i18n.global
  const store = useComponentStore()

  const certificateNumber = computed(
    () => store.workerPreview?.worker?.digital_certificate?.serial
  )

  // Lavozim guvohnomalarining eng oxirgisi — amaldagi guvohnoma raqami
  const positionCertificateId = computed(
    () => store.workerPreview?.worker?.certificates?.at(-1)?.number
  )

  const onCopy = () => {
    $Toast.success(t('message.successDone'))
  }
</script>

<template>
  <div class="grid md:grid-cols-2 lg:flex lg:divide-x lg:divide-surface-line gap-4 lg:gap-0">
    <div class="min-w-0 lg:flex-1 lg:pr-4">
      <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14">
          <PositionCertificateIcon />
        </n-icon>
        {{ $t('workerView.header.positionCertificateId') }}
      </div>
      <div class="font-semibold flex items-center gap-1 flex-wrap">
        <span class="break-words">{{ positionCertificateId }}</span>
        <n-icon
          v-if="positionCertificateId"
          size="16"
          class="cursor-pointer text-primary shrink-0"
          @click="Utils.copyToClipboard(positionCertificateId, onCopy)"
        >
          <CopyIcon />
        </n-icon>
      </div>
    </div>

    <div class="min-w-0 lg:flex-1 lg:px-4">
      <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
        <n-icon size="14">
          <CertificateIcon />
        </n-icon>
        {{ $t('workerView.header.employeeId') }}
      </div>
      <div class="font-semibold flex items-center gap-1 flex-wrap">
        <span class="break-words">{{ certificateNumber }}</span>
        <n-icon
          v-if="certificateNumber"
          size="16"
          class="cursor-pointer text-primary shrink-0"
          @click="Utils.copyToClipboard(certificateNumber, onCopy)"
        >
          <CopyIcon />
        </n-icon>
      </div>
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
          masked
            ? Utils.maskText(store.workerPreview?.worker.pin, 3, 4)
            : store.workerPreview?.worker.pin
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
          <PhoneIcon />
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
