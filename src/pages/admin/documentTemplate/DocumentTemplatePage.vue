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
  import { UIFigBlock, UIPageContent, UIProfileButton } from '@/components/index.js'
  import { useDocumentTemplateStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'
  import { ArrowReset20Regular, ErrorCircle20Regular, Info20Regular } from '@vicons/fluent'
  import VariablePanel from './ui/VariablePanel.vue'
  import DocumentSettingsCard from './ui/DocumentSettingsCard.vue'

  const { t } = i18n.global
  const store = useDocumentTemplateStore()
  const accStore = useAccountStore()
  const route = useRoute()
  const router = useRouter()

  const officeServerUrl = import.meta.env.VITE_OFFICE_SERVER
  const canWrite = computed(() => accStore.checkPermission(accStore.pn.documentTemplatesWrite))

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
        label: `${o.type} · ${o.label.split(' · ').slice(2).join(' · ')} (${o.fileName})`,
        edited: o.edited
      })
    }
    return [...groups.values()]
  })

  const renderOptionLabel = (option) =>
    option.type === 'group'
      ? option.label
      : h('span', { class: 'dt-option' }, [
          h('span', { class: 'dt-option__label' }, option.label),
          option.edited
            ? h('span', { class: 'dt-option__badge' }, t('documentTemplate.editedBadge'))
            : null
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

  const selectTemplate = async (key) => {
    if (key === store.selectedKey) return
    // URL'da saqlanadi — sahifa yangilansa ham, havola yuborilsa ham shu shablon ochiladi.
    router.replace({ query: { ...route.query, template: key ?? undefined } })
    await store._select(key)
  }

  // Loyihaning umumiy tasdiq oynasi (DAS-15706).
  const onReset = () =>
    confirmDialog({
      title: t('documentTemplate.resetConfirmTitle'),
      message: t('documentTemplate.resetConfirmText'),
      confirmText: t('content.yes'),
      onConfirm: () => store._reset()
    })

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
    <UIFigBlock class="dt-card" :title="$t('documentTemplate.name')" :icon="icons.figFileArrowDown">
      <p class="dt-intro">{{ $t('documentTemplate.subtitle') }}</p>

      <div class="dt-toolbar">
        <n-select
          class="dt-select"
          size="large"
          filterable
          clearable
          :loading="store.loading"
          :options="groupedOptions"
          :render-label="renderOptionLabel"
          :placeholder="$t('documentTemplate.selectPlaceholder')"
          :value="store.selectedKey"
          @update:value="selectTemplate"
        />

        <div class="dt-actions">
          <UIProfileButton
            v-if="canWrite && store.canReset"
            :icon="ArrowReset20Regular"
            :loading="store.resetting"
            :disabled="store.configLoading"
            @click="onReset"
          >
            {{ $t('documentTemplate.reset') }}
          </UIProfileButton>
        </div>
      </div>

      <div v-if="store.selected" class="dt-context">
        <div class="dt-context__notice">
          <n-icon :size="18"><Info20Regular /></n-icon>
          <span>
            {{ store.canEdit ? $t('documentTemplate.editHint') : $t('documentTemplate.viewOnly') }}
            {{ $t('documentTemplate.globalNotice') }}
          </span>
        </div>
      </div>
    </UIFigBlock>

    <DocumentSettingsCard />

    <!-- OnlyOffice chapda, o'zgaruvchilar paneli o'ngda. -->
    <div class="dt-workspace">
      <div class="dt-editor">
        <n-spin v-if="store.configLoading" class="dt-editor__center" />
        <div v-else-if="store.selected && store.configError" class="dt-editor__center dt-editor__error">
          <n-icon size="40" class="text-fig-text-red"><ErrorCircle20Regular /></n-icon>
          <div class="text-base font-semibold text-textColor1">{{ $t('onlyOfficeEditor.tokenError') }}</div>
          <div class="max-w-[420px] text-sm text-textColor3">{{ $t('onlyOfficeEditor.tokenErrorHint') }}</div>
        </div>
        <div v-else-if="store.editorConfig" class="dt-office">
          <DocumentEditor
            id="dtOfficeEditor"
            :key="editorKey"
            width="100%"
            height="100%"
            :document-server-url="officeServerUrl"
            :config="store.editorConfig"
          />
        </div>
        <n-empty v-else :description="$t('documentTemplate.empty')" class="dt-editor__center" />
      </div>

      <VariablePanel
        v-if="store.selected"
        :selected="store.selected"
        :variables="store.variables"
        :flash="flash"
        @copy="copyVariable"
      />
    </div>
  </UIPageContent>
</template>

<style scoped>
  .dt-page {
    min-height: 0;
    overflow: hidden;
  }

  /* `ui-page-content` — flex ustun. Ish maydoni katta bo'lgani uchun yuqoridagi
     karta flex-shrink bilan siqilib, `fig-block`ning `overflow:hidden`i ichini
     kesib tashlardi. Karta siqilmaydi, ish maydoni qolgan joyni oladi. */
  .dt-card {
    flex: none;
  }

  .dt-intro {
    margin: -4px 0 0;
    color: var(--fig-text-secondary);
    font-size: 13px;
    line-height: 20px;
  }

  .dt-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .dt-select {
    flex: 1 1 420px;
    min-width: 260px;
  }

  .dt-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .dt-context {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--fig-br-disable);
  }

  .dt-context__notice {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--fig-text-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  .dt-context__notice .n-icon {
    flex: none;
    color: var(--fig-text-brand);
  }

  .dt-workspace {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex: 1 1 auto;
    overflow: hidden;
    min-height: 0;
  }

  /* Kartalar: bir xil 1px chegara + yumshoq soya. Ilgari mavjud bo'lmagan
     `--fig-bg-surface` ishlatilib, dark mode'da ham oq fon chiqardi. */
  .dt-editor {
    position: relative;
    flex: 1 1 auto;
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

    .dt-workspace {
      flex-direction: column;
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

    .dt-actions {
      width: 100%;
      margin-left: 0;
      justify-content: flex-end;
    }

    .dt-context {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>

<!-- Dialoglar teleport bilan body'ga chiqadi — scoped emas. -->
<style>
  .dt-option {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .dt-option__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dt-option__badge {
    flex: none;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
    font-size: 10.5px;
    font-weight: 600;
    line-height: 16px;
  }
</style>
