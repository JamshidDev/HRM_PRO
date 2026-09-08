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
  import { MenuItemBadge } from '@components'

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
    mint: '#111111'
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
  /**
   * Ochiladigan guruhlar (masalan «Hujjatlar») — har biri alohida holatda.
   * Ilgari bitta umumiy `collapse` bor edi: ikkita guruh birga ochilib ketardi.
   */
  const openGroups = ref(new Set())

  const isGroupOpen = (item) => openGroups.value.has(item.label)

  const toggleGroup = (item) => {
    const next = new Set(openGroups.value)
    next.has(item.label) ? next.delete(item.label) : next.add(item.label)
    openGroups.value = next
  }

  /*
   * Guruh ochilish/yopilish animatsiyasi — balandlik JS'da o'lchanadi.
   * Sof CSS variantlari (grid `0fr→1fr`, qat'iy `max-height`) bu yerda ishlamaydi:
   * birinchisi eski uslublar bilan to'qnashadi, ikkinchisi bolalar soni oldindan
   * noma'lum bo'lgani uchun yo qadamli sakraydi, yo oxirgi qatorni kesib qo'yadi.
   * `scrollHeight` esa har safar haqiqiy kontent balandligini beradi.
   */
  const onGroupEnter = (el) => {
    el.style.height = '0px'
    // Reflow: brauzer boshlang'ich holatni "ko'rmasa" o'tish umuman chizilmaydi.
    void el.offsetHeight
    el.style.height = `${el.scrollHeight}px`
  }

  const onGroupBeforeLeave = (el) => {
    el.style.height = `${el.scrollHeight}px`
    void el.offsetHeight
  }

  const onGroupLeave = (el) => {
    el.style.height = '0px'
  }

  // Ochilib bo'lgach qat'iy balandlik olib tashlanadi — ro'yxat keyinchalik
  // o'zgarsa (qidiruv, ruxsat) guruh kontentga moslashib qolaveradi.
  const onGroupAfterTransition = (el) => {
    el.style.height = ''
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
    return (
      navigations
        .find((v) => v.path === effectiveMenuPath.value)
        .children.map((v) => ({
          ...v,
          // Guruh bolalari ham o'z ruxsati bilan filtrlanadi.
          ...(v.children ? { children: v.children.filter((c) => canView(c.permission)) } : null),
          allowed: canView(v.permission)
        }))
        // Bolalari qolmagan guruh menyuda ko'rinmaydi.
        .filter((v) => v.allowed && (!v.children || v.children.length > 0))
    )
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
   * Tartib kaliti. Ochiladigan guruhning (masalan «Hujjatlar») `path` i YO'Q,
   * shuning uchun faqat `path` saqlansa guruh ro'yxatdan butunlay tushib qolar,
   * keyingi o'qishda esa "notanish element" bo'lib eng oxirga surilib ketardi.
   */
  const orderKey = (item) => item?.path ?? item?.label ?? ''

  const toOrderKeys = (items) => items.map(orderKey).filter(Boolean)

  /**
   * Saqlangan tartibga solish.
   *
   * Ro'yxatda YO'Q element (navigations.js ga keyin qo'shilgan sahifa yoki
   * guruh yozilmagan eski sozlama) o'z TABIIY qo'shnisi yonida qoladi: unga
   * oldingi elementdan keyingi kasr rank beriladi. Ilgari bunday element eng
   * katta rank olib, ro'yxat OXIRIGA tushib ketardi.
   */
  const sortByStoredOrder = (items, storedOrder) => {
    const rank = new Map(storedOrder.map((key, index) => [key, index]))
    const effective = new Map()
    // Kasr qadam 1 dan kichik — notanish element hech qachon keyingi
    // tanish elementdan oshib ketmaydi.
    const step = 1 / (items.length + 1)
    let previous = -1
    let gap = 0

    items.forEach((item) => {
      const key = orderKey(item)
      const stored = rank.get(key)
      if (stored === undefined) {
        gap += 1
        effective.set(key, previous + gap * step)
        return
      }
      previous = stored
      gap = 0
      effective.set(key, stored)
    })

    return [...items].sort((a, b) => effective.get(orderKey(a)) - effective.get(orderKey(b)))
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
   * Ochiladigan guruhlar ichidagi tartib — guruh yorlig'i bo'yicha xarita.
   * Bolalar guruhdan CHIQMAYDI, shuning uchun ular yuqori darajadagi `order` ga
   * emas, alohida `groups` sozlamasiga yoziladi.
   */
  const arrangedGroupChildren = computed(() => {
    const modulePath = effectiveMenuPath.value
    return panelMenu.value.reduce((acc, item) => {
      if (!item.children?.length) return acc
      acc[item.label] = sortByStoredOrder(
        item.children,
        modulePath ? menuStore.moduleGroupOrder(modulePath, item.label) : []
      )
      return acc
    }, {})
  })

  /**
   * VueDraggable model massivini o'zi mutatsiya qiladi, shuning uchun computed'ni
   * to'g'ridan-to'g'ri berib bo'lmaydi — lokal nusxa saqlanadi va modul/ruxsat/
   * sozlama o'zgarganda qayta sinxronlanadi.
   */
  const pinnedItems = ref([])
  const restItems = ref([])
  const groupChildren = ref({})

  watch(
    arrangedMenu,
    ({ pinned, rest }) => {
      pinnedItems.value = pinned
      restItems.value = rest
    },
    { immediate: true }
  )

  watch(
    arrangedGroupChildren,
    (value) => {
      groupChildren.value = value
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

  /**
   * Guruh ichidagi ko'rinadigan bolalar. Qidiruvsiz holatda bu AYNAN model
   * massivning o'zi — Sortable DOM indeksini massiv indeksiga moslay oladi;
   * qidiruv paytida esa sudrash `:disabled` bilan to'xtatilgani uchun filtrlangan
   * ro'yxat model bilan farq qilishi xavfsiz.
   */
  const visibleGroupChildren = (item) => filterItems(groupChildren.value[item.label] ?? [])

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
      toOrderKeys(restItems.value)
    )
  }

  /**
   * vue-draggable-plus ro'yxatlar orasida ko'chirilgan elementni sukut bo'yicha
   * `JSON.parse(JSON.stringify(item))` bilan nusxalaydi. Menyu elementidagi `icon`
   * — Vue komponenti (SVG), JSON esa funksiyalarni tashlab yuboradi: pinlangandan
   * keyingi bir renderda ikona yo'q vnode bilan chiqardi. Element bir massivdan
   * ikkinchisiga o'tadi, nusxa kerak emas — asl obyektning O'ZI beriladi.
   */
  const keepItem = (item) => item

  // Sortable'ning `end` hodisasi model yangilanishidan oldin ham chiqishi mumkin.
  const onDragEnd = () => {
    dragging.value = false
    nextTick(persistArrangement)
  }

  /*
   * Guruh ichidagi sudrash `dragging` ni KO'TARMAYDI: u faqat yuqori darajadagi
   * ro'yxat uchun — bo'sh pin zonasini "tashlab pin qilish" maydoniga aylantiradi,
   * guruh ichida esa bunday tashlash mumkin emas.
   */
  const onGroupDragEnd = (item) => {
    nextTick(() => {
      const modulePath = effectiveMenuPath.value
      const items = groupChildren.value[item.label]
      if (!modulePath || !items?.length) return
      menuStore.setGroupOrder(modulePath, item.label, toPaths(items))
    })
  }

  const togglePin = (item) => {
    const modulePath = effectiveMenuPath.value
    if (!modulePath || !isPinnable(item)) return

    const pinnedPaths = toPaths(pinnedItems.value)
    // `path` siz guruhlar ham kalit oladi — busiz ular saqlangan tartibdan
    // tushib qolib, har pin bosilganda ro'yxat oxiriga sirg'alib ketardi.
    const restKeys = toOrderKeys(restItems.value)

    if (!pinnedPaths.includes(item.path)) {
      menuStore.setModulePrefs(
        modulePath,
        [...pinnedPaths, item.path],
        restKeys.filter((key) => key !== item.path)
      )
      return
    }

    // Pindan chiqarilgan element navigations.js dagi tabiiy qo'shnisi yoniga
    // qaytadi — ro'yxat oxiriga tashlanib ketmaydi.
    const naturalIndex = new Map(panelMenu.value.map((v, index) => [orderKey(v), index]))
    const own = naturalIndex.get(item.path) ?? -1
    const at = restKeys.findIndex((key) => (naturalIndex.get(key) ?? -1) > own)
    const nextRest = restKeys.filter((key) => key !== item.path)
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

  // Joriy sahifa guruh ichida bo'lsa guruh ochiq turadi (to'g'ridan-to'g'ri
  // havola bilan kirilganda ham foydalanuvchi qayerdaligini ko'radi). Guruhdan
  // tashqaridagi sahifaga o'tilganda esa OCHIQ QOLADI — yopish faqat foydalanuvchi
  // sarlavhani bosgandagina bo'ladi.
  watch(
    [() => route.path, panelMenu],
    () => {
      const group = panelMenu.value.find((item) =>
        item.children?.some((child) => child.path === route.path)
      )
      if (group && !openGroups.value.has(group.label)) {
        openGroups.value = new Set(openGroups.value).add(group.label)
      }
    },
    { immediate: true }
  )

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
                :clone="keepItem"
                class="menu-drop-zone"
                :class="{
                  'menu-drop-zone-empty': !pinnedItems.length,
                  'menu-drop-zone-active': !pinnedItems.length && dragging
                }"
                @start="dragging = true"
                @end="onDragEnd"
              >
                <div v-for="item in visiblePinned" :key="item.path" class="menu-drop-row">
                  <SidebarPanelItem
                    :item="item"
                    :category="currentCategory"
                    :active="isCurrentPath(item.path)"
                    pinned
                    @select="onChangePath"
                    @toggle-pin="togglePin"
                  />
                </div>
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
              :clone="keepItem"
              class="menu-drop-zone"
              @start="dragging = true"
              @end="onDragEnd"
            >
              <!--
                HAR BIR QATOR — YAKKA HAQIQIY ELEMENT (`<template v-for>` EMAS).
                Sortable sudralgan node'ni konteynerlar orasida JISMONAN ko'chiradi,
                keyin vue-draggable-plus uni `insertBefore` bilan manba konteynerga
                qaytaradi. `<template v-for>` da har element Vue Fragment'i bo'lib,
                o'chirilishi ikki matnli "anchor" ORASIDAGI node'larni olib tashlaydi
                — node esa endi o'sha anchor'lar orasida emas. Natijada element DOM'da
                qolib ketardi: pinlangan qator pastda ham ko'rinardi va DOM indekslari
                massiv indekslaridan siljib, keyingi sudrashda BOSHQA element pinlanardi.
                Yakka ildiz elementda Vue node'ni `el` bo'yicha o'chiradi — joyi muhim emas.
              -->
              <div v-for="item in visibleRest" :key="item.path ?? item.label" class="menu-drop-row">
                <div
                  v-if="item?.children && item.children.length > 0"
                  class="panel-item-multiple"
                  :class="isGroupOpen(item) && 'is-open'"
                >
                  <div
                    class="panel-header"
                    :class="isGroupOpen(item) && 'is-open'"
                    @click="toggleGroup(item)"
                  >
                    <MenuItemBadge :category="currentCategory" :field="item?.name" />
                    <div class="item-icon rounded-[10px]">
                      <n-icon size="20">
                        <component :is="item.icon" />
                      </n-icon>
                    </div>
                    <div class="item-title truncate pl-2">
                      <span>{{ $t(item.label) }}</span>
                      <n-icon size="16" class="group-chevron">
                        <ChevronDown12Regular />
                      </n-icon>
                    </div>
                  </div>
                  <transition
                    name="group-collapse"
                    @enter="onGroupEnter"
                    @after-enter="onGroupAfterTransition"
                    @before-leave="onGroupBeforeLeave"
                    @leave="onGroupLeave"
                    @after-leave="onGroupAfterTransition"
                  >
                    <div v-if="isGroupOpen(item)" class="panel-body">
                      <!--
                        `group` nomi HAR GURUH uchun O'ZGACHA — shu tufayli bolani
                        yuqori darajadagi ro'yxatga ham, boshqa guruhga ham
                        sudrab bo'lmaydi: tartib faqat o'z oilasi ichida o'zgaradi.
                      -->
                      <VueDraggable
                        v-model="groupChildren[item.label]"
                        :group="`sidebar-group:${item.label}`"
                        :animation="150"
                        :delay="250"
                        :delay-on-touch-only="true"
                        :disabled="isSearching"
                        class="panel-body-inner"
                        @end="onGroupDragEnd(item)"
                      >
                        <SidebarPanelItem
                          v-for="subMenu in visibleGroupChildren(item)"
                          :key="subMenu.path"
                          :item="subMenu"
                          :category="currentCategory"
                          :active="isCurrentPath(subMenu.path)"
                          :pinnable="false"
                          @select="onChangePath"
                        />
                      </VueDraggable>
                    </div>
                  </transition>
                </div>

                <SidebarPanelItem
                  v-else
                  :item="item"
                  :category="currentCategory"
                  :active="isCurrentPath(item.path)"
                  @select="onChangePath"
                  @toggle-pin="togglePin"
                />
              </div>
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

  /*
   * Ochiladigan guruh. Balandlik JS hooklarida (`onGroupEnter` va h.k.) piksel
   * qiymati bilan beriladi, bu yerda faqat o'tishning o'zi tasvirlangan.
   */
  .group-collapse-enter-active,
  .group-collapse-leave-active {
    overflow: hidden;
    transition:
      height 0.25s ease,
      opacity 0.2s ease;
  }

  .group-collapse-enter-from,
  .group-collapse-leave-to {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .group-collapse-enter-active,
    .group-collapse-leave-active {
      transition-duration: 0.01ms;
    }
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
