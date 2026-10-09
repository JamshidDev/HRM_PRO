<script setup>
  import { useOrganizationStore, useAccountStore } from '@/store/modules/index.js'
  import { UITree } from '@/components/index.js'
  import { ChevronDoubleUp16Regular, LocalLanguage16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const accStore = useAccountStore()
  const store = useOrganizationStore()
  const { t } = i18n.global

  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  // Qidiruv natijasi daraxtning kesimi — undagi o'rinlar haqiqiy tartibni
  // bildirmaydi, shuning uchun qidiruvda sudrash o'chiriladi.
  const canDrag = computed(
    () => accStore.checkPermission(accStore.pn.organizationsWrite) && !store.searchQuery
  )

  const changeHeaderLang = (v) => {
    store.headerLang = v
    store._index()
  }

  const onToggle = (key) => {
    const hasKey = store.expandedKeys.includes(key)
    if (hasKey) {
      store.expandedKeys = store.expandedKeys.filter((k) => !(k === key || k.startsWith(`${key}-`)))
    } else {
      store.expandedKeys.push(key)
    }
  }

  const onLoad = (v) => {
    if (!accStore.checkAction(accStore.pn.organizationsRead)) return
    store._loadChildren(v)
  }

  const onSelect = (v) => {
    if (!accStore.checkAction(accStore.pn.organizationsRead)) return
    store.select(v)
  }

  const onMove = (v) => {
    if (!accStore.checkAction(accStore.pn.organizationsWrite)) return
    store.openMove({
      id: v.id,
      name: v.name,
      fromParentId: v.parentId,
      fromParentName: v.parentName,
      parentId: v.toParentId,
      parentName: v.toParentName,
      position: v.position
    })
  }
</script>

<template>
  <div
    class="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border border-surface-line bg-surface-section"
  >
    <div
      class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-surface-line"
    >
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-textColor0">{{ $t('organizationPage.name') }}</span>
        <!-- Faqat qidiruvda — topilgan korxonalar soni. Oddiy ko'rinishda `total` faqat
             ildiz korxonalarni sanaydi (odatda 1) va chalg'itardi. -->
        <Transition name="fade">
          <span
            v-if="store.searchHighlight"
            class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums"
          >
            {{ store.totalItems }}
          </span>
        </Transition>
      </div>
      <div class="ml-auto flex items-center gap-2">
        <Transition name="fade">
          <n-button
            v-if="store.expandedKeys.length"
            size="small"
            quaternary
            @click="store.expandedKeys = []"
          >
            <template #icon>
              <n-icon><ChevronDoubleUp16Regular /></n-icon>
            </template>
            {{ $t('organizationPage.collapseAll') }}
          </n-button>
        </Transition>
        <n-select
          size="small"
          class="w-[160px]!"
          v-model:value="store.headerLang"
          :options="headerOption"
          value-field="id"
          label-field="name"
          @update:value="changeHeaderLang"
        >
          <template #arrow>
            <n-icon><LocalLanguage16Regular /></n-icon>
          </template>
        </n-select>
      </div>
    </div>

    <n-spin :show="store.loading" class="flex-1 min-h-0" content-class="h-full">
      <div class="h-full overflow-auto px-3 py-2 tree-scroll">
        <UITree
          v-if="store.list.length"
          :children="store.list"
          :element-id="store.indexPath"
          :expanded-keys="store.expandedKeys"
          :selected-id="store.panel.open ? store.panel.id : null"
          :draggable="canDrag"
          :highlight="store.searchHighlight"
          @on-load="onLoad"
          @on-toggle="onToggle"
          @on-select="onSelect"
          @on-move="onMove"
        />
        <n-empty v-else-if="!store.loading" class="py-16" :description="$t('content.no-data')" />
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .tree-scroll {
    scrollbar-width: thin;
  }
</style>
