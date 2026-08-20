<script setup>
  import {
    ArrowExpand20Regular,
    ArrowMinimize20Regular,
    CheckmarkCircle20Filled,
    ChevronDown20Regular,
    DismissCircle20Filled,
    Warning20Filled
  } from '@vicons/fluent'
  import { UIModal, UIStatus, UIUser } from '@/components/index.js'
  import { useAuditStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAuditStore()

  // UIStatus rang va ikonani `status.id` bo'yicha tanlaydi (UIStatus.vue: 10..13).
  const STATUS_ID = { create: 10, update: 11, delete: 12, restore: 13 }
  const statusOf = (s) => ({ id: STATUS_ID[s] ?? 9, name: t(`audit.status.${s}`) })

  const dateOf = (ev) => {
    const [d] = String(ev?.created_at || '').split(' ')
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  const timeOf = (ev) => String(ev?.created_at || '').split(' ')[1] || '—'

  // Modal sarlavhasi: qaysi sahifaning qaysi yozuvi tarixi ochilgan.
  const title = computed(() => {
    const page = store.detailEvent?.page?.title
    const id = store.detailParams.trigger_id
    if (!page) return t('audit.detail.title')
    return id ? `${t('audit.detail.title')} — ${page} #${id}` : `${t('audit.detail.title')} — ${page}`
  })

  const hasMore = computed(() => store.detailList.length < store.detailTotal)

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

  // Kontekst (korxona / kanal / IP / qurilma) har hodisada YIG'ILGAN turadi —
  // odatda kerak emas, kerak bo'lganda ochiladi. Kalit sifatida ro'yxatdagi
  // indeks: `request_id` takrorlanishi mumkin emas, lekin indeks barqarorroq
  // ("yana yuklash" bilan ro'yxat faqat oxiriga qo'shiladi).
  const expanded = ref(new Set())

  const toggleMeta = (i) => {
    const next = new Set(expanded.value)
    next.has(i) ? next.delete(i) : next.add(i)
    expanded.value = next
  }

  // "Oldin/Keyin" kartochkalari — BARCHASI birdan ochiladi/yopiladi. Boshqaruv
  // modal sarlavhasida (yopish tugmasi yonida), chunki u butun modalga tegishli.
  const cardsOpen = ref(true)

  // ── Bosilgan hodisaga scroll ────────────────────────────────────────────
  // Har bir hodisa bloki `request_id` bo'yicha eslab qolinadi; ro'yxat birinchi
  // marta yuklangach o'sha blokka olib boriladi. "Yana yuklash" da TAKRORLANMAYDI
  // (`focusDone`) — aks holda foydalanuvchi scroll qilgan joyidan sakrab ketardi.
  const eventEls = new Map()
  const focusDone = ref(false)

  const setEventRef = (el, requestId) => {
    if (el) eventEls.set(requestId, el)
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
      if (el) el.scrollIntoView({ block: 'start' })
    }
  )

  // Modal har ochilganda: kontekstlar yig'ilgan, kartochkalar ochiq.
  watch(
    () => store.detailVisible,
    (v) => {
      if (v) {
        expanded.value = new Set()
        cardsOpen.value = true
        focusDone.value = false
        eventEls.clear()
        nextTick(setupObserver)
      } else {
        teardownObserver()
      }
    }
  )

  // Bitta hodisaning kontekst qatori (kanal / IP / qurilma) — bo'shlari tushadi.
  const metaOf = (ev) =>
    [
      { label: t('audit.detail.organization'), value: ev.organization?.name },
      { label: t('audit.detail.channel'), value: t(`audit.channel.${ev.auth_channel}`) },
      { label: t('audit.detail.ip'), value: ev.ip, mono: true },
      { label: t('audit.detail.userAgent'), value: ev.user_agent, mono: true, wrap: true }
    ].filter((r) => r.value)

  // Qiymatni ekranga chiqarish. `ref` tipidagi maydon backenddan {id, name}.
  // `bool` bu yerda ISHLANMAYDI — u ikonka bilan chiziladi (`boolIcon`), shunda
  // barcha mantiqiy maydonlar (Faol va h.k.) BIR XIL ko'rinishda bo'ladi.
  const show = (value, type) => {
    if (value === null || value === undefined) return '—'
    if (type === 'ref') {
      if (typeof value !== 'object') return String(value)
      return value.name || `#${value.id}`
    }
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  const isBool = (f, value) =>
    f.type === 'bool' && value !== null && value !== undefined

  const boolIcon = (value) => (value ? CheckmarkCircle20Filled : DismissCircle20Filled)
</script>

<template>
  <UIModal
    v-model:visible="store.detailVisible"
    :title="title"
    width="min(1040px, calc(100vw - 32px))"
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
        <!--
          Loader ro'yxatning YONIDA turadi, uni O'RAMAYDI: `n-spin` o'ram
          bo'lganda sticky sarlavha uchun ortiqcha ajdod hosil bo'lardi.
          Faqat BIRINCHI yuklashda; "yana yuklash" o'z tugmasida ko'rsatiladi.
        -->
        <div v-if="store.detailLoading && !store.detailList.length" class="audit-loading">
          <n-skeleton height="64px" :sharp="false" />
          <n-skeleton height="132px" :sharp="false" />
          <n-skeleton height="132px" :sharp="false" />
        </div>

        <div v-else-if="!store.detailList.length" class="audit-empty">
          {{ $t('audit.detail.empty') }}
        </div>

        <!--
          Yozuvning BUTUN tarixi — eng yangisidan eskisiga. Har hodisa alohida
          blok: yuqorida bajaruvchi, pastida "Oldin / Keyin" kartochkalari.
        -->
        <section
          v-for="(ev, i) in store.detailList"
          :key="ev.request_id + i"
          :ref="(el) => setEventRef(el, ev.request_id)"
          class="audit-event"
          :class="{ 'audit-event--focused': ev.request_id === store.detailFocusId }"
        >
          <!--
            STICKY sarlavha: shu hodisaning kartochkalarini scroll qilib
            ko'rayotganda "kim va qachon" ko'z oldida turadi. Keyingi hodisa
            bloki tepaga yetganda uni tabiiy ravishda surib chiqaradi.
          -->
          <header class="audit-event__head">
            <div class="audit-event__row">
              <UIUser
                v-if="ev.user"
                class="min-w-0 flex-1"
                :short="false"
                :data="{
                  photo: ev.user.photo,
                  lastName: ev.user.last_name,
                  firstName: ev.user.first_name,
                  middleName: ev.user.middle_name,
                  position: ev.role?.name
                }"
              />
              <span v-else class="flex-1 text-sm opacity-60">{{ $t('audit.detail.system') }}</span>

              <div class="audit-event__when">
                <span>{{ dateOf(ev) }}</span>
                <span class="opacity-60">{{ timeOf(ev) }}</span>
              </div>

              <!-- Kontekst YIG'ILGAN turadi — kerak bo'lganda ochiladi. -->
              <n-button
                quaternary
                circle
                size="small"
                class="audit-event__toggle"
                :class="{ 'is-open': expanded.has(i) }"
                :aria-label="$t('audit.detail.moreInfo')"
                @click="toggleMeta(i)"
              >
                <template #icon>
                  <n-icon><ChevronDown20Regular /></n-icon>
                </template>
              </n-button>
            </div>

            <!-- O'ram div SHART: `n-collapse-transition` balandlikni o'lchaydi,
                 to'g'ridan-to'g'ri `margin` li bola bilan margin-collapse yuz berib
                 kartochka "sakrab" ochilardi. Margin endi o'ram ichida. -->
            <n-collapse-transition :show="expanded.has(i)">
              <div class="audit-meta__wrapper">
              <dl class="audit-meta">
                <template v-for="m in metaOf(ev)" :key="m.label">
                  <dt>{{ m.label }}</dt>
                  <dd :class="[m.mono && 'font-mono text-xs', m.wrap && 'audit-meta__wrap']">
                    {{ m.value }}
                  </dd>
                </template>
              </dl>
              </div>
            </n-collapse-transition>
          </header>

          <!-- Sudo ogohlantirishi — shu hodisaga tegishli -->
          <n-alert v-if="ev.impersonator" type="warning" class="mt-2" :bordered="false">
            <template #icon>
              <n-icon><Warning20Filled /></n-icon>
            </template>
            {{
              $t('audit.detail.impersonated', {
                admin: ev.impersonator.full_name,
                user: ev.user?.full_name
              })
            }}
          </n-alert>

          <div v-for="(ch, ci) in ev.changes" :key="ci" class="audit-change">
            <!-- Sahifa nomi bu yerda TAKRORLANMAYDI: u modal sarlavhasida
                 allaqachon bor. Holat belgisi yetarli. -->
            <div class="audit-change__head">
              <UIStatus :status="statusOf(ch.status)" pill />
            </div>

            <n-collapse-transition :show="cardsOpen">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <!-- OLDIN — create'da yozuv bo'lmagan -->
              <div v-if="ch.has_old" class="audit-card audit-card--before">
                <span class="audit-card__label">{{ $t('audit.detail.before') }}</span>
                <div
                  v-for="f in ch.fields"
                  :key="`o-${f.field}`"
                  class="audit-row"
                  :class="{ 'audit-row--changed': f.changed }"
                >
                  <span class="audit-row__mark" aria-hidden="true"></span>
                  <span class="audit-row__label">{{ f.label }}</span>
                  <span class="audit-row__value">
                    <n-icon
                      v-if="isBool(f, f.old)"
                      :size="16"
                      :class="f.old ? 'audit-bool--on' : 'audit-bool--off'"
                      :component="boolIcon(f.old)"
                    />
                    <template v-else>{{ show(f.old, f.type) }}</template>
                  </span>
                </div>
              </div>
              <div v-else class="audit-card audit-card--empty">
                {{ $t('audit.detail.noBefore') }}
              </div>

              <!-- KEYIN — hard delete'da yozuv qolmagan -->
              <div v-if="ch.has_new" class="audit-card audit-card--after">
                <span class="audit-card__label">{{ $t('audit.detail.after') }}</span>
                <div
                  v-for="f in ch.fields"
                  :key="`n-${f.field}`"
                  class="audit-row"
                  :class="{ 'audit-row--changed': f.changed }"
                >
                  <span class="audit-row__mark" aria-hidden="true"></span>
                  <span class="audit-row__label">{{ f.label }}</span>
                  <span class="audit-row__value">
                    <n-icon
                      v-if="isBool(f, f.new)"
                      :size="16"
                      :class="f.new ? 'audit-bool--on' : 'audit-bool--off'"
                      :component="boolIcon(f.new)"
                    />
                    <template v-else>{{ show(f.new, f.type) }}</template>
                  </span>
                </div>
              </div>
              <div v-else class="audit-card audit-card--empty">
                {{ $t('audit.detail.noAfter') }}
              </div>
            </div>
            </n-collapse-transition>
          </div>
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
  .audit-sentinel {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    margin-top: 12px;
  }

  .audit-sentinel__end {
    font-size: 12px;
    opacity: 0.4;
  }

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

  /* ── Bitta hodisa bloki ───────────────────────────────────────────────── */
  /*
    Ajratgich keyingi blokning USTIDA emas, oldingisining OSTIDA — aks holda
    `padding-top` sticky sarlavhani tepadan surib qo'yardi.
  */
  .audit-event + .audit-event {
    margin-top: 20px;
  }

  .audit-event:not(:last-child)::after {
    content: '';
    display: block;
    margin-top: 18px;
    border-top: 1px dashed var(--color-surface-line, #e2e8f0);
  }

  /*
    Bajaruvchi kartochkasi STICKY, aynan `top: 0` — orasida hech qanday
    padding/margin yo'q. Fon SHAFFOF BO'LMASLIGI shart, aks holda ostidagi
    kartochkalar ko'rinib ketadi.
  */
  .audit-event__head {
    position: sticky;
    /*
      `top: 0` scroll konteynerining PADDING chekkasiga yopishtiradi, UIModal
      tanasi esa `px-4 pt-4 pb-4` (UIModal.vue:133) — natijada tepada 16px
      bo'shliq qolardi. Manfiy `top` shu padding'ni qoplaydi va kartochka
      modal sarlavhasiga tegib turadi.
    */
    top: -16px;
    z-index: 3;
    padding: 10px 12px;
    margin: 0 -12px;
    border-radius: 14px;
    background: var(--color-surface-section, #ffffff);
    border: 1px solid var(--color-surface-line, #e2e8f0);
  }

  /* Ro'yxatdan bosilgan hodisa — brend ramkasi bilan ajratiladi. */
  .audit-event--focused .audit-event__head {
    border-color: var(--color-fig-chip-brand-text, #1570ef);
    box-shadow: 0 0 0 2px var(--color-fig-bg-brand-surface, #eff8ff);
  }

  .audit-event__row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .audit-event__when {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1.3;
    white-space: nowrap;
  }

  .audit-event__toggle {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .audit-event__toggle.is-open {
    transform: rotate(180deg);
  }

  /* ── Kontekst (ochiladigan) ───────────────────────────────────────────── */
  .audit-meta__wrapper {
    padding-top: 10px;
    margin-top: 10px;
    border-top: 1px dashed var(--color-surface-line, #e2e8f0);
  }

  .audit-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;
    margin: 0;
    font-size: 12px;
  }

  .audit-meta dt {
    opacity: 0.5;
    white-space: nowrap;
  }

  .audit-meta dd {
    margin: 0;
    word-break: break-word;
  }

  .audit-meta__wrap {
    max-height: 44px;
    overflow: auto;
    opacity: 0.75;
  }

  /* ── O'zgarish kartochkalari ──────────────────────────────────────────── */
  .audit-change {
    margin-top: 14px;
  }

  .audit-change__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  /*
    Kartochka = KO'TARILGAN yuza (`surface-section`: oq / #1d2939), modal tanasi
    esa `surface-ground` bilan bo'yalgan (naive: `--n-color: var(--surface-ground)`).
    Ilgari kartochkaga ham `surface-ground` berilgandi -> fon bilan qo'shilib
    ketardi va kartochka ko'rinmasdi.
    Rang faqat O'ZGARGAN qatorlarda bo'ladi — aks holda butun kartochka bo'yalib
    diff'ni o'qish qiyinlashadi.
  */
  .audit-card {
    position: relative;
    border: 1px solid var(--color-surface-line, #e2e8f0);
    border-radius: 16px;
    padding: 16px 4px 6px;
    background: var(--color-surface-section, #ffffff);
  }

  /*
    "Oldin" / "Keyin" yorliqlari kartochka BURCHAGIDA, ramkani kesib o'tadi
    (fieldset legend uslubi) — alohida qator egallamaydi.
  */
  .audit-card__label {
    position: absolute;
    top: -10px;
    left: 14px;
    padding: 1px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    border: 1px solid var(--color-surface-line, #e2e8f0);
    background: var(--color-surface-section, #ffffff);
    color: var(--color-fig-text-red, #ca1f29);
  }

  .audit-card--after .audit-card__label {
    color: var(--color-fig-chip-green-text, #008838);
  }

  .audit-card--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 104px;
    border-style: dashed;
    background: transparent;
    opacity: 0.5;
    font-size: 13px;
  }

  /* ── Maydon qatorlari ─────────────────────────────────────────────────── */
  /*
    Uch ustun: MARKER | yorliq | qiymat. Marker ustuni BARCHA qatorlarda bor
    (o'zgarmaganida bo'sh) — shuning uchun yorliqlar bir chiziqda tekislanadi
    va +/- belgilari ular bilan bir urvinda turmaydi.
  */
  .audit-row {
    display: grid;
    grid-template-columns: 16px minmax(0, 40%) minmax(0, 1fr);
    align-items: baseline;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.35;
  }

  .audit-row__mark {
    font-weight: 700;
    line-height: 1;
    text-align: center;
  }

  .audit-row + .audit-row {
    margin-top: 1px;
  }

  /*
    O'zgargan qatorlar — DIFF uslubi: eski kartochkada "−" va error rangi,
    yangisida "+" va success rangi. Marker `::before` bilan qator boshida
    turadi; qator ichki chekkasi (`padding-left`) unga joy qoldiradi.
  */
  .audit-row--changed {
    font-weight: 500;
  }

  /* Eski holat — o'chirilgan/almashtirilgan qiymat */
  .audit-card--before .audit-row--changed {
    background: var(--color-fig-red-100, #ffe9e6);
  }

  .audit-card--before .audit-row--changed .audit-row__mark::before {
    content: '−';
    color: var(--color-fig-text-red, #ca1f29);
  }

  /* Yangi holat — qo'shilgan qiymat */
  .audit-card--after .audit-row--changed {
    background: var(--color-fig-chip-green, #f5fdf6);
  }

  .audit-card--after .audit-row--changed .audit-row__mark::before {
    content: '+';
    color: var(--color-fig-chip-green-text, #008838);
  }

  .audit-row__label {
    opacity: 0.6;
  }

  .audit-row__value {
    word-break: break-word;
  }

  /* Mantiqiy maydonlar (Faol, ...) — matn emas, bir xil ikonka. */
  .audit-bool--on {
    color: var(--color-fig-chip-green-text, #008838);
  }

  .audit-bool--off {
    color: var(--color-fig-text-red, #ca1f29);
  }
</style>
