<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'
  import CertificateIcon from '@/assets/icons/certificateIcon.svg'
  import JshirIcon from '@/assets/icons/jshirIcon.svg'
  import PhoneIcon from '@/assets/icons/phoneIcon.svg'
  import WorkerPhoneIcon from '@/assets/icons/workerPhoneIcon.svg'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import RatingStarIcon from '@/assets/icons/ratingStarIcon.png'
  import VerifiedIcon from '@/assets/icons/verifiedIcon.svg'

  const { t } = i18n.global
  const store = useComponentStore()
  const masked = defineModel('masked', { type: Boolean, default: true })

  const activePhotoIndex = ref(0)

  const photos = computed(() => store.workerPreview?.worker?.photos || [])

  const avatarSrc = computed(() => {
    return photos.value[activePhotoIndex.value]?.photo || store.workerPreview?.worker?.photo
  })

  const onCopy = () => {
    $Toast.info(t('message.successDone'))
  }

  const onOpenViewer = () => {
    if (avatarSrc.value) window.$openViewer(avatarSrc.value)
  }
</script>

<template>
  <div v-if="store.workerPreview" class="bg-surface-section rounded-3xl p-4">
    <div class="flex flex-wrap items-start gap-3">
      <div class="flex flex-col items-center gap-2 shrink-0">
        <n-avatar
          :size="76"
          round
          class="cursor-pointer"
          :src="avatarSrc || Utils.noAvailableImage"
          :fallback-src="Utils.noAvailableImage"
          :img-props="{ style: 'object-fit: cover' }"
          @click="onOpenViewer"
        />
        <!-- TODO: backend real active/inactive field qo'shilganda ulanadi -->
        <UIBadge
          :label="$t('workerView.header.activeEmployee')"
          :type="Utils.colorTypes.success"
          :show-icon="false"
          class="!w-auto"
        />
        <div v-if="photos.length > 1" class="flex gap-1">
          <span
            v-for="(item, idx) in photos"
            :key="item.id ?? idx"
            class="w-6 h-6 rounded-md overflow-hidden border-2 cursor-pointer"
            :class="idx === activePhotoIndex ? 'border-primary' : 'border-transparent'"
            @click="activePhotoIndex = idx"
          >
            <img
              class="w-full h-full object-cover"
              :src="item.photo || Utils.noAvailableImage"
              @error="Utils.onImgError"
              alt="worker thumbnail"
            />
          </span>
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <div>
          <span class="text-2xl font-bold text-textColor0">
            {{ Utils.combineFullName(store.workerPreview?.worker) }}
            <n-icon size="20" class="text-primary align-middle inline-flex">
              <VerifiedIcon />
            </n-icon>
          </span>
        </div>
        <div class="flex items-center gap-2 text-textColor3 mt-1">
          <n-icon size="16">
            <PositionIcon />
          </n-icon>
          <span>{{ store.workerPreview?.department?.name }} — {{ store.workerPreview?.post_name }}</span>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-3 pt-3 border-t border-surface-line">
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
                  : Utils.formatPhoneWithMask(
                    store.workerPreview?.worker.phones[0].phone,
                    '## ### ## ##'
                  )
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
      </div>

      <!-- TODO: rating/count backend'dan kelmaydi, hozirgidek statik qoldirildi -->
      <div class="shrink-0 flex items-center gap-2 bg-warning/10 rounded-xl px-4 py-2.5">
        <img :src="RatingStarIcon" class="w-12 h-12 object-contain" alt="rating star" />
        <span class="text-lg font-bold text-textColor0">4.67</span>
      </div>
    </div>
  </div>
</template>
