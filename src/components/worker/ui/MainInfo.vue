<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import UIBadge from '@/components/ui/UIBadge.vue'
  import Utils from '../../../utils/Utils.js'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import DepartmentIcon from '@/assets/icons/departmentIcon.svg'
  import VerifiedIcon from '@/assets/icons/verifiedIcon.svg'
  import HeaderBg from '@/assets/icons/profile-preview-header.svg?url'
  import SectionHeader from './shared/SectionHeader.vue'
  import WorkerStatsGrid from './shared/WorkerStatsGrid.vue'

  const store = useComponentStore()
  const masked = defineModel('masked', { type: Boolean, default: true })

  const activePhotoIndex = ref(0)

  const photos = computed(() => store.workerPreview?.worker?.photos || [])

  const avatarSrc = computed(() => {
    return photos.value[activePhotoIndex.value]?.photo || store.workerPreview?.worker?.photo
  })

  const onOpenViewer = () => {
    if (photos.value.length) {
      window.$openViewer(photos.value.map((p) => p.photo).filter(Boolean), activePhotoIndex.value)
    } else if (avatarSrc.value) {
      window.$openViewer(avatarSrc.value)
    }
  }
</script>

<template>
  <SectionHeader v-if="store.workerPreview">
    <template #header>
      <div
        class="main-info-header-bg relative overflow-hidden flex max-md:flex-col items-center gap-3 py-1 w-full rounded-t-3xl"
      >
        <div
          class="main-info-header-bg-image absolute inset-0 bg-cover bg-no-repeat rounded-t-3xl bg-[180px_-100px]"
          :style="{ backgroundImage: `url(${HeaderBg})` }"
        ></div>

        <n-avatar
          :size="96"
          round
          class="main-info-avatar relative z-10 cursor-pointer shrink-0"
          :src="avatarSrc || Utils.noAvailableImage"
          :fallback-src="Utils.noAvailableImage"
          :img-props="{ style: 'object-fit: cover' }"
          @click="onOpenViewer"
        />

        <div class="relative z-10 min-w-0 flex-1">
          <div class="flex max-md:flex-wrap items-center max-md:justify-center gap-2">
            <span class="md:text-2xl font-bold text-textColor0 md:truncate">
              {{ Utils.combineFullName(store.workerPreview?.worker) }}
            </span>
            <!-- TODO: backend real active/inactive field qo'shilganda ulanadi -->
            <span class="shrink-0 active-employee-badge">
              <UIBadge
                :label="$t('workerView.header.activeEmployee')"
                :type="Utils.colorTypes.success"
                :show-icon="false"
              />
            </span>
            <n-icon size="20" class="text-primary shrink-0">
              <VerifiedIcon />
            </n-icon>
          </div>
          <div class="flex items-center gap-2 text-textColor2 mt-2 text-pretty">
            <n-icon size="16">
              <PositionIcon />
            </n-icon>
            <span>{{ store.workerPreview?.post_name }}</span>
          </div>
          <div class="flex items-center gap-2 text-textColor2 mt-1 text-pretty">
            <n-icon size="16">
              <DepartmentIcon />
            </n-icon>
            <span>{{ store.workerPreview?.department?.name }}</span>
          </div>
        </div>
      </div>
    </template>

    <WorkerStatsGrid :masked="masked" />
  </SectionHeader>
</template>

<style lang="scss">
  [data-theme='dark'] {
    .main-info-header-bg-image {
      mix-blend-mode: color;
    }
  }

  .main-info-avatar {
    border: 1px solid var(--surface-300);
    width: 96px !important;
    height: 96px !important;
    flex-shrink: 0;

    img {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center top !important;
    }
  }

  .active-employee-badge {
    .ui--badge-success {
      background-color: #f5fdf6;
      border-color: #f5fdf6;
    }
    .ui--badge-label {
      color: #14813c;
    }
  }
</style>
