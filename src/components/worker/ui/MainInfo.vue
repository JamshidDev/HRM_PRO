<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import RatingStarIcon from '@/assets/icons/ratingStarIcon.png'
  import VerifiedIcon from '@/assets/icons/verifiedIcon.svg'
  import WorkerStatsGrid from './shared/WorkerStatsGrid.vue'

  const store = useComponentStore()
  const masked = defineModel('masked', { type: Boolean, default: true })

  const activePhotoIndex = ref(0)

  const photos = computed(() => store.workerPreview?.worker?.photos || [])

  const avatarSrc = computed(() => {
    return photos.value[activePhotoIndex.value]?.photo || store.workerPreview?.worker?.photo
  })

  const onOpenViewer = () => {
    if (avatarSrc.value) window.$openViewer(avatarSrc.value)
  }
</script>

<template>
  <div v-if="store.workerPreview" class="bg-surface-section rounded-3xl p-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex flex-col items-center gap-2 shrink-0 order-1">
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

      <!-- TODO: rating/count backend'dan kelmaydi, hozirgidek statik qoldirildi -->
      <div
        class="shrink-0 order-2 lg:order-3 flex items-center gap-2 bg-warning/10 rounded-xl px-4 py-2.5"
      >
        <img :src="RatingStarIcon" class="w-12 h-12 object-contain" alt="rating star" />
        <span class="text-lg font-bold text-textColor0">4.67</span>
      </div>

      <div class="w-full lg:w-auto lg:flex-1 min-w-0 order-3 lg:order-2">
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

        <!-- Large screens: stats sit inline next to the avatar, like before -->
        <div class="hidden lg:block mt-3 pt-3 border-t border-surface-line">
          <WorkerStatsGrid :masked="masked" />
        </div>
      </div>
    </div>

    <!-- Smaller screens: stats break out to the full card width below the header -->
    <div class="lg:hidden mt-3 pt-3 border-t border-surface-line">
      <WorkerStatsGrid :masked="masked" />
    </div>
  </div>
</template>
