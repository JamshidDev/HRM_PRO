<script setup>
  // Asos: izoh yoki fayl (kamida bittasi majburiy) — korxona yaratish / yopish / qayta ochishda.
  import { Attach16Regular, Dismiss16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const comment = defineModel('comment', { type: String, default: null })
  const file = defineModel('file', { type: String, default: null })
  const fileName = defineModel('fileName', { type: String, default: null })

  const MAX_MB = 10
  const ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  const inputRef = ref(null)

  const onPick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) {
      $Toast.error(t('organizationPage.basis.tooLarge', { mb: MAX_MB }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      file.value = reader.result
      fileName.value = f.name
    }
    reader.readAsDataURL(f)
  }

  const clearFile = () => {
    file.value = null
    fileName.value = null
  }
</script>

<template>
  <div class="rounded-xl border border-surface-line p-3 flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-textColor0">{{ t('organizationPage.basis.title') }}</span>
      <span class="text-xs text-textColor3">{{ t('organizationPage.basis.hint') }}</span>
    </div>
    <n-input
      v-model:value="comment"
      type="textarea"
      :autosize="{ minRows: 2, maxRows: 5 }"
      :maxlength="2000"
      :placeholder="t('organizationPage.basis.comment')"
    />
    <input ref="inputRef" type="file" class="hidden" :accept="ACCEPT" @change="onPick" />
    <div v-if="fileName" class="flex items-center gap-2 rounded-lg bg-surface-ground px-3 py-2">
      <n-icon size="16" class="text-primary"><Attach16Regular /></n-icon>
      <span class="flex-1 min-w-0 truncate text-sm text-textColor1">{{ fileName }}</span>
      <n-button size="tiny" quaternary circle @click="clearFile">
        <template #icon><n-icon><Dismiss16Regular /></n-icon></template>
      </n-button>
    </div>
    <n-button v-else size="small" dashed @click="inputRef?.click()">
      <template #icon><n-icon><Attach16Regular /></n-icon></template>
      {{ t('organizationPage.basis.file') }}
    </n-button>
  </div>
</template>
