<script setup>
  import { Dismiss24Regular, Person20Regular, Phone20Regular } from '@vicons/fluent'
  import { useMobileUserStore, useAccountStore } from '@/store/modules/index.js'
  import { UIPageContent, UIPageFilter, UIModal } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import Detail from './ui/Detail.vue'
  import Devices from './ui/Devices.vue'
  import VersionCard from './ui/VersionCard.vue'

  const store = useMobileUserStore()
  const accStore = useAccountStore()

  const deviceCount = computed(() => store.detail?.devices?.length ?? 0)

  const onSearch = (v) => {
    // Ilgari qo'pol `admin` edi; backend `mobile-users-read` ni enforce qiladi.
    if (!accStore.canView(accStore.pn.mobileUsers)) return
    store.params.search = v
    store._filterEvent()
  }

  onMounted(() => {
    // Ilgari qo'pol `admin` edi; backend `mobile-users-read` ni enforce qiladi.
    if (!accStore.canView(accStore.pn.mobileUsers)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <VersionCard />
    <UIPageFilter :show-add-button="false" :show-filter-button="false" @on-search="onSearch" />
    <Table />
    <UIModal v-model:visible="store.detailVisible" :width="1100" height="85vh">
      <!-- Header: sarlavhasiz — faqat segment tab + yopish. Modal balandligi qat'iy
           (85vh), kontent ichida scroll bo'ladi (UIModal `height` bilan). -->
      <template #header>
        <div class="-mx-2 -mt-2 border-b border-surface-line px-6 py-3 flex items-center justify-between gap-4">
          <div class="w-[300px] shrink-0">
            <n-tabs v-model:value="store.detailTab" type="segment" size="small" animated>
              <n-tab :name="store.detailTabs.face">
                <div class="flex items-center gap-1.5">
                  <n-icon size="15"><Person20Regular /></n-icon>
                  <span>{{ $t('mobileUserPage.tabFaceId') }}</span>
                </div>
              </n-tab>
              <n-tab :name="store.detailTabs.devices">
                <div class="flex items-center gap-1.5">
                  <n-icon size="15"><Phone20Regular /></n-icon>
                  <span>{{ $t('mobileUserPage.tabDevices') }}</span>
                  <span
                    v-if="deviceCount"
                    class="text-[10px] font-semibold leading-none px-1.5 py-0.5 rounded-full bg-surface-line text-textColor1"
                  >
                    {{ deviceCount }}
                  </span>
                </div>
              </n-tab>
            </n-tabs>
          </div>
          <div
            @click="store.detailVisible = false"
            class="w-9 h-9 rounded-full bg-surface-ground hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
          >
            <n-icon size="18" class="text-textColor1">
              <Dismiss24Regular />
            </n-icon>
          </div>
        </div>
      </template>

      <Detail v-if="store.detailTab === store.detailTabs.face" />
      <Devices v-else />
    </UIModal>
  </UIPageContent>
</template>
