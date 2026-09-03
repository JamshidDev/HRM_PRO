<script setup>
  import { navigations } from '../../data/navigations.js'
  import { VueDraggable } from 'vue-draggable-plus'
  import {
    ArrowReset20Regular,
    ChevronDown12Regular,
    ChevronDoubleLeft16Filled,
    Dismiss16Regular,
    Search20Regular
  } from '@vicons/fluent'
  import { useAccountStore, useAppStore, useSidebarMenuStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import { MiniMenuBadge, UIProfile, DownloadTask } from '@components'
  import SidebarPanelItem from './SidebarPanelItem.vue'

  const { t } = i18n.global
  const route = useRoute()
  const router = useRouter()

  const store = useAccountStore()
  const appStore = useAppStore()
  const menuStore = useSidebarMenuStore()
  const emits = defineEmits(['onChange', 'onOpen', 'onClose'])

  const sidebarThemeTooltipColors = {
    indigo: '#2F2C7F',
    blue: '#0C4089',
    green: '#00220E',
    // Mint temada tooltip qora rail yonida chiqadi — shuning uchun to'q fon + oq matn
    mint: '#1F1F1F'
  }
  const tooltipThemeOverrides = computed(() => {
    const color = sidebarThemeTooltipColors[appStore.sidebarTheme]
    if (!color) return undefined
    return { Tooltip: { color, textColor: '#fff' } }
  })

  const checkPage = (path) => {
    if ([AppPaths.Home, AppPaths.Info].includes(path)) {
      menuPath.value = null
      emits('onClose')
    }
  }

  watch(
    () => route.path,
    (newPath) => {
      checkPage(newPath)
    }
  )

  const showPanel = ref(true)
  const menuPath = ref(null)
  const collapse = ref(false)

  const controlCollapse = () => {
    collapse.value = !collapse.value
  }

  const nextPanel = (path) => {
    menuPath.value = path
    let index = navigations.findIndex((v) => v.path === path)
    if (navigations[index].children && navigations[index].children.length) {
      emits('onOpen')
    } else {
      router.push(navigations[index].path)
      emits('onClose')
    }
    showPanel.value = false
    setTimeout(() => {
      showPanel.value = true
    }, 150)
  }

  /**
   * Mobil kenglik — organizationLayout.scss dagi $mobile_device_screen_size (900px) bilan bir xil.
   * Bu o'lchamdan pastda sidebar kontentni to'liq qoplab turadi.
   */
  const isMobileWidth = () => window.matchMedia('(max-width: 899.5px)').matches

  const onChangePath = (item) => {
    if (item?.disable) return
    router.push(item.path)
    // Sahifa tanlangach qidiruv yopiladi — qaytib kelganda to'liq menyu ko'rinadi
    closeSearch()
    // Mobilda sahifaga o'tgach sidebar yopilsin (desktop holati saqlanmasin)
    if (isMobileWidth()) emits('onClose', false)
  }

  /**
   * Ko'rish qoidasi (bare slug YOKI uning '-read' varianti) endi store'dagi
   * `canView` getterida — router bilan AYNAN bir xil manba. Ilgari bu mantiq
   * shu yerda va router/index.js da alohida-alohida yozilgan edi.
   */
  const canView = (permission) => store.canView(permission)

  /**
   * Modul (mini-menyu) FAQAT o'zining module-access ruxsati bo'lsa ko'rinadi.
   * Avvalgi child-fallback yo'q (`instructions` kabi umumiy permission tufayli
   * hr/hrLeader Admin modulini ko'rib qolardi). Ichki sahifalar ham o'z
   * permissioni bilan filtrlanadi (children.filter, pastda).
   */
  const moduleVisible = (mod) => canView(mod.permission)

  const miniMenu = computed(() =>
    navigations
      .filter((v) => moduleVisible(v))
      .map((v) => ({
        index: v.index,
        label: v.label,
        path: v.path,
        icon: v.icon,
        name: v?.name,
        permission: v.permission
      }))
  )

  /**
   * When no module is selected yet (e.g. on the home page right after load),
   * fall back to the first module the user has access to so the sidebar panel
   * has something to show and the toggle button remains functional.
   */
  const fallbackMenuPath = computed(() => {
    const nav = navigations.find((v) => moduleVisible(v) && v.children?.length)
    return nav?.path ?? null
  })

  const effectiveMenuPath = computed(() => menuPath.value ?? fallbackMenuPath.value)

  const panelMenu = computed(() => {
    if (effectiveMenuPath.value == null) {
      return []
    }
    /**
     * It is impossible the navigation find returns undefined value
     * since effectiveMenuPath is either set when clicking one of the mini menus
     * or falls back to the first accessible module
     * if you think about the user typing from the router you have to implement navigation guard for routes
     */
    return navigations
      .find((v) => v.path === effectiveMenuPath.value)
      .children.map((v) => ({
        ...v,
        allowed: canView(v.permission)
      }))
      .filter((v) => v.allowed)
  })

  /* ------------------------------------------------------------------------
   * Menyuni pin qilish va drag-and-drop bilan tartiblash
   *
   * Sozlamalar `sidebarMenuStore` da (localStorage, foydalanuvchi bo'yicha) faqat
   * PATH ko'rinishida saqlanadi. Manba ro'yxat esa har doim `panelMenu` — u
   * allaqachon permissionlar bo'yicha filtrlangan, ya'ni ruxsati olib qo'yilgan
   * sahifa pinlangan bo'lsa ham menyuda chiqmaydi va saqlangan tartib uni
   * qaytarib keltirmaydi.
   * --------------------------------------------------------------------- */

  const dragging = ref(false)

  /**
   * Rol almashganda (`accountStore._changeRole` → `_index`) sidebar qayta mount
   * BO'LMAYDI, faqat `Home` ga o'tiladi. Shuning uchun scope o'zgarishini shu
   * yerda kuzatamiz — aks holda yangi rol eski rolning pin/tartibini ko'rardi.
   */
  watch(
    () => [store.account?.role?.id, store.account?.organization?.id].join('-'),
    () => menuStore.syncScope()
  )

  /** Pin faqat oddiy element uchun — `panel-item-multiple` guruhlari pinlanmaydi. */
  const isPinnable = (item) => Boolean(item?.path) && !item?.children?.length

  const toPaths = (items) => items.map((v) => v.path).filter(Boolean)

  /**
   * Saqlangan tartibga solish. Ro'yxatda yo'q element (navigations.js ga keyin
   * qo'shilgan sahifa) eng katta rank oladi — ya'ni o'z tabiiy tartibini saqlab
   * ro'yxat oxirida turadi (`Array.sort` barqaror).
   */
  const sortByStoredOrder = (items, storedOrder) => {
    const rank = new Map(storedOrder.map((path, index) => [path, index]))
    const rankOf = (item) => (rank.has(item.path) ? rank.get(item.path) : Number.MAX_SAFE_INTEGER)
    return [...items].sort((a, b) => rankOf(a) - rankOf(b))
  }

  const arrangedMenu = computed(() => {
    const modulePath = effectiveMenuPath.value
    const items = panelMenu.value
    if (!modulePath || !items.length) return { pinned: [], rest: [...items] }

    const pinnedPaths = menuStore.modulePinned(modulePath)
    const pinnedSet = new Set(pinnedPaths)
    const isPinnedItem = (item) => isPinnable(item) && pinnedSet.has(item.path)

    return {
      pinned: sortByStoredOrder(items.filter(isPinnedItem), pinnedPaths),
      rest: sortByStoredOrder(
        items.filter((v) => !isPinnedItem(v)),
        menuStore.moduleOrder(modulePath)
      )
    }
  })

  /**
   * VueDraggable model massivini o'zi mutatsiya qiladi, shuning uchun computed'ni
   * to'g'ridan-to'g'ri berib bo'lmaydi — lokal nusxa saqlanadi va modul/ruxsat/
   * sozlama o'zgarganda qayta sinxronlanadi.
   */
  const pinnedItems = ref([])
  const restItems = ref([])

  watch(
    arrangedMenu,
    ({ pinned, rest }) => {
      pinnedItems.value = pinned
      restItems.value = rest
    },
    { immediate: true }
  )

  /* ------------------------------------------------------------------------
   * Menyu bo'yicha qidiruv
   *
   * Ro'yxat qisqa emas (HRM modulida 25+ element), shuning uchun sarlavhadagi
   * lupa tugmasi qidiruv maydonini ochadi. Qidiruv FAQAT ko'rinishni filtrlaydi:
   * saqlangan pin/tartib tegilmaydi, shuning uchun qidiruv ochiq paytda
   * sudrash o'chiriladi (filtrlangan ro'yxatni sudrash to'liq tartibni
   * buzib yozib yuborardi).
   * --------------------------------------------------------------------- */

  const searchOpen = ref(false)
  const searchQuery = ref('')
  const searchInputRef = ref(null)

  const isSearching = computed(() => Boolean(searchQuery.value.trim()))

  const openSearch = async () => {
    searchOpen.value = true
    await nextTick()
    searchInputRef.value?.focus()
  }

  const closeSearch = () => {
    searchOpen.value = false
    searchQuery.value = ''
  }

  const labelOf = (item) => t(item?.label ?? '').toLowerCase()

  /** Guruh elementi ichki sahifasi nomi bo'yicha ham topiladi. */
  const matchesQuery = (item, needle) => {
    if (labelOf(item).includes(needle)) return true
    return Boolean(item.children?.some((child) => labelOf(child).includes(needle)))
  }

  const filterItems = (items) => {
    if (!isSearching.value) return items
    const needle = searchQuery.value.trim().toLowerCase()
    return items.filter((item) => matchesQuery(item, needle))
  }

  /**
   * VueDraggable yoziladigan model talab qiladi. Qidiruvsiz holatda bu asl
   * massivning o'zi (sudrash avvalgidek ishlaydi); qidiruv paytida esa sudrash
   * `:disabled` bilan to'xtatilgani uchun setter umuman chaqirilmaydi.
   */
  const visiblePinned = computed({
    get: () => filterItems(pinnedItems.value),
    set: (value) => {
      if (!isSearching.value) pinnedItems.value = value
    }
  })

  const visibleRest = computed({
    get: () => filterItems(restItems.value),
    set: (value) => {
      if (!isSearching.value) restItems.value = value
    }
  })

  const searchEmpty = computed(
    () => isSearching.value && !visiblePinned.value.length && !visibleRest.value.length
  )

  // Modul almashsa qidiruv o'z-o'zidan yopiladi — yangi menyuda eski so'rov
  // bo'yicha bo'sh ro'yxat ko'rinib qolmasin.
  watch(effectiveMenuPath, closeSearch)

  const persistArrangement = () => {
    const modulePath = effectiveMenuPath.value
    // Ro'yxat bo'sh bo'lsa (masalan ruxsatlar hali yuklanmagan) saqlamaymiz —
    // aks holda foydalanuvchining tartibi o'chib ketardi.
    if (!modulePath || !panelMenu.value.length) return
    menuStore.setModulePrefs(
      modulePath,
      toPaths(pinnedItems.value.filter(isPinnable)),
      toPaths(restItems.value)
    )
  }

  // Sortable'ning `end` hodisasi model yangilanishidan oldin ham chiqishi mumkin.
  const onDragEnd = () => {
    dragging.value = false
    nextTick(persistArrangement)
  }

  const togglePin = (item) => {
    const modulePath = effectiveMenuPath.value
    if (!modulePath || !isPinnable(item)) return

    const pinnedPaths = toPaths(pinnedItems.value)
    const restPaths = toPaths(restItems.value)

    if (!pinnedPaths.includes(item.path)) {
      menuStore.setModulePrefs(
        modulePath,
        [...pinnedPaths, item.path],
        restPaths.filter((path) => path !== item.path)
      )
      return
    }

    // Pindan chiqarilgan element navigations.js dagi tabiiy qo'shnisi yoniga
    // qaytadi — ro'yxat oxiriga tashlanib ketmaydi.
    const naturalIndex = new Map(panelMenu.value.map((v, index) => [v.path, index]))
    const own = naturalIndex.get(item.path) ?? -1
    const at = restPaths.findIndex((path) => (naturalIndex.get(path) ?? -1) > own)
    const nextRest = restPaths.filter((path) => path !== item.path)
    nextRest.splice(at === -1 ? nextRest.length : at, 0, item.path)

    menuStore.setModulePrefs(
      modulePath,
      pinnedPaths.filter((path) => path !== item.path),
      nextRest
    )
  }

  const isArranged = computed(() => menuStore.hasCustomization(effectiveMenuPath.value))

  const resetArrangement = () => {
    if (effectiveMenuPath.value) menuStore.resetModule(effectiveMenuPath.value)
  }

  /**
   * Panel sarlavhasi uchun MAXSUS nomlar: mini-menyudagi qisqa nom ("Xodimlar")
   * o'rniga to'liq shakli ("Xodimlar menyusi") ko'rsatiladi.
   */
  const panelTitleKeys = {
    '/hrm': 'sidebar.hrm',
    '/attestation': 'sidebar.attestation',
    '/admin': 'sidebar.admin',
    '/chat': 'sidebar.chat',
    '/docflow': 'sidebar.docflow',
    '/timesheet': 'sidebar.timesheet',
    '/turnstile': 'turnstile.title',
    '/lms': 'sidebar.lms',
    [AppPaths.Hospital]: 'sidebar.hospital',
    [AppPaths.Accountant]: 'sidebar.accountant'
  }

  const menuName = computed(() => {
    const path = effectiveMenuPath.value
    if (!path) return ''
    const titleKey = panelTitleKeys[path]
    if (titleKey) return t(titleKey)
    // Maxsus nomi yo'q modul (`/extra` — "Qo'shimchalar") sarlavhasiz qolmasin:
    // mini-menyudagi o'z nomi ishlatiladi.
    const navLabel = navigations.find((v) => v.path === path)?.label
    return navLabel ? t(navLabel) : ''
  })

  const onClick = () => {
    if (panelMenu.value?.length) {
      emits('onChange')
    }
  }

  const currentCategory = computed(() => {
    const nav = navigations.find((n) => n.path === effectiveMenuPath.value)
    return nav?.name || null
  })

  const isComboxMenu = (path) => {
    // if (route.path.includes(path)) {
    //   menuPath.value = path
    // }
    return effectiveMenuPath.value === path || route.path.includes(path)
  }

  const isCurrentPath = (path) => {
    return route.path === path
  }

  onMounted(() => {
    // Sidebar har login'dan keyin qaytadan mount bo'ladi — sozlamalar shu yerda
    // joriy foydalanuvchi kaliti bilan o'qiladi.
    menuStore.load()
    checkPage(route.path)
    const activeNav = navigations.find(
      (nav) => route.path.startsWith(nav.path) && nav.children?.length
    )
    if (activeNav) {
      menuPath.value = activeNav.path
      emits('onOpen')
    }
  })
</script>

<template>
  <div class="sidebar-content">
    <div class="sidebar-card m-2 rounded-3xl overflow-hidden flex">
      <div class="mini-content">
        <div class="mini-top-group">
          <div
            @click="() => router.push({ name: AppPaths.Home.substring(1) })"
            class="logo-content cursor-pointer"
          >
            <img :src="useAppSetting.appLogoUrl" alt=" " class="object-center animation-logo" />
          </div>

          <div class="mini-menu-scroll">
            <template v-for="item in miniMenu" :key="item">
              <n-tooltip trigger="hover" placement="right" :theme-overrides="tooltipThemeOverrides">
                <template #trigger>
                  <div
                    :class="[isComboxMenu(item.path) && 'active-mini-content']"
                    class="main-menu-item"
                    @click="nextPanel(item.path)"
                  >
                    <MiniMenuBadge :category="item?.name ?? undefined" />
                    <n-icon>
                      <component :is="item.icon" />
                    </n-icon>
                  </div>
                </template>
                {{ $t(item.label) }}
              </n-tooltip>
            </template>
          </div>
        </div>
        <div class="flex flex-col items-center gap-[10px]">
          <DownloadTask />
          <!-- <PageInstruction /> -->
          <!-- <NotificationsWidget /> -->
          <UIProfile />
        </div>
      </div>
      <div
        class="panel-content sidebar-panel overflow-y-auto! h-full"
        style="scrollbar-width: none"
      >
        <transition name="slide-right" mode="out-in">
          <div v-if="showPanel && panelMenu?.length">
            <div
              class="sticky top-0 z-10 bg-surface-section pt-2 -mt-2"
              :class="{ 'sidebar-themed-sticky': appStore.sidebarTheme !== 'default' }"
            >
              <!--
                `h-7` — qat'iy balandlik: sarlavha (20px) va qidiruv maydoni (28px)
                bir xil joyni egallashi uchun. Aks holda maydon ochilganda butun
                menyu pastga siljib ketardi.

                `pl-1` — lupa qo'shilgach sarlavhaga joy qolmay, uzun nomlar
                ("Xabar va e'lonlar menyusi") kesilib qolardi; qator chapga surildi.
              -->
              <div class="flex items-center gap-1 pl-2 pr-1 mb-3 h-7">
                <!--
                  Qidiruv ochilganda sarlavha o'rnini maydon egallaydi: panel tor
                  (240px), ikkalasi yonma-yon sig'maydi.
                -->
                <template v-if="searchOpen">
                  <n-icon size="16" class="menu-head-btn shrink-0 cursor-default">
                    <Search20Regular />
                  </n-icon>
                  <input
                    ref="searchInputRef"
                    v-model="searchQuery"
                    type="text"
                    class="menu-search-input flex-1 min-w-0"
                    :placeholder="$t('sidebar.searchPlaceholder')"
                    @keydown.esc="closeSearch"
                  />
                  <n-icon
                    size="16"
                    class="menu-head-btn shrink-0"
                    :title="$t('content.cancel')"
                    @click="closeSearch"
                  >
                    <Dismiss16Regular />
                  </n-icon>
                </template>

                <template v-else>
                  <n-icon
                    size="16"
                    class="menu-head-btn shrink-0"
                    :title="$t('sidebar.searchMenu')"
                    @click="openSearch"
                  >
                    <Search20Regular />
                  </n-icon>
                  <span class="text-sm text-textColor2 truncate font-semibold flex-1 min-w-0">
                    {{ menuName }}
                  </span>
                  <!-- Tiklash qaytarib bo'lmaydi — tasdiqsiz bajarilmaydi -->
                  <n-popconfirm
                    v-if="isArranged"
                    placement="bottom-end"
                    :positive-text="$t('content.yes')"
                    :negative-text="$t('content.no')"
                    @positive-click="resetArrangement"
                  >
                    <template #trigger>
                      <n-icon
                        size="16"
                        class="menu-reset-btn shrink-0"
                        :title="$t('sidebar.resetOrder')"
                      >
                        <ArrowReset20Regular />
                      </n-icon>
                    </template>
                    {{ $t('sidebar.resetOrderConfirm') }}
                  </n-popconfirm>
                </template>
              </div>
              <div class="border-b border-surface-line -mx-1 mb-5"></div>
            </div>

            <!--
              Pinlangan elementlar. Guruh bo'sh bo'lganda ham DOM'da QOLADI (balandligi
              4px ga tushadi): `v-if` bilan olib tashlansa, oxirgi pinlangan elementni
              sudrab chiqarish paytida Sortable boshqarayotgan konteyner yo'q bo'lib,
              drag yarim yo'lda uzilardi. Sudrash boshlanganda zona ko'rinadigan
              "tashlab pin qilish" maydoniga aylanadi.
            -->
            <div class="relative" :class="pinnedItems.length && 'mb-1'">
              <VueDraggable
                v-model="visiblePinned"
                group="sidebar-panel-menu"
                :animation="150"
                :delay="250"
                :delay-on-touch-only="true"
                :disabled="isSearching"
                class="menu-drop-zone"
                :class="{
                  'menu-drop-zone-empty': !pinnedItems.length,
                  'menu-drop-zone-active': !pinnedItems.length && dragging
                }"
                @start="dragging = true"
                @end="onDragEnd"
              >
                <SidebarPanelItem
                  v-for="item in visiblePinned"
                  :key="item.path"
                  :item="item"
                  :category="currentCategory"
                  :active="isCurrentPath(item.path)"
                  pinned
                  @select="onChangePath"
                  @toggle-pin="togglePin"
                />
              </VueDraggable>
              <span v-if="!pinnedItems.length && dragging" class="menu-drop-hint">
                {{ $t('sidebar.dropToPin') }}
              </span>
            </div>

            <div
              v-if="pinnedItems.length"
              class="border-b border-dashed border-surface-line -mx-1 mb-3"
            ></div>

            <VueDraggable
              v-model="visibleRest"
              group="sidebar-panel-menu"
              :animation="150"
              :delay="250"
              :delay-on-touch-only="true"
              :disabled="isSearching"
              class="menu-drop-zone"
              @start="dragging = true"
              @end="onDragEnd"
            >
              <template v-for="item in visibleRest" :key="item.path ?? item.label">
                <div v-if="item?.children && item.children.length > 0" class="panel-item-multiple">
                  <div class="panel-header" @click="controlCollapse">
                    <div class="item-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <div class="item-title">
                      <span>{{ $t(item.label) }}</span>
                      <n-icon size="18">
                        <ChevronDown12Regular />
                      </n-icon>
                    </div>
                  </div>
                  <div
                    class="panel-body pl-2"
                    :style="{ height: collapse ? item.children.length * 38 + 'px' : '0px' }"
                  >
                    <div v-for="subMenu in item.children" :key="subMenu.path" class="panel-item">
                      <div class="item-icon">
                        <i :class="subMenu.icon"></i>
                      </div>
                      <div class="item-title">{{ $t(subMenu.label) }}</div>
                    </div>
                  </div>
                </div>

                <SidebarPanelItem
                  v-else
                  :item="item"
                  :category="currentCategory"
                  :active="isCurrentPath(item.path)"
                  @select="onChangePath"
                  @toggle-pin="togglePin"
                />
              </template>
            </VueDraggable>

            <div v-if="searchEmpty" class="menu-search-empty">
              {{ $t('sidebar.searchEmpty') }}
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div @click="onClick" class="control-btn border border-surface-line">
      <n-icon>
        <ChevronDoubleLeft16Filled />
      </n-icon>
    </div>
  </div>
</template>

<style scoped>
  .slide-right-enter-active {
    transition: all 0.2s ease;
  }

  .slide-right-leave-active {
    transition: all 0.2s ease;
  }

  .slide-right-enter-from {
    transform: translateX(-20px);

    opacity: 0;
  }

  .slide-right-enter-to {
    transform: translateX(0px);
    opacity: 1;
  }

  .slide-right-leave-from {
    transform: translateX(0px);
    opacity: 1;
  }

  .slide-right-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }

  .sidebar-card {
    border: 1px solid #eaecf0;
  }

  [data-theme='dark'] {
    .sidebar-card {
      border: 1px solid #2b3d55;
    }
  }

  [data-sidebar-theme='indigo'],
  [data-sidebar-theme='blue'],
  [data-sidebar-theme='green'] {
    .sidebar-card {
      border-color: rgba(255, 255, 255, 0.15);
    }
  }

  /* Mint — och panelli tema: oq border ko'rinmaydi, to'q shaffof kerak */
  [data-sidebar-theme='mint'] {
    .sidebar-card {
      border-color: rgba(16, 24, 40, 0.08);
    }
  }
</style>
