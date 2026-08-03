<script setup>
  import { Briefcase16Regular, Dismiss24Regular } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import UserAroundIllustration from '@/assets/images/content/userAround.png'
  import TickIllustration from '@/assets/images/content/tick.png'
  import portifel from '@assets/icons/portifel.svg'

  const store = useAccountStore()
</script>

<template>
  <UIModal
    v-model:visible="store.organizationVisible"
    :width="640"
    :persistent="false"
    card-class="organization-modal-card"
  >
    <template #header>
      <div
        class="organization-modal-header -m-2 px-6 py-4 border-b border-surface-line rounded-t-[28px] flex items-center justify-between"
      >
        <h3 class="text-2xl font-bold text-textColor0">{{ $t('content.changeAccount') }}</h3>
        <div
          @click="store.organizationVisible = false"
          class="w-9 h-9 rounded-full bg-surface-section hover:bg-surface-line flex items-center justify-center cursor-pointer shrink-0 transition-colors"
        >
          <n-icon size="18" class="text-textColor2">
            <Dismiss24Regular />
          </n-icon>
        </div>
      </div>
    </template>

    <div
      class="organization-modal-tray -mx-6 -mb-6 px-6 pt-6 pb-5 rounded-b-[28px] flex flex-col gap-4"
    >
      <div
        class="organization-modal-scroll flex flex-col gap-4 min-h-0 overflow-y-auto"
        style="max-height: 350px"
      >
        <div
          v-for="(item, idx) in store.roleList"
          :key="idx"
          class="organization-modal-row shrink-0 relative overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary p-5 cursor-pointer transition-colors hover:bg-surface-line/40"
          @click="store.changeAccount(item)"
        >
          <img
            :src="item.key === store.activeRole ? TickIllustration : UserAroundIllustration"
            alt=""
            class="pointer-events-none select-none absolute right-4 top-1/2 -translate-y-1/2 object-contain w-20 h-20"
          />
          <div class="relative z-10 flex items-center gap-2">
            <span class="text-lg font-semibold text-textColor0">{{ item.name }}</span>
            <span class="text-sm font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
              {{ item.role }}
            </span>
          </div>
          <div class="relative z-10 flex items-center gap-2 mt-1.5 text-sm text-textColor3">
            <component :is="portifel" size="16" class="shrink-0" />
            <span>{{ item.full_name }}</span>
          </div>
        </div>
      </div>
    </div>
  </UIModal>
</template>

<style>
  /*
    Global (not scoped): NCard's box is teleported to <body> by Naive UI's
    modal, outside this component's scoped-CSS subtree, so a scoped
    :deep() selector can't reliably reach it.
  */
  .organization-modal-card {
    border-radius: 28px !important;
  }

  .organization-modal-header {
    background-color: #eaecf0;
  }

  .organization-modal-tray {
    background-color: #ffffff;
  }

  .organization-modal-row {
    background-color: #f9fafb;
  }

  [data-theme='dark'] {
    .organization-modal-header {
      background-color: var(--table-header);
    }

    .organization-modal-tray {
      background-color: var(--surface-section);
    }

    .organization-modal-row {
      background-color: var(--surface-ground-soft);
    }
  }

  /*
    Native scrollbar rendering (arrow buttons, track length) varies too much
    across browsers to style reliably here, so it's hidden outright — the
    list still scrolls fine via wheel/trackpad/touch, just with no visible
    bar, which sidesteps the cross-browser inconsistency entirely.
  */
  .organization-modal-scroll {
    scrollbar-width: none;
  }

  .organization-modal-scroll::-webkit-scrollbar {
    display: none;
  }
</style>
