<script setup>
  import { navigations } from '../../data/navigations.js'
  import { ChevronDown12Regular, ChevronDoubleLeft16Filled } from '@vicons/fluent'
  import { useAccountStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import { AppPaths, useAppSetting } from '@/utils/index.js'
  import { MiniMenuBadge, MenuItemBadge, UIProfile, DownloadTask } from '@components'

  const { t } = i18n.global
  const route = useRoute()
  const router = useRouter()

  const store = useAccountStore()
  const emits = defineEmits(['onChange', 'onOpen', 'onClose'])

  const checkPage = (path) => {
    if ([AppPaths.Home, AppPaths.AIConversation, AppPaths.Info].includes(path)) {
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
      // router.push(
      //   navigations[index].children.filter(
      //     (v) => store.isModeDev || store.checkPermission(v.permission)
      //   )?.[0]?.path
      // )
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

  const onChangePath = (item) => {
    if (item?.disable) return
    router.push(item.path)
  }

  /**
   * Menyu ko'rish ruxsati: bare slug YOKI uning '-read' varianti yetarli.
   * Fine-grained migratsiyadan keyin rollar 'hr-departments-read' oladi, menyu esa
   * tarixan bare 'hr-departments' tekshirardi — natijada faqat -read'ga ega rol
   * sahifani ochsa ham menyu yashirilardi. Ikkovini ham qamraymiz.
   */
  const canView = (permission) =>
    store.checkPermission(permission) || store.checkPermission(`${permission}-read`)

  /**
   * Modul (mini-menyu) ko'rinadi: o'z ruxsati bo'lsa YOKI kamida bitta ko'rinadigan
   * bola menyusi bo'lsa. Shu bilan faqat child-ruxsatga ega (coarse modul ruxsatisiz)
   * foydalanuvchi ham modulni ko'rib, ichidagi sahifasiga o'ta oladi.
   */
  const moduleVisible = (mod) =>
    store.isModeDev ||
    canView(mod.permission) ||
    (mod.children?.some((c) => canView(c.permission)) ?? false)

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
      .filter((v) => store.isModeDev || v.allowed)
  })

  const menuName = computed(() => {
    if (effectiveMenuPath.value === '/hrm') return t('sidebar.hrm')
    else if (effectiveMenuPath.value === '/attestation') return t('sidebar.attestation')
    else if (effectiveMenuPath.value === '/admin') return t('sidebar.admin')
    else if (effectiveMenuPath.value === '/chat') return t('sidebar.chat')
    else if (effectiveMenuPath.value === '/docflow') return t('sidebar.docflow')
    else if (effectiveMenuPath.value === '/timesheet') return t('sidebar.timesheet')
    else if (effectiveMenuPath.value === '/turnstile') return t('turnstile.title')
    else if (effectiveMenuPath.value === '/lms') return t('sidebar.lms')
    else if (effectiveMenuPath.value === AppPaths.Hospital) return t('sidebar.hospital')
    else if (effectiveMenuPath.value === AppPaths.Accountant) return t('sidebar.accountant')
    else return ''
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
              <n-tooltip trigger="hover" placement="right">
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
            <div class="sticky top-0 z-10 bg-surface-section pt-[10px] -mt-[10px]">
              <span class="text-sm block text-textColor2 truncate font-semibold pl-4 mb-3">
                {{ menuName }}
              </span>
              <div class="border-b border-surface-line -mx-[10px] mb-5"></div>
            </div>
            <template v-for="item in panelMenu" :key="item">
              <template v-if="item?.children && item.children.length > 0">
                <div class="panel-item-multiple">
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
              </template>

              <template v-else>
                <div
                  @click="onChangePath(item)"
                  class="panel-item-single relative"
                  :class="[
                    isCurrentPath(item.path) && 'active-panel-item-single',
                    item?.disable && 'opacity-30'
                  ]"
                >
                  <MenuItemBadge :category="currentCategory" :field="item?.name" />
                  <div class="item-icon rounded-[10px] ml-[-2px]">
                    <n-icon size="20">
                      <component :is="item.icon" /> 
                    </n-icon>
                  </div>
                  <div class="item-title truncate pl-2">
                    <span>{{ $t(item.label) }}</span>
                  </div>
                </div>
              </template>
            </template>
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
</style>
