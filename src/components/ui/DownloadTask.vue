<script setup>
  import { AppPaths, eventBus, Events, useDebounce, Utils } from '@utils'
  import { useAccountStore } from '@stores'
  import router from '@/router'
  import {
    ArrowCircleDown24Regular,
    CloudArrowDown28Regular,
    ErrorCircle12Filled,
    Timer16Regular
  } from '@vicons/fluent'

  const store = useAccountStore()

  const notificationRefs = ref([])
  const observer = ref(null)
  const viewedNotifications = ref(new Set())
  const scrollContainer = ref(null)
  let viewedIds = []

  const setupObserver = () => {
    if (observer.value) {
      observer.value.disconnect()
    }

    const options = {
      root: scrollContainer.value,
      rootMargin: '0px',
      threshold: 0.5
    }

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const notificationId = Number(entry.target.dataset.notificationId)
          const isReadFlag = Number(entry.target.dataset.isRead)
          if (!viewedNotifications.value.has(notificationId) && isReadFlag === 0) {
            viewedNotifications.value.add(notificationId)
            markAsRead()
          }
        }
      })
    }

    observer.value = new IntersectionObserver(callback, options)

    notificationRefs.value.forEach((el) => {
      if (el) {
        observer.value.observe(el)
      }
    })
  }
  const markAsRead = useDebounce(() => {
    const data = [...viewedNotifications.value].filter((id) => !viewedIds.includes(id))
    viewedIds = [...viewedNotifications.value]
    store._markRead({ ids: data })
  })
  const setNotificationRef = (el, index) => {
    if (!el) return
    notificationRefs.value[index] = el
  }
  const onShow = (v) => {
    if (!v) return
    store._fetchTask()
    store._fetchUnReadNotificationCount()
  }
  const onDownload = (url) => {
    window.open(url, '_blank')
  }
  const goViewAll = () => {
    router.push(Utils.routeHrmPathMaker(AppPaths.Export))
  }
  const viewAll = () => {
    const data = {
      all: true
    }
    store._markRead(data, () => {
      store._fetchUnReadNotificationCount()
      store._fetchTask()
    })
  }
  const updateNotification = (v) => {
    const index = store.notificationList.findIndex((x) => x.id === Number(v.taskId))
    if (index === -1) return
    store.notificationList[index].status.id = 2
    store.notificationList[index].file = v.file
  }

  watch(
    () => store.notificationList,
    (newList) => {
      if (newList && newList.length > 0) {
        nextTick(() => {
          setupObserver()
        })
      }
    }
  )

  onMounted(() => {
    store._fetchUnReadNotificationCount()
    eventBus.on(Events.TASK_COMPLETED, updateNotification)
  })

  onBeforeUnmount(() => {
    eventBus.off(Events.TASK_COMPLETED, updateNotification)
    if (observer.value) {
      observer.value.disconnect()
    }
  })
</script>

<template>
  <n-popover arrow-wrapper-class="![--n-arrow-offset:18px]" class="-translate-x-2 !p-0 ![--n-border-radius:20px]" placement="bottom-start" trigger="click" @update:show="onShow">
    <template #trigger>
      <n-badge
        class="!text-[10px] header-app-badge"
        :value="store.unReadNotificationCount"
        :offset="[4, -4]"
      >
        <n-icon id="taskBtn" size="28" class="cursor-pointer text-primary transition-all hover:text-info/70">
          <CloudArrowDown28Regular />
        </n-icon>
      </n-badge>
    </template>

    <div class="w-[300px] h-[300px] cursor-pointer overflow-hidden">
      <div
        class="w-full border-b border-surface-line px-2 py-2 text-xs font-semibold flex justify-between items-center"
      >
        <span>{{ $t('content.notifications') }}</span>
        <n-button @click="viewAll" size="tiny">
          <span class="text-[10px]">{{ $t('content.markAsRead') }}</span>
        </n-button>
      </div>

      <n-spin class="h-[calc(100%-66px)]" :show="store.notifyLoading">
        <div ref="scrollContainer" class="w-full h-full overflow-y-auto px-1">
          <template v-for="(item, index) in store.notificationList" :key="item.id">
            <div
              :ref="(el) => setNotificationRef(el, index)"
              :data-notification-id="item.id"
              :data-is-read="item.read_at ? 1 : 0"
              class="px-2 my-1 border border-surface-line rounded-lg pt-2 transition-all duration-300"
              :class="{
                'bg-surface-ground/30 hover:bg-surface-ground/80': !viewedNotifications.has(
                  item.id.toString()
                ),
                'bg-green-50/10 border-green-200': viewedNotifications.has(item.id.toString())
              }"
            >
              <div class="w-full text-xs leading-[1]">
                <n-badge v-if="!item.read_at" class="mb-[2px]" type="info" dot />
                {{ item.type }}
              </div>

              <div class="flex justify-between items-center mt-4 pb-1">
                <div class="text-[10px] text-textColor3">
                  {{ Utils.timeWithMonth(item.created_at) }}
                </div>

                <n-button
                  v-if="item.status.id === 2"
                  @click="onDownload(item.file)"
                  class="!py-1"
                  type="success"
                  secondary
                  size="tiny"
                >
                  <template #icon>
                    <ArrowCircleDown24Regular />
                  </template>
                </n-button>

                <n-button
                  v-if="item.status.id === 1"
                  class="!py-1"
                  type="warning"
                  secondary
                  size="tiny"
                  :loading="true"
                >
                  <template #icon>
                    <Timer16Regular />
                  </template>
                </n-button>
                <n-button
                  v-if="item.status.id === 3"
                  class="!py-1"
                  type="error"
                  secondary
                  size="tiny"
                >
                  <template #icon>
                    <ErrorCircle12Filled />
                  </template>
                  {{ $t('content.Error') }}
                </n-button>
              </div>
            </div>
          </template>
        </div>
      </n-spin>
      <div
        @click="goViewAll"
        class="w-full text-center border-t border-surface-line px-2 py-1 text-xs hover:bg-surface-ground/50 transition-colors"
      >
        {{ $t('content.viewAll') }}
      </div>
    </div>
  </n-popover>
</template>

<style scoped>
  .transition-all {
    transition: all 0.3s ease;
  }
</style>
