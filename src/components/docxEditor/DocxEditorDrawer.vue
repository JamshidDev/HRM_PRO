<script setup>
  /**
   * Tahrirlash v2 oynasi — docx-editor.dev muharriri + tasdiqlovchilar paneli.
   *
   * Imzolash BU YERDA bajarilmaydi: imzo PDF ustiga qo'yiladi va butun E-IMZO
   * oqimi mavjud PDF oynasida (`UIPdfSignatureDrawer`) ishlaydi. Shuning uchun
   * "Imzolash" tugmasi avval saqlaydi, so'ng `onSign` hodisasini beradi —
   * sahifa o'sha hujjatni imzolash oynasida ochadi. Ikkита parallel imzo
   * mantig'i paydo bo'lmaydi.
   */
  import { useDocxEditorStore } from '@/store/modules/index.js'
  import { UIStatus, UIUser } from '@/components/index.js'
  import DocxEditorApp from './DocxEditorApp.vue'
  import {
    ChevronRight16Regular,
    Dismiss20Regular,
    People20Regular,
    Save20Regular,
    Signature20Regular
  } from '@vicons/fluent'

  const store = useDocxEditorStore()
  const emits = defineEmits(['onSign', 'onSaved'])

  const editorRef = ref(null)

  // Drawer header tab'lari. "Asosiy hujjat" — muharrir + tasdiqlovchilar
  // paneli; qolganlari keyinroq to'ldiriladi (hozircha bo'sh).
  const activeTab = ref('document')
  const tabs = [
    { key: 'document', label: 'docxEditor.tabs.document' },
    { key: 'confirmations', label: 'docxEditor.tabs.confirmations' },
    { key: 'attachments', label: 'docxEditor.tabs.attachments' }
  ]

  /**
   * Muharrir DRAWER ochilish animatsiyasi tugagachgina mount qilinadi.
   *
   * Sabab: muharrirni ko'tarish (React + OOXML parse + shriftlar) asosiy oqimni
   * bir necha soniyaga band qiladi. Agar u animatsiya bilan bir vaqtda
   * boshlansa, brauzer kadrlarni o'tkazib yuboradi va Vue transition'i
   * `enter-from` holatida qotib qoladi — oyna yarim ochiq/ekrandan pastda
   * qolib ketadi (jonli kuzatilgan). Avval oyna silliq ko'tariladi, keyin
   * hujjat yuklanadi (shu orada spinner turadi).
   */
  const drawerReady = ref(false)
  let readyTimer = null

  watch(
    () => store.visible,
    (visible) => {
      clearTimeout(readyTimer)
      if (!visible) {
        drawerReady.value = false
        return
      }
      // Zaxira: `after-enter` hodisasi kelmay qolsa ham muharrir ochiladi.
      readyTimer = setTimeout(() => (drawerReady.value = true), 600)
    }
  )

  onBeforeUnmount(() => clearTimeout(readyTimer))

  const onAfterEnter = () => {
    clearTimeout(readyTimer)
    drawerReady.value = true
  }

  // Yopilish animatsiyasi tugagach tozalaymiz — aks holda hujjat oyna
  // pastga tushayotganda yo'qolib, "sakrash" effekti chiqadi.
  const onAfterLeave = () => {
    drawerReady.value = false
    store._close()
  }

  const onChange = () => {
    store.dirty = true
  }

  const doSave = async () => {
    const buffer = await editorRef.value?.save()
    if (!buffer) return false
    const ok = await store._save(buffer)
    if (ok) emits('onSaved', { documentId: store.documentId, model: store.model })
    return ok
  }

  const onSave = async () => {
    await doSave()
  }

  // Imzolashdan oldin saqlanmagan tahrir yo'qolmasligi uchun avval saqlaymiz.
  const onSign = async () => {
    if (store.dirty) {
      const ok = await doSave()
      if (!ok) return
    }
    const payload = { documentId: store.documentId, model: store.model }
    store._hide()
    emits('onSign', payload)
  }

  // Faqat yopilish animatsiyasini boshlaymiz; holat `after-leave` da tozalanadi.
  const onBack = () => {
    store._hide()
  }
</script>

<template>
  <n-drawer
    :close-on-esc="false"
    :mask-closable="false"
    class="ui__docxEditor-drawer"
    height="100vh"
    v-model:show="store.visible"
    width="100%"
    placement="bottom"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
  >
    <!-- `body-content-style` — n-drawer-content standart padding'i olib
         tashlanadi, aks holda ichki balandlik hisobi drawer'dan oshib ketadi va
         pastki amallar paneli ekran tashqarisida qoladi. -->
    <n-drawer-content
      :native-scrollbar="false"
      :body-content-style="{ padding: 0, height: '100%' }"
      class="h-full"
    >
      <div class="w-full h-full flex-col flex">
        <div class="w-full h-[50px] shrink-0 flex justify-between items-center px-4 gap-3">
          <!-- Tab'lar `›` ajratgichli qadam ko'rinishida (breadcrumb uslubi).
               Orqaga tugmasi yo'q — yopish pastdagi suzuvchi panelda. -->
          <div class="flex items-center gap-1 min-w-0">
            <template v-for="(tab, i) in tabs" :key="tab.key">
              <n-icon v-if="i" size="16" class="opacity-30 shrink-0">
                <ChevronRight16Regular />
              </n-icon>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer"
                :class="
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'opacity-55 hover:opacity-100 hover:bg-surface-ground'
                "
                @click="activeTab = tab.key"
              >
                {{ $t(tab.label) }}
              </button>
            </template>

            <n-tag v-if="store.dirty" size="small" type="warning" :bordered="false" class="ml-2">
              {{ $t('docxEditor.unsaved') }}
            </n-tag>
          </div>

          <!-- Asosiy amallar (Saqlash / Imzolash / Yopish) pastdagi suzuvchi panelda. -->
          <span class="truncate text-sm opacity-60 max-w-[280px]">{{ store.fileName }}</span>
        </div>

        <div class="w-full flex-1 min-h-0 flex gap-3 px-4 pb-4">
          <!-- Muharrir `v-show` bilan yashiriladi — tab almashganda qayta
               yuklanmasin (hujjat va saqlanmagan tahrir joyida qolsin). -->
          <div
            v-show="activeTab === 'document'"
            class="flex-1 min-w-0 h-full rounded-lg overflow-hidden relative"
          >
            <n-spin
              v-if="store.loading || !drawerReady"
              class="w-full h-full flex items-center justify-center"
            />
            <DocxEditorApp
              v-else-if="store.bytes"
              ref="editorRef"
              :bytes="store.bytes"
              @change="onChange"
            />

            <!--
              Saqlash ~5-10 s davom etadi (MinIO + PDF konvertatsiya). Shu vaqtda
              tahrirni bloklaymiz: aks holda saqlanayotgan nusxaga tushmagan
              o'zgarishlar `dirty=false` bilan "saqlangan" deb belgilanib
              yo'qolardi.
            -->
            <div
              v-if="store.saving"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface-ground/70 backdrop-blur-[1px]"
            >
              <n-spin size="large" />
              <span class="text-sm opacity-80">{{ $t('docxEditor.saving') }}</span>
            </div>

            <!-- Asosiy amallar — tahrir oynasining pastki markazida suzib turadi
                 (soya bilan ajralib turadi, sahifa ustidan o'tib ketmasin
                 uchun `z-20`). -->
            <div
              class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-surface-line bg-surface-section px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
            >
              <n-button
                type="primary"
                round
                :loading="store.saving"
                :disabled="store.loading"
                @click="onSave"
              >
                <template #icon>
                  <n-icon size="18"><Save20Regular /></n-icon>
                </template>
                {{ $t('docxEditor.save') }}
              </n-button>

              <n-button
                v-if="store.canSign"
                type="info"
                round
                secondary
                :disabled="store.loading || store.saving"
                @click="onSign"
              >
                <template #icon>
                  <n-icon size="18"><Signature20Regular /></n-icon>
                </template>
                {{ $t('docxEditor.sign') }}
              </n-button>

              <n-button type="error" round :disabled="store.saving" @click="onBack">
                <template #icon>
                  <n-icon size="18"><Dismiss20Regular /></n-icon>
                </template>
                {{ $t('content.close') }}
              </n-button>
            </div>
          </div>

          <!-- ASOSIY HUJJAT tabining o'ng paneli — tasdiqlovchilar (sidebar). -->
          <aside
            v-show="activeTab === 'document'"
            class="w-[300px] shrink-0 h-full flex flex-col rounded-lg border border-surface-line bg-surface-section overflow-hidden"
          >
            <div
              class="shrink-0 px-3 py-2.5 border-b border-surface-line flex items-center gap-2"
            >
              <n-icon size="16" class="opacity-60"><People20Regular /></n-icon>
              <span class="text-sm font-medium">{{ $t('docxEditor.confirmations') }}</span>
              <n-tag v-if="store.confirmations.length" size="tiny" :bordered="false" round>
                {{ store.confirmations.length }}
              </n-tag>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-2">
              <div
                v-for="item in store.confirmations"
                :key="item.id"
                class="p-2.5 rounded-lg bg-surface-ground flex flex-col gap-2"
              >
                <UIUser
                  :short="true"
                  :data="{
                    photo: item.worker?.photo,
                    lastName: item.worker?.last_name,
                    firstName: item.worker?.first_name,
                    middleName: item.worker?.middle_name,
                    position: item.position
                  }"
                />
                <UIStatus :status="item.status" />
              </div>
              <n-empty v-if="!store.confirmations.length" size="small" class="mt-4" />
            </div>
          </aside>

          <!-- Kelishuvchilar / Ilovalar tablari — hozircha bo'sh. -->
          <div
            v-if="activeTab !== 'document'"
            class="flex-1 min-w-0 h-full flex items-center justify-center"
          >
            <n-empty
              size="small"
              :description="
                activeTab === 'confirmations'
                  ? $t('docxEditor.tabs.confirmations')
                  : $t('docxEditor.tabs.attachments')
              "
            />
          </div>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

