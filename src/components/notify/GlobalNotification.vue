<script setup>
  import { useNotify } from '@/composables/useNotify'
  import {cn, notificationTypes} from "@utils";
  import {Dismiss20Filled} from "@vicons/fluent"
  import {useNotificationStore} from "@stores";
  import dayjs from "dayjs";
  const { notifications, remove } = useNotify()

  const store = useNotificationStore()
  const onClickClose = (item)=>{
    store.userUnreadNotificationsCount++
    store.userUnreadNotifications.unshift({
      id: item.meta.id,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: {
        alert: item.meta.alert,
        title: item.meta.title,
        message: item.meta.message,
      }
    })
    remove(item.id)
  }

  const onClickNotification = (item)=>{
    console.log(item)
    store.setViewingNotification({
      id: item.meta.id,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: {
        alert: item.meta.alert,
        title: item.meta.title,
        message: item.meta.message,
      }
    })
    remove(item.id)
  }

</script>

<template>
  <div class="fixed top-[50px] right-2 z-[9999] flex flex-col gap-2 w-[280px]">
    <TransitionGroup name="notify">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="
          rounded-lg cursor-pointer w-full notification-blurry-bg px-2 py-2 flex items-center gap-1 relative group
        "
        @click="()=>onClickNotification(item)"
      >
        <div @click.stop="()=>onClickClose(item)" class="hidden group-hover:block absolute top-0 left-0 -translate-1/2 p-0.5 rounded-full border border-surface/10 bg-danger/30 cursor-pointer hover:bg-danger/20 dark:bg-surface-ground transition-all">
          <Dismiss20Filled class="size-3 text-danger" />
        </div>
        <div class="relative">
          <component
              :class="cn('size-7 p-0.5 rounded-full inline-block shrink-0',
                item.type===notificationTypes.info.value && 'bg-info/20 text-info',
                item.type===notificationTypes.success.value && 'bg-success/20 text-success',
                item.type===notificationTypes.warning.value && 'bg-warning/20 text-warning',
                item.type===notificationTypes.error.value && 'bg-danger/20 text-danger')"
              :is="notificationTypes[item.type].icon"
          />
          <div :class="cn('absolute size-7 rounded-full top-1/2 left-1/2 -translate-1/2 custom-animate-pulse opacity-0',
          item.type===notificationTypes.info.value && 'bg-info/10',
                item.type===notificationTypes.success.value && 'bg-success/10',
                item.type===notificationTypes.warning.value && 'bg-warning/10',
                item.type===notificationTypes.error.value && 'bg-danger/10'
                )">

          </div>
        </div>
        <span class="line-clamp-1 font-medium text-textColor0">{{ item.content }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
  .notify-move,
  .notify-enter-active,
  .notify-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .notify-enter-from {
    opacity: 0;
    transform: translateY(-30px) scale(0.8);
  }

  .notify-leave-to {
    opacity: 0;
    transform: translateY(-100px) scale(0.8);
  }

  .notify-leave-active {
    position: absolute;
    right: 0;
  }
  .notification-blurry-bg{
    /* From https://css.glass */
    background: rgba(255, 255, 255, 0.59);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(8.3px);
    -webkit-backdrop-filter: blur(8.3px);
    border: 1px solid rgba(255, 255, 255, 0.56);
  }

  [data-theme="dark"] .notification-blurry-bg{
    /* From https://css.glass */
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .custom-animate-pulse {
    animation: pulse-fade 2s ease-out 5;
  }

  @keyframes pulse-fade{
    70%{
      opacity: 1;
    }
    85%{
      opacity: 0.5;
    }
    90%{
      opacity: 0;
    }
    100%{
      transform: scale(2);
    }
  }
</style>
