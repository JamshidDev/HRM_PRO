<script setup>
  // Telegram formatlashini qo'llab-quvvatlaydigan yengil muharrir.
  // `contenteditable` + toolbar; chiqish — Telegram HTML (`toTelegramHtml`).
  // Telegram/Word'dan nusxalab qo'yilganda format saqlanadi (paste normalizatsiya).
  import { NTooltip } from 'naive-ui'
  import {
    TextBold24Regular,
    TextItalic24Regular,
    TextUnderline24Regular,
    TextStrikethrough24Regular,
    Code24Regular,
    Link24Regular,
    TextQuote24Regular,
    EyeOff24Regular,
    TextClearFormatting24Regular
  } from '@vicons/fluent'
  import { toTelegramHtml, telegramHtmlToPreview } from '@/utils/telegramHtml.js'

  const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  })
  const emit = defineEmits(['update:modelValue'])

  const editorRef = ref(null)
  const isEmpty = ref(!props.modelValue)

  const syncModel = () => {
    const html = toTelegramHtml(editorRef.value?.innerHTML ?? '')
    isEmpty.value = !(editorRef.value?.textContent || '').trim()
    emit('update:modelValue', html)
  }

  // Tashqaridan tozalansa (resetForm) muharrirni ham bo'shatamiz. Aks holda
  // har `input`da innerHTML qayta yozilib kursor boshiga sakrardi.
  watch(
    () => props.modelValue,
    (v) => {
      if (!v && editorRef.value && editorRef.value.innerHTML !== '') {
        editorRef.value.innerHTML = ''
        isEmpty.value = true
      }
    }
  )

  onMounted(() => {
    if (props.modelValue) {
      editorRef.value.innerHTML = telegramHtmlToPreview(props.modelValue)
      isEmpty.value = false
    }
  })

  const exec = (cmd) => {
    if (props.disabled) return
    editorRef.value?.focus()
    document.execCommand(cmd, false, null)
    syncModel()
  }

  // Tanlangan matnni tegga o'rash (execCommand bilmaydigan formatlar uchun).
  const wrapSelection = (tagName, attrs = {}) => {
    if (props.disabled) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const el = document.createElement(tagName)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    el.appendChild(range.extractContents())
    range.insertNode(el)
    sel.removeAllRanges()
    syncModel()
  }

  const addLink = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const href = window.prompt('Havola (https://...)')
    if (!href) return
    wrapSelection('a', { href })
  }

  const clearFormat = () => exec('removeFormat')

  // Nusxalangan HTML'ni Telegram teglariga keltirib qo'yamiz — aks holda
  // `<span style=...>`, `<div>`, `<font>` kabi teglar Telegram'da 400 beradi.
  const onPaste = (e) => {
    e.preventDefault()
    const html = e.clipboardData?.getData('text/html')
    const text = e.clipboardData?.getData('text/plain') ?? ''
    const safe = html
      ? telegramHtmlToPreview(toTelegramHtml(html))
      : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')
    document.execCommand('insertHTML', false, safe)
    syncModel()
  }

  const onKeydown = (e) => {
    const meta = e.metaKey || e.ctrlKey
    if (!meta) return
    const key = e.key.toLowerCase()
    if (key === 'b' || key === 'i' || key === 'u') {
      e.preventDefault()
      exec({ b: 'bold', i: 'italic', u: 'underline' }[key])
    }
  }

  const tools = [
    { key: 'bold', icon: TextBold24Regular, label: 'Qalin (Ctrl+B)', run: () => exec('bold') },
    { key: 'italic', icon: TextItalic24Regular, label: 'Kursiv (Ctrl+I)', run: () => exec('italic') },
    { key: 'underline', icon: TextUnderline24Regular, label: 'Tagi chizilgan (Ctrl+U)', run: () => exec('underline') },
    { key: 'strike', icon: TextStrikethrough24Regular, label: "O'chirilgan", run: () => exec('strikeThrough') },
    { key: 'spoiler', icon: EyeOff24Regular, label: 'Spoiler', run: () => wrapSelection('span', { class: 'tg-spoiler' }) },
    { key: 'code', icon: Code24Regular, label: 'Kod', run: () => wrapSelection('code') },
    { key: 'quote', icon: TextQuote24Regular, label: 'Iqtibos', run: () => wrapSelection('blockquote') },
    { key: 'link', icon: Link24Regular, label: 'Havola', run: addLink },
    { key: 'clear', icon: TextClearFormatting24Regular, label: 'Formatni tozalash', run: clearFormat }
  ]
</script>

<template>
  <div
    class="tg-editor w-full overflow-hidden rounded-lg border border-surface-line bg-surface-section transition-colors focus-within:border-primary"
    :class="{ 'opacity-60': disabled }"
  >
    <div
      class="flex flex-wrap items-center gap-0.5 border-b border-surface-line bg-surface-section px-1 py-1"
    >
      <NTooltip v-for="t in tools" :key="t.key" trigger="hover" placement="top">
        <template #trigger>
          <button
            type="button"
            class="flex size-7 items-center justify-center rounded text-textColor3 transition-colors hover:bg-info/10 hover:text-info"
            :disabled="disabled"
            @mousedown.prevent
            @click="t.run"
          >
            <component :is="t.icon" class="size-4" />
          </button>
        </template>
        <span class="text-xs">{{ t.label }}</span>
      </NTooltip>
    </div>

    <div class="relative">
      <div
        ref="editorRef"
        class="tg-editor__area min-h-[120px] max-h-[260px] overflow-y-auto px-3 py-2 text-sm outline-none"
        :contenteditable="!disabled"
        spellcheck="false"
        @input="syncModel"
        @blur="syncModel"
        @paste="onPaste"
        @keydown="onKeydown"
      />
      <div
        v-if="isEmpty"
        class="pointer-events-none absolute left-3 top-2 text-sm text-textColor3/60"
      >
        {{ placeholder }}
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Telegram ko'rinishiga yaqin: kod va iqtibos ajralib tursin. */
  .tg-editor__area :deep(code) {
    background: rgb(0 0 0 / 6%);
    border-radius: 4px;
    padding: 0 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .tg-editor__area :deep(blockquote) {
    border-left: 3px solid var(--color-info, #3b82f6);
    margin: 4px 0;
    padding-left: 8px;
    opacity: 0.9;
  }
  .tg-editor__area :deep(.tg-spoiler) {
    background: rgb(0 0 0 / 18%);
    border-radius: 3px;
  }
  .tg-editor__area :deep(a) {
    color: var(--color-info, #3b82f6);
    text-decoration: underline;
  }
</style>
