<script setup>
  /**
   * Vue Bits «RubberSegment» — rezina kabi cho'ziluvchi thumb'li segment boshqaruv.
   * Asl TS manbadan JS'ga o'girilgan (loyiha ESLint'i TS'ni parse qilmaydi), mantiq o'zgarmagan.
   *
   * Loyiha uchun qo'shimchalar (item obyekti ichida):
   *  - `disabled` — alohida bo'limni o'chirish;
   *  - `badge`    — matn yonidagi son/chip;
   *  - `render`   — label o'rniga chiziladigan funksiya (n-tab'ning `#tab` sloti kabi).
   */
  import { HugeiconsIcon } from '@hugeicons/vue'
  import { animate, motion, motionValue, useReducedMotion, useTransform } from 'motion-v'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  const EASE_OUT = [0.23, 1, 0.32, 1]
  const SPRING_UI = { type: 'spring', duration: 0.3, bounce: 0 }
  const SPRING_MOMENTUM = { type: 'spring', duration: 0.4, bounce: 0.2 }
  const SPRING_RELAX = { type: 'spring', duration: 0.16, bounce: 0 }
  const DILATE = 0.19
  const HANDOFF = 0.15
  const FLICK = 110
  const MAX_VELOCITY = 2000
  const DEADZONE = 4
  const SLOP = 10
  const RUBBER = 0.55
  const SIZES = {
    sm: { height: 28, font: 12, pad: 10, min: 36 },
    md: { height: 36, font: 13, pad: 14, min: 44 },
    lg: { height: 44, font: 14, pad: 18, min: 48 }
  }
  const CELL_CLASS =
    'inline-flex h-[calc(var(--rs-h)-var(--rs-inset)*2)] min-w-[var(--rs-min)] items-center justify-center gap-1.5 m-0 border-0 bg-transparent px-[var(--rs-pad)] py-0 rounded-[var(--rs-thumb-radius)] [font:inherit] text-[length:var(--rs-font)] font-medium leading-none whitespace-nowrap outline-none [transition:opacity_160ms_ease,transform_160ms_var(--rs-ease-out)] motion-reduce:[transition:opacity_160ms_ease]'
  const BADGE_CLASS =
    'inline-flex items-center justify-center min-w-[18px] h-[16px] px-1.5 rounded-full text-[10px] font-semibold leading-none [background:color-mix(in_srgb,currentColor_16%,transparent)]'

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const rubber = (over, dim) => (over * dim * RUBBER) / (dim + RUBBER * Math.abs(over))
  const project = (v, glide) => {
    const d = 1 - 0.1 * Math.pow(0.05, glide / 100)
    return ((v / 1000) * d) / (1 - d)
  }
  const velocityOf = (hist, now) => {
    const recent = hist.filter(([t]) => now - t <= 100)
    if (recent.length < 2) return 0
    const [t0, x0] = recent[0]
    const [t1, x1] = recent[recent.length - 1]
    return t1 - t0 >= 8 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0
  }
  const nearestSlot = (slots, x) => {
    let best = 0
    for (let i = 1; i < slots.length; i++) {
      if (
        Math.abs((slots[i].l + slots[i].r) / 2 - x) <
        Math.abs((slots[best].l + slots[best].r) / 2 - x)
      )
        best = i
    }
    return best
  }
  const isIconData = (icon) => Array.isArray(icon)
  const hasBadge = (item) => item.badge !== undefined && item.badge !== null && item.badge !== ''

  const props = defineProps({
    // [string | { value, label, icon?, badge?, disabled?, render? }]
    items: { type: Array, required: true },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    trackColor: { type: String, default: '#27272a' },
    thumbColor: { type: String, default: '#fafafa' },
    textColor: { type: String, default: '#fafafa' },
    activeTextColor: { type: String, default: '#18181b' },
    size: { type: String, default: 'md' }, // sm | md | lg
    radius: { type: Number, default: 10 },
    inset: { type: Number, default: 3 },
    equalSlots: { type: Boolean, default: true },
    stretch: { type: Number, default: 100 },
    squash: { type: Number, default: 3 },
    speed: { type: Number, default: 1 },
    glide: { type: Number, default: 75 },
    draggable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    className: { type: String, default: '' },
    ariaLabel: { type: String, default: 'Segmented control' }
  })

  const emit = defineEmits(['change'])

  const list = computed(() =>
    props.items.map((item) =>
      typeof item === 'string' ? { value: item, label: item, icon: undefined } : item
    )
  )
  const inner = ref(props.defaultValue ?? list.value[0]?.value)
  const current = computed(() => (props.value !== undefined ? props.value : inner.value))
  const index = computed(() =>
    Math.max(
      0,
      list.value.findIndex((item) => item.value === current.value)
    )
  )
  const reduce = useReducedMotion()

  const trackRef = ref(null)
  const itemEls = []
  let slots = []
  let box = null
  let committed = index.value
  let handoff
  let drag = null
  let gen = 0
  let observer = null

  const edgeL = motionValue(0)
  const edgeR = motionValue(0)
  const innerW = motionValue(0)
  // the corner radius comes from a CSS variable so a radius change never leaves the clip stale
  const clipPath = useTransform(
    [edgeL, edgeR, innerW],
    ([l, r, w]) =>
      `inset(0 ${Math.max(0, w - r)}px 0 ${Math.max(0, l)}px round var(--rs-thumb-radius))`
  )

  const t = (seconds) => seconds / props.speed
  const isOff = (i) => !!list.value[i]?.disabled

  const jumpTo = (i) => {
    const s = slots[i]
    if (!s) return
    clearTimeout(handoff)
    gen += 1
    edgeL.jump(s.l)
    edgeR.jump(s.r)
  }

  const measure = () => {
    const track = trackRef.value
    if (!track) return
    const rect = track.getBoundingClientRect()
    box = rect
    // getBoundingClientRect transformni ham hisobga oladi: modal ochilish animatsiyasida
    // (scale < 1) o'lchansa, thumb noto'g'ri kenglikda qotib qolardi — ResizeObserver
    // transform o'zgarishini sezmaydi. Shu sababli o'lchamlarni layout px'ga qaytaramiz.
    const scale = track.offsetWidth ? rect.width / track.offsetWidth : 1
    slots = list.value.map((_, i) => {
      const el = itemEls[i]
      if (!el) return { l: 0, r: 0 }
      const r = el.getBoundingClientRect()
      return {
        l: (r.left - rect.left) / scale - props.inset,
        r: (r.right - rect.left) / scale - props.inset
      }
    })
    innerW.set(rect.width / scale - props.inset * 2)
    jumpTo(committed)
  }

  const listKey = computed(() =>
    list.value.map((item) => `${item.value}:${item.label}:${item.badge ?? ''}`).join('|')
  )
  onMounted(() => {
    measure()
    observer = new ResizeObserver(measure)
    if (trackRef.value) observer.observe(trackRef.value)
    if (typeof document !== 'undefined' && document.fonts) document.fonts.ready.then(measure)
  })
  watch([listKey, () => props.size, () => props.inset, () => props.equalSlots], measure, {
    flush: 'post'
  })

  watch(
    index,
    (next) => {
      if (!drag && committed !== next) {
        committed = next
        jumpTo(next)
      }
    },
    { flush: 'post' }
  )

  onUnmounted(() => {
    observer?.disconnect()
    clearTimeout(handoff)
    edgeL.stop()
    edgeR.stop()
  })

  const commit = (i) => {
    committed = i
    if (i === index.value) return
    if (props.value === undefined) inner.value = list.value[i].value
    emit('change', list.value[i].value, i)
  }

  const land = (to, v, flick, withSquash) => {
    const b = slots[to]
    if (!b) return
    const g = ++gen
    const dir = Math.sign((b.l + b.r) / 2 - (edgeL.get() + edgeR.get()) / 2) || 1
    const [lead, leadTo, trail, trailTo] =
      dir > 0 ? [edgeR, b.r, edgeL, b.l] : [edgeL, b.l, edgeR, b.r]
    const velocityFor = (mv) =>
      clamp(v === null ? mv.getVelocity() : v, -MAX_VELOCITY, MAX_VELOCITY)
    animate(lead, leadTo, {
      ...(flick ? SPRING_MOMENTUM : SPRING_UI),
      duration: t(flick ? 0.4 : 0.3),
      velocity: velocityFor(lead)
    })
    const trailVelocity = velocityFor(trail)
    if (!withSquash || props.squash <= 0) {
      animate(trail, trailTo, { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity })
      return
    }
    animate(trail, trailTo + dir * props.squash, {
      ...SPRING_UI,
      duration: t(0.3),
      velocity: trailVelocity
    }).then(() => {
      if (gen === g) animate(trail, trailTo, { ...SPRING_RELAX, duration: t(0.16) })
    })
  }

  const travel = (from, to) => {
    const a = slots[from]
    const b = slots[to]
    if (!a || !b) return
    clearTimeout(handoff)
    gen += 1
    if (reduce.value) {
      edgeL.jump(b.l)
      edgeR.jump(b.r)
      return
    }
    const u = props.stretch / 100
    const tween = { duration: t(DILATE), ease: EASE_OUT }
    animate(edgeL, b.l + (Math.min(a.l, b.l) - b.l) * u, tween)
    animate(edgeR, b.r + (Math.max(a.r, b.r) - b.r) * u, tween)
    handoff = setTimeout(() => land(to, null, false, true), t(HANDOFF) * 1000)
  }

  const localX = (e) => e.clientX - (box ? box.left : 0) - props.inset

  const handlePointerDown = (e, i) => {
    if (props.disabled || isOff(i) || drag || e.button !== 0) return
    box = trackRef.value?.getBoundingClientRect() ?? null
    const el = e.currentTarget
    try {
      el.setPointerCapture(e.pointerId)
    } catch {
      // capture unavailable
    }
    const x = localX(e)
    const onThumb = props.draggable && x >= edgeL.get() && x <= edgeR.get()
    drag = {
      id: e.pointerId,
      x0: x,
      slot: i,
      onThumb,
      live: false,
      offset: 0,
      w: 0,
      hist: [[e.timeStamp, x]]
    }
    if (onThumb) {
      clearTimeout(handoff)
      gen += 1
      edgeL.stop()
      edgeR.stop()
    } else if (!reduce.value) {
      el.dataset.pressed = ''
    }
  }

  const handlePointerMove = (e) => {
    const d = drag
    if (!d || e.pointerId !== d.id || !d.onThumb) return
    const x = localX(e)
    d.hist.push([e.timeStamp, x])
    if (d.hist.length > 8) d.hist.shift()
    if (!d.live) {
      if (Math.abs(x - d.x0) < DEADZONE) return
      d.live = true
      d.offset = x - edgeL.get()
      d.w = edgeR.get() - edgeL.get()
      if (trackRef.value) trackRef.value.dataset.held = ''
    }
    const width = innerW.get()
    const l = x - d.offset
    const maxL = width - d.w
    if (reduce.value) {
      const c = clamp(l, 0, maxL)
      edgeL.set(c)
      edgeR.set(c + d.w)
    } else if (l < 0) {
      edgeL.set(0)
      edgeR.set(d.w - rubber(-l, d.w))
    } else if (l > maxL) {
      edgeR.set(width)
      edgeL.set(maxL + rubber(l - maxL, d.w))
    } else {
      edgeL.set(l)
      edgeR.set(l + d.w)
    }
  }

  const release = () => {
    const d = drag
    drag = null
    if (trackRef.value) delete trackRef.value.dataset.held
    const el = itemEls[d.slot]
    if (el) delete el.dataset.pressed
    return d
  }

  const handlePointerUp = (e) => {
    const d = drag
    if (!d || e.pointerId !== d.id) return
    release()
    const x = localX(e)
    if (!d.live) {
      if (Math.abs(x - d.x0) <= SLOP && d.slot !== committed) {
        const from = committed
        commit(d.slot)
        travel(from, d.slot)
      }
      return
    }
    const v = velocityOf(d.hist, e.timeStamp)
    const flick = Math.abs(v) > FLICK
    let to = nearestSlot(slots, (edgeL.get() + edgeR.get()) / 2 + project(v, props.glide))
    if (flick && to === committed) to = clamp(to + Math.sign(v), 0, list.value.length - 1)
    // o'chirilgan bo'limga tushib qolsa — joyiga qaytadi
    if (isOff(to)) to = committed
    commit(to)
    if (reduce.value) jumpTo(to)
    else land(to, v, flick, flick)
  }

  const handlePointerCancel = (e) => {
    const d = drag
    if (!d || e.pointerId !== d.id) return
    release()
    if (!d.live) return
    if (reduce.value) jumpTo(committed)
    else land(committed, null, false, false)
  }

  // Strelkalar o'chirilgan bo'limlarni sakrab o'tadi
  const step = (from, dir) => {
    let i = from + dir
    while (i >= 0 && i < list.value.length && isOff(i)) i += dir
    return i >= 0 && i < list.value.length ? i : from
  }

  const handleKeyDown = (e) => {
    if (props.disabled) return
    const last = list.value.length - 1
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = step(index.value, 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = step(index.value, -1)
    else if (e.key === 'Home') next = isOff(0) ? step(0, 1) : 0
    else if (e.key === 'End') next = isOff(last) ? step(last, -1) : last
    if (next === null) return
    e.preventDefault()
    if (next === index.value) return
    commit(next)
    jumpTo(next)
    itemEls[next]?.focus()
  }

  // Loyihadagi barcha tab'lar bir xil balandlikda bo'lsin — `size` (sm/lg)
  // e'tiborsiz qoldiriladi, hamma joyda standart `md` o'lcham chiziladi.
  const preset = computed(() => SIZES.md)
  const thumbRadius = computed(() => Math.max(0, props.radius - props.inset))

  const rootStyle = computed(() => ({
    '--rs-track': props.trackColor,
    '--rs-thumb': props.thumbColor,
    '--rs-ink': props.textColor,
    '--rs-ink-active': props.activeTextColor,
    '--rs-radius': `${props.radius}px`,
    '--rs-inset': `${props.inset}px`,
    '--rs-thumb-radius': `${thumbRadius.value}px`,
    '--rs-h': `${preset.value.height}px`,
    '--rs-font': `${preset.value.font}px`,
    '--rs-pad': `${preset.value.pad}px`,
    '--rs-min': `${preset.value.min}px`,
    '--rs-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)'
  }))
</script>

<template>
  <div
    ref="trackRef"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
    :data-equal="equalSlots ? '' : undefined"
    :data-draggable="draggable && !disabled ? '' : undefined"
    class="group inline-grid relative grid-flow-col auto-cols-auto data-[equal]:auto-cols-[minmax(0,1fr)] aria-disabled:opacity-50 p-[var(--rs-inset)] rounded-[var(--rs-radius)] align-middle [-webkit-touch-callout:none] touch-pan-y data-[held]:cursor-grabbing aria-disabled:pointer-events-none select-none [font-family:inherit] [-webkit-tap-highlight-color:transparent] [background:var(--rs-track)]"
    :class="className"
    :style="rootStyle"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @lostpointercapture="handlePointerCancel"
  >
    <button
      v-for="(item, i) in list"
      :key="item.value"
      :ref="(el) => (itemEls[i] = el)"
      type="button"
      role="radio"
      :aria-checked="i === index"
      :tabindex="i === index ? 0 : -1"
      :disabled="disabled || item.disabled"
      :class="[
        CELL_CLASS,
        'cursor-pointer [color:var(--rs-ink)] opacity-70 disabled:opacity-35 disabled:cursor-not-allowed aria-checked:cursor-default group-data-[draggable]:aria-checked:cursor-grab group-data-[held]:cursor-grabbing data-[pressed]:[transform:scale(0.96)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:[outline-color:var(--rs-thumb)] [@media(hover:hover)_and_(pointer:fine)]:[&[aria-checked=false]:not(:disabled):hover]:opacity-90'
      ]"
      @pointerdown="handlePointerDown($event, i)"
      @keydown="handleKeyDown"
    >
      <component :is="item.render" v-if="item.render" />
      <template v-else>
        <template v-if="item.icon">
          <HugeiconsIcon v-if="isIconData(item.icon)" :icon="item.icon" :size="16" :stroke-width="2" />
          <n-icon v-else :size="16" :component="item.icon" />
        </template>
        {{ item.label }}
      </template>
      <span v-if="hasBadge(item)" :class="BADGE_CLASS">{{ item.badge }}</span>
    </button>
    <motion.div
      class="absolute inset-[var(--rs-inset)] grid grid-flow-col auto-cols-auto group-data-[equal]:auto-cols-[minmax(0,1fr)] pointer-events-none [background:var(--rs-thumb)] [color:var(--rs-ink-active)]"
      aria-hidden="true"
      :style="{ clipPath }"
    >
      <span
        v-for="item in list"
        :key="item.value"
        :class="[CELL_CLASS, 'cursor-default [color:inherit]']"
      >
        <component :is="item.render" v-if="item.render" />
        <template v-else>
          <template v-if="item.icon">
            <HugeiconsIcon v-if="isIconData(item.icon)" :icon="item.icon" :size="16" :stroke-width="2" />
            <n-icon v-else :size="16" :component="item.icon" />
          </template>
          {{ item.label }}
        </template>
        <span v-if="hasBadge(item)" :class="BADGE_CLASS">{{ item.badge }}</span>
      </span>
    </motion.div>
  </div>
</template>
