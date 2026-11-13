<script setup>
  /**
   * «Shablon» sahifasi — buyruq/shartnoma/qo'shimcha shartnoma/ariza DOCX shablonini
   * tanlab OnlyOffice'da ochish. Yozish huquqi bo'lsa tahrirlanadi; saqlashni OnlyOffice
   * backend'ga yuboradi, natija (saqlandi / rad etildi) shu yerda ko'rsatiladi.
   * Tahrir hamma korxonaning keyingi hujjatlariga qo'llanadi.
   */
  import { h } from 'vue'
  import { DocumentEditor } from '@onlyoffice/document-editor-vue'
  import { confirmDialog, showAlert } from '@/components/notify/alertDialog.js'
  import { useRoute, useRouter } from 'vue-router'
  import { UIPageContent, UISegmentTabs } from '@/components/index.js'
  import { useDocumentTemplateStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import {
    CheckmarkCircle16Filled,
    ErrorCircle16Filled,
    ErrorCircle20Regular,
    Save20Regular
  } from '@vicons/fluent'
  import VariablePanel from './ui/VariablePanel.vue'
  import DocumentSettingsCard from './ui/DocumentSettingsCard.vue'

  const { t } = i18n.global
  const store = useDocumentTemplateStore()
  const accStore = useAccountStore()
  const route = useRoute()
  const router = useRouter()

  // Sahifa tablari: shablonlar (OnlyOffice) | muddatlar va elektron raqam; URL'da saqlanadi.
  const pageTabs = computed(() => [
    { id: 'templates', name: t('documentTemplate.tabTemplates') },
    { id: 'settings', name: t('documentSettings.title') }
  ])
  const activeTab = computed(() => (route.query.tab === 'settings' ? 'settings' : 'templates'))
  const onTabChange = (tab) => {
    router.replace({ query: { ...route.query, tab: tab === 'settings' ? 'settings' : undefined } })
  }

  const officeServerUrl = import.meta.env.VITE_OFFICE_SERVER

  // Select variantlari kategoriya bo'yicha guruhlanadi — 66 shablon bitta ro'yxatda qidirish qiyin.
  const groupedOptions = computed(() => {
    const groups = new Map()
    for (const o of store.options) {
      if (!groups.has(o.category)) {
        groups.set(o.category, {
          type: 'group',
          key: o.category,
          label: store.list.find((r) => r.category === o.category)?.category_name ?? o.category,
          children: []
        })
      }
      groups.get(o.category).children.push({
        key: o.key,
        value: o.key,
        label: `${o.type} · ${o.label.split(' · ').slice(2).join(' · ')} (${o.fileName})`
      })
    }
    return [...groups.values()]
  })

  const renderOptionLabel = (option) =>
    option.type === 'group'
      ? option.label
      : h('span', { class: 'dt-option' }, [
          h('span', { class: 'dt-option__label' }, option.label),
        ])

  // Shablon almashsa yoki qayta yuklansa muharrir qaytadan quriladi.
  const editorKey = computed(() => store.editorConfig?.document?.key ?? '')

  /* O'zgaruvchini nusxalash */
  const flash = ref('')
  let flashTimer = null
  const copyVariable = (name) => {
    Utils.copyToClipboard(`\${${name}}`, () => {
      flash.value = name
      window.clearTimeout(flashTimer)
      flashTimer = window.setTimeout(() => (flash.value = ''), 1200)
      $Toast.success(t('documentTemplate.copied'))
    })
  }

  /* Saqlash natijasini kuzatish — OnlyOffice backend'ga yuboradi, biz natijani so'raymiz. */
  let pollTimer = null
  const stopPolling = () => window.clearInterval(pollTimer)
  const startPolling = () => {
    stopPolling()
    if (!store.canEdit) return
    pollTimer = window.setInterval(async () => {
      const row = await store._checkSave()
      if (!row) return
      if (row.status === 'saved') {
        $Toast.success(t('documentTemplate.saved'))
        return
      }
      showAlert({
        type: 'warning',
        title: t('documentTemplate.saveRejectedTitle'),
        message: row.message || t('content.error')
      })
    }, 4000)
  }
  watch(editorKey, (key) => (key ? startPolling() : stopPolling()))

  // OnlyOffice: `data === true` — hujjatda serverga hali saqlanmagan o'zgarish bor.
  const onDocumentStateChange = (e) => {
    if (e?.data) store._markDirty()
  }
  const onLoadComponentError = () => {
    store.configError = 'unreachable'
  }

  // Holat yorlig'i: saqlandi (vaqt) / rad etildi.
  const statusChip = computed(() => {
    if (store.saveState === 'saved')
      return {
        tone: 'green',
        icon: CheckmarkCircle16Filled,
        text: t('documentTemplate.stateSaved', { time: String(store.savedAt ?? '').slice(11, 16) })
      }
    if (store.saveState === 'rejected')
      return { tone: 'red', icon: ErrorCircle16Filled, text: t('documentTemplate.stateRejected') }
    return null
  })

  const showRejectReason = () => {
    if (store.saveState !== 'rejected') return
    showAlert({
      type: 'warning',
      title: t('documentTemplate.saveRejectedTitle'),
      message: store.rejectMessage || t('content.error')
    })
  }

  // Select ustidagi izoh: to'liq nom va kim, qachon o'zgartirgani.
  const selectTitle = computed(() => {
    const sel = store.selected
    if (!sel) return ''
    const who = sel.updated_by_name
      ? `\n${t('documentTemplate.updatedBy')}: ${sel.updated_by_name} · ${String(sel.updated_at ?? '').slice(0, 16)}`
      : ''
    return `${sel.type} · ${sel.name}${who}`
  })

  // Loyihaning umumiy tasdiq oynasi (DAS-15706).
  const onDiscard = () =>
    confirmDialog({
      title: t('documentTemplate.discardTitle'),
      message: t('documentTemplate.discardText'),
      confirmText: t('content.yes'),
      onConfirm: () => store._discard()
    })

  // Muharrir xatosi turi bo'yicha sarlavha va izoh.
  const errorText = computed(() => {
    const kind = store.configError ?? 'failed'
    return {
      title: t(`documentTemplate.editorError.${kind}`),
      hint: t(`documentTemplate.editorError.${kind}Hint`)
    }
  })

  const selectTemplate = async (key) => {
    if (key === store.selectedKey) return
    // URL'da saqlanadi — sahifa yangilansa ham, havola yuborilsa ham shu shablon ochiladi.
    router.replace({ query: { ...route.query, template: key ?? undefined } })
    await store._select(key)
  }

  onMounted(async () => {
    if (!accStore.checkAction(accStore.pn.documentTemplatesRead)) return
    await store._index()
    const key = route.query.template
    if (key && store.options.some((o) => o.key === key)) await store._select(key)
  })

  onBeforeUnmount(() => {
    stopPolling()
    window.clearTimeout(flashTimer)
    // Store global — keyingi kirishda eski tanlov qolib ketmasin.
    store.$reset()
  })
</script>

<template>
  <UIPageContent class="dt-page">
    <UISegmentTabs
      class="dt-tabs"
      :model-value="activeTab"
      :tabs="pageTabs"
      @update:model-value="onTabChange"
    />

    <DocumentSettingsCard v-if="activeTab === 'settings'" class="dt-card" />

    <!-- Chapda OnlyOffice + pastda suzuvchi boshqaruv paneli, o'ngda o'zgaruvchilar; tab almashganda sessiya uzilmasin — v-show. -->
    <div v-show="activeTab === 'templates'" class="dt-workspace">
      <div class="dt-main">
        <div class="dt-editor">
          <n-spin v-if="store.configLoading" class="dt-editor__center" />
          <div v-else-if="store.selected && store.configError" class="dt-editor__center dt-editor__error">
            <n-icon size="40" class="text-fig-text-red"><ErrorCircle20Regular /></n-icon>
            <div class="text-base font-semibold text-textColor1">{{ errorText.title }}</div>
            <div class="max-w-[420px] text-sm text-textColor3">{{ errorText.hint }}</div>
          </div>
          <div v-else-if="store.editorConfig" class="dt-office">
            <DocumentEditor
              id="dtOfficeEditor"
              :key="editorKey"
              width="100%"
              height="100%"
              :document-server-url="officeServerUrl"
              :config="store.editorConfig"
              :events_onDocumentStateChange="onDocumentStateChange"
              :on-load-component-error="onLoadComponentError"
            />
          </div>
          <n-empty v-else :description="$t('documentTemplate.empty')" class="dt-editor__center" />
        </div>

        <!-- Bitta qatorli suzuvchi panel: shablon, holat, bekor qilish, saqlash. -->
        <div class="dt-bar">
          <n-select
            class="dt-bar__select"
            :title="selectTitle"
            filterable
            :consistent-menu-width="false"
            placement="top-start"
            :virtual-scroll="false"
            :menu-props="{ class: 'dt-select-menu' }"
            :loading="store.loading"
            :options="groupedOptions"
            :render-label="renderOptionLabel"
            :placeholder="$t('documentTemplate.selectPlaceholder')"
            :value="store.selectedKey"
            @update:value="selectTemplate"
          />
          <div class="dt-bar__actions">
            <button
              v-if="statusChip"
              type="button"
              class="dt-state"
              :class="[`dt-state--${statusChip.tone}`, { 'dt-state--link': store.saveState === 'rejected' }]"
              :title="store.saveState === 'rejected' ? $t('documentTemplate.stateRejectedHint') : ''"
              @click="showRejectReason"
            >
              <n-icon :size="14"><component :is="statusChip.icon" /></n-icon>
              {{ statusChip.text }}
            </button>
            <template v-if="store.canEdit && store.editorConfig">
              <n-button
                :disabled="!['dirty', 'rejected'].includes(store.saveState) || store.saving"
                :loading="store.discarding"
                @click="onDiscard"
              >
                {{ $t('content.cancel') }}
              </n-button>
              <n-button type="primary" :loading="store.saving" @click="store._forceSave()">
                <template #icon><n-icon><Save20Regular /></n-icon></template>
                {{ $t('content.save') }}
              </n-button>
            </template>
          </div>
        </div>
      </div>

      <aside class="dt-side">
        <VariablePanel
          :template-key="store.selectedKey"
          :variables="store.variables"
          :flash="flash"
          @copy="copyVariable"
        />
      </aside>
    </div>
  </UIPageContent>
</template>

<style scoped>
  /* UIPageContent'ning standart p-4/gap-4 bo'shliqlari bu sahifada kichraytiriladi. */
  .dt-page {
    gap: 0;
    padding: 8px;
    min-height: 0;
    overflow: hidden;
  }

  /* `ui-page-content` — flex ustun. Ish maydoni katta bo'lgani uchun yuqoridagi
     karta flex-shrink bilan siqilib, `fig-block`ning `overflow:hidden`i ichini
     kesib tashlardi. Karta siqilmaydi, ish maydoni qolgan joyni oladi. */
  .dt-card {
    flex: none;
  }

  .dt-tabs {
    flex: none;
    align-self: flex-start;
    margin-bottom: 8px;
  }








  .dt-state {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    cursor: default;
  }


  .dt-state--green {
    background: var(--fig-chip-green-bg);
    color: var(--fig-chip-green-text);
  }

  .dt-state--red {
    border-color: var(--fig-br-error);
    background: var(--fig-red-50);
    color: var(--fig-text-red);
  }

  .dt-state--link {
    cursor: pointer;
  }

  .dt-state--link:hover {
    text-decoration: underline;
  }

  .dt-side {
    flex: 0 0 340px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  /* Panel ustunning butun balandligini egallaydi. */
  .dt-side :deep(.vp) {
    flex: 1 1 auto;
  }

  /* Panel muharrir ustida suzadi — joy egallamaydi. */
  .dt-main {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  /* Pastdagi suzuvchi panel — bitta qator. */
  .dt-bar {
    position: absolute;
    left: 50%;
    bottom: 80px;
    z-index: 10;
    width: min(600px, calc(100% - 32px));
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-disable);
    border-radius: 12px;
    box-shadow:
      0 4px 12px rgb(16 24 40 / 8%),
      0 12px 32px rgb(16 24 40 / 10%);
  }

  /* Tanlangan nom karta o'lchamini o'zgartirmasin — bir qator, ortig'i «…». */
  .dt-bar__select {
    flex: 1 1 0;
    min-width: 0;
  }

  .dt-bar__select :deep(.n-base-selection-label),
  .dt-bar__select :deep(.n-base-selection-input),
  .dt-bar__select :deep(.n-base-selection-input__content) {
    min-width: 0;
    overflow: hidden;
  }

  .dt-bar__select :deep(.dt-option),
  .dt-bar__select :deep(.dt-option__label),
  .dt-bar__select :deep(.n-base-selection-input__content) {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  .dt-bar__actions {
    display: flex;
    flex: none;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .dt-workspace {
    display: flex;
    gap: 8px;
    flex: 1 1 auto;
    overflow: hidden;
    min-height: 0;
  }

  /* Kartalar: bir xil 1px chegara + yumshoq soya. Ilgari mavjud bo'lmagan
     `--fig-bg-surface` ishlatilib, dark mode'da ham oq fon chiqardi. */
  .dt-editor {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    display: flex;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-disable);
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 1px 2px rgb(16 24 40 / 5%),
      0 6px 20px rgb(16 24 40 / 5%);
  }

  .dt-editor__center {
    margin: auto;
  }

  .dt-office {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }

  .dt-editor__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .dt-page {
      height: auto !important;
      min-height: 100%;
      overflow: visible;
    }

    .dt-side {
      flex-basis: auto;
    }

    .dt-bar {
      position: static;
      width: auto;
      margin-top: 8px;
      transform: none;
      flex-wrap: wrap;
    }

    .dt-workspace {
      flex-direction: column-reverse;
      overflow: visible;
    }

    .dt-editor {
      min-height: 640px;
    }
  }

  @media (max-width: 640px) {
    .dt-editor {
      min-height: 520px;
    }


  }
</style>

<!-- Dialoglar teleport bilan body'ga chiqadi — scoped emas. -->
<style>
  .dt-option {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }

  .dt-option__label {
    min-width: 0;
    white-space: normal;
    word-break: break-word;
  }

  /* Shablon nomlari uzun — menyu kengroq va variantlar qatorga o'raladi. */
  .dt-select-menu {
    width: min(560px, calc(100vw - 32px));
  }

  .dt-select-menu.n-base-select-menu .n-base-select-option {
    height: auto;
    min-height: 34px;
    padding-block: 6px;
  }

  .dt-select-menu.n-base-select-menu .n-base-select-option .n-base-select-option__content {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    line-height: 18px;
  }

</style>
