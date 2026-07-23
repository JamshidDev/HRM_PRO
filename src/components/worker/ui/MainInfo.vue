<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'
  import VerifiedIcon from '@/assets/icons/verifiedIcon.svg'
  import HeaderBg from '@/assets/icons/profile-preview-header.svg?url'
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
  <div v-if="store.workerPreview" class="rounded-3xl overflow-hidden bg-[#ffffff] mt-4 p-1">
    <div
      class="main-info-header-bg flex flex-wrap items-start gap-3 p-4 bg-cover bg-no-repeat bg-right-top rounded-3xl"
      :style="{ backgroundImage: `url(${HeaderBg})` }"
    >
      <n-avatar
        :size="76"
        round
        class="cursor-pointer shrink-0"
        :src="avatarSrc || Utils.noAvailableImage"
        :fallback-src="Utils.noAvailableImage"
        :img-props="{ style: 'object-fit: cover' }"
        @click="onOpenViewer"
      />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-2xl font-bold text-textColor0">
            {{ Utils.combineFullName(store.workerPreview?.worker) }}
          </span>
          <!-- TODO: backend real active/inactive field qo'shilganda ulanadi -->
          <UIBadge
            :label="$t('workerView.header.activeEmployee')"
            :type="Utils.colorTypes.success"
            :show-icon="false"
            class="!w-auto active-employee-badge"
          />
          <n-icon size="20" class="text-primary shrink-0">
            <VerifiedIcon />
          </n-icon>
        </div>
        <div class="flex items-center gap-2 text-textColor2 mt-2">
          <n-icon size="16">
            <PositionIcon />
          </n-icon>
          <span>{{ store.workerPreview?.post_name }}</span>
        </div>
        <div class="flex items-center gap-2 text-textColor2 mt-1">
          <n-icon size="16">
            <DepartmentIcon />
          </n-icon>
          <span>{{ store.workerPreview?.department?.name }}</span>
        </div>

        <div v-if="photos.length > 1" class="flex gap-1 mt-2">
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
    </div>

    <div class="bg-surface-section border-surface-line p-4">
      <WorkerStatsGrid :masked="masked" />
    </div>
  </div>
</template>

<style lang="scss">
  .main-info-header-bg {
    background-color: #eff8ff;
  }
  [data-theme='dark'] {
    .main-info-header-bg {
      background-color: #0f172a;
    }
  }

  .active-employee-badge {
    > div {
      background-color: #f5fdf6;
      border-color: #f5fdf6;
    }
    .ui--badge-label {
      color: #14813c;
    }
  }
</style>
