<script setup>
  // Sahifa OCHIQ bo'lganda chiqadigan o'z toast'imiz (brauzer bildirishnomasi emas —
  // uni `public/firebase-messaging-sw.js` faqat tab ko'rinmaganda chizadi).
  import { useNotify } from '@/composables/useNotify'
  import { notificationTypes } from '@utils'
  import { Dismiss20Filled } from '@vicons/fluent'
  import { useNotificationStore } from '@stores'
  import dayjs from 'dayjs'
  import { usePushDetail } from '@/composables/usePushDetail.js'

  const { notifications, remove, pause, resume } = useNotify()

  const store = useNotificationStore()
  const pushDetail = usePushDetail()

  // `type` allaqachon useNotify'da normallashtirilgan, lekin eski meta'lardan
  // notanish qiymat kelsa ham komponent yiqilmasin.
  const typeOf = (item) => notificationTypes[item.type] || notificationTypes.info

  // Toast meta'sidan modal uchun ma'lumot (rasm va tur ham uzatiladi).
  const toViewData = (item) => ({
    alert: item.meta.alert || item.meta.type,
    type: item.meta.type,
    title: item.meta.title,
    message: item.meta.message,
    image_url: item.meta.image_url || null
  })

  // Qo'ng'iroq badge'i uchun o'qilmaganlar ro'yxatiga qo'shadi.
  const pushToUnread = (item, data) => {
    store.userUnreadNotificationsCount++
    store.userUnreadNotifications.unshift({
      id: item.meta.id,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data
    })
  }

  const onClickClose = (item) => {
    // Tizim ogohlantirishlari (masalan ovoz apparati yo'qligi) `meta` siz keladi — ular
    // bildirishnomalar ro'yxatiga tushmaydi, shunchaki yopiladi
    if (!item.meta) {
      remove(item.id)
      return
    }
    pushToUnread(item, toViewData(item))
    remove(item.id)
  }

  const onClickNotification = (item) => {
    if (!item.meta) {
      remove(item.id)
      return
    }
    const data = toViewData(item)
    pushDetail.open({
      id: item.meta.id,
      created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      type: data.type || data.alert,
      title: data.title,
      message: data.message,
      image_url: data.image_url
    })
    pushToUnread(item, data)
    remove(item.id)
  }
</script>

<template>
  <!-- `Teleport`: stack `position: fixed` — ota-elementdagi `transform`/`filter`
       uni o'ziga bog'lab qo'ymasligi uchun to'g'ridan-to'g'ri `body` ga chiqaramiz. -->
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <article
          v-for="item in notifications"
          :key="item.id"
          :class="['toast', `toast--${item.type}`]"
          @click="onClickNotification(item)"
          @mouseenter="pause(item.id)"
          @mouseleave="resume(item.id)"
        >
          <!-- Turni bir qarashda bildiradigan chap chiziq. -->
          <span class="toast__accent" />

          <span class="toast__icon">
            <component :is="typeOf(item).icon" class="size-[18px]" />
          </span>

          <div class="toast__body">
            <p class="toast__title">{{ item.content }}</p>
            <p v-if="item.meta?.message" class="toast__text">{{ item.meta.message }}</p>
          </div>

          <img v-if="item.meta?.image_url" :src="item.meta.image_url" alt="" class="toast__thumb" />

          <button
            type="button"
            class="toast__close"
            aria-label="close"
            @click.stop="onClickClose(item)"
          >
            <Dismiss20Filled class="size-3.5" />
          </button>

          <!-- Qancha vaqt qolganini ko'rsatadi; sichqoncha ustida to'xtaydi. -->
          <span
            v-if="item.duration > 0"
            class="toast__progress"
            :style="{
              animationDuration: `${item.duration}ms`,
              animationPlayState: item.paused ? 'paused' : 'running'
            }"
          />
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
  .toast-stack {
    position: fixed;
    top: 56px;
    right: 16px;
    z-index: 9999;
    display: flex;
    width: 360px;
    flex-direction: column;
    gap: 10px;
    /* Konteyner bosishlarni yutmasin — faqat toast'ning o'zi bosiladi. */
    pointer-events: none;
  }

  /* Telefonda qat'iy kenglik sig'maydi — chetlardan 12px qoldirib cho'ziladi. */
  @media (max-width: 479.98px) {
    .toast-stack {
      right: 12px;
      left: 12px;
      width: auto;
    }
  }

  .toast {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    overflow: hidden;
    padding: 12px 12px 12px 16px;
    border: 1px solid var(--surface-line);
    border-radius: 14px;
    /* Oldin qat'iy `rgba(255,255,255,.59)` edi — dark temada oqarib ketardi.
       Endi fon tema o'zgaruvchisidan, blur esa ustidan qo'shimcha qatlam. */
    background: color-mix(in srgb, var(--surface-section) 88%, transparent);
    box-shadow: 0 10px 30px rgb(16 24 40 / 12%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    pointer-events: auto;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .toast:hover {
    transform: translateX(-2px);
    box-shadow: 0 14px 36px rgb(16 24 40 / 18%);
  }

  /* Turga qarab rang — bitta joyda, qolgani shu o'zgaruvchidan oziqlanadi. */
  .toast--info {
    --toast-color: var(--info-color);
  }

  .toast--success {
    --toast-color: var(--success-color);
  }

  .toast--warning {
    --toast-color: var(--warning-color);
  }

  .toast--error {
    --toast-color: var(--danger-color);
  }

  .toast__accent {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: var(--toast-color);
  }

  .toast__icon {
    display: flex;
    height: 30px;
    width: 30px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: color-mix(in srgb, var(--toast-color) 14%, transparent);
    color: var(--toast-color);
  }

  .toast__body {
    min-width: 0;
    flex: 1;
    /* Yopish tugmasi ostiga kirib ketmasin. */
    padding-right: 18px;
  }

  .toast__title {
    display: -webkit-box;
    overflow: hidden;
    color: var(--textColor0);
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .toast__text {
    display: -webkit-box;
    overflow: hidden;
    margin-top: 2px;
    color: var(--textColor2);
    font-size: 12px;
    line-height: 16px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .toast__thumb {
    height: 40px;
    width: 40px;
    flex-shrink: 0;
    border-radius: 10px;
    object-fit: cover;
  }

  /* Oldin faqat hover'da ko'rinardi va kartochkadan tashqariga chiqib turardi —
     teginish qurilmalarida umuman bosib bo'lmasdi. Endi doim joyida. */
  .toast__close {
    position: absolute;
    top: 6px;
    right: 6px;
    display: flex;
    height: 20px;
    width: 20px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: var(--textColor3);
    cursor: pointer;
    opacity: 0.65;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      opacity 0.2s ease;
  }

  .toast:hover .toast__close {
    opacity: 1;
  }

  .toast__close:hover {
    background: var(--surface-line);
    color: var(--textColor0);
  }

  .toast__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background: var(--toast-color);
    opacity: 0.55;
    transform-origin: left center;
    animation: toast-progress linear forwards;
  }

  @keyframes toast-progress {
    from {
      transform: scaleX(1);
    }

    to {
      transform: scaleX(0);
    }
  }

  /* Kirish/chiqish — o'ngdan suzib kiradi, `PushPermissionAlert` bilan bir ohangda. */
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition:
      opacity 0.25s ease,
      transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .toast-enter-from {
    opacity: 0;
    transform: translateX(24px) scale(0.96);
  }

  .toast-leave-to {
    opacity: 0;
    transform: translateX(24px) scale(0.96);
  }

  /* Chiqayotgani oqimdan chiqsin — qolganlari silliq suriladi. */
  .toast-leave-active {
    position: absolute;
    right: 0;
    left: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .toast,
    .toast-enter-active,
    .toast-leave-active,
    .toast-move {
      transition: none;
    }

    .toast__progress {
      animation: none;
    }
  }
</style>
