<script setup>
  /**
   * docx-editor.dev muharriri (React) Vue ichida — "React island".
   *
   * Muharrirning Vue adapteri yo'q, faqat React paketi bor. Shuning uchun kichik
   * React root shu komponent ichida yaratiladi; React/react-dom/muharrir
   * **dinamik import** qilinadi — asosiy bundle'ga tushmasin, faqat tahrirlash
   * oynasi ochilganda yuklansin (core ≈ 380 KB gz).
   *
   * Tashqariga faqat `save()` chiqariladi — u DOCX'ni ArrayBuffer qilib qaytaradi.
   */
  const props = defineProps({
    // Uint8Array — muharrirga beriladigan DOCX baytlari.
    bytes: { type: Object, default: null },
    mode: { type: String, default: 'edit' }
  })
  const emits = defineEmits(['change', 'ready'])

  const hostRef = ref(null)
  const editorInstance = shallowRef(null)

  let reactRoot = null
  let React = null
  // Kompozitsiya qismlari: Root / Menu / Toolbar / Viewport / Content.
  let parts = null
  // Word shriftlarining metrik-mos o'rinbosarlari (Carlito↔Calibri,
  // Liberation Serif↔Times New Roman, ...). Paket ichida keladi — tashqi CDN
  // YO'Q. Berilmasa muharrir "Some fonts ... aren't available" ogohlantirishini
  // ko'rsatadi va satr uzilishlarini taxminiy hisoblaydi.
  let fontConfig = null

  /**
   * Muharrir hujjatni yuklab, sahifani birinchi marta joylashtirganda ham
   * `onChange` beradi — foydalanuvchi hech narsaga tegmasa ham "saqlanmagan
   * o'zgarish" ko'rinib qolardi. Shuning uchun `change` faqat **haqiqiy
   * foydalanuvchi aralashuvidan keyin** yuqoriga uzatiladi (tugma bosish,
   * klaviatura, paste — hammasi muharrir konteyneri ichida sodir bo'ladi).
   */
  const userTouched = ref(false)
  const markTouched = () => {
    userTouched.value = true
  }

  /**
   * KOMPOZITSIYA rejimi (tayyor `<DocxEditor>` EMAS).
   *
   * Sabab: tayyor komponent hujjat nomi qatorini ("Untitled") majburan
   * chizadi va uni o'chiradigan prop yo'q (`chrome: false` esa asboblar
   * panelini ham olib tashlaydi). `Root` + `Menu` + `Toolbar` + `Viewport`
   * bilan o'sha qatorsiz yig'amiz — sarlavha bizning drawer header'imizda.
   */
  const renderEditor = () => {
    if (!reactRoot || !React || !parts || !props.bytes) return
    const { Root, Toolbar, Viewport, Content } = parts
    reactRoot.render(
      React.createElement(
        Root,
        {
          document: props.bytes,
          mode: props.mode,
          ...(fontConfig ? { fonts: fontConfig } : {}),
          // Kompozitsiyada `ref` emas — `Editor` nusxasi shu callback bilan keladi.
          onReady: (editor) => {
            editorInstance.value = editor
          },
          onChange: () => {
            if (userTouched.value) emits('change')
          }
        },
        // Menyu qatori (File/Format/Insert/Help) chiqarilmaydi: `MenuBar`
        // faqat Toolbar konteksti ichida ishlaydi, `DocxEditorMenu` esa
        // konteynersiz vertikal ro'yxat bo'lib cho'ziladi. Barcha formatlash
        // asboblar panelida bor, File→Saqlash esa bizning tugmamizda.
        React.createElement(Toolbar, { key: 'toolbar' }),
        React.createElement(
          Viewport,
          { key: 'viewport' },
          React.createElement(Content, { key: 'content' })
        )
      )
    )
  }

  onMounted(async () => {
    const [reactMod, clientMod, editorMod, fontsMod] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('@docx-editor.dev/react'),
      import('@docx-editor.dev/fonts'),
      import('@docx-editor.dev/core/styles/editor.css')
    ])
    React = reactMod.default ?? reactMod
    parts = {
      Root: editorMod.DocxEditorRoot,
      Toolbar: editorMod.DocxEditorToolbar,
      Viewport: editorMod.DocxEditorViewport,
      Content: editorMod.DocxEditorContent
    }

    // Shriftlar yuklanmasa ham muharrir ochiladi (o'rinbosar metrikada) —
    // shuning uchun xato bloklamaydi.
    try {
      fontConfig = await fontsMod.defaultFonts()
    } catch (e) {
      console.warn('[docx-editor] shriftlarni yuklab bo‘lmadi', e)
    }
    reactRoot = clientMod.createRoot(hostRef.value)
    hostRef.value?.addEventListener('pointerdown', markTouched, { capture: true })
    hostRef.value?.addEventListener('keydown', markTouched, { capture: true })
    hostRef.value?.addEventListener('paste', markTouched, { capture: true })
    renderEditor()
    emits('ready')
  })

  watch(
    () => props.bytes,
    () => {
      // Yangi hujjat — aralashuv hisoblagichi noldan boshlanadi.
      userTouched.value = false
      renderEditor()
    }
  )

  onBeforeUnmount(() => {
    const root = reactRoot
    reactRoot = null
    editorInstance.value = null
    hostRef.value?.removeEventListener('pointerdown', markTouched, { capture: true })
    hostRef.value?.removeEventListener('keydown', markTouched, { capture: true })
    hostRef.value?.removeEventListener('paste', markTouched, { capture: true })
    // React render tsikli ichida sinxron unmount ogohlantirish beradi — keyingi
    // mikrotaskga suramiz.
    queueMicrotask(() => root?.unmount())
  })

  // Tahrirlangan hujjat — ArrayBuffer (backendga multipart bo'lib ketadi).
  const save = async () => {
    if (!editorInstance.value) return null
    return await editorInstance.value.save()
  }

  defineExpose({ save })
</script>

<template>
  <div ref="hostRef" class="docx-editor-mount w-full h-full"></div>
</template>

<style>
  /*
   * Kompozitsiya rejimida (`Root` + `Toolbar` + `Viewport`) hech kim balandlik
   * bermaydi: asboblar paneli va scroll konteyneri oddiy blok bo'lib joylashadi,
   * hujjat konteynerdan oshib ketadi va **scroll ishlamaydi** (jonli kuzatilgan:
   * hujjatning oxirini ko'rib bo'lmasdi).
   *
   * ⚠️ `.docx-editor` klassini muharrir IKKI elementga qo'yadi — asboblar
   * paneliga (`docx-editor docx-toolbar`) va scroll konteyneriga
   * (`docx-editor__scroll-container`). Shuning uchun umumiy
   * `.docx-editor { height: 100% }` qoidasi PANELNI ham cho'zib yuboradi
   * (jonli kuzatilgan buzilish). Faqat scroll konteyneri maqsad qilinadi.
   *
   * Teleport (drawer) sababli style `scoped` EMAS; qamrov drawer klassi bilan
   * cheklangan.
   */
  .ui__docxEditor-drawer .docx-editor-mount {
    display: flex;
    flex-direction: column;
  }

  /* Asboblar paneli — o'z balandligicha. */
  .ui__docxEditor-drawer .docx-editor-mount > .docx-toolbar {
    flex: 0 0 auto;
  }

  /* Hujjat maydoni — qolgan joyni egallaydi va O'ZI scroll qiladi. */
  .ui__docxEditor-drawer .docx-editor__scroll-container {
    flex: 1 1 auto;
    min-height: 0;
  }
</style>
