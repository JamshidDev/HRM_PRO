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
  import { UIStatus, UIUser, UISegmentTabs, UIProfileButton } from '@/components/index.js'
  import DocxEditorApp from './DocxEditorApp.vue'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'
  import { Save20Regular, Signature20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useDocxEditorStore()
  const emits = defineEmits(['onSign', 'onSaved'])

  const editorRef = ref(null)

  // Drawer header tab'lari. "Asosiy hujjat" — muharrir + tasdiqlovchilar
  // paneli; qolganlari keyinroq to'ldiriladi (hozircha bo'sh).
  const activeTab = ref('document')
  const tabs = computed(() => [
    { id: 'document', name: t('docxEditor.tabs.document'), icon: icons.figFileArrowDown },
    {
      id: 'confirmations',
      name: t('docxEditor.tabs.confirmations'),
      icon: icons.figUsers,
      badge: store.confirmations.length || null
    },
    { id: 'attachments', name: t('docxEditor.tabs.attachments'), icon: icons.figImageSquare }
  ])

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
      <div class="docx-shell">
        <!-- Sarlavha: chapda hujjat nomi, markazda boblar, o'ngda amallar.
             `1fr auto 1fr` — boblar yon tomonlar kengligidan qat'i nazar
             oynaning aniq markazida qoladi. -->
        <header class="docx-header">
          <div class="docx-title">
            <span class="docx-title__icon">
              <n-icon :size="20"><component :is="icons.figFileArrowDown" /></n-icon>
            </span>
            <div class="flex flex-col min-w-0">
              <span class="docx-title__name">{{ store.fileName || $t('docxEditor.title') }}</span>
              <span v-if="store.dirty" class="docx-title__dirty">
                {{ $t('docxEditor.unsaved') }}
              </span>
            </div>
          </div>

          <UISegmentTabs :tabs="tabs" v-model="activeTab" class="docx-header__tabs" />

          <div class="docx-actions">
            <UIProfileButton
              :icon="Save20Regular"
              :loading="store.saving"
              :disabled="store.loading"
              @click="onSave"
            >
              {{ $t('docxEditor.save') }}
            </UIProfileButton>

            <UIProfileButton
              v-if="store.canSign"
              variant="brand"
              :icon="Signature20Regular"
              :disabled="store.loading || store.saving"
              @click="onSign"
            >
              {{ $t('docxEditor.sign') }}
            </UIProfileButton>

            <button
              type="button"
              class="docx-close"
              :disabled="store.saving"
              :aria-label="$t('content.close')"
              @click="onBack"
            >
              <n-icon :size="18"><component :is="icons.figXmark" /></n-icon>
            </button>
          </div>
        </header>

        <div class="docx-body">
          <!-- Muharrir `v-show` bilan yashiriladi — tab almashganda qayta
               yuklanmasin (hujjat va saqlanmagan tahrir joyida qolsin). -->
          <section v-show="activeTab === 'document'" class="docx-editor">
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
            <div v-if="store.saving" class="docx-saving">
              <n-spin size="large" />
              <span class="text-sm text-fig-text-secondary">{{ $t('docxEditor.saving') }}</span>
            </div>
          </section>

          <!-- ASOSIY HUJJAT tabining o'ng paneli — tasdiqlovchilar.
               `UIFigBlock` emas: bu yerda tana to'liq balandlikni egallab
               ichida skroll bo'lishi kerak, blok komponenti esa kontent
               bo'yicha o'lchanadi. Ranglar va radiuslar bir xil. -->
          <aside v-show="activeTab === 'document'" class="docx-side">
            <div class="docx-side__header">
              <n-icon :size="20" class="text-fig-text-brand shrink-0">
                <component :is="icons.figUsers" />
              </n-icon>
              <span class="docx-side__title">{{ $t('docxEditor.confirmations') }}</span>
              <span v-if="store.confirmations.length" class="docx-side__count">
                {{ store.confirmations.length }}
              </span>
            </div>

            <div class="docx-side__body">
              <div v-for="item in store.confirmations" :key="item.id" class="docx-person">
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

              <div v-if="!store.confirmations.length" class="docx-empty">
                <n-icon :size="28" class="text-fig-text-tertiary">
                  <component :is="icons.figUsers" />
                </n-icon>
                <span>{{ $t('content.notFoundData') }}</span>
              </div>
            </div>
          </aside>

          <!-- Kelishuvchilar / Ilovalar tablari — hozircha bo'sh. -->
          <section v-if="activeTab !== 'document'" class="docx-placeholder">
            <n-icon :size="36" class="text-fig-text-tertiary">
              <component
                :is="activeTab === 'confirmations' ? icons.figUsers : icons.figImageSquare"
              />
            </n-icon>
            <span>
              {{
                activeTab === 'confirmations'
                  ? $t('docxEditor.tabs.confirmations')
                  : $t('docxEditor.tabs.attachments')
              }}
            </span>
          </section>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="scss" scoped>
  .docx-shell {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--surface-ground);
  }

  .docx-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    padding: 12px 16px;
    border-bottom: 1px solid var(--fig-br-disable);
    background: var(--fig-block-bg);
  }

  .docx-header__tabs {
    justify-self: center;
  }

  .docx-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .docx-title__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 10px;
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
  }

  .docx-title__name {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .docx-title__dirty {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--fig-text-orange, var(--fig-icon-orange));
  }

  .docx-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    min-width: 0;
  }

  .docx-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: none;
    border-radius: 8px;
    background: var(--fig-bg-tertiary);
    color: var(--fig-text-secondary);
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover:not(:disabled) {
      opacity: 0.85;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .docx-body {
    display: flex;
    flex: 1;
    min-height: 0;
    gap: 16px;
    padding: 16px;
  }

  .docx-editor {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    border-radius: 24px;
    overflow: hidden;
    background: var(--fig-block-bg);
  }

  .docx-saving {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: color-mix(in srgb, var(--surface-ground) 70%, transparent);
    backdrop-filter: blur(2px);
  }

  // Maketdagi blok qolipi: 4px ramka + 28px radiusli gradient sarlavha
  .docx-side {
    display: flex;
    flex-direction: column;
    width: 320px;
    flex-shrink: 0;
    height: 100%;
    padding: 4px;
    border-radius: 24px;
    overflow: hidden;
    background: var(--fig-block-bg);
  }

  .docx-side__header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    padding: 10px 16px;
    border-radius: 20px 20px 4px 4px;
    background: var(--fig-block-header-bg);
  }

  .docx-side__title {
    flex: 1;
    min-width: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    color: var(--fig-text-brand);
  }

  .docx-side__count {
    flex-shrink: 0;
    min-width: 22px;
    padding: 2px 8px;
    border-radius: 9999px;
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    text-align: center;
  }

  .docx-side__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 0;
    padding: 12px;
    overflow-y: auto;
  }

  .docx-person {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
    background: var(--fig-bg-secondary);
  }

  .docx-empty,
  .docx-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    color: var(--fig-text-tertiary);
  }

  .docx-empty {
    flex: 1;
  }

  .docx-placeholder {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 1px dashed var(--fig-br-disable);
    border-radius: 24px;
    background: var(--fig-block-bg);
  }

  // Tor ekranda amallar sarlavha ostiga tushadi, panel esa muharrir tagiga
  @media (max-width: 1200px) {
    .docx-header {
      grid-template-columns: 1fr auto;
      row-gap: 12px;
    }

    .docx-header__tabs {
      grid-column: 1 / -1;
      grid-row: 2;
      justify-self: start;
    }
  }

  @media (max-width: 976px) {
    .docx-body {
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    .docx-side {
      width: 100%;
      height: auto;
      max-height: 240px;
    }
  }
</style>
