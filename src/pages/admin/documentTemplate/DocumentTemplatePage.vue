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
   *
   * Tuzilishi: chapda shablonlar ro'yxati | markazda muharrir | o'ngda
   * o'zgaruvchilar. Saqlanmagan tahrir uch joyda qo'riqlanadi: boshqa shablonga
   * o'tish, boshqa sahifaga o'tish va brauzer tabini yopish.
   */
  import { h } from 'vue'
  import { NButton, useDialog } from 'naive-ui'
  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
  import { UIFigBlock, UIPageContent, UIProfileButton } from '@/components/index.js'
  import DocxEditorApp from '@/components/docxEditor/DocxEditorApp.vue'
  import { useDocumentTemplateStore, useAccountStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'
  import {
    Add16Regular,
    ArrowReset20Regular,
    Info20Regular,
    Save20Regular,
    Subtract16Regular
  } from '@vicons/fluent'
  import VariablePanel from './ui/VariablePanel.vue'
  import { extractVariables } from './variableMeta.js'

  const { t } = i18n.global
  const store = useDocumentTemplateStore()
  const accStore = useAccountStore()
  const route = useRoute()
  const router = useRouter()
  const dialog = useDialog()

  const editorRef = ref(null)

  const canWrite = computed(() => accStore.checkPermission(accStore.pn.documentTemplatesWrite))

  const busy = computed(() => store.saving || store.contentLoading || store.resetting)
  const canInsert = computed(() => canWrite.value && Boolean(store.bytes) && !busy.value)
  const canSave = computed(() => canWrite.value && Boolean(store.bytes) && store.dirty && !busy.value)

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

  // Tahrirlangan shablon ro'yxatda darhol ko'rinsin.
  const renderOptionLabel = (option) =>
    option.type === 'group'
      ? option.label
      : h('span', { class: 'dt-option' }, [
          h('span', { class: 'dt-option__label' }, option.label),
          option.edited
            ? h('span', { class: 'dt-option__badge' }, t('documentTemplate.editedBadge'))
            : null
        ])

  const isMac =typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  const saveShortcut = isMac ? '⌘S' : 'Ctrl+S'

  /* ------------------------------------------------------------------------
   * Hujjatdagi `${...}` tahlili — o'ng panel va saqlashdan oldingi tekshiruv.
   * ---------------------------------------------------------------------- */
  const usage = shallowRef(null)
  const unknown = ref([])
  let analyzeTimer = null

  const analyze = () => {
    const texts = editorRef.value?.getParagraphTexts()
    if (!texts) {
      usage.value = null
      unknown.value = []
      return null
    }
    const found = extractVariables(texts)
    const counts = new Map()
    for (const name of store.variables) {
      // `paragraphs` jadval kataklarini qamramasligi mumkin — topilmasa
      // `findMatches` bilan qayta tekshiramiz (u butun hujjat bo'ylab qidiradi).
      counts.set(name, found.get(name) ?? editorRef.value.countMatches(`\${${name}}`))
    }
    const known = new Set(store.variables)
    usage.value = counts
    unknown.value = [...found.keys()].filter((name) => !known.has(name))
    return {
      missing: store.variables.filter((name) => !counts.get(name)),
      unknown: unknown.value
    }
  }

  const scheduleAnalyze = () => {
    window.clearTimeout(analyzeTimer)
    analyzeTimer = window.setTimeout(analyze, 300)
  }

  watch(
    () => store.bytes,
    () => {
      usage.value = null
      unknown.value = []
    }
  )
  watch(() => store.variables, scheduleAnalyze)

  const onChange = () => {
    store.dirty = true
  }

  /* ------------------------------------------------------------------------
   * Zoom — toolbar'dagi zoom tor ekranda "⋯" ichiga yashirinadi, shuning uchun
   * muharrir burchagida doim ko'rinadigan boshqaruv.
   * ---------------------------------------------------------------------- */
  const ZOOM_STEPS = [0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2]
  const zoom = ref(1)

  const syncZoom = () => {
    if (editorRef.value) zoom.value = editorRef.value.getZoom()
  }

  const stepZoom = (dir) => {
    const current = editorRef.value?.getZoom() ?? zoom.value
    const next =
      dir > 0
        ? ZOOM_STEPS.find((s) => s > current + 0.001)
        : [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001)
    if (next && editorRef.value?.setZoom(next)) zoom.value = next
  }

  const fitZoom = () => {
    editorRef.value?.fitZoom()
    // Fit rejimi viewport'dan hisoblanadi — keyingi kadrda o'qiymiz.
    requestAnimationFrame(syncZoom)
  }

  const onEditorUpdate = () => {
    syncZoom()
    scheduleAnalyze()
  }

  /* ------------------------------------------------------------------------
   * O'zgaruvchini qo'yish / nusxalash
   * ---------------------------------------------------------------------- */
  const flash = ref('')
  let flashTimer = null
  const flashVariable = (name) => {
    flash.value = name
    window.clearTimeout(flashTimer)
    flashTimer = window.setTimeout(() => (flash.value = ''), 1200)
  }

  const copyVariable = (name, message = t('documentTemplate.copied')) => {
    Utils.copyToClipboard(`\${${name}}`, () => {
      flashVariable(name)
      $Toast.success(message)
    })
  }

  const insertVariable = (name) => {
    if (editorRef.value?.insertText(`\${${name}}`)) {
      flashVariable(name)
      return
    }
    // Kursor hujjatda emas — nusxalab, foydalanuvchiga o'zi joylashini aytamiz.
    copyVariable(name, t('documentTemplate.insertFallback'))
  }

  /* ------------------------------------------------------------------------
   * Dialog yordamchilari (Promise qaytaradi)
   * ---------------------------------------------------------------------- */

  // `destroy()` ATAYLAB qo'lda: naive-ui `useDialog` positive click'da dialogni
  // o'zi yopmaydi. `settle` bir marta ishlaydi — yopilish yo'llari ko'p.
  const confirm = ({ title, content, positiveText, type = 'warning' }) =>
    new Promise((resolve) => {
      let settled = false
      const settle = (value) => {
        if (settled) return
        settled = true
        resolve(value)
      }
      const d = dialog[type]({
        title,
        content,
        positiveText,
        negativeText: t('content.cancel'),
        onPositiveClick: () => {
          d.destroy()
          settle(true)
        },
        onNegativeClick: () => settle(false),
        onClose: () => settle(false),
        onMaskClick: () => settle(false),
        onAfterLeave: () => settle(false)
      })
    })

  // Uch tugmali: 'save' | 'discard' | 'cancel'.
  const askUnsaved = () =>
    new Promise((resolve) => {
      let settled = false
      let d = null
      const settle = (value) => {
        if (settled) return
        settled = true
        d?.destroy()
        resolve(value)
      }
      d = dialog.warning({
        title: t('documentTemplate.unsavedTitle'),
        content: t('documentTemplate.unsavedText', { name: store.selected?.name ?? '' }),
        onClose: () => settle('cancel'),
        onMaskClick: () => settle('cancel'),
        onAfterLeave: () => settle('cancel'),
        action: () =>
          h('div', { class: 'dt-dialog-actions' }, [
            h(NButton, { onClick: () => settle('cancel') }, () => t('content.cancel')),
            h(
              NButton,
              { type: 'error', ghost: true, onClick: () => settle('discard') },
              () => t('documentTemplate.discard')
            ),
            canWrite.value
              ? h(NButton, { type: 'primary', onClick: () => settle('save') }, () => t('content.save'))
              : null
          ])
      })
    })

  // Saqlash tasdig'i ichida — o'zgaruvchilar muammosi bo'lsa ro'yxati.
  const renderSaveContent = (issues) => () =>
    h('div', { class: 'dt-save-confirm' }, [
      issues?.missing.length
        ? h('div', { class: 'dt-save-confirm__issue dt-save-confirm__issue--warning' }, [
            h('strong', t('documentTemplate.missingText')),
            h(
              'div',
              { class: 'dt-save-confirm__codes' },
              issues.missing.map((name) => h('code', `\${${name}}`))
            )
          ])
        : null,
      issues?.unknown.length
        ? h('div', { class: 'dt-save-confirm__issue dt-save-confirm__issue--error' }, [
            h('strong', t('documentTemplate.unknownText')),
            h(
              'div',
              { class: 'dt-save-confirm__codes' },
              issues.unknown.map((name) => h('code', `\${${name}}`))
            )
          ])
        : null,
      h('p', t('documentTemplate.saveConfirmText', { name: store.selected?.name ?? '' }))
    ])

  /* ------------------------------------------------------------------------
   * Saqlash / standartga qaytarish
   * ---------------------------------------------------------------------- */

  // Tasdiq oynasi ochiq turganda Ctrl+S qayta bosilsa ikkinchi oyna ochilmasin.
  let saveInProgress = false

  // `true` — saqlandi. Dialogni bekor qilish yoki xato — `false`.
  const saveFlow = async () => {
    if (!canSave.value || saveInProgress) return false
    saveInProgress = true
    try {
      const buffer = await editorRef.value?.save()
      if (!buffer) return false

      const issues = analyze()
      const hasIssues = Boolean(issues?.missing.length || issues?.unknown.length)
      const ok = await confirm({
        title: t('documentTemplate.saveConfirmTitle'),
        content: renderSaveContent(issues),
        positiveText: hasIssues ? t('documentTemplate.saveAnyway') : t('content.save'),
        type: hasIssues ? 'error' : 'warning'
      })
      if (!ok) return false
      return await store._save(buffer)
    } finally {
      saveInProgress = false
    }
  }

  const onReset = async () => {
    const ok = await confirm({
      title: t('documentTemplate.resetConfirmTitle'),
      content: t('documentTemplate.resetConfirmText'),
      positiveText: t('content.yes')
    })
    if (ok) await store._reset()
  }

  /* ------------------------------------------------------------------------
   * Saqlanmagan o'zgarishlar qo'riqchisi
   * ---------------------------------------------------------------------- */

  // `true` — davom etish mumkin (saqlandi, rad etildi yoki o'zgarish yo'q edi).
  const guardUnsaved = async () => {
    if (!store.dirty) return true
    const choice = await askUnsaved()
    if (choice === 'cancel') return false
    if (choice === 'discard') {
      store.dirty = false
      return true
    }
    return await saveFlow()
  }

  const selectTemplate = async (key) => {
    if (key === store.selectedKey) return
    if (!(await guardUnsaved())) return
    // URL'da saqlanadi — sahifa yangilansa ham, havola yuborilsa ham shu shablon ochiladi.
    router.replace({ query: { ...route.query, template: key ?? undefined } })
    await store._select(key)
  }

  onBeforeRouteLeave(async () => await guardUnsaved())

  const onBeforeUnload = (e) => {
    if (!store.dirty) return
    e.preventDefault()
    e.returnValue = ''
  }

  // Ctrl/⌘+S — brauzerning «sahifani saqlash» oynasi o'rniga shablonni saqlaydi.
  // `capture` — muharrir hodisani o'zida to'xtatib qo'ysa ham ushlaymiz.
  const onKeydown = (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.key?.toLowerCase() !== 's') return
    e.preventDefault()
    if (canSave.value) void saveFlow()
  }

  onMounted(async () => {
    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('keydown', onKeydown, true)
    if (!accStore.checkAction(accStore.pn.documentTemplatesRead)) return
    await store._index()
    const key = route.query.template
    if (key && store.options.some((o) => o.key === key)) await store._select(key)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
    window.removeEventListener('keydown', onKeydown, true)
    window.clearTimeout(analyzeTimer)
    window.clearTimeout(flashTimer)
    // Store global — keyingi kirishda eski tanlov/`dirty` qolib ketmasin.
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
            :disabled="store.saving || store.contentLoading"
            @click="onReset"
          >
            {{ $t('documentTemplate.reset') }}
          </UIProfileButton>

          <n-tooltip v-if="canWrite" :disabled="!store.bytes">
            <template #trigger>
              <UIProfileButton
                variant="brand"
                :icon="Save20Regular"
                :loading="store.saving"
                :disabled="!canSave"
                @click="saveFlow"
              >
                {{ $t('content.save') }}
              </UIProfileButton>
            </template>
            {{ saveShortcut }}
          </n-tooltip>
        </div>
      </div>

      <div v-if="store.selected" class="dt-context">
        <div class="dt-context__notice">
          <n-icon :size="18"><Info20Regular /></n-icon>
          <span>{{ $t('documentTemplate.globalNotice') }}</span>
        </div>
        <span v-if="store.dirty" class="dt-unsaved">
          <span class="dt-unsaved__dot" aria-hidden="true" />
          {{ $t('documentTemplate.unsaved') }}
        </span>
      </div>
    </UIFigBlock>

    <!-- Muharrir chapda, ma'lumot kartasi o'ngda. -->
    <div class="dt-workspace">
      <div class="dt-editor">
        <n-spin v-if="store.contentLoading" class="dt-editor__center" />
        <DocxEditorApp
          v-else-if="store.bytes"
          ref="editorRef"
          :bytes="store.bytes"
          @change="onChange"
          @update="onEditorUpdate"
        />
        <n-empty v-else :description="$t('documentTemplate.empty')" class="dt-editor__center" />

        <div v-if="store.bytes && !store.contentLoading" class="dt-zoom">
          <button
            type="button"
            class="dt-zoom__btn"
            :title="$t('documentTemplate.zoomOut')"
            :disabled="zoom <= ZOOM_STEPS[0] + 0.001"
            @mousedown.prevent
            @click="stepZoom(-1)"
          >
            <n-icon :size="16"><Subtract16Regular /></n-icon>
          </button>
          <button
            type="button"
            class="dt-zoom__value"
            :title="$t('documentTemplate.zoomFit')"
            @mousedown.prevent
            @click="fitZoom"
          >
            {{ Math.round(zoom * 100) }}%
          </button>
          <button
            type="button"
            class="dt-zoom__btn"
            :title="$t('documentTemplate.zoomIn')"
            :disabled="zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1] - 0.001"
            @mousedown.prevent
            @click="stepZoom(1)"
          >
            <n-icon :size="16"><Add16Regular /></n-icon>
          </button>
        </div>

        <!-- Saqlash davomida tahrirni bloklaymiz: aks holda saqlanayotgan
             nusxaga tushmagan o'zgarishlar "saqlangan" deb belgilanib yo'qoladi. -->
        <div v-if="store.saving" class="dt-editor__overlay">
          <n-spin size="large" />
          <span class="text-sm text-fig-text-secondary">{{ $t('docxEditor.saving') }}</span>
        </div>
      </div>

      <VariablePanel
        v-if="store.selected"
        :selected="store.selected"
        :variables="store.variables"
        :usage="usage"
        :unknown="unknown"
        :can-insert="canInsert"
        :flash="flash"
        @insert="insertVariable"
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

  /* `n-tag warning` fonga singib ko'rinmay qolardi — oq-sariq fon + to'q
     sariq matn + chegara (ikkala mavzuda ham kontrastli). */
  .dt-unsaved {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 10px;
    border: 1px solid var(--fig-icon-amber);
    border-radius: 999px;
    background: var(--fig-chip-amber-bg);
    color: var(--fig-chip-amber-text);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .dt-unsaved__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--fig-icon-amber);
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

  /* Pastki o'ng burchak (skroll chizig'idan chaproqda). */
  .dt-zoom {
    position: absolute;
    right: 24px;
    bottom: 16px;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--fig-br-disable);
    border-radius: 999px;
    background: var(--fig-block-bg);
    box-shadow: 0 4px 14px rgb(16 24 40 / 10%);
  }

  .dt-zoom__btn,
  .dt-zoom__value {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    border-radius: 999px;
    color: var(--fig-text-secondary);
    transition: background-color 0.12s ease, color 0.12s ease;
  }

  .dt-zoom__btn {
    width: 28px;
  }

  .dt-zoom__value {
    min-width: 52px;
    padding: 0 6px;
    color: var(--fig-text-primary);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .dt-zoom__btn:hover:not(:disabled),
  .dt-zoom__value:hover {
    background: var(--fig-bg-secondary);
    color: var(--fig-text-brand);
  }

  .dt-zoom__btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .dt-editor__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    /* Mavzuga mos: oq emas, joriy yuza rangining shaffof varianti (dark mode). */
    background: color-mix(in srgb, var(--fig-block-bg) 72%, transparent);
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

  /* Kutubxona toolbar'ni "tabletka" (`border-radius: 9999px`) qilib chizadi.
     Radius 0: yuqori burchaklarni konteynerning o'zi (12px + overflow:hidden)
     kesadi — ramka bilan bir xil bo'ladi; pasti tekis, ajratuvchi chiziq bilan. */
  .dt-editor :deep(.docx-editor-mount > .docx-toolbar) {
    flex: 0 0 auto;
    border-radius: 0;
    border-bottom: 1px solid var(--fig-br-disable);
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

  .dt-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .dt-save-confirm {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dt-save-confirm__issue {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 12px;
  }

  .dt-save-confirm__issue--warning {
    background: var(--fig-yellow-100);
  }

  .dt-save-confirm__issue--error {
    background: var(--fig-red-50);
  }

  .dt-save-confirm__codes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .dt-save-confirm__codes code {
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--fig-block-bg);
    font-size: 11px;
  }
</style>
