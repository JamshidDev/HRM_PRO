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
  <n-popover
    arrow-wrapper-class="![--n-arrow-offset:18px]"
    class="!p-0 ![--n-border-radius:20px]"
    placement="right-start"
    trigger="click"
    @update:show="onShow"
  >
    <template #trigger>
      <n-badge
        class="!text-[10px] header-app-badge"
        :value="store.unReadNotificationCount"
        :offset="[-4, -4]"
      >
        <n-icon
          id="taskBtn"
          size="28"
          class="cursor-pointer text-white transition-all hover:text-white/70"
        >
          <CloudArrowDown28Regular />
        </n-icon>
      </n-badge>
    </template>

    <div class="w-[320px] h-[300px] rounded-3xl overflow-hidden cursor-pointer notif-panel flex flex-col">
      <div class="notif-bar shrink-0 flex items-center justify-between gap-2 px-4 py-2.5">
        <span class="text-sm font-semibold text-textColor0">{{ $t('content.notifications') }}</span>
        <button
          type="button"
          class="text-xs font-medium text-primary hover:opacity-70 transition-opacity"
          @click="viewAll"
        >
          {{ $t('content.markAsRead') }}
        </button>
      </div>

      <n-spin class="notif-body flex-1 min-h-0" :show="store.notifyLoading">
        <div ref="scrollContainer" class="w-full h-full overflow-y-auto px-3 py-2 space-y-2">
          <template v-for="(item, index) in store.notificationList" :key="item.id">
            <div
              :ref="(el) => setNotificationRef(el, index)"
              :data-notification-id="item.id"
              :data-is-read="item.read_at ? 1 : 0"
              class="notif-item flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-300"
              :class="{
                'notif-item-viewed': viewedNotifications.has(item.id.toString())
              }"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 text-xs font-medium text-textColor0 leading-tight">
                  <n-badge v-if="!item.read_at" type="info" dot />
                  <span>{{ item.type }}</span>
                </div>
                <div class="text-[10px] text-textColor3 mt-1.5">
                  {{ Utils.timeWithMonth(item.created_at) }}
                </div>
              </div>

              <button
                v-if="item.status.id === 2"
                type="button"
                class="status-circle status-circle-success shrink-0"
                @click="onDownload(item.file)"
              >
                <n-icon size="16">
                  <ArrowCircleDown24Regular />
                </n-icon>
              </button>

              <n-tooltip v-else-if="item.status.id === 1" trigger="hover">
                <template #trigger>
                  <div class="status-circle status-circle-warning shrink-0">
                    <n-icon size="16" class="animate-spin">
                      <Timer16Regular />
                    </n-icon>
                  </div>
                </template>
                {{ $t('content.process') }}
              </n-tooltip>

              <n-tooltip v-else-if="item.status.id === 3" trigger="hover">
                <template #trigger>
                  <div class="status-circle status-circle-error shrink-0">
                    <n-icon size="16">
                      <ErrorCircle12Filled />
                    </n-icon>
                  </div>
                </template>
                {{ $t('content.error') }}
              </n-tooltip>
            </div>
          </template>
        </div>
      </n-spin>

      <div @click="goViewAll" class="notif-bar shrink-0 text-center px-3 py-2.5 text-xs font-semibold text-primary hover:opacity-70 transition-opacity">
        {{ $t('content.viewAll') }}
      </div>
    </div>
  </n-popover>
</template>

<style scoped>
  .transition-all {
    transition: all 0.3s ease;
  }

  .notif-panel {
    background-color: #fff;
  }
  .notif-bar {
    background-color: #eff8ff;
  }
  .notif-item {
    background-color: #f9fafb;
  }
  .notif-item-viewed {
    background-color: rgba(45, 203, 115, 0.08);
  }

  .status-circle {
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .status-circle-success {
    background-color: rgba(45, 203, 115, 0.12);
    color: var(--success-color);
  }
  .status-circle-warning {
    background-color: rgba(253, 199, 0, 0.14);
    color: var(--warning-color);
  }
  .status-circle-error {
    background-color: rgba(231, 0, 10, 0.1);
    color: var(--danger-color);
  }

  [data-theme='dark'] {
    .notif-panel {
      background-color: var(--surface-section);
    }
    .notif-bar {
      background-color: var(--table-header);
    }
    .notif-item {
      background-color: var(--surface-ground);
    }
  }
</style>
