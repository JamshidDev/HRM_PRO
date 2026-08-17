<script setup>
  import { AddCircle24Regular, Dismiss16Regular } from '@vicons/fluent'
  import clearFilterIcon from '@/assets/icons/clear_filter.svg?url'
  import filterIcon from '@/assets/icons/filter.svg?url'
  import searchIcon from '@/assets/icons/search.svg?url'
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { useAppBreakpoints } from '@/composables/index.js'
  const slots = useSlots()
  const props = defineProps({
    title: {
      type: String,
      default: null
    },
    showSearchInput: {
      type: Boolean,
      default: true
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    showFilterButton: {
      type: Boolean,
      default: true
    },
    filterCount: {
      type: Number,
      default: 0
    },
    filterPlacement: {
      type: String,
      default: 'bottom-end'
    },
    popoverStyle: {
      type: Object,
      default: () => ({
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        minHeight: 'auto',
        padding: '0',
        borderRadius: '20px'
      })
    },
    searchLoading: {
      type: Boolean,
      default: false
    },
    autoFocusInput: {
      type: Boolean,
      default: true
    },
    addButtonTitle: {
      type: String,
      default: null
    },
    filterButtonTitle: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    /**
     * Qo'shish tugmasi uchun ruxsat slug'i (masalan `accStore.pn.countriesWrite`).
     * Ruxsat bo'lmasa tugma YASHIRILMAYDI, balki kulrang bo'ladi — foydalanuvchi
     * imkoniyat borligini ko'rib, admindan so'ray olsin.
     */
    addPermission: {
      type: String,
      default: null
    }
  })

  const accStore = useAccountStore()
  const { isMobile } = useAppBreakpoints()
  const addDisabled = computed(
    () => !!props.addPermission && !accStore.checkPermission(props.addPermission)
  )
  const hasFullFilterSlot = !!slots.fullFilterContent
  const searchModel = defineModel('search', { type: String, default: null })
  const searchInputRef = ref(null)
  const filterTriggerRef = ref(null)
  const filterMaxHeight = ref('70vh')

  const emits = defineEmits(['onAdd', 'onSearch', 'onClear', 'show'])

  let timeout = null
  const searchEvent = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      emits('onSearch', searchModel.value)
    }, 1000)
  }

  const onSearchClear = () => {
    searchModel.value = ''
    searchEvent()
  }

  const addEvent = () => {
    emits('onAdd')
  }

  const updateFilterMaxHeight = () => {
    const el = filterTriggerRef.value?.$el ?? filterTriggerRef.value
    if (!el) return
    const bottomMargin = 16
    const available = window.innerHeight - el.getBoundingClientRect().bottom - bottomMargin
    const headerHeight = 44
    const viewportLimit = window.innerHeight * 0.7
    filterMaxHeight.value = `${Math.max(Math.min(available - headerHeight, viewportLimit), 200)}px`
  }

  const onFilterShow = (v) => {
    emits('show', v)
    // Mobilda filtr full-screen drawer'da ochiladi — balandlikni drawer o'zi
    // boshqaradi, trigger'ga nisbatan hisoblash keraksiz (va noto'g'ri bo'lardi).
    if (!v || isMobile.value) return
    nextTick(updateFilterMaxHeight)
    window.addEventListener('resize', updateFilterMaxHeight)
  }

  // Mobil drawer boshqariladigan (controlled) bo'lgani uchun ochilish/yopilishni
  // popover bilan BIR XIL hodisaga ulaymiz: sahifalar `@show` da filtr
  // ro'yxatlarini lazy yuklaydi (masalan worker sahifasidagi `onShow`).
  const filterOpen = ref(false)
  watch(filterOpen, (v) => onFilterShow(v))

  onMounted(() => {
    if (!props.autoFocusInput) return
    searchInputRef.value?.focus()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateFilterMaxHeight)
  })
</script>

<template>
  <div class="grid grid-cols-1">
    <div v-if="title">
      <span class="text-lg font-semibold inline-block mb-2 text-surface-600">{{ title }}</span>
    </div>
    <!-- Mobilda bu konteyner GRID bo'ladi (pastdagi `@media`): qidiruv + kvadrat
         filtr tugmasi 1-qatorda, amal tugmalari 2-qatorda. Desktopda o'zgarishsiz
         flex qatori. -->
    <div class="ui-filter-bar flex flex-col items-center md:flex-row gap-4">
      <div
        :class="[slots.filterSearch || slots.filterBefore ? 'md:max-w-full' : 'md:max-w-[264px]!']"
        class="ui-filter-bar__search w-full flex items-center gap-2"
      >
        <slot name="filterBefore"></slot>
        <n-input
          ref="searchInputRef"
          class="ui-page-search skip-format w-full md:max-w-[264px]! md:w-full!"
          v-if="showSearchInput"
          v-model:value="searchModel"
          type="text"
          :placeholder="placeholder || $t('content.search')"
          :on-keyup="searchEvent"
          
          @paste="searchEvent"
        >
          <template #prefix>
            <img class="ui-page-search-icon" :src="searchIcon" alt="" />
          </template>
          <template #suffix>
            <n-spin v-if="searchLoading" class="ui-page-search-spinner" :size="14" />
            <n-icon
              v-else-if="searchModel"
              class="ui-page-search-clear"
              :size="16"
              @click="onSearchClear"
            >
              <Dismiss16Regular />
            </n-icon>
          </template>
        </n-input>
        <slot name="filterSearch"></slot>
      </div>
      <!-- `md:w-[calc(100%-264px)]` emas: u 264px qidiruv ustunini aks ettirar,
           lekin oradagi `gap-4` ni hisobga olmas edi, ya'ni aynan `md` chegarasida
           qator 16px oshib ketardi. Flexbox kenglikni o'zi to'g'ri hisoblaydi. -->
      <div
        class="ui-filter-bar__actions flex flex-wrap items-center w-full md:flex-1 md:min-w-0 justify-end gap-4"
      >
        <slot name="filterAction"></slot>
        <n-button
          class="ui-page-action-button w-full! md:w-auto!"
          v-if="showAddButton"
          :disabled="addDisabled"
          type="primary"
          icon-placement="right"
          @click="addEvent"
        >
          <template #icon>
            <n-icon>
              <AddCircle24Regular />
            </n-icon>
          </template>
          {{ addButtonTitle || $t('content.add') }}
        </n-button>
      </div>

      <!-- Filtr tugmasi amal blokidan TASHQARIDA: mobil gridda u qidiruv yonida
           (1-qator, 2-ustun) turishi kerak. DOM tartibi o'zgarmagani uchun
           desktopdagi flex qatori avvalgidek ko'rinadi. -->
      <div class="ui-filter-bar__filter" v-if="showFilterButton">
        <!-- ===== MOBIL: tugma + full-screen drawer =====
             Popover'ni CSS bilan full-screen qilish ishonchsiz: vueuc uni
             `transform` li follower ichida joylashtiradi, `position: fixed` esa
             shu transform ichida qamalib qoladi (viewport'ga emas, follower'ga
             nisbatan hisoblanadi). Shu bois mobilda boshqa komponent — drawer. -->
        <template v-if="isMobile">
          <n-button
            class="ui-page-filter-button"
            type="primary"
            ghost
            :aria-label="filterButtonTitle || $t('content.filters')"
            @click="filterOpen = true"
          >
            <template #icon>
              <img class="ui-page-filter-icon" :src="filterIcon" alt="" />
            </template>
            <span class="ui-page-filter-label">
              {{ filterButtonTitle || $t('content.filters') }}
            </span>
          </n-button>

          <!-- Badge tugmadan TASHQARIDA: naive-ui `.n-button` da ripple uchun
               `overflow: hidden` bor (badge kesilardi), ustiga esa DOM'da kontentdan
               keyin turgan `.n-button__border` overlay'i chizilardi. Tashqarida u
               o'ram div'ga nisbatan joylashadi va hech narsa uni kesmaydi. -->
          <span v-if="filterCount > 0" class="ui-page-filter-count">{{ filterCount }}</span>

          <n-drawer v-model:show="filterOpen" placement="right" width="100%">
            <n-drawer-content
              :native-scrollbar="false"
              header-style="padding: 0"
              footer-style="padding: 12px 16px"
              body-content-style="padding: 0"
            >
              <template #header>
                <div class="ui-filter-drawer__head">
                  <div class="ui-filter-header-title">
                    <img :src="filterIcon" alt="" />
                    <span>{{ $t('content.filterSetting') }}</span>
                  </div>
                  <button
                    type="button"
                    class="ui-filter-drawer__close"
                    :aria-label="$t('content.close')"
                    @click="filterOpen = false"
                  >
                    <n-icon :size="20"><Dismiss16Regular /></n-icon>
                  </button>
                </div>
              </template>

              <!-- `.ui-filter-content` saqlanadi: uning `:deep()` qoidalari filtr
                   ichidagi select/input o'lchamlarini beradi. Balandlik cheklovi
                   YO'Q — skrollni drawer o'zi boshqaradi. -->
              <div class="ui-filter-content">
                <slot name="filterContent"></slot>
              </div>

              <template #footer>
                <button type="button" class="ui-filter-clear" @click="emits('onClear')">
                  <img :src="clearFilterIcon" alt="" />
                  <span>{{ $t('content.clearFilters') }}</span>
                </button>
              </template>
            </n-drawer-content>
          </n-drawer>
        </template>

        <!-- ===== DESKTOP: avvalgi popover ===== -->
        <n-popover
          v-else
          @update:show="onFilterShow"
          trigger="click"
          scrollable
          :show-arrow="false"
          :placement="filterPlacement"
          class="max-w-[95vw] min-w-[280px] sm:min-w-[400px] md:w-auto"
          :style="{
            ...popoverStyle,
            position: 'relative',
            left: '12px'
          }"
          :content-style="{ padding: '0' }"
        >
          <template #trigger>
            <n-button
              ref="filterTriggerRef"
              class="ui-page-filter-button md:w-auto!"
              type="primary"
              ghost
              :aria-label="filterButtonTitle || $t('content.filters')"
            >
              <template #icon>
                <img class="ui-page-filter-icon" :src="filterIcon" alt="" />
              </template>
              <span class="ui-page-filter-label">
                {{ filterButtonTitle || $t('content.filters') }}
              </span>
              <span v-if="filterCount > 0" class="ui-page-filter-count">{{ filterCount }}</span>
            </n-button>
          </template>
          <div class="ui-filter-panel-shell flex flex-col max-w-full">
            <div class="ui-filter-header-wrap">
              <slot name="filterHeader">
                <div class="ui-filter-header">
                  <div class="ui-filter-header-title">
                    <img :src="filterIcon" alt="" />
                    <span>{{ $t('content.filterSetting') }}</span>
                  </div>
                  <button type="button" class="ui-filter-clear" @click="emits('onClear')">
                    <img :src="clearFilterIcon" alt="" />
                    <span>{{ $t('content.clearFilters') }}</span>
                  </button>
                </div>
              </slot>
            </div>
            <div class="ui-filter-content overflow-y-auto" :style="{ maxHeight: filterMaxHeight }">
              <slot name="filterContent"></slot>
            </div>
          </div>
        </n-popover>
      </div>
    </div>
    <div v-if="hasFullFilterSlot" class="w-full">
      <slot name="fullFilterContent"></slot>
    </div>
  </div>
</template>

<style scoped>
  .ui-page-search {
    --n-height: 32px !important;
    --n-border-radius: 8px !important;
    --n-font-size: 14px !important;
  }

  .ui-page-search :deep(.n-input-wrapper) {
    padding: 0 16px;
  }

  .ui-page-search-icon {
    width: 13.5px;
    height: 13.5px;
    flex-shrink: 0;
    aspect-ratio: 1 / 1;
    color: var(--textColor2);
  }

  .ui-page-search :deep(.n-input__prefix) {
    margin-right: 8px;
  }

  .ui-page-search-clear {
    flex-shrink: 0;
    cursor: pointer;
    color: var(--textColor2);
    transition: color 0.2s var(--n-bezier);
  }

  .ui-page-search-clear:hover {
    color: var(--textColor0);
  }

  .ui-page-search-spinner {
    flex-shrink: 0;
  }

  .ui-page-search :deep(.n-input__placeholder) {
    color: #98a2b3;
  }

  .ui-page-search :deep(.n-input__input-el::placeholder) {
    color: #98a2b3;
    opacity: 1;
  }

  .ui-page-action-button,
  .ui-page-filter-button {
    --n-height: 32px !important;
    --n-border-radius: 8px !important;
  }

  .ui-page-action-button {
    --n-padding: 0 16px !important;
  }

  .ui-page-filter-button {
    --n-height: 32px !important;
    --n-border-radius: 8px !important;
    --n-padding: 0 16px !important;
    --n-font-size: 12px !important;
    font-weight: 600;
  }

  .ui-page-filter-button :deep(.n-button__content) {
    gap: 8px;
  }

  .ui-page-filter-icon {
    width: 16px;
    height: 16px;
  }

  .ui-page-filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 999px;
    color: #fff;
    background: #ef3e42;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
  }

  .ui-filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 18px 18px 0 0;
    color: var(--primary-color);
    background: var(--color-brand-surface);
    font-size: 14px;
    font-weight: 600;
  }

  .ui-filter-header-wrap {
    padding: 4px 4px 0;
  }

  .ui-filter-header-title,
  .ui-filter-clear {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ui-filter-header-title img,
  .ui-filter-clear img {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .ui-filter-header-title,
  .ui-filter-clear {
    font-size: 14px;
  }

  .ui-filter-clear {
    flex-shrink: 0;
    padding: 4px 6px;
    border: 0;
    border-radius: 8px;
    color: #e5383b;
    background: transparent;
    cursor: pointer;
    font: inherit;
    transition: background-color 0.2s ease;
  }

  .ui-filter-clear:hover {
    background: rgba(229, 56, 59, 0.08);
  }

  .ui-filter-content {
    padding: 24px;
    overscroll-behavior: contain;
  }

  .ui-filter-content :deep(label) {
    display: block;
    margin-bottom: 4px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .ui-filter-content
    :deep(:where(.n-select, .n-date-picker, .n-input-number, .ui__structure-input)) {
    width: 100%;
    min-height: 36px;
    --n-height: 36px !important;
    --n-border-radius: 12px !important;
  }

  .ui-filter-content :deep(:where(.n-base-selection, .n-input, .n-input-number)) {
    min-height: 36px;
    --n-height: 36px !important;
    --n-border-radius: 12px !important;
    border-radius: 12px !important;
  }

  .ui-filter-content
    :deep(
      :where(
        .n-base-selection-label,
        .n-base-selection__border,
        .n-base-selection__state-border,
        .n-input__border,
        .n-input__state-border
      )
    ) {
    border-radius: 12px !important;
  }

  .ui-filter-content :deep(.n-select) {
    --n-padding-single: 0 12px !important;
    --n-padding-multiple: 0 12px !important;
  }

  .ui-filter-content :deep(.n-base-selection-label),
  .ui-filter-content :deep(.ui__structure-input .n-input-wrapper),
  .ui-filter-content :deep(.n-input-number .n-input-wrapper) {
    padding-left: 12px;
    padding-right: 12px;
  }

  .ui-filter-content :deep(.n-badge) {
    --n-color: #ef3e42 !important;
  }

  .ui-filter-content :deep(.n-badge-sup) {
    background-color: #ef3e42 !important;
  }

  .ui-filter-content :deep(.ui-filter-grid label) {
    display: block;
    margin-bottom: 4px;
    color: var(--textColor1);
    font-size: 13px;
    font-weight: 500;
  }

  .ui-filter-content :deep(.ui-filter-grid :where(.n-select, .n-date-picker, .n-input-number)) {
    width: 100%;
    min-height: 36px;
    --n-height: 36px !important;
    --n-border-radius: 12px !important;
  }

  .ui-filter-content :deep(.ui-filter-grid) {
    column-gap: 24px;
    row-gap: 24px;
  }

  .ui-filter-content :deep(.ui-filter-grid .n-select) {
    --n-padding-single: 0 12px !important;
    --n-padding-multiple: 0 12px !important;
  }

  .ui-filter-content :deep(.ui-filter-grid .n-base-selection-label),
  .ui-filter-content :deep(.ui-filter-grid .ui__structure-input .n-input-wrapper),
  .ui-filter-content :deep(.ui-filter-grid .n-input-number .n-input-wrapper) {
    padding-left: 12px;
    padding-right: 12px;
  }

  :global([data-theme='dark'] .ui-filter-panel-shell) {
    overflow: hidden;
    border: 1px solid #1d2939;
    border-radius: 20px;
    background: #101828;
  }

  :global([data-theme='dark'] .ui-filter-header) {
    color: var(--primary-color);
    background: #344054;
  }

  :global([data-theme='dark'] .ui-filter-content) {
    background: #101828;
  }

  :global([data-theme='dark'] .ui-filter-content label) {
    color: #f2f4f7;
  }

  :global([data-theme='dark'] .ui-filter-content .n-base-selection-placeholder),
  :global([data-theme='dark'] .ui-filter-content .n-input__placeholder),
  :global([data-theme='dark'] .ui-filter-content .n-input__input-el::placeholder) {
    color: #98a2b3;
    opacity: 1;
  }

  /* ===== Mobil (<md): qidiruv + kvadrat filtr tugmasi bitta qatorda =====
     ATAYLAB style blokining OXIRIDA: yuqoridagi `.ui-page-search` / `.ui-page-filter-button`
     qoidalari bir xil spesifiklikda, shu bois media query oldin tursa ular buni
     bosib ketardi. Tashqi konteyner gridga o'tadi — shunda filtr tugmasi DOM'da
     amal blokidan KEYIN turgani holda 1-qatorga joylashadi va desktopdagi flex
     tartibi buzilmaydi. */
  @media (max-width: 767.98px) {
    .ui-filter-bar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      /* qator oralig'i / ustun oralig'i */
      gap: 12px 8px;
      align-items: center;
    }

    .ui-filter-bar__search {
      grid-area: 1 / 1;
    }

    .ui-filter-bar__filter {
      grid-area: 1 / 2;
      /* Badge shu o'ramga nisbatan joylashadi (tugmaga emas — u kesib qo'yadi). */
      position: relative;
    }

    /* Amal tugmalari (+ «Qo'shish») pastda, to'liq kenglikda. */
    .ui-filter-bar__actions {
      grid-area: 2 / 1 / 3 / -1;
    }

    /* Slot bo'sh va «Qo'shish» yashirin bo'lsa — 12px qator oralig'i behuda
       joy egallamasin. */
    .ui-filter-bar__actions:empty {
      display: none;
    }

    /* Qidiruv va filtr tugmasi bir tekisda turishi uchun ikkalasi ham 40px. */
    .ui-page-search {
      --n-height: 40px !important;
      --n-border-radius: 10px !important;
    }

    /* Icon-only kvadrat tugma. */
    .ui-page-filter-button {
      width: 40px;
      --n-height: 40px !important;
      --n-border-radius: 10px !important;
      --n-padding: 0 !important;
      justify-content: center;
      /* naive-ui default slot bo'sh emas deb hisoblaydi (yorliq span'i `display: none`
         bo'lsa ham DOM'da turadi) va ikonkaga tema margin'ini qo'yadi. */
      --n-icon-margin: 0 !important;
    }

    .ui-page-filter-label {
      display: none;
    }

    /* MUHIM: naive-ui'da `__icon` va `__content` — tugmaning yonma-yon flex
       farzandlari, ikonka content ICHIDA emas. Shu sababli `__content` ga
       `width: 100%` berish ikonkani chapga surib yuborardi. Yorliq yashirilgani
       uchun content 0 kenglikda qoladi va tugmaning o'z markazlashi ishlaydi. */
    .ui-page-filter-button :deep(.n-button__content) {
      width: auto;
      gap: 0;
    }

    .ui-page-filter-button :deep(.n-button__icon) {
      margin: 0 !important;
      flex: 0 0 auto;
    }

    .ui-page-filter-icon {
      width: 18px;
      height: 18px;
    }

    /* Faol filtr soni — tugmaning yuqori-o'ng burchagida, tugma ustida. */
    .ui-page-filter-count {
      position: absolute;
      top: -6px;
      right: -6px;
      z-index: 2;
      /* Badge tugma ustida turadi — bosish baribir tugmaga o'tsin. */
      pointer-events: none;
    }

    /* Full-screen drawer'da kontent burchaklari kesilmasin. */
    .ui-filter-content {
      padding: 16px;
      border-radius: 0;
    }
  }

  /* ===== Mobil full-screen drawer chromi ===== */
  .ui-filter-drawer__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 52px;
    padding: 0 16px;
    border-bottom: 1px solid var(--surface-line);
    color: var(--primary-color);
    background: var(--color-brand-surface);
    font-size: 15px;
    font-weight: 600;
  }

  .ui-filter-drawer__close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    color: var(--textColor1);
    background: var(--surface-ground);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .ui-filter-drawer__close:hover {
    background: var(--surface-line);
  }

  :global([data-theme='dark'] .ui-filter-drawer__head) {
    color: var(--primary-color);
    background: #344054;
    border-bottom-color: #1d2939;
  }
</style>
