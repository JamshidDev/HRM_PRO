<script setup>
  /**
   * «Shablon» sahifasi — buyruq/shartnoma/qo'shimcha shartnoma/ariza DOCX
   * shablonini tanlab, brauzerdagi muharrirda (docx-editor.dev) tahrirlash.
   *
   * Hujjat muharriridan (`DocxEditorDrawer`) farqi: bu yerda hujjat nusxasi
   * emas, SHABLONNING O'ZI tahrirlanadi va tahrir GLOBAL — hamma korxonaning
   * BUNDAN KEYINGI hujjatlariga tegadi. Shu sabab saqlash tasdiq so'raydi.
   *
   * `admin/document` sahifasi («Hujjat namunalari») bilan aralashtirmaslik
   * kerak: u korxonaga xos shablon FAYLINI yuklaydi (`structure/command-types`),
   * bu yerda esa global shablon matni tahrirlanadi.
   */
  import { UIFigBlock, UIPageContent, UIProfileButton } from '@/components/index.js'
  import DocxEditorApp from '@/components/docxEditor/DocxEditorApp.vue'
  import { useDialog } from 'naive-ui'
  import { useDocumentTemplateStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'
  import {
    ArrowReset20Regular,
    Copy20Regular,
    Info20Regular,
    Save20Regular,
    Search20Regular
  } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useDocumentTemplateStore()
  const accStore = useAccountStore()

  const editorRef = ref(null)
  const dialog = useDialog()
  const variableQuery = ref('')
  const copiedVariable = ref('')

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.documentTemplatesWrite))

  const filteredVariables = computed(() => {
    const query = variableQuery.value.trim().toLocaleLowerCase()
    if (!query) return store.variables
    return store.variables.filter((variable) => variable.toLocaleLowerCase().includes(query))
  })

  const copyVariable = (variable) => {
    const value = `\${${variable}}`
    Utils.copyToClipboard(value, () => {
      copiedVariable.value = variable
      $Toast.success(t('documentTemplate.copied'))
      window.setTimeout(() => {
        if (copiedVariable.value === variable) copiedVariable.value = ''
      }, 1400)
    })
  }

  // Select variantlari kategoriya bo'yicha guruhlanadi — 66 shablon bitta
  // tekis ro'yxatda qidirish qiyin.
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
        // Talab bo'yicha: buyruq nomi VA shablon fayl nomi ikkalasi ko'rinadi.
        label: `${o.type} · ${o.label.split(' · ').slice(2).join(' · ')} (${o.fileName})`,
        edited: o.edited
      })
    }
    return [...groups.values()]
  })

  const onChange = () => {
    store.dirty = true
  }

  const onSave = async () => {
    const buffer = await editorRef.value?.save()
    if (!buffer) return
    // `destroy()` ATAYLAB qo'lda: naive-ui `useDialog` positive click'da
    // dialogni o'zi yopmaydi. Yopib, so'ng saqlaymiz — jarayon muharrir
    // ustidagi `store.saving` overlay'ida ko'rinadi.
    const d = dialog.warning({
      title: t('documentTemplate.saveConfirmTitle'),
      content: t('documentTemplate.saveConfirmText'),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => {
        d.destroy()
        void store._save(buffer)
      }
    })
  }

  const onReset = () => {
    const d = dialog.warning({
      title: t('documentTemplate.resetConfirmTitle'),
      content: t('documentTemplate.resetConfirmText'),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => {
        d.destroy()
        void store._reset()
      }
    })
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.documentTemplatesRead)) return
    store._index()
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
          :placeholder="$t('documentTemplate.selectPlaceholder')"
          :value="store.selectedKey"
          @update:value="store._select"
        />

        <div class="dt-actions">
          <UIProfileButton
            v-if="canWrite && store.canReset"
            :icon="ArrowReset20Regular"
            :loading="store.resetting"
            :disabled="store.saving || store.contentLoading"
            @click="onReset"
          >
            {{ $t('documentTemplate.reset') }}
          </UIProfileButton>

          <UIProfileButton
            v-if="canWrite"
            variant="brand"
            :icon="Save20Regular"
            :loading="store.saving"
            :disabled="!store.bytes || !store.dirty || store.contentLoading"
            @click="onSave"
          >
            {{ $t('content.save') }}
          </UIProfileButton>
        </div>
      </div>

      <div v-if="store.selected" class="dt-context">
        <div class="dt-context__notice">
          <n-icon :size="18"><Info20Regular /></n-icon>
          <span>{{ $t('documentTemplate.globalNotice') }}</span>
        </div>
        <n-tag v-if="store.dirty" :bordered="false" type="warning" round size="small">
          {{ $t('documentTemplate.unsaved') }}
        </n-tag>
      </div>
    </UIFigBlock>

    <!-- Muharrir chapda, ma'lumot kartasi o'ngda. -->
    <div class="dt-workspace">
      <div class="dt-editor">
        <n-spin v-if="store.contentLoading" class="dt-editor__spin" />
        <DocxEditorApp
          v-else-if="store.bytes"
          ref="editorRef"
          :bytes="store.bytes"
          @change="onChange"
        />
        <n-empty v-else :description="$t('documentTemplate.empty')" class="dt-editor__spin" />

        <!-- Saqlash davomida tahrirni bloklaymiz: aks holda saqlanayotgan
             nusxaga tushmagan o'zgarishlar "saqlangan" deb belgilanib yo'qoladi. -->
        <div v-if="store.saving" class="dt-editor__overlay">
          <n-spin size="large" />
          <span class="text-sm text-fig-text-secondary">{{ $t('docxEditor.saving') }}</span>
        </div>
      </div>

      <!-- O'ng karta: fayl nomi / qaysi qatlam amalda + shablondagi `${...}` lar.
           O'zgaruvchilar ro'yxati admin yangi nom o'ylab topmasligi uchun —
           ro'yxatda yo'q o'zgaruvchi hujjatga to'ldirilmaydi. -->
      <aside v-if="store.selected" class="dt-side">
        <div class="dt-side__header">
          <div class="dt-side__block">
            <span class="dt-side__label">{{ $t('documentTemplate.fileLabel') }}</span>
            <span class="dt-side__file">{{ store.selected.file_name }}</span>
          </div>
          <n-tag
            :bordered="false"
            size="small"
            :type="store.selected.edited ? 'warning' : 'success'"
          >
            {{
              store.selected.edited
                ? $t('documentTemplate.sourceGlobal')
                : $t('documentTemplate.sourceDefault')
            }}
          </n-tag>
          <span v-if="store.selected.updated_at" class="dt-side__date">
            {{ store.selected.updated_at }}
          </span>
        </div>

        <div class="dt-side__block dt-side__block--vars">
          <div class="dt-side__vars-head">
            <div>
              <h3 class="dt-side__title">
                {{ $t('documentTemplate.variables') }}
                <span>{{ store.variables.length }}</span>
              </h3>
              <p class="dt-side__hint">{{ $t('documentTemplate.variablesHint') }}</p>
            </div>
          </div>

          <n-input
            v-if="store.variables.length > 6"
            v-model:value="variableQuery"
            clearable
            size="small"
            :placeholder="$t('documentTemplate.searchVariables')"
          >
            <template #prefix><n-icon><Search20Regular /></n-icon></template>
          </n-input>

          <div class="dt-side__vars">
            <button
              v-for="v in filteredVariables"
              :key="v"
              type="button"
              class="dt-variable"
              :class="{ 'dt-variable--copied': copiedVariable === v }"
              @click="copyVariable(v)"
            >
              <code>{{ '${' + v + '}' }}</code>
              <n-icon :size="14"><Copy20Regular /></n-icon>
            </button>
            <n-empty
              v-if="!filteredVariables.length"
              size="small"
              :description="$t('documentTemplate.noVariables')"
            />
          </div>
        </div>
      </aside>
    </div>
  </UIPageContent>
</template>

<style scoped>
  .dt-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .dt-page {
    min-height: 0;
    overflow: hidden;
  }

  .dt-intro {
    margin: -4px 0 0;
    color: var(--fig-text-secondary, #71717a);
    font-size: 13px;
    line-height: 20px;
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
    border-top: 1px solid var(--fig-br-disable, #e4e4e7);
  }

  .dt-context__notice {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: var(--fig-text-secondary, #71717a);
    font-size: 12px;
    line-height: 18px;
  }

  .dt-context__notice .n-icon {
    flex: none;
    color: var(--fig-text-brand, #1570ef);
  }

  /* `ui-page-content` — flex ustun. Ish maydoni katta bo'lgani uchun yuqoridagi
     karta flex-shrink bilan siqilib, `fig-block`ning `overflow:hidden`i ichini
     kesib tashlardi. Karta siqilmaydi, ish maydoni qolgan joyni oladi. */
  .dt-card {
    flex: none;
  }

  .dt-workspace {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex: 1 1 auto;
    overflow: hidden;
    min-height: 0;
  }

  .dt-editor {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    background: var(--fig-bg-surface, #fff);
    border-radius: 12px;
    border: 1px solid var(--fig-br-disable, #e4e4e7);
    overflow: hidden;
    box-shadow: 0 8px 28px rgb(15 23 42 / 6%);
  }

  .dt-side {
    flex: 0 0 288px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: var(--fig-bg-surface, #fff);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--fig-br-disable, #e4e4e7);
    box-shadow: 0 8px 28px rgb(15 23 42 / 6%);
  }

  .dt-side__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    flex: none;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--fig-br-disable, #e4e4e7);
  }

  .dt-side__block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  /* O'zgaruvchilar ro'yxati uzun bo'lishi mumkin — karta o'smaydi, ichida skroll. */
  .dt-side__block--vars {
    flex: 1 1 auto;
    min-height: 0;
  }

  .dt-side__label {
    font-size: 12px;
    color: var(--fig-text-secondary, #71717a);
  }

  .dt-side__title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--fig-text-primary, #18181b);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  .dt-side__title span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--fig-bg-brand-secondary, #eff6ff);
    color: var(--fig-text-brand, #1570ef);
    font-size: 11px;
  }

  .dt-side__hint {
    margin-top: 2px;
    color: var(--fig-text-secondary, #71717a);
    font-size: 11px;
    line-height: 16px;
  }

  .dt-side__vars-head {
    flex: none;
  }

  .dt-side__file {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 14px;
    font-weight: 600;
  }

  .dt-side__date {
    font-size: 12px;
    color: var(--fig-text-secondary, #71717a);
  }

  .dt-side__vars {
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    min-height: 0;
    padding-right: 4px;
    scrollbar-gutter: stable;
  }

  .dt-variable {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--fig-br-disable, #e4e4e7);
    border-radius: 8px;
    background: var(--fig-bg-surface-secondary, #fafafa);
    color: var(--fig-text-primary, #27272a);
    text-align: left;
    transition: border-color 0.16s ease, background-color 0.16s ease, color 0.16s ease;
  }

  .dt-variable code {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    white-space: nowrap;
  }

  .dt-variable .n-icon {
    flex: none;
    color: var(--fig-text-secondary, #71717a);
  }

  .dt-variable:hover,
  .dt-variable--copied {
    border-color: var(--fig-text-brand, #1570ef);
    background: var(--fig-bg-brand-secondary, #eff6ff);
    color: var(--fig-text-brand, #1570ef);
  }

  .dt-variable:hover .n-icon,
  .dt-variable--copied .n-icon {
    color: var(--fig-text-brand, #1570ef);
  }

  .dt-editor__spin {
    margin: auto;
  }

  .dt-editor__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    background: rgb(255 255 255 / 70%);
    z-index: 5;
    backdrop-filter: blur(2px);
  }

  /* `DocxEditorApp`ning drawer uchun yozilgan scroll qoidasi bu sahifaga
     tegmaydi. Toolbar o'z balandligida qoladi, faqat hujjat viewporti skroll qiladi. */
  .dt-editor :deep(.docx-editor-mount) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .dt-editor :deep(.docx-editor-mount > .docx-toolbar) {
    flex: 0 0 auto;
  }

  .dt-editor :deep(.docx-editor__scroll-container) {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
    scrollbar-gutter: stable;
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

    .dt-side {
      flex-basis: auto;
      max-height: 420px;
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
