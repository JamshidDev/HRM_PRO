<script setup>
  // Xabar yozish maydoni — haqiqiy qalin / kursiv ko'rsatadi (oddiy textarea buni qila olmaydi).
  // v-model:value — saqlanadigan matn (**qalin**, __kursiv__); foydalanuvchi belgilarni ko'rmaydi.
  // Qalin/kursiv: belgilangan matnda o'ng tugma menyusi yoki Ctrl/⌘+B, Ctrl/⌘+I.
  import { h } from 'vue'
  import { NIcon } from 'naive-ui'
  import { TextBold20Regular, TextItalic20Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { domToParts, renderToDom, serializeParts } from './textFormat.js'

  const { t } = i18n.global

  const props = defineProps({
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    maxlength: { type: Number, default: 4000 }
  })
  const emit = defineEmits(['update:value', 'input', 'keydown'])

  const editorRef = ref(null)
  // Oxirgi chiqarilgan qiymat — tashqaridan kelgan o'zgarish (tozalash, qoralama) ni ajratish uchun.
  let lastValue = null

  const sync = () => {
    const value = serializeParts(domToParts(editorRef.value))
    lastValue = value
    emit('update:value', value)
    emit('input', value)
  }

  watch(
    () => props.value,
    (value) => {
      if (value === lastValue) return
      lastValue = value
      renderToDom(editorRef.value, value)
    }
  )

  // ── Belgilash (selection) ────────────────────────────────────────────────
  // Menyu yoki emoji paneli bosilganda fokus ketadi — oxirgi belgilash saqlab qo'yiladi.
  let savedRange = null
  const isInside = (node) => !!node && editorRef.value?.contains(node)
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel?.rangeCount && isInside(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange()
  }
  const placeCaretAtEnd = () => {
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  }
  const restoreSelection = () => {
    editorRef.value.focus()
    if (!savedRange || !isInside(savedRange.startContainer)) return placeCaretAtEnd()
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(savedRange)
  }

  onMounted(() => {
    lastValue = props.value
    renderToDom(editorRef.value, props.value)
    document.addEventListener('selectionchange', saveSelection)
  })
  onBeforeUnmount(() => document.removeEventListener('selectionchange', saveSelection))

  // ── Tashqi API ───────────────────────────────────────────────────────────
  const focus = () => {
    editorRef.value?.focus()
    placeCaretAtEnd()
  }

  // Kursor turgan joyga (masalan emoji) — brauzerning "undo" tarixi saqlanadi.
  const insertText = (text) => {
    restoreSelection()
    document.execCommand('insertText', false, text)
  }

defineExpose({ focus, insertText })

  // ── Formatlash ───────────────────────────────────────────────────────────
  const applyFormat = (kind) => {
    restoreSelection()
    document.execCommand(kind)
  }

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  const shortcut = (key) => (isMac ? `⌘${key}` : `Ctrl+${key}`)
  const optionLabel = (label, key) => () =>
    h('span', { class: 'flex w-full items-center gap-6' }, [
      h('span', { class: 'flex-1' }, label),
      h('span', { class: 'text-xs text-textColor3' }, shortcut(key))
    ])
  const optionIcon = (icon) => () => h(NIcon, null, { default: () => h(icon) })

  const menu = reactive({ show: false, x: 0, y: 0 })
  const menuOptions = computed(() => [
    { key: 'bold', label: optionLabel(t('liveChatPage.bold'), 'B'), icon: optionIcon(TextBold20Regular) },
    { key: 'italic', label: optionLabel(t('liveChatPage.italic'), 'I'), icon: optionIcon(TextItalic20Regular) }
  ])

  // Brauzer menyusi hech qachon chiqmaydi; hech narsa belgilanmagan bo'lsa — menyu yo'q.
  const onContextMenu = (e) => {
    e.preventDefault()
    const sel = window.getSelection()
    if (!sel?.rangeCount || sel.isCollapsed || !isInside(sel.anchorNode)) return
    saveSelection()
    menu.show = false
    nextTick(() => Object.assign(menu, { show: true, x: e.clientX, y: e.clientY }))
  }

  const onMenuSelect = (kind) => {
    menu.show = false
    applyFormat(kind)
  }

  const onKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) {
      const key = e.key.toLowerCase()
      if (key === 'b' || key === 'i') {
        e.preventDefault()
        applyFormat(key === 'b' ? 'bold' : 'italic')
        return
      }
      // Tagiga chizish saqlanmaydi — maydonda ham ko'rinmasin.
      if (key === 'u') {
        e.preventDefault()
        return
      }
    }
    emit('keydown', e)
  }

  // ── Kiritish cheklovlari ─────────────────────────────────────────────────
  const currentLength = () => (editorRef.value?.innerText ?? '').replace(/\n$/, '').length
  const selectedLength = () => window.getSelection()?.toString().length ?? 0

  const onBeforeInput = (e) => {
    if (!e.inputType?.startsWith('insert') || e.inputType === 'insertFromPaste') return
    if (currentLength() - selectedLength() >= props.maxlength) e.preventDefault()
  }

  // Boshqa joydan nusxa — faqat oddiy matn (rang, shrift, havolalar kirmaydi).
  const onPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') ?? ''
    const room = props.maxlength - currentLength() + selectedLength()
    if (text && room > 0) document.execCommand('insertText', false, text.slice(0, room))
  }

  // Matnni sudrab tashlash — HTML kirmasin; fayllar esa yuqoriga (chat oynasiga) o'tadi.
  const onDrop = (e) => {
    if (!e.dataTransfer?.files?.length) e.preventDefault()
  }
</script>

<template>
  <div class="rich-input relative min-w-0">
    <div v-if="!value && placeholder" class="rich-placeholder" aria-hidden="true">{{ placeholder }}</div>
    <div
      ref="editorRef"
      class="rich-editor"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      :aria-placeholder="placeholder"
      @input="sync"
      @keydown="onKeydown"
      @beforeinput="onBeforeInput"
      @paste="onPaste"
      @drop="onDrop"
      @contextmenu="onContextMenu"
    />
    <n-dropdown
      trigger="manual"
      placement="bottom-start"
      size="small"
      :show="menu.show"
      :x="menu.x"
      :y="menu.y"
      :options="menuOptions"
      @select="onMenuSelect"
      @clickoutside="menu.show = false"
    />
  </div>
</template>

<style scoped>
  /* Balandlik: 1 qatorda 40px (yonidagi ikonalar bilan teng), 5 qatordan keyin scroll. */
  .rich-editor,
  .rich-placeholder {
    padding: var(--rich-padding, 9px 12px);
    font-size: var(--rich-font-size, 14px);
    line-height: var(--rich-line-height, 22px);
  }
  .rich-editor {
    max-height: var(--rich-max-height, 128px);
    overflow-y: auto;
    outline: none;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    color: var(--textColor0);
    caret-color: var(--primary-color);
  }
  .rich-editor :deep(b),
  .rich-editor :deep(strong) {
    font-weight: 600;
  }
  .rich-placeholder {
    position: absolute;
    inset: 0;
    overflow: hidden;
    color: var(--textColor3);
    white-space: nowrap;
    text-overflow: ellipsis;
    pointer-events: none;
  }
</style>
