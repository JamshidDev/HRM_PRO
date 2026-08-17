<script setup>
  import { useExportStore, useWorkerStore } from '@/store/modules'
  import { computed, onMounted } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import {
    Airplane24Regular,
    ArrowDownload24Regular,
    ContactCard24Regular,
    DocumentBulletList24Regular,
    DocumentTable24Regular,
    Info20Regular,
    PeopleTeam24Regular,
    ReOrderDotsVertical16Regular
  } from '@vicons/fluent'
  import { UIToggleTag } from '@/components/index.js'

  const store = useExportStore()
  const workerStore = useWorkerStore()

  // Yagona «Yuklashni boshlash» — joriy tab qaysi eksportni ishga tushirishini
  // shu yerda hal qilamiz (uchala oqim ham fon topshirig'i yaratadi).
  const startLoading = computed(
    () => store.saveLoading || store.exportResumeLoading || workerStore.loading
  )

  const onExportStart = () => {
    if (store.tab === 'excel') {
      store._export_workers(workerStore._params())
      return
    }
    if (store.tab === 'relatives') {
      workerStore._downloadRelative(store.resumePayload.worker_ids)
      store.visible = false
      return
    }
    store._export_resume(workerStore._params())
    store.visible = false
  }

  // «Excel» tabi bosqichlari: 1 — ustunlarni tanlash, 2 — tartib (fayl ko'rinishi).
  // Bosqich store'da: pastdagi tugmalar modal footer'ida (WorkerPage) turadi.
  const STEP_COLUMNS = 1
  const STEP_ORDER = 2

  // Tab almashganda Excel har doim 1-bosqichdan boshlansin; qarindoshlar tabida
  // "fayl ko'rinishi" uchun ustun nomlari bir marta olinadi.
  const onTabChange = (key) => {
    if (key === 'excel') store.step = STEP_COLUMNS
    if (key === 'relatives') store._relative_columns()
  }

  // Backend ustunlarni guruh tartibida qaytaradi (`group`, `group_label`), shu bois
  // bu yerda saralash yo'q — ketma-ket kelgan bir xil `group` bitta blokka yig'iladi.
  const groups = computed(() => {
    const out = []
    for (const item of store.columns) {
      const key = item.group ?? 'other'
      const last = out[out.length - 1]
      if (last && last.key === key) {
        last.items.push(item)
      } else {
        out.push({ key, label: item.group_label ?? '', items: [item] })
      }
    }
    return out
  })

  const isChecked = (item) => !!store.payload.columns.find((i) => i.column === item.column)

  const toggleItem = (v) => {
    if (isChecked(v)) {
      store.payload.columns = store.payload.columns.filter((i) => i.column !== v.column)
    } else {
      store.payload.columns.push(v)
    }
  }

  // Guruh sarlavhasi ostidagi "3 / 10 tanlangan" hisoblagichi.
  const selectedIn = (group) => group.items.filter((i) => isChecked(i)).length

  // Guruh nomiga bosilganda — shu guruhning hammasini tanlash / bekor qilish.
  const toggleGroup = (group) => {
    const all = selectedIn(group) === group.items.length
    if (all) {
      const keys = new Set(group.items.map((i) => i.column))
      store.payload.columns = store.payload.columns.filter((i) => !keys.has(i.column))
    } else {
      group.items.forEach((i) => {
        if (!isChecked(i)) store.payload.columns.push(i)
      })
    }
  }

  const allChecked = computed(
    () => store.columns.length > 0 && store.payload.columns.length === store.columns.length
  )

  const toggleAll = () => {
    if (allChecked.value) {
      store.payload.columns = []
    } else {
      store.columns.forEach((i) => {
        if (!isChecked(i)) store.payload.columns.push(i)
      })
    }
  }

  onMounted(() => {
    store.resetPayload()
    store.tab = 'excel'
    store._columns()
  })
</script>

<template>
  <div class="export-form">
    <!-- Pill (tugmasimon) tab'lar — HR dashboard header'idagi bilan bir xil:
         `n-tabs type="line"` + global `.ui-pill-tabs` (assets/scss/component.scss).
         `--inline` varianti kenglikni kontentga tenglaydi, shunda yonidagi
         «Barchasini tanlash» pastga tushmaydi. -->
    <div class="export-head">
      <n-tabs
        v-model:value="store.tab"
        @update:value="onTabChange"
        type="line"
        class="ui-pill-tabs ui-pill-tabs--inline"
      >
        <!-- Har tabda: mos ikonka + nomi. Nechta xodim yuklanishi tabda EMAS —
             u eksport turiga bog'liq emas, shu bois modal header'ida bir marta. -->
        <n-tab name="excel">
          <span class="export-tab">
            <n-icon size="17"><DocumentTable24Regular /></n-icon>
            Excel
          </span>
        </n-tab>
        <n-tab name="relatives">
          <span class="export-tab">
            <n-icon size="17"><PeopleTeam24Regular /></n-icon>
            {{ $t('exportPage.tabRelatives') }}
          </span>
        </n-tab>
        <n-tab name="reference">
          <span class="export-tab">
            <n-icon size="17"><DocumentBulletList24Regular /></n-icon>
            {{ $t('exportPage.tabReference') }}
          </span>
        </n-tab>
      </n-tabs>

      <label
        v-if="store.tab === 'excel' && store.step === STEP_COLUMNS"
        class="export-check-all"
      >
        <n-checkbox :checked="allChecked" @update:checked="toggleAll" />
        <span>{{ $t('exportPage.checkAll') }}</span>
      </label>
    </div>

    <!-- ================= Excel ================= -->
    <n-spin
      v-if="store.tab === 'excel'"
      :content-style="{ width: '100%' }"
      :show="store.loading"
    >
      <div class="export-pane">
        <!-- 1-bosqich: guruhlangan teglar -->
        <div v-show="store.step === STEP_COLUMNS" class="export-groups">
          <div v-for="group in groups" :key="group.key" class="export-group">
            <div class="export-group__head">
              <button type="button" class="export-group__title" @click="toggleGroup(group)">
                {{ group.label }}
              </button>
              <span class="export-group__count">
                {{ selectedIn(group) }} / {{ group.items.length }}
                {{ $t('exportPage.selectedShort') }}
              </span>
            </div>
            <div class="export-group__tags">
              <UIToggleTag
                v-for="item in group.items"
                :key="item.column"
                :label="item.label"
                :checked="isChecked(item)"
                @toggle="toggleItem(item)"
              />
            </div>
          </div>
        </div>

        <!-- 2-bosqich: tartib + fayl ko'rinishi -->
        <div v-show="store.step === STEP_ORDER" class="export-order">
          <template v-if="store.payload.columns.length">
            <div class="export-preview__head">
              <p class="export-preview__title">
                {{ $t('exportPage.filePreview') }} —
                {{ $t('exportPage.columnCount', { count: store.payload.columns.length }) }}
              </p>
              <p class="export-order__hint">{{ $t('exportPage.orderHint') }}</p>
            </div>

            <div class="export-preview">
              <table class="export-preview__table">
                <thead>
                  <!-- `tag="tr"` — VueDraggable o'z o'ramini yaratmasdan aynan qator
                       bo'lib chiqadi. `force-fallback` — `<th>` uchun brauzerning
                       native HTML5 drag'i ishonchsiz. -->
                  <VueDraggable
                    tag="tr"
                    v-model="store.payload.columns"
                    :animation="150"
                    :force-fallback="true"
                    ghost-class="export-preview__th--ghost"
                    chosen-class="export-preview__th--chosen"
                  >
                    <th
                      v-for="header in store.payload.columns"
                      :key="header.column"
                      class="export-preview__th"
                    >
                      <n-icon class="export-preview__handle" size="14">
                        <ReOrderDotsVertical16Regular />
                      </n-icon>
                      {{ header.label }}
                    </th>
                  </VueDraggable>
                </thead>
                <tbody>
                  <tr v-for="row in 3" :key="row">
                    <td v-for="header in store.payload.columns" :key="header.column">
                      <span
                        class="export-preview__skeleton"
                        :style="{ width: 40 + ((row * 17) % 45) + '%' }"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <p v-else class="export-order__empty">{{ $t('exportPage.noColumns') }}</p>

          <div v-if="store.payload.columns.length" class="export-start">
            <n-button
              v-fly-upload
              size="large"
              type="primary"
              :loading="startLoading"
              @click="onExportStart"
            >
              <template #icon>
                <n-icon><ArrowDownload24Regular /></n-icon>
              </template>
              {{ $t('exportPage.startDownload') }}
            </n-button>
          </div>
        </div>
      </div>
    </n-spin>

    <!-- ================= Yaqin qarindosh ================= -->
    <div v-else-if="store.tab === 'relatives'" class="export-pane export-info">
      <svg class="export-art" viewBox="0 0 220 140" aria-hidden="true">
        <rect class="export-art__sheet" x="24" y="16" width="120" height="108" rx="10" />
        <rect class="export-art__line" x="40" y="38" width="88" height="7" rx="3.5" />
        <rect class="export-art__line" x="40" y="56" width="66" height="7" rx="3.5" />
        <rect class="export-art__line" x="40" y="74" width="76" height="7" rx="3.5" />
        <rect class="export-art__line" x="40" y="92" width="52" height="7" rx="3.5" />
        <circle class="export-art__accent" cx="166" cy="52" r="18" />
        <path class="export-art__accent" d="M140 104c0-15 12-26 26-26s26 11 26 26z" />
      </svg>
      <h4 class="export-info__title">{{ $t('exportPage.tabRelatives') }}</h4>
      <p class="export-info__text">{{ $t('exportPage.relativesHint') }}</p>

      <!-- Fayl qanday ko'rinishi: ustun nomlari HAQIQIY (backend eksportda ham
           shu ro'yxatni ishlatadi), kontent esa skeleton — ma'lumot bu yerda
           yuklanmaydi, faqat tuzilma ko'rsatiladi. -->
      <div v-if="store.relativeColumns.length" class="export-relatives-preview">
        <div class="export-preview">
          <table class="export-preview__table">
            <thead>
              <tr>
                <th v-for="c in store.relativeColumns" :key="c.column">{{ c.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in 3" :key="row">
                <td v-for="(c, i) in store.relativeColumns" :key="c.column">
                  <span
                    class="export-preview__skeleton"
                    :style="{
                      width: 45 + ((row * 13 + i * 7) % 45) + '%',
                      animationDelay: (row * 0.12 + i * 0.04).toFixed(2) + 's'
                    }"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="export-start">
        <n-button
          v-fly-upload
          size="large"
          type="primary"
          :loading="startLoading"
          @click="onExportStart"
        >
          <template #icon>
            <n-icon><ArrowDownload24Regular /></n-icon>
          </template>
          {{ $t('exportPage.startDownload') }}
        </n-button>
      </div>
    </div>

    <!-- ================= Ma'lumotnoma ================= -->
    <div v-else class="export-pane export-info">
      <!-- Papka ichida ZIP tarkibi: .docx ma'lumotnoma + pasport nusxalari.
           FON qatlami sifatida chiziladi (kontent ustidan o'qiladi), pasport
           varaqlari esa tanlangan opsiyaga qarab yonadi/so'nadi — belgilash
           nimaga ta'sir qilishi matnni o'qimasdan ham ko'rinadi. -->
      <div class="export-zip-bg" aria-hidden="true">
        <span class="export-zip-bg__glow"></span>
        <svg class="export-zip" viewBox="0 0 230 150">
          <!-- papkaning orqa qismi (hujjatlar undan yuqorida "chiqib" turadi) -->
          <path
            class="export-zip__folder-back"
            d="M16 44c0-6 5-11 11-11h42c3 0 6 1 8 4l7 8h119c6 0 11 5 11 11v76c0 6-5 11-11 11H27c-6 0-11-5-11-11V44z"
          />

          <!-- .docx ma'lumotnoma -->
          <g class="export-zip__doc">
            <rect x="54" y="12" width="56" height="62" rx="7" fill="#ffffff" stroke="#d8e0ec" />
            <rect x="54" y="12" width="56" height="18" rx="7" fill="#2f6feb" />
            <rect x="54" y="24" width="56" height="6" fill="#2f6feb" />
            <text x="82" y="26" text-anchor="middle" class="export-zip__tag">DOCX</text>
            <rect x="63" y="40" width="38" height="5" rx="2.5" fill="#e2e8f2" />
            <rect x="63" y="51" width="30" height="5" rx="2.5" fill="#e2e8f2" />
          </g>

          <!-- pasport nusxasi -->
          <g
            class="export-zip__pass"
            :class="{ 'export-zip__pass--off': !store.resumePayload.passport }"
          >
            <rect x="116" y="18" width="48" height="56" rx="7" fill="#1f8a5b" />
            <circle cx="140" cy="38" r="9" fill="#ffffff" opacity="0.9" />
            <rect x="126" y="54" width="28" height="4" rx="2" fill="#ffffff" opacity="0.7" />
          </g>

          <!-- xorij pasporti nusxasi -->
          <g
            class="export-zip__pass"
            :class="{ 'export-zip__pass--off': !store.resumePayload.foreign_passport }"
          >
            <rect x="168" y="24" width="44" height="50" rx="7" fill="#2b5fd9" />
            <circle
              cx="190"
              cy="42"
              r="9"
              fill="none"
              stroke="#ffffff"
              stroke-width="2"
              opacity="0.9"
            />
            <path
              d="M181 42h18M190 33c4 5 4 13 0 18M190 33c-4 5-4 13 0 18"
              stroke="#ffffff"
              stroke-width="1.5"
              fill="none"
              opacity="0.9"
            />
          </g>

          <!-- papkaning oldingi qismi -->
          <path
            class="export-zip__folder-front"
            d="M16 66h198v57c0 6-5 11-11 11H27c-6 0-11-5-11-11V66z"
          />
          <rect class="export-zip__label" x="86" y="92" width="58" height="14" rx="7" />
        </svg>
      </div>
      <h4 class="export-info__title">{{ $t('exportPage.tabReference') }}</h4>
      <p class="export-info__text">{{ $t('exportPage.referenceHint') }}</p>

      <!-- Pasport nusxalari ARXIVGA QO'SHILISHI uchun tanlash SHART — aks holda
           ZIP'da faqat ma'lumotnoma (.docx) bo'ladi. Shuni ochiq aytamiz. -->
      <p class="export-note">
        <n-icon size="17"><Info20Regular /></n-icon>
        {{ $t('exportPage.optionsHint') }}
      </p>

      <!-- Ikkalasi MUSTAQIL tanlanadi (bittasi, ikkalasi yoki hech qaysi).
           Shu bois karta — radio emas, belgilanadigan katak. -->
      <div class="export-options">
        <button
          type="button"
          class="export-option"
          :class="{ 'export-option--on': store.resumePayload.passport }"
          :aria-pressed="store.resumePayload.passport"
          @click="store.resumePayload.passport = !store.resumePayload.passport"
        >
          <span class="export-option__icon">
            <n-icon size="26"><ContactCard24Regular /></n-icon>
          </span>
          <span class="export-option__text">{{ $t('exportPage.optPassport') }}</span>
          <n-checkbox class="export-option__check" :checked="store.resumePayload.passport" />
        </button>

        <button
          type="button"
          class="export-option"
          :class="{ 'export-option--on': store.resumePayload.foreign_passport }"
          :aria-pressed="store.resumePayload.foreign_passport"
          @click="store.resumePayload.foreign_passport = !store.resumePayload.foreign_passport"
        >
          <span class="export-option__icon">
            <n-icon size="26"><Airplane24Regular /></n-icon>
          </span>
          <span class="export-option__text">{{ $t('exportPage.optForeignPassport') }}</span>
          <n-checkbox
            class="export-option__check"
            :checked="store.resumePayload.foreign_passport"
          />
        </button>
      </div>

      <div class="export-start">
        <n-button
          v-fly-upload
          size="large"
          type="primary"
          :loading="startLoading"
          @click="onExportStart"
        >
          <template #icon>
            <n-icon><ArrowDownload24Regular /></n-icon>
          </template>
          {{ $t('exportPage.startDownload') }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* Skrollni modal o'zi boshqaradi (`UIModal` `height` bilan) — bu yerda ikkinchi
     skroll konteyner yaratilmaydi. */
  .export-form {
    min-height: 100%;
  }

  .export-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .export-pane {
    padding-top: 12px;
  }

  .export-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .export-check-all {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    color: var(--textColor1);
    font-size: 14px;
    white-space: nowrap;
  }

  /* ===== Guruhlar ===== */
  .export-group {
    display: grid;
    grid-template-columns: 170px minmax(0, 1fr);
    gap: 16px;
    padding: 10px 0;
  }

  .export-group + .export-group {
    border-top: 1px solid var(--surface-line);
  }

  .export-group__head {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .export-group__title {
    background: none;
    padding: 0;
    text-align: left;
    color: var(--textColor0);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .export-group__title:hover {
    color: var(--primary-color);
  }

  .export-group__count {
    color: var(--textColor3);
    font-size: 12px;
  }

  .export-group__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* ===== Tartib + ko'rinish ===== */
  .export-order__hint,
  .export-order__empty {
    margin: 0;
    color: var(--textColor1);
    font-size: 13px;
  }

  .export-order__empty {
    padding: 40px 0;
    text-align: center;
  }

  .export-preview__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;
  }

  .export-preview__title {
    margin: 0;
    color: var(--textColor3);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .export-preview {
    border: 1px solid var(--surface-line);
    border-radius: 10px;
    overflow-x: auto;
  }

  .export-preview__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .export-preview__table th {
    padding: 10px 12px;
    /* Jadval sarlavhasi — primary rangning yengil varianti. */
    background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-section));
    color: var(--primary-color);
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
  }

  /* Sarlavhaning o'zi sudraladi — tartib shu yerda o'zgaradi. */
  .export-preview__th {
    cursor: grab;
    user-select: none;
  }

  .export-preview__th:active {
    cursor: grabbing;
  }

  .export-preview__handle {
    margin-right: 4px;
    vertical-align: -2px;
    opacity: 0.6;
  }

  .export-preview__th:hover,
  .export-preview__th--chosen {
    background: var(--primary-color) !important;
    color: var(--white-color) !important;
  }

  .export-preview__th--ghost {
    opacity: 0.4;
  }

  .export-preview__table th + th,
  .export-preview__table td + td {
    border-left: 1px solid var(--surface-line);
  }

  .export-preview__table tbody tr {
    border-top: 1px solid var(--surface-line);
  }

  .export-preview__table td {
    padding: 12px;
    min-width: 120px;
  }

  /* Skeleton — "yuklanmoqda" hissi uchun yumshoq shimmer. */
  .export-preview__skeleton {
    display: block;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--surface-line) 25%,
      var(--surface-ground) 37%,
      var(--surface-line) 63%
    );
    background-size: 400% 100%;
    animation: export-shimmer 1.6s ease infinite;
  }

  @keyframes export-shimmer {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .export-preview__skeleton {
      animation: none;
    }
  }

  .export-relatives-preview {
    width: 100%;
    margin-top: 22px;
    text-align: left;
  }

  /* Asosiy amal — kontent ichida, markazda (footerda emas). */
  .export-start {
    display: flex;
    justify-content: center;
    margin-top: 28px;
  }

  /* To'liq yumaloq (pill) va biroz "ko'tarilgan" — oynadagi asosiy amal. */
  .export-start :deep(.n-button) {
    --n-height: 50px !important;
    --n-padding: 0 34px !important;
    --n-border-radius: 999px !important;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 8px 20px color-mix(in srgb, var(--primary-color) 28%, transparent);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .export-start :deep(.n-button:hover:not(.n-button--disabled)) {
    box-shadow: 0 10px 26px color-mix(in srgb, var(--primary-color) 36%, transparent);
    transform: translateY(-1px);
  }

  .export-start :deep(.n-button:active:not(.n-button--disabled)) {
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 26%, transparent);
    transform: translateY(0);
  }

  /* Ikonka bilan matn orasi — pill ichida havodor ko'rinsin. */
  .export-start :deep(.n-button__content) {
    gap: 4px;
  }

  /* ===== Qarindoshlar / Ma'lumotnoma ===== */
  .export-info {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding-top: 96px;
    text-align: center;
  }

  /* Kontent fon qatlamidan yuqorida. */
  .export-info > *:not(.export-zip-bg) {
    position: relative;
    z-index: 1;
  }

  .export-art {
    width: 220px;
    height: 140px;
    margin-bottom: 8px;
  }

  .export-art__sheet {
    fill: var(--surface-ground);
    stroke: var(--surface-line);
    stroke-width: 2;
  }

  .export-art__line {
    fill: var(--surface-line);
  }

  /* ZIP tarkibi illyustratsiyasi (papka + fayllar). Ranglar ataylab qat'iy —
     bu brend elementi emas, "hujjat turlari" belgisi; ikkala temada bir xil. */
  /* Illyustratsiya — FON: katta, xira va bosilmaydigan qatlam. Kontent uning
     ustida to'liq o'qiladi (opacity past + yumshoq nur). */
  .export-zip-bg {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 6px;
    pointer-events: none;
    overflow: hidden;
  }

  .export-zip-bg__glow {
    position: absolute;
    top: 10px;
    width: 520px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(
      closest-side,
      color-mix(in srgb, var(--primary-color) 10%, transparent),
      transparent
    );
  }

  .export-zip {
    position: relative;
    width: 520px;
    max-width: 95%;
    height: auto;
    opacity: 0.13;
    /* Yengil blur — grafika "tekstura" bo'lib qoladi, kontent bilan raqobatlashmaydi. */
    filter: blur(0.6px);
    /* Pastga qarab so'nadi: kartalar va tugma toza fonda turadi. */
    mask-image: linear-gradient(to bottom, #000 58%, transparent 92%);
    -webkit-mask-image: linear-gradient(to bottom, #000 58%, transparent 92%);
  }

  .export-zip__folder-back {
    fill: #f6c667;
  }

  .export-zip__folder-front {
    fill: #f3b13f;
  }

  .export-zip__label {
    fill: #ffffff;
    opacity: 0.5;
  }

  .export-zip__tag {
    fill: #ffffff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  /* Tanlanmagan pasport turi — so'nadi, lekin ko'rinib turadi. */
  .export-zip__pass {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
    transform-origin: center bottom;
  }

  .export-zip__pass--off {
    opacity: 0.25;
    transform: translateY(6px);
  }

  .export-art__accent {
    fill: color-mix(in srgb, var(--primary-color) 22%, var(--surface-section));
  }

  .export-info__title {
    margin: 0;
    color: var(--textColor0);
    font-size: 16px;
    font-weight: 700;
  }

  .export-info__text {
    margin: 0;
    max-width: 460px;
    color: var(--textColor1);
    font-size: 13px;
    line-height: 1.5;
  }

  /* Ogohlantirish emas, yo'l-yo'riq: tanlash ixtiyoriy, lekin natijaga ta'sir qiladi. */
  .export-note {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 18px 0 0;
    padding: 8px 14px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--info-color) 10%, var(--surface-section));
    color: var(--info-color);
    font-size: 13px;
    text-align: left;
  }

  .export-options {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }

  /* Katta tanlanadigan karta: ikonka + matn + belgi. */
  .export-option {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 300px;
    padding: 16px 18px;
    border: 1px solid var(--surface-line);
    border-radius: 14px;
    background: var(--surface-section);
    color: var(--textColor1);
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .export-option:hover {
    border-color: color-mix(in srgb, var(--primary-color) 45%, var(--surface-line));
  }

  .export-option--on {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 6%, var(--surface-section));
    box-shadow: 0 2px 10px color-mix(in srgb, var(--primary-color) 14%, transparent);
  }

  .export-option__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: var(--surface-ground);
    color: var(--textColor1);
    flex-shrink: 0;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .export-option--on .export-option__icon {
    background: color-mix(in srgb, var(--primary-color) 14%, var(--surface-section));
    color: var(--primary-color);
  }

  .export-option__text {
    flex: 1;
    min-width: 0;
    color: var(--textColor0);
    font-weight: 500;
    line-height: 1.35;
  }

  .export-option__check {
    pointer-events: none;
    flex-shrink: 0;
  }

  @media (max-width: 767.98px) {
    .export-group {
      grid-template-columns: minmax(0, 1fr);
      gap: 10px;
    }

    /* 300px qat'iy karta 375px ekranda modal padding'i bilan sig'maydi. */
    .export-options {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .export-option {
      width: 100%;
      max-width: 320px;
    }

    /* 96px — telefon ekranining ~1/4 qismi, bekorga ketardi. */
    .export-info {
      padding-top: 28px;
    }

    .export-info__text {
      font-size: 12px;
    }

    /* Ustunlar ko'p bo'lganda preview jadvali skroll bo'ladi — 120px o'rniga
       96px bilan bir ekranga ko'proq ustun sig'adi. */
    .export-preview {
      -webkit-overflow-scrolling: touch;
    }

    .export-preview__table td,
    .export-preview__table th {
      min-width: 96px;
    }

    /* Asosiy amal — barmoq uchun to'liq kenglikda, lekin pill shaklini saqlaydi. */
    .export-start :deep(.n-button) {
      --n-height: 44px !important;
      --n-padding: 0 22px !important;
      width: 100%;
      max-width: 320px;
    }

    /* Pill tab'lar sig'masa gorizontal skroll bo'lsin (component.scss:54). */
    .export-head {
      gap: 10px;
    }

    .export-head :deep(.n-tabs) {
      min-width: 0;
      max-width: 100%;
    }
  }
</style>
