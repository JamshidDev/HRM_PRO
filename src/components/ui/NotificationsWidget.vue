<script setup>
  import { cn, notificationTypes, useDebounce, Utils } from '@utils'
  import { useNotificationStore } from '@stores'
  import { Alert16Filled, CommentMultipleCheckmark24Filled } from '@vicons/fluent'
  import { NoDataPicture, UIEditorViewer, UIModal } from '@components'
  import dayjs from 'dayjs'
  import NotificationBadge from '@pages/chat/notification/ui/NotificationBadge.vue'

  const store = useNotificationStore()

  const observer = ref(null)
  const notifactionIdsToRead = new Set()
  const scrollContainer = ref(null)

  const setupObserver = () => {
    if (!scrollContainer.value) return
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
          const notificationId = entry.target.dataset.notificationId
          const isRead = Number(entry.target.dataset.isRead)
          if (isRead === 0) {
            notifactionIdsToRead.add(notificationId)
          }
        }
      })
    }

    observer.value = new IntersectionObserver(callback, options)

    for (let child of scrollContainer.value.children) {
      observer.value.observe(child)
    }
  }

  const viewAll = () => {
    store.userUnreadNotificationsLoading = true
    store._mark_read(
      {
        all: true
      },
      () => {
        store.userUnreadNotificationsLoading = false
      }
    )
  }

  watch(
    () => store.userUnreadNotifications,
    () => {
      nextTick(() => {
        setupObserver()
      })
    },
    {
      deep: true
    }
  )

  onMounted(() => {
    store._userUnreadNotificationsCount()
  })

  onBeforeUnmount(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  const onScrollEv = () => {
    const element = scrollContainer.value

    if (!element || store.userUnreadNotificationsLoading) return
    if (
      element.scrollTop + element.offsetHeight + 20 > element.scrollHeight &&
      store.userUnreadNotificationsCount > store.userUnreadNotifications.length
    ) {
      store.userUnreadNotificationsParams.page++
      store._userUnreadNotifications()
    }
  }

  const showViewModal = ref(false)

  watch(
    () => store.viewingNotification,
    (v) => {
      if (v) {
        showViewModal.value = true
      }
    }
  )

  const showPopover = ref(false)

  const onShow = (v) => {
    if (showViewModal.value && store.viewingNotification && !v) {
      return
    }

    if (observer.value) {
      observer.value.disconnect()
    }
    showPopover.value = v

    if (!v && notifactionIdsToRead.size) {
      store._mark_read({
        ids: Array.from(notifactionIdsToRead)
      })
    }

    if (v) {
      store.userUnreadNotifications = []
      store.userUnreadNotificationsParams.page = 1
      store._userUnreadNotifications()
    }
  }
</script>

<template>
  <n-popover
    arrow-wrapper-class="![--n-arrow-offset:18px]"
    class="!p-0 ![--n-border-radius:20px] -translate-x-2"
    placement="bottom-start"
    trigger="click"
    @update:show="onShow"
    :show="showPopover"
  >
    <template #trigger>
      <n-badge
        class="!text-[10px] header-app-badge"
        :value="store.userUnreadNotificationsCount"
        :offset="[4, -4]"
      >
        <n-icon id="taskBtn" size="28" class="cursor-pointer text-info">
          <Alert16Filled />
        </n-icon>
      </n-badge>
    </template>

    <div class="w-[300px] h-[300px] cursor-pointer overflow-hidden grid-rows-[auto_1fr_auto] grid">
      <div
        class="w-full border-b border-surface-line px-2 py-2 text-xs font-semibold flex justify-between items-center"
      >
        <span>{{ $t('notification.unreadPlural') }}</span>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button :disabled="!store.userUnreadNotificationsCount" @click="viewAll" size="small">
              <template #icon>
                <n-icon>
                  <CommentMultipleCheckmark24Filled />
                </n-icon>
              </template>
            </n-button>
          </template>
          <span>{{ $t('notification.markAllAsRead') }}</span>
        </n-tooltip>
      </div>

      <n-spin class="overflow-hidden" :show="store.userUnreadNotificationsLoading">
        <NoDataPicture
          v-if="!store.userNotificationsLoading && store.userUnreadNotifications.length === 0"
          class="!m-0 [&_svg]:!size-[120px] [&_.text-textColor2]:text-sm [&_.text-textColor3]:text-xs"
        />

        <div ref="scrollContainer" class="w-full h-full overflow-y-auto px-1" @scroll="onScrollEv">
          <template v-for="item in store.userUnreadNotifications" :key="item.id">
            <div
              :data-notification-id="item.id"
              :data-is-read="item.read_at ? 1 : 0"
              class="px-2 my-1 border border-surface-line rounded-xl pt-2 transition-all duration-300 hover:bg-info/10"
              @click="store.setViewingNotification({ ...item })"
            >
              <div class="w-full leading-[1]">
                <div class="grid grid-cols-[auto_1fr] gap-1">
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <div>
                        <component
                          :class="
                            cn(
                              'size-5 p-0.5 rounded-full inline-block shrink-0',
                              item.data.alert === notificationTypes.info.value &&
                                'bg-info/20 text-info',
                              item.data.alert === notificationTypes.success.value &&
                                'bg-success/20 text-success',
                              item.data.alert === notificationTypes.warning.value &&
                                'bg-warning/20 text-warning',
                              item.data.alert === notificationTypes.error.value &&
                                'bg-danger/20 text-danger'
                            )
                          "
                          :is="notificationTypes?.[item.data.alert]?.icon"
                        />
                      </div>
                    </template>
                    <span>{{ notificationTypes[item.data.alert].label }}</span>
                  </n-tooltip>
                  <div>
                    <span class="text-sm line-clamp-2">
                      {{ item?.data?.title }}
                    </span>
                    <span class="text-xs text-textColor3">{{
                      dayjs(item.created_at).format('MMM DD, HH:mm')
                    }}</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-between items-center mt-1 pb-1"></div>
            </div>
          </template>
        </div>
      </n-spin>
      <!--          @click="goViewAll"-->
      <!--      <div-->
      <!--          class="w-full text-center border-t border-surface-line px-2 py-2 text-xs hover:bg-surface-ground/50 transition-colors"-->
      <!--      >-->
      <!--        {{ $t('content.viewAll') }}-->
      <!--      </div>-->
    </div>
  </n-popover>
  <UIModal v-model:visible="showViewModal" :width="700">
    <template #header-title>
      <p>{{ store.viewingNotification?.data?.title }}</p>
      <span class="text-sm text-textColor3">{{
        dayjs(store.viewingNotification.created_at).format('MMM DD, HH:mm')
      }}</span>
    </template>
    <div
      class="grid grid-rows-[1fr_auto] h-[500px] relative"
      v-if="store.viewingNotification?.data?.message"
    >
      <UIEditorViewer :html="store.viewingNotification?.data?.message" />

      <component
        :is="notificationTypes[store.viewingNotification?.data?.alert]?.icon"
        class="size-20 absolute right-0 bottom-10 text-textColor3/60"
      />
      <component
        :is="notificationTypes[store.viewingNotification?.data?.alert]?.icon"
        class="size-10 absolute right-0 bottom-30 text-textColor3/60"
      />
      <component
        :is="notificationTypes[store.viewingNotification?.data?.alert]?.icon"
        class="size-8 absolute right-20 bottom-12 text-textColor3/60"
      />
      <component
        :is="notificationTypes[store.viewingNotification?.data?.alert]?.icon"
        class="size-6 absolute right-18 bottom-28 text-textColor3/60"
      />

      <div class="flex items-center justify-between">
        <NotificationBadge
          v-if="store.viewingNotification.data.alert"
          :alert="store.viewingNotification.data.alert"
        />
        <p class="text-sm text-textColor3">
          {{ $t('content.read') }}:
          <b>{{
            dayjs(store?.viewingNotification?.read_at || undefined).format('MMM DD, HH:mm')
          }}</b>
        </p>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  .transition-all {
    transition: all 0.3s ease;
  }
</style>
