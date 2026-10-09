<script setup>
  import { Building16Regular, ChevronRight16Regular } from '@vicons/fluent'
  const props = defineProps({
    children: Array,
    deep: {
      type: Number,
      default: 0
    },
    id: {
      type: String,
      default: '0'
    },
    // Har bir ajdod darajasi uchun: shu darajada vertikal chiziq davom etadimi
    // (ajdod o'z ro'yxatida oxirgi bo'lmasa — davom etadi). Ilgari chiziq har
    // darajada doim chizilardi va oxirgi tugunlar ostida ham "osilib" qolardi.
    lines: {
      type: Array,
      default: () => []
    },
    elementId: {
      type: String,
      default: null
    },
    expandedKeys: {
      type: Array,
      default: () => []
    },
    selectedId: {
      type: [Number, String],
      default: null
    },
    // Shu ro'yxatning otasi ({ id, name }); ildizda — null.
    parent: {
      type: Object,
      default: null
    },
    draggable: {
      type: Boolean,
      default: false
    },
    // Qidiruv matni — nomdagi mos qism belgilanadi.
    highlight: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['onLoad', 'onToggle', 'onSelect', 'onMove'])

  const onLoad = (v) => emits('onLoad', v)
  const onToggle = (v) => emits('onToggle', v)
  const onSelect = (v) => emits('onSelect', v)
  const onMove = (v) => emits('onMove', v)

  const isExpanded = (key) => props.expandedKeys.includes(key)

  // Strelka bosilganda ochiladi/yopiladi. Bolalar yuklanayotganda (`elementId`
  // band) boshqa tugunlar ochilmaydi — avvalgidek.
  const handleToggle = (item, key) => {
    if (!item?.isHaveChild || props.elementId != null) return
    const opened = isExpanded(key)
    if (!opened && (!Array.isArray(item.children) || item.children.length === 0)) {
      onLoad({ index: key, id: item.id })
    }
    onToggle(key)
  }

  // Qator bosilganda korxona tanlanadi (o'ng panel) va yopiq bo'lsa ochiladi.
  // Yig'ish — strelka yoki qatorni ikki marta bosish. Ikki marta bosish birinchi
  // bosishdan boshlanadi (u yopiq tugunni ochib yuboradi), shuning uchun faqat
  // bosishdan OLDIN ochiq bo'lgan tugun yopiladi — aks holda ochilib-yopilardi.
  let openBeforeClick = null
  const handleSelect = (e, item, key) => {
    if (e.detail > 1) return
    openBeforeClick = isExpanded(key) ? key : null
    onSelect({
      id: item.id,
      name: item.name,
      closedAt: item.closedAt,
      parentId: props.parent?.id ?? null,
      parentName: props.parent?.name ?? null
    })
    if (!isExpanded(key)) handleToggle(item, key)
  }

  const handleDblClick = (item, key) => {
    if (openBeforeClick === key && isExpanded(key)) handleToggle(item, key)
    openBeforeClick = null
  }

  const isLastItem = (idx) => idx === props.children.length - 1

  // Nomdagi qo'shtirnoq va belgilarni tashlab, birinchi harf — avatar uchun.
  const initial = (name) => (name || '').replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase()

  // To'liq nom ko'pincha qisqa nom bilan bir xil — takror qatorni ko'rsatmaymiz.
  const normalize = (v) => (v || '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
  const showFullName = (item) => item.fullName && normalize(item.fullName) !== normalize(item.name)

  // Matnni [{ text, hit }] bo'laklariga ajratadi (katta-kichik harf farqsiz).
  const parts = (text) => {
    const q = props.highlight?.trim()
    if (!q || !text) return [{ text, hit: false }]
    const lower = text.toLocaleLowerCase()
    const needle = q.toLocaleLowerCase()
    const out = []
    let from = 0
    let at = lower.indexOf(needle)
    while (at !== -1) {
      if (at > from) out.push({ text: text.slice(from, at), hit: false })
      out.push({ text: text.slice(at, at + needle.length), hit: true })
      from = at + needle.length
      at = lower.indexOf(needle, from)
    }
    if (from < text.length) out.push({ text: text.slice(from), hit: false })
    return out
  }

  /* ------------------------------ Drag & drop ------------------------------
   * Daraxt rekursiv, shuning uchun sudrash holati ildizda yaratiladi va barcha
   * darajalarga provide/inject orqali uzatiladi. Tashlash joyi qator balandligi
   * bo'yicha: yuqori chet — oldiga, pastki chet — keyiniga, o'rta — ichiga.
   * Daraxt bu yerda o'zgartirilmaydi: faqat `onMove` chiqariladi, sahifa
   * tasdiqlagandan keyin backend'ga yuboradi.
   */
  const drag =
    props.deep === 0 ? reactive({ source: null, overKey: null, pos: null }) : inject('uiTreeDrag')
  if (props.deep === 0) provide('uiTreeDrag', drag)

  const resetDrag = () => {
    drag.source = null
    drag.overKey = null
    drag.pos = null
  }

  const onDragStart = (e, item, idx, key) => {
    if (!props.draggable) return
    drag.source = {
      id: item.id,
      name: item.name,
      key,
      index: idx,
      parentId: props.parent?.id ?? null,
      parentName: props.parent?.name ?? null
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(item.id))
  }

  // O'zini yoki o'z avlodini nishon qilib bo'lmaydi.
  const isOwnBranch = (key) => {
    const src = drag.source?.key
    return !!src && (key === src || key.startsWith(`${src}-`))
  }

  // Yopilgan korxona ichiga va hozirgi otasining ichiga (o'zgarish yo'q) tashlanmaydi.
  const dropPosition = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    const canInside = !item.closedAt && item.id !== drag.source.parentId
    if (!canInside) return ratio < 0.5 ? 'before' : 'after'
    if (ratio < 0.28) return 'before'
    if (ratio > 0.72) return 'after'
    return 'inside'
  }

  const onDragOver = (e, item, key) => {
    if (!drag.source || isOwnBranch(key)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    drag.overKey = key
    drag.pos = dropPosition(e, item)
  }

  const onDragLeave = (e, key) => {
    if (drag.overKey === key && !e.currentTarget.contains(e.relatedTarget)) {
      drag.overKey = null
      drag.pos = null
    }
  }

  const onDrop = (e, item, idx, key) => {
    e.preventDefault()
    const src = drag.source
    const pos = drag.pos
    resetDrag()
    if (!src || !pos || isOwnBranch(key)) return

    if (pos === 'inside') {
      onMove({ ...src, toParentId: item.id, toParentName: item.name, position: null })
      return
    }

    const toParentId = props.parent?.id ?? null
    const sameParent = toParentId === src.parentId
    let position = pos === 'before' ? idx : idx + 1
    if (sameParent && src.index < position) position -= 1
    if (sameParent && position === src.index) return

    onMove({ ...src, toParentId, toParentName: props.parent?.name ?? null, position })
  }

  const dropClass = (key) => (drag.overKey === key ? `tree-drop--${drag.pos}` : null)

  /* ------------------------- Ochilish animatsiyasi -------------------------
   * Balandlik `auto` ga CSS transition ishlamaydi, shuning uchun hook'larda
   * haqiqiy balandlik o'lchanadi: 0 → scrollHeight (ochilish) va aksincha.
   * Davomiylik qatorlar soniga qarab biroz uzayadi (katta ro'yxat sekinroq).
   * `.tree-expand-enter-active` klassi qatorlarning ketma-ket chiqishi uchun
   * qo'lda qo'yiladi (`:css="false"` bo'lgani uchun Vue qo'ymaydi).
   */
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const expandDuration = (h) => Math.min(520, 280 + h * 0.4)

  const runHeight = (el, from, to, ms, ease, done) => {
    if (reducedMotion) return done()
    el.style.overflow = 'hidden'
    el.style.height = `${from}px`
    el.style.opacity = from ? '1' : '0'
    void el.offsetHeight
    el.style.transition = `height ${ms}ms ${ease}, opacity ${Math.round(ms * 0.8)}ms ease`
    el.style.height = `${to}px`
    el.style.opacity = to ? '1' : '0'
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      el.removeEventListener('transitionend', onEnd)
      done()
    }
    const onEnd = (e) => e.target === el && e.propertyName === 'height' && finish()
    el.addEventListener('transitionend', onEnd)
    setTimeout(finish, ms + 80)
  }

  const onExpandEnter = (el, done) => {
    el.classList.add('tree-expand-enter-active')
    const h = el.scrollHeight
    runHeight(el, 0, h, expandDuration(h), 'cubic-bezier(0.22, 1, 0.36, 1)', done)
  }

  const onExpandLeave = (el, done) => {
    const h = el.scrollHeight
    runHeight(el, h, 0, Math.round(expandDuration(h) * 0.75), 'cubic-bezier(0.4, 0, 0.2, 1)', done)
  }

  // Ichki qatorlar animatsiyasi tugashini kutib, klass olib tashlanadi.
  const clearExpandStyle = (el) => {
    el.style.height = ''
    el.style.overflow = ''
    el.style.opacity = ''
    el.style.transition = ''
    setTimeout(() => el.classList.remove('tree-expand-enter-active'), 500)
  }
</script>

<template>
  <template v-for="(item, idx) in children" :key="item.id ?? idx">
    <div class="tree-row flex items-stretch" :style="{ '--i': idx }">
      <span
        v-for="(cont, i) in lines"
        :key="`guide-${i}`"
        class="tree-guide"
        :class="cont && 'tree-guide--line'"
      ></span>
      <span
        v-if="deep > 0"
        class="tree-guide tree-guide--elbow"
        :class="isLastItem(idx) && 'tree-guide--last'"
      ></span>

      <div
        class="group relative flex flex-1 min-w-0 items-center gap-2.5 rounded-lg pl-1.5 pr-1.5 py-1.5 cursor-pointer transition-colors duration-150"
        :class="[
          isExpanded(`${id}-${idx}`) && 'tree-node--open',
          selectedId != null && selectedId === item.id ? 'bg-primary/10' : 'hover:bg-surface-ground',
          drag.source?.key === `${id}-${idx}` && 'opacity-40',
          dropClass(`${id}-${idx}`)
        ]"
        :draggable="draggable"
        @click="handleSelect($event, item, `${id}-${idx}`)"
        @dblclick="handleDblClick(item, `${id}-${idx}`)"
        @mousedown="(e) => e.detail > 1 && e.preventDefault()"
        @dragstart="onDragStart($event, item, idx, `${id}-${idx}`)"
        @dragend="resetDrag"
        @dragover="onDragOver($event, item, `${id}-${idx}`)"
        @dragleave="onDragLeave($event, `${id}-${idx}`)"
        @drop="onDrop($event, item, idx, `${id}-${idx}`)"
      >
        <!-- Avatar markazi (6px + 16px = 22px) ustun chizig'i bilan bir chiziqda:
             tirsak avatarga 6px qolganda tugaydi, ochilgan tugundan chiziq avatar ostidan tushadi. -->
        <span
          class="relative z-[1] w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold"
          :class="
            deep === 0
              ? 'bg-primary/15 text-primary'
              : 'border border-surface-line bg-surface-section text-secondary'
          "
        >
          <template v-if="initial(item.name)">{{ initial(item.name) }}</template>
          <n-icon v-else size="16"><Building16Regular /></n-icon>
        </span>

        <div class="min-w-0 flex-1">
          <div
            class="truncate text-sm leading-[1.3]"
            :class="deep === 0 ? 'font-semibold text-textColor0' : 'font-medium text-textColor0'"
            :title="item.name"
          >
            <template v-for="(p, pi) in parts(item.name)" :key="pi">
              <mark v-if="p.hit" class="tree-hit">{{ p.text }}</mark>
              <template v-else>{{ p.text }}</template>
            </template>
            <span
              v-if="item.closedAt"
              class="ml-1.5 inline-flex rounded-full bg-fig-red-100 px-1.5 py-px text-[10px] font-semibold text-fig-text-red align-middle"
            >
              {{ $t('organizationPage.closedBadge') }}
            </span>
          </div>
          <div
            v-if="showFullName(item)"
            class="truncate text-xs leading-[1.3] text-secondary"
            :title="item.fullName"
          >
            <template v-for="(p, pi) in parts(item.fullName)" :key="pi">
              <mark v-if="p.hit" class="tree-hit">{{ p.text }}</mark>
              <template v-else>{{ p.text }}</template>
            </template>
          </div>
        </div>

        <!-- Ochish/yopish strelkasi qator oxirida — chiziqlar ustida turmaydi -->
        <span
          v-if="item?.isHaveChild"
          class="tree-chevron w-6 h-6 flex items-center justify-center shrink-0 rounded-md text-secondary"
          @click.stop="handleToggle(item, `${id}-${idx}`)"
        >
          <n-spin v-if="elementId === `${id}-${idx}`" :size="14" />
          <n-icon v-else size="16">
            <ChevronRight16Regular
              class="transition-transform duration-200"
              :class="isExpanded(`${id}-${idx}`) && 'rotate-90'"
            />
          </n-icon>
        </span>
      </div>
    </div>

    <!-- Bolalar kelgandan keyin render qilinadi — aks holda bo'sh blok 0px gacha
         "ochilib", qatorlar keyin animatsiyasiz sakrab chiqardi. -->
    <Transition
      name="tree-expand"
      :css="false"
      @enter="onExpandEnter"
      @after-enter="clearExpandStyle"
      @enter-cancelled="clearExpandStyle"
      @leave="onExpandLeave"
    >
      <div v-if="isExpanded(`${id}-${idx}`) && item.children?.length" class="tree-expand">
        <UITree
          :element-id="elementId"
          :expanded-keys="props.expandedKeys"
          :selected-id="selectedId"
          :draggable="draggable"
          :highlight="highlight"
          :parent="{ id: item.id, name: item.name }"
          :children="item.children"
          :lines="deep > 0 ? [...lines, !isLastItem(idx)] : []"
          @on-load="onLoad"
          @on-toggle="onToggle"
          @on-select="onSelect"
          @on-move="onMove"
          :deep="deep + 1"
          :id="`${id}-${idx}`"
        />
      </div>
    </Transition>
  </template>
</template>

<style scoped>
  /* Har bir daraja ustuni 36px, chiziq markazi 22px — qator ichki chegarasi (6px) +
     avatar (32px) yarmi bilan bir xil. Tirsak ustun oxirida tugaydi, ya'ni avatardan
     6px oldin — chiziq avatarga yopishib qolmaydi.
     Chiziqlar 2px va `background` bilan chiziladi: 1px `border` brauzer masshtabi
     100% bo'lmaganda ayrim qatorlarda yo'qolib qolardi. Rang — loyihadagi kulrang. */
  .tree-row {
    --tree-line: var(--fig-br-secondary, var(--surface-line));
    --tree-w: 2px;
  }

  .tree-guide {
    position: relative;
    width: 36px;
    flex-shrink: 0;
  }

  /* Ajdod darajasidagi davom etuvchi vertikal chiziq va o'rtadagi tugunning T-tirsagi */
  .tree-guide--line::before,
  .tree-guide--elbow::before {
    content: '';
    position: absolute;
    left: 21px;
    width: var(--tree-w);
    top: 0;
    bottom: 0;
    background: var(--tree-line);
  }

  .tree-guide--elbow::after {
    content: '';
    position: absolute;
    left: 21px;
    right: 0;
    top: calc(50% - 1px);
    height: var(--tree-w);
    background: var(--tree-line);
  }

  /* Oxirgi tugun: vertikal chiziq shu yerda tugaydi va yumaloq burchak bilan avatarga buriladi */
  .tree-guide--last::before {
    display: none;
  }

  .tree-guide--last::after {
    top: 0;
    height: calc(50% + 1px);
    background: none;
    border-left: var(--tree-w) solid var(--tree-line);
    border-bottom: var(--tree-w) solid var(--tree-line);
    border-bottom-left-radius: 10px;
  }

  /* Ochilgan tugun: avatar ostidan birinchi bolaning tirsagigacha uzluksiz chiziq */
  .tree-node--open::before {
    content: '';
    position: absolute;
    left: 21px;
    width: var(--tree-w);
    top: calc(50% + 16px);
    bottom: 0;
    background: var(--tree-line);
  }

  .tree-hit {
    padding: 0 1px;
    border-radius: 3px;
    color: inherit;
    background: color-mix(in srgb, var(--warning-color, #f0a020) 35%, transparent);
  }

  .tree-chevron {
    transition:
      color 0.15s ease,
      background-color 0.15s ease;
  }

  .tree-chevron:hover {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }

  /* Tashlash joyi ko'rsatkichlari: ichiga — ramka, oldiga/keyiniga — chiziq */
  .tree-drop--inside {
    outline: 2px dashed var(--primary-color);
    outline-offset: -2px;
    background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  }

  .tree-drop--before::after,
  .tree-drop--after::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 9999px;
    background: var(--primary-color);
    pointer-events: none;
  }

  .tree-drop--before::after {
    top: -2px;
  }

  .tree-drop--after::after {
    bottom: -2px;
  }

  /* Ochilish/yopilish balandligi JS hook'larda (`onExpandEnter`/`onExpandLeave`).
     Ochilganda bola qatorlar ketma-ket (har biri 35ms kechikib) paydo bo'ladi. */
  .tree-expand-enter-active > .tree-row {
    animation: tree-row-in 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(min(var(--i, 0), 10) * 35ms + 60ms);
  }

  @keyframes tree-row-in {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .tree-expand-enter-active > .tree-row {
      animation: none;
    }
  }
</style>
