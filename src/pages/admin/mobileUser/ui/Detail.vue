<script setup>
import {CheckmarkCircle32Filled, Clock12Regular, DismissCircle32Filled} from '@vicons/fluent'
import {UIUser} from '@/components/index.js'
import {useMobileUserStore} from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'

const store = useMobileUserStore()

const getTimelineType = (status, success) => {
  if (success) return 'success'
  if (status === 'process') return 'warning'
  return 'error'
}
</script>

<template>
  <n-spin :show="store.detailLoading">
    <div v-if="store.detail" class="space-y-4">
      <div class="border border-surface-line rounded-lg p-3">
        <div class="flex items-center gap-3">
          <UIUser
            :data="{
              photo: store.detail?.device?.user?.worker?.photo,
              lastName: store.detail?.device?.user?.worker?.last_name,
              firstName: store.detail?.device?.user?.worker?.first_name,
              middleName: store.detail?.device?.user?.worker?.middle_name,
              position: store.detail?.device?.user?.phone
            }"
          />
        </div>
        <div class="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-surface-line">
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ $t('mobileUserPage.deviceModel') }}</span>
            <p class="text-xs font-medium mt-0.5">{{ store.detail?.device?.device_model || '-' }}</p>
          </div>
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ $t('mobileUserPage.platform') }}</span>
            <p class="text-xs font-medium mt-0.5">{{ store.detail?.device?.platform || '-' }}</p>
          </div>
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ $t('mobileUserPage.verificationTime') }}</span>
            <p class="text-xs font-medium mt-0.5">
              {{ store.detail?.device?.face ? Utils.timeWithMonth(store.detail?.device?.face) : '' }}
            </p>
          </div>
          <div class="border border-surface-line rounded p-2">
            <span class="text-[11px] text-gray-500">{{ $t('content.date') }}</span>
            <p class="text-xs font-medium mt-0.5">{{ Utils.timeWithMonth(store.detail?.device?.created_at) }}</p>
          </div>
        </div>
      </div>

      <div class="border border-surface-line rounded-lg p-3">
        <h3 class="text-xs font-semibold text-gray-600 mb-3">{{ $t('mobileUserPage.sessions') }}</h3>

        <n-timeline v-if="store.detail?.sessions?.length">
          <n-timeline-item
            v-for="session in store.detail?.sessions"
            :key="session.id"
            :type="getTimelineType(session.status, session.success)"
            :title="Utils.timeWithMonth(session.created_at)"
            line-type="dashed"
          >
            <template #icon>
              <n-icon size="16">
                <CheckmarkCircle32Filled v-if="session.success" />
                <Clock12Regular v-else-if="session.status === 'process'" />
                <DismissCircle32Filled v-else />
              </n-icon>
            </template>

            <div class="pb-3">
              <!-- Photos -->
              <div v-if="session.photos && session.photos.length > 0" class="grid grid-cols-5 gap-1.5 mt-1">
                <div
                  v-for="(photo, idx) in session.photos"
                  :key="idx"
                  class="aspect-square rounded overflow-hidden border border-surface-line"
                >
                  <n-image
                    :src="photo"
                    class="w-full h-full object-cover"
                    :previewed-img-props="{ style: { maxWidth: '90vw', maxHeight: '90vh' } }"
                  />
                </div>
              </div>
              <div v-else class="text-[11px] text-gray-400 italic mt-1">
                {{ $t('mobileUserPage.noPhotos') }}
              </div>
            </div>
          </n-timeline-item>
        </n-timeline>

        <div v-else class="text-center text-gray-400 py-6 border border-dashed border-surface-line rounded text-xs">
          {{ $t('mobileUserPage.noSessions') }}
        </div>
      </div>
    </div>
  </n-spin>
</template>
