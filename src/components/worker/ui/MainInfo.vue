<script setup>
  import {
    CheckmarkCircle16Filled,
    Mail16Regular,
    Building20Regular,
    Badge24Regular,
    DocumentRibbon20Regular,
    Phone24Regular,
    PhoneDesktop20Regular,
    Copy16Regular,
    StarEmphasis32Filled
  } from '@vicons/fluent'
  import { useComponentStore } from '@/store/modules/index.js'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import i18n from '@/i18n/index.js'

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
  <div v-if="store.workerPreview" class="flex items-start gap-4">
    <div class="relative flex-1 bg-surface-section rounded-xl p-5 min-w-0">
      <div class="flex flex-wrap items-start gap-4">
        <div class="flex flex-col items-center gap-2 shrink-0">
          <n-avatar
            :size="110"
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
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-2xl font-bold text-textColor0">{{
              Utils.combineFullName(store.workerPreview?.worker)
            }}</span>
            <n-icon size="20" class="text-primary shrink-0">
              <CheckmarkCircle16Filled />
            </n-icon>
          </div>
          <div class="flex items-center gap-2 text-textColor3 mt-1">
            <n-icon size="16">
              <Mail16Regular />
            </n-icon>
            <span>{{ store.workerPreview?.department?.name }} — {{ store.workerPreview?.post_name }}</span>
          </div>

          <div class="flex divide-x divide-surface-line mt-4 pt-4 border-t border-surface-line">
            <div class="flex-1 min-w-0 pr-4">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14">
                  <Building20Regular />
                </n-icon>
                {{ $t('workerView.general.department') }}
              </div>
              <div class="font-semibold truncate">{{ store.workerPreview?.department?.name }}</div>
            </div>

            <!-- TODO: backend real field qo'shilganda ulanadi — hozircha statik placeholder -->
            <div class="flex-1 min-w-0 px-4">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14">
                  <DocumentRibbon20Regular />
                </n-icon>
                {{ $t('workerView.header.serviceCertificate') }}
              </div>
              <div class="font-semibold">000000</div>
            </div>

            <div class="flex-1 min-w-0 px-4">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14">
                  <Badge24Regular />
                </n-icon>
                {{ $t('workerView.general.passportJSHSHIR') }}
              </div>
              <div class="font-semibold flex items-center gap-1">
                {{
                  masked
                    ? Utils.maskText(store.workerPreview?.worker.pin, 3, 4)
                    : store.workerPreview?.worker.pin
                }}
                <n-icon
                  size="16"
                  class="cursor-pointer text-textColor3"
                  @click="Utils.copyToClipboard(store.workerPreview?.worker.pin, onCopy)"
                >
                  <Copy16Regular />
                </n-icon>
              </div>
            </div>

            <div class="flex-1 min-w-0 px-4">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14">
                  <Phone24Regular />
                </n-icon>
                {{ $t('workerView.general.phone') }}
              </div>
              <div class="font-semibold flex items-center gap-1">
                {{
                  masked
                    ? Utils.maskText(store.workerPreview?.worker.phones[0].phone, 2, 2)
                    : Utils.formatPhoneWithMask(
                      store.workerPreview?.worker.phones[0].phone,
                      '## ### ## ##'
                    )
                }}
                <n-icon
                  size="16"
                  class="cursor-pointer text-textColor3"
                  @click="Utils.copyToClipboard(store.workerPreview?.worker.phones[0].phone, onCopy)"
                >
                  <Copy16Regular />
                </n-icon>
              </div>
            </div>

            <!-- TODO: backend real field qo'shilganda ulanadi — hozircha statik placeholder -->
            <div class="flex-1 min-w-0 pl-4">
              <div class="flex items-center gap-1.5 text-textColor3 text-sm mb-1">
                <n-icon size="14">
                  <PhoneDesktop20Regular />
                </n-icon>
                {{ $t('workerView.header.workNumber') }}
              </div>
              <div class="font-semibold flex items-center gap-1">
                00 000
                <n-icon
                  size="16"
                  class="cursor-pointer text-textColor3"
                  @click="Utils.copyToClipboard('00 000', onCopy)"
                >
                  <Copy16Regular />
                </n-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TODO: rating/count backend'dan kelmaydi, hozirgidek statik qoldirildi -->
    <div
      class="shrink-0 bg-warning/10 rounded-xl p-4 text-center flex flex-col items-center justify-center min-w-[160px]"
    >
      <div class="flex items-center justify-center gap-1 text-warning font-bold text-lg">
        <n-icon size="20">
          <StarEmphasis32Filled />
        </n-icon>
        4.67
      </div>
      <div class="text-xs text-textColor3 mt-1">{{ $t('workerView.header.avgRating') }}</div>
      <div class="text-xs text-textColor3">{{ $t('workerView.header.ratingBasedOn', { count: 148 }) }}</div>
    </div>
  </div>
</template>
