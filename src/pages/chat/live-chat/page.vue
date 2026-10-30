<script setup>
  import { UIPageContent } from '@components'
  import { ChatSidebar, ChatWindow, EmptyState } from './ui'
  import { useLiveChat } from './ui/useLiveChat.js'
  import { useLiveChatStore } from '@/store/modules/chat/liveChatStore.js'
  import { useAppBreakpoints } from '@/composables/useBreakpoint.js'

  const chat = useLiveChat()
  const store = useLiveChatStore()
  const { isMobile } = useAppBreakpoints()

  // Mobil: avval faqat ro'yxat; suhbat tanlansa — butun ekranli oyna (Telegram kabi).
  const mobileChatOpen = computed(() => isMobile.value && !!chat.selectedUserId.value)

  // To'liq ekran — faqat desktop/planshetda (mobilda suhbat allaqachon butun ekranda).
  // `fsActive` — panel haqiqatda body'da (fixed) turganmi; chiqishda animatsiya tugaguncha true qoladi.
  const fsActive = ref(false)
  const fullscreenOn = computed(() => fsActive.value && !isMobile.value)

  // Kirish/chiqish animatsiyasi: panel sahifadagi o'rnidan butun oynaga "kengayadi" va
  // qaytishda yana o'sha joyga "yig'iladi" (chetlari top/left/right/bottom bo'yicha siljiydi).
  const panelRef = ref(null)
  const pageContentRef = ref(null)
  const FS_MS = 300
  const FS_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
  const FULL = { top: '0px', left: '0px', right: '0px', bottom: '0px' }
  let fsAnim = null

  const insetOf = (r) => ({
    top: `${r.top}px`,
    left: `${r.left}px`,
    right: `${window.innerWidth - r.right}px`,
    bottom: `${window.innerHeight - r.bottom}px`
  })

  // Panelning sahifadagi joyi — UIPageContent'ning ichki (paddingsiz) qutisi.
  const slotRect = () => {
    const el = pageContentRef.value?.$el
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      top: r.top + parseFloat(cs.paddingTop),
      left: r.left + parseFloat(cs.paddingLeft),
      right: r.right - parseFloat(cs.paddingRight),
      bottom: r.bottom - parseFloat(cs.paddingBottom)
    }
  }

  watch(
    () => chat.fullscreen.value,
    async (on) => {
      fsAnim?.cancel()
      fsAnim = null
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (isMobile.value || reduceMotion) {
        fsActive.value = on
        return
      }
      if (on) {
        const from = panelRef.value?.getBoundingClientRect()
        fsActive.value = true
        await nextTick()
        if (!panelRef.value || !from) return
        fsAnim = panelRef.value.animate(
          [{ ...insetOf(from), borderRadius: '20px' }, { ...FULL, borderRadius: '0px' }],
          { duration: FS_MS, easing: FS_EASE }
        )
        return
      }
      const to = slotRect()
      if (!panelRef.value || !to || !fsActive.value) {
        fsActive.value = false
        return
      }
      const anim = panelRef.value.animate(
        [{ ...FULL, borderRadius: '0px' }, { ...insetOf(to), borderRadius: '20px' }],
        { duration: FS_MS, easing: FS_EASE, fill: 'forwards' }
      )
      fsAnim = anim
      await anim.finished.catch(() => {})
      // Animatsiya paytida qayta bosilgan bo'lsa — yangi holat o'zi boshqaradi.
      if (fsAnim !== anim) return
      fsActive.value = false
      await nextTick()
      anim.cancel()
      fsAnim = null
    }
  )
  const onFullscreenKey = (e) => {
    if (e.key !== 'Escape' || !fullscreenOn.value) return
    // Ochiq modal/menyu bo'lsa — Esc avval ularni yopadi.
    if (document.querySelector('.n-modal-container .n-modal, .n-dropdown-menu, .n-popover')) return
    chat.setFullscreen(false)
  }

  // Brauzer menyusi butun sahifada o'chiq (matn maydonlarida ham) — o'ng klik faqat bizning menyular:
  // xabar/suhbat amallari, matn belgilanganda — qalin/kursiv.
  const onContextMenu = (e) => e.preventDefault()

  // Telefonning "orqaga" tugmasi sahifadan chiqib ketmasin — avval suhbatni yopsin.
  // Joriy URL o'zgarmaydi; router holati (history.state) saqlab qolinadi.
  let historyPushed = false
  watch(mobileChatOpen, (open) => {
    if (open && !historyPushed) {
      history.pushState({ ...history.state, liveChatOpen: true }, '')
      historyPushed = true
    } else if (!open && historyPushed) {
      historyPushed = false
      if (history.state?.liveChatOpen) history.back()
    }
  })
  const onPopState = () => {
    if (!historyPushed || history.state?.liveChatOpen) return
    historyPushed = false
    chat.closeChat()
  }

  onMounted(() => {
    store.init()
    store.loadConversations()
    if (store.selectedId) store.markRead(store.selectedId)
    window.addEventListener('popstate', onPopState)
    window.addEventListener('keydown', onFullscreenKey)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', onPopState)
    window.removeEventListener('keydown', onFullscreenKey)
    chat.setFullscreen(false)
    // Mobilda sahifaga qaytilganda avval ro'yxat ko'rinsin. `historyPushed` oldin o'chiriladi —
    // aks holda watch `history.back()` qilib, hozirgi o'tishni bekor qilib yuborishi mumkin.
    historyPushed = false
    if (isMobile.value) chat.closeChat()
  })
</script>

<template>
  <div class="!h-full" @contextmenu="onContextMenu">
    <!-- Brauzer kontekst menyusi butunlay o'chirilgan (o'ng klik — faqat o'z menyularimiz). -->
    <UIPageContent ref="pageContentRef" class="!h-full">
      <!-- Ro'yxat va suhbat bitta panelda (orasida faqat ingichka chiziq). To'liq ekranda panel
           o'z joyida `position: fixed` bo'lib, ilova menyusi/sarlavhasi ustidan butun oynani egallaydi.
           Teleport ishlatilmaydi: DOM ko'chirilsa brauzer scroll'ni nolga tushiradi, ovozli xabar
           to'xtaydi va fokus yo'qoladi — suhbat "qayta yuklangandek" ko'rinardi. -->
      <div
        ref="panelRef"
        class="live-chat-panel flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-section md:flex-row"
        :class="fullscreenOn ? 'fixed inset-0 z-[101]' : 'rounded-[20px] border border-surface-line/50'"
      >
        <div
          class="flex flex-col pt-3 md:min-h-0 md:w-[280px] md:shrink-0 md:border-r md:border-surface-line/60 xl:w-[310px]"
        >
          <ChatSidebar :chat="chat" />
        </div>

        <!-- Mobilda suhbat body'ga ko'chiriladi: header/sidebar ustida butun ekranni egallaydi. -->
        <Teleport to="body" :disabled="!isMobile">
          <Transition :name="isMobile ? 'chat-slide' : ''">
            <div
              v-if="!isMobile || mobileChatOpen"
              :class="
                isMobile
                  ? 'live-chat-mobile fixed inset-x-0 top-0 z-[95] flex flex-col bg-surface-section'
                  : 'min-w-0 flex-1 md:min-h-0'
              "
            >
              <Transition name="pane-fade" mode="out-in">
                <ChatWindow
                  v-if="chat.selectedUserId.value"
                  :chat="chat"
                  :mobile="isMobile"
                  class="h-full min-h-0 flex-1"
                  @back="chat.closeChat"
                />
                <EmptyState v-else />
              </Transition>
            </div>
          </Transition>
        </Teleport>
      </div>
    </UIPageContent>
  </div>
</template>

<style scoped>
  /* `svh` emas `dvh`: klaviatura/manzil paneli o'zgarganda kiritish maydoni ko'rinib tursin. */
  .live-chat-mobile {
    height: 100dvh;
    padding-bottom: env(safe-area-inset-bottom);
  }
  /* Bo'sh holat ↔ suhbat oynasi (desktop) */
  .pane-fade-enter-active,
  .pane-fade-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }
  .pane-fade-enter-from,
  .pane-fade-leave-to {
    opacity: 0;
    transform: scale(0.99);
  }
  .chat-slide-enter-active,
  .chat-slide-leave-active {
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;
  }
  .chat-slide-enter-from,
  .chat-slide-leave-to {
    transform: translateX(24%);
    opacity: 0;
  }
</style>
