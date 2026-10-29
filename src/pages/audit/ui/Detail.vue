<script setup>
  /**
   * Yozuv tarixi modali — vaqt chizig'i. Hodisalar kunlar bo'yicha guruhlanadi;
   * har hodisa bajaruvchi, bir jumlalik xulosa va o'zgargan yozuvlar ro'yxati.
   * Bitta hodisa `detail/HistoryEntry.vue`, bitta yozuv `detail/ChangeRow.vue`.
   */
  import { ArrowExpand20Regular, ArrowMinimize20Regular, CalendarLtr16Regular } from '@vicons/fluent'
  import { UIModal } from '@/components/index.js'
  import { useAuditStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import HistoryEntry from './detail/HistoryEntry.vue'

  const { t } = i18n.global
  const store = useAuditStore()

  // Modal sarlavhasi: qaysi sahifaning qaysi yozuvi tarixi ochilgan.
  const title = computed(() => {
    const page = store.detailEvent?.page?.title
    const id = store.detailParams.trigger_id
    if (!page) return t('audit.detail.title')
    return id ? `${t('audit.detail.title')} — ${page} #${id}` : `${t('audit.detail.title')} — ${page}`
  })

  const hasMore = computed(() => store.detailList.length < store.detailTotal)

  // ── Kunlar bo'yicha guruhlash ────────────────────────────────────────────
  // Backend `created_at` ni "YYYY-MM-DD HH:MM:SS" ko'rinishida, eng yangisidan
  // eskisiga beradi — tartib saqlanib, ketma-ket bir kunlik hodisalar yig'iladi.
  const pad = (n) => String(n).padStart(2, '0')
  const localDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const dayLabel = (key) => {
    const [y, m, d] = key.split('-')
    const date = `${d}.${m}.${y}`
    const now = new Date()
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    if (key === localDay(now)) return `${t('content.today')} · ${date}`
    if (key === localDay(yesterday)) return `${t('content.yesterday')} · ${date}`
    return date
  }

  const days = computed(() => {
    const out = []
    store.detailList.forEach((ev, index) => {
      const [day = ''] = String(ev.created_at || '').split(' ')
      const item = { ev, index }
      const last = out[out.length - 1]
      if (last && last.key === day) last.items.push(item)
      else out.push({ key: day, label: day ? dayLabel(day) : '—', items: [item] })
    })
    return out
  })

  // ── Cheksiz scroll ───────────────────────────────────────────────────────
  // Sentinel ro'yxat oxirida DOIM turadi (shart bilan render qilinsa u yo'qolib,
  // observer uzilgan tugunni kuzatib qolardi). Ko'rinishga kirganda keyingi
  // sahifa so'raladi; qo'sh chaqiriqdan store'dagi `detailLoading` himoya qiladi.
  const sentinel = ref(null)
  let observer = null

  const teardownObserver = () => {
    observer?.disconnect()
    observer = null
  }

  const setupObserver = () => {
    teardownObserver()
    if (!sentinel.value) return
    // `root` — modal tanasi (UIModal.vue: `overflow-y-auto`). Topilmasa viewport.
    const root = sentinel.value.closest('.overflow-y-auto') || null
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        if (!hasMore.value || store.detailLoading) return
        store.loadMoreDetail()
      },
      { root, rootMargin: '300px' }
    )
    observer.observe(sentinel.value)
  }

  onBeforeUnmount(teardownObserver)

  // ── Ochiq bo'laklar ──────────────────────────────────────────────────────
  // Kontekst (korxona / kanal / IP / qurilma) hodisa indeksi bo'yicha eslab
  // qolinadi. Indeks barqaror: "yana yuklash" ro'yxatni faqat oxiridan to'ldiradi.
  const metaOpen = ref(new Set())

  const toggleMeta = (i) => {
    const next = new Set(metaOpen.value)
    next.has(i) ? next.delete(i) : next.add(i)
    metaOpen.value = next
  }

  // "Oldin / Keyin" kartochkalari — BARCHASI birdan ochiladi/yopiladi. Boshqaruv
  // modal sarlavhasida (yopish tugmasi yonida), chunki u butun modalga tegishli.
  const cardsOpen = ref(true)

  // ── Bosilgan hodisaga scroll ────────────────────────────────────────────
  // Har bir hodisa bloki `request_id` bo'yicha eslab qolinadi; ro'yxat birinchi
  // marta yuklangach o'sha blokka olib boriladi. "Yana yuklash" da TAKRORLANMAYDI
  // (`focusDone`) — aks holda foydalanuvchi scroll qilgan joyidan sakrab ketardi.
  const eventEls = new Map()
  const focusDone = ref(false)

  // `ref` komponentga qo'yilgan — DOM tuguni uning `$el` ida.
  const setEventRef = (el, requestId) => {
    const node = el?.$el ?? el
    if (node) eventEls.set(requestId, node)
    else eventEls.delete(requestId)
  }

  watch(
    () => store.detailList.length,
    async (len) => {
      await nextTick()

      // Kuzatuvchini QAYTA ulaymiz: IntersectionObserver faqat holat
      // O'ZGARGANDA ishlaydi. Birinchi sahifa ekranni to'ldirmasa sentinel
      // allaqachon ko'rinib turadi va yangi callback kelmasdi — qayta observe
      // darhol joriy holat bilan callback beradi.
      setupObserver()

      if (!len || focusDone.value || !store.detailFocusId) return
      const el = eventEls.get(store.detailFocusId)
      focusDone.value = true
      // Topilmasa (bosilgan hodisa keyingi sahifada) — hech narsa qilinmaydi.
      if (el) el.scrollIntoView({ block: 'center' })
    }
  )

  // Modal har ochilganda: kontekstlar yig'ilgan, kartochkalar ochiq.
  watch(
    () => store.detailVisible,
    (v) => {
      if (v) {
        metaOpen.value = new Set()
        cardsOpen.value = true
        focusDone.value = false
        eventEls.clear()
        nextTick(setupObserver)
      } else {
        teardownObserver()
      }
    }
  )
</script>

<template>
  <UIModal
    v-model:visible="store.detailVisible"
    :title="title"
    width="min(860px, calc(100vw - 32px))"
    height="min(85vh, 820px)"
  >
    <template #header-actions>
      <n-button
        quaternary
        circle
        :aria-label="cardsOpen ? $t('audit.detail.collapseAll') : $t('audit.detail.expandAll')"
        @click="cardsOpen = !cardsOpen"
      >
        <template #icon>
          <n-icon>
            <ArrowMinimize20Regular v-if="cardsOpen" />
            <ArrowExpand20Regular v-else />
          </n-icon>
        </template>
      </n-button>
    </template>

    <div class="audit-detail">
      <!-- Faqat BIRINCHI yuklashda; keyingi sahifalar sentinel'da ko'rsatiladi. -->
      <div v-if="store.detailLoading && !store.detailList.length" class="audit-loading">
        <n-skeleton v-for="n in 3" :key="n" height="88px" :sharp="false" />
      </div>

      <div v-else-if="!store.detailList.length" class="audit-empty">
        {{ $t('audit.detail.empty') }}
      </div>

      <section v-for="day in days" :key="day.key" class="audit-day">
        <!-- Kun sarlavhasi STICKY: scroll qilganda qaysi kun ekani ko'rinib turadi. -->
        <div class="audit-day__head">
          <span class="audit-day__chip">
            <n-icon :size="14"><CalendarLtr16Regular /></n-icon>
            {{ day.label }}
          </span>
        </div>

        <HistoryEntry
          v-for="{ ev, index } in day.items"
          :key="ev.request_id + index"
          :ref="(el) => setEventRef(el, ev.request_id)"
          :event="ev"
          :index="index"
          :focused="ev.request_id === store.detailFocusId"
          :meta-open="metaOpen.has(index)"
          :cards-open="cardsOpen"
          @toggle-meta="toggleMeta(index)"
        />
      </section>

      <!-- Cheksiz scroll nishoni + keyingi sahifa indikatori -->
      <div ref="sentinel" class="audit-sentinel">
        <n-spin v-if="store.detailLoading && store.detailList.length" :size="18" />
        <span v-else-if="store.detailList.length && !hasMore" class="audit-sentinel__end">
          {{ store.detailList.length }} / {{ store.detailTotal }}
        </span>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  .audit-loading {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .audit-empty {
    padding: 48px 0;
    text-align: center;
    opacity: 0.5;
    font-size: 13px;
  }

  /*
    Kun sarlavhasi STICKY. `top: -16px` va shuncha manfiy `margin-top` UIModal
    tanasining ichki chekkasini (`pt-4`) qoplaydi: ostidan o'tayotgan kontent
    sarlavha tepasida ko'rinib qolmaydi. Fon — modal kartochkasining o'z rangi
    (`--n-color`), shuning uchun alohida kulrang chiziq bo'lib ajralmaydi;
    yon tomonlarga chiqib ketmaydi (manfiy yon margin yo'q).
  */
  .audit-day__head {
    position: sticky;
    top: -16px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: -16px;
    padding: 16px 0 10px;
    background: var(--n-color, var(--color-surface-section, #ffffff));
  }

  .audit-day + .audit-day .audit-day__head {
    margin-top: -12px;
  }

  /* Sarlavhadan o'ngga cho'zilgan ingichka chiziq — kunlarni ajratadi. */
  .audit-day__head::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-surface-line, #e2e8f0);
  }

  .audit-day__chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--color-surface-line, #e2e8f0);
    background: var(--color-surface-ground, #f8fafc);
    color: var(--color-fig-text-secondary, #475467);
  }

  .audit-sentinel {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
  }

  .audit-sentinel__end {
    font-size: 12px;
    opacity: 0.4;
  }
</style>
