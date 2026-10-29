<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import SearchElement from '@/pages/turnstile/schedule/ui/SearchElement.vue'
  import Utils from '@/utils/Utils.js'
  import {
    ArrowSync20Regular,
    PersonAdd20Regular,
    CalendarEdit16Regular,
    Delete16Regular,
    MoreHorizontal32Filled,
    PeopleSwap20Regular
  } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'
  import {
    cycleDays,
    cycleOf,
    fromAnchored,
    isRotating,
    navbatOf,
    patternOf,
    toAnchored
  } from './navbat.js'
  import i18n from '@/i18n/index.js'

  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const { t } = i18n.global

  const currentScheduleList = ref([])

  const DAILY_TYPE = 2
  const rotating = computed(() => isRotating(store.shiftType))
  const pattern = computed(() => patternOf(store.shiftType))
  // Smena davri (start..end) — undan tashqaridagi kunlar xiralashtiriladi.
  const inPeriod = (date) =>
    (!store.params.startDate || date >= String(store.params.startDate).slice(0, 10)) &&
    (!store.params.endDate || date <= String(store.params.endDate).slice(0, 10))

  watchEffect(() => {
    const offset = Math.max((store.paging.from || 1) - 1, 0)
    const pat = pattern.value
    const rows = store.list.map((v) => {
      const fullName = Utils.combineFullName(v)
      // O'rinbosarlik kunlarida navbat asl reja bo'yicha aniqlanadi.
      const planDays = v.days.map((e) =>
        e.substitution?.original ? { ...e, ...e.substitution.original } : e
      )
      const nav = rotating.value ? navbatOf(planDays, pat) : null
      return {
        workerId: v.worker_id,
        workerPositionId: v.worker_position_id,
        firstId: v.first_id ?? 0,
        fullName,
        position: v.position_name,
        department: v.department_name,
        navbat: nav,
        days: v.days.map((e, i) => ({
          date: e.date,
          isWorkDay: e.work_status,
          startTime: e.start_time || null,
          endTime: e.end_time || null,
          workTime: e.daily_minutes,
          // Kunning o'z tushligi. BACKEND: schedule-workers → days[] har bir kunda
          // `break_start_time` / `break_end_time` ("HH:mm" yoki null) qaytarishi kerak —
          // docs/api/turnstile-day-break.md. Hozircha kelmaydi → null, UI smena turidagi tushlikni ko'rsatadi.
          breakStart: e.break_start_time ? String(e.break_start_time).slice(0, 5) : null,
          breakEnd: e.break_end_time ? String(e.break_end_time).slice(0, 5) : null,
          isEmpty: e.id === null,
          // Shu kuni boshqa smenada (o'ringa oy o'rtasida kelgan/ketgan) — faqat ko'rsatish uchun.
          other: e.id === null ? (e.other_schedule ?? null) : null,
          inPeriod: inPeriod(e.date),
          // Bir kunlik o'rinbosarlik (backend asl rejani qaytaradi).
          substitution: e.substitution ?? null,
          // Naqshdan farqli kun — almashtirilgan.
          changed:
            !!nav &&
            e.id !== null &&
            !e.substitution &&
            pat[(nav - 1 + i) % pat.length] !==
              (e.work_status ? `W${(e.start_time || '').slice(0, 5)}` : '-')
        }))
      }
    })
    // Aylanma smenada navbat tartibida — kim qaysi navbatda ekani ko'rinsin.
    if (rotating.value) {
      rows.sort(
        (a, b) => (a.navbat ?? 99) - (b.navbat ?? 99) || a.fullName.localeCompare(b.fullName)
      )
    }
    currentScheduleList.value = rows.map((r, i) => ({ ...r, number: offset + i + 1 }))
  })

  // Davrdan tashqari va hech kimda kun yo'q ustunlar xiralashtiriladi (ma'lumot bo'lsa — ko'rinadi).
  const headerInPeriod = computed(() => {
    const first = currentScheduleList.value[0]?.days ?? []
    return first.map(
      (d, i) => d.inPeriod || currentScheduleList.value.some((w) => !w.days[i]?.isEmpty)
    )
  })

  // Backend `schedule-workers` `search` parametrini qo'llamaydi — guruh xodimlari bitta
  // sahifada keladi (store'da per_page katta) va qidiruv brauzerda bajariladi.
  const visibleList = computed(() => {
    const q = store.params.search?.trim().toLowerCase()
    if (!q) return currentScheduleList.value
    return currentScheduleList.value.filter(
      (v) => v.fullName?.toLowerCase().includes(q) || v.position?.toLowerCase().includes(q)
    )
  })

  // Bo'sh o'rin uchun navbat naqshidan kutilayotgan grafik (AddSlotModal bilan bir xil faza).
  const slotDays = (fam, phase) => {
    const cd = cycleDays(store.shiftType)
    const { crewSize } = cycleOf(store.shiftType)
    const n = cd.length
    // Xodimsiz guruhda sanalar oy kunlaridan olinadi.
    const monthStart = store.monthRange.from
    const dates =
      store.list[0]?.days?.map((d) => d.date) ??
      (monthStart
        ? store.dayOfMonth.map((d) => `${monthStart.slice(0, 8)}${String(d.day).padStart(2, '0')}`)
        : [])
    if (!n || !crewSize || !phase) return null
    const phase0 = fam + (phase - 1) * (n / crewSize)
    return dates.map((date, i) => {
      const d = cd[(phase0 + i) % n]
      return {
        date,
        inPeriod: inPeriod(date),
        isWorkDay: !!d.work_status,
        startTime: d.start_time || null,
        endTime: d.end_time || null,
        workTime: d.daily_minutes || 0
      }
    })
  }
  const planHours = (days) =>
    Math.floor(days.filter((d) => d.inPeriod).reduce((s, d) => s + d.workTime, 0) / 60)

  const initialsOf = (name) =>
    (name || '')
      .split(' ')
      .slice(0, 2)
      .map((x) => x[0] || '')
      .join('')
      .toUpperCase()

  // Oddiy grafikda bir kunlik o'rinbosar — bo'sh kunini to'ldirgan yagona xodimning qatoriga.
  const LOOSE_SUB_MAX = 3
  const filledOf = (w) => w.days.map((d, i) => (d.isEmpty ? -1 : i)).filter((i) => i >= 0)
  const foldLoose = (ws) => {
    const out = [...ws]
    for (const w of ws) {
      const idx = filledOf(w)
      if (!idx.length || idx.length > LOOSE_SUB_MAX) continue
      const hosts = out.filter((h) => {
        const hi = filledOf(h)
        return (
          h !== w &&
          hi.length > LOOSE_SUB_MAX &&
          idx.every((i) => h.days[i].isEmpty && i >= hi[0] && i <= hi[hi.length - 1])
        )
      })
      if (hosts.length !== 1) continue
      const h = hosts[0]
      const days = h.days.map((d, i) =>
        idx.includes(i)
          ? { ...w.days[i], sub: { name: w.fullName, initials: initialsOf(w.fullName) } }
          : d
      )
      out.splice(out.indexOf(h), 1, { ...h, days })
      out.splice(out.indexOf(w), 1)
    }
    return out
  }

  const sigOf = (w) =>
    w.days.map((d) => (d.isEmpty ? '_' : d.isWorkDay ? `W${d.startTime}` : '-')).join('|')
  const firstWork = (w) => w.days.findIndex((d) => !d.isEmpty && d.isWorkDay)
  const byPositionName = (a, b) =>
    (a.position || '').localeCompare(b.position || '') || a.fullName.localeCompare(b.fullName)

  // Hali saqlanmagan o'rinlar — ko'rinish birinchi marta muzlatiladi (sections hisoblaganda to'ladi).
  let pendingSlots = []
  const sentSlots = new Set()

  // Guruh (ekipaj) = bitta bo'limda har navbatdan bittadan xodim; yetishmagan navbat — bo'sh o'rin.
  const sections = computed(() => {
    const ws = visibleList.value
    let num = Math.max((store.paging.from || 1) - 1, 0)
    const numbered = (w, phase) => ({ ...w, phase, number: ++num })
    // Bitta o'rindagi xodimlar (egasi + o'tkazilgan) — bitta raqam, «№»/navbat kataklari birlashadi.
    const sharedSlot = (chain, phase) => {
      const number = ++num
      return chain.map((w, ci) => ({
        ...w,
        phase,
        number,
        span: ci === 0 ? chain.length : 0,
        chainEnd: ci === chain.length - 1
      }))
    }

    // Xar kunlik smenada guruh yo'q — oddiy ro'yxat.
    if (store.shiftType?.type?.id === DAILY_TYPE) {
      return [{ key: 'all', workers: foldLoose(ws).map((w) => numbered(w, null)), missing: 0 }]
    }

    // Aylanma bo'lmagan turda ekipaj yo'q — bir xil grafikdagilar bitta blokda.
    if (!rotating.value) {
      const map = new Map()
      for (const w of foldLoose(ws)) {
        if (!map.has(sigOf(w))) map.set(sigOf(w), [])
        map.get(sigOf(w)).push(w)
      }
      return [...map.values()]
        .sort((a, b) => firstWork(a[0]) - firstWork(b[0]))
        .map((group, i) => ({
          key: `s-${i}`,
          title: t('shiftType.groupView.scheduleN', { n: i + 1 }),
          department: '',
          workers: group.map((w) => numbered(w, null)),
          missing: 0
        }))
    }

    const { pattern: cyc, crewSize } = cycleOf(store.shiftType)
    const phaseCount = cyc.length
    if (phaseCount <= 1 || !crewSize) {
      return [{ key: 'all', workers: ws.map((w) => numbered(w, null)), missing: 0 }]
    }

    // Sikl fazasi → ekipaj oilasi (siljish) va navbat: «Smena»da bitta oila, «1 haftalik»da faza mod 7.
    const step = phaseCount / crewSize
    const monthStart = store.list[0]?.days?.[0]?.date ?? store.monthRange.from
    const famOf = (k) => (k - 1) % step
    const navOf = (k) => Math.floor((k - 1) / step)
    const filledIdx = (w) => w.days.map((d, i) => (d.isEmpty ? -1 : i)).filter((i) => i >= 0)
    const firstDay = (w) => filledIdx(w)[0] ?? 0
    const disjoint = (a, b) => {
      const set = new Set(filledIdx(a))
      return filledIdx(b).every((i) => !set.has(i))
    }
    const workIdx = (w) =>
      w.days.map((d, i) => (!d.isEmpty && d.isWorkDay ? i : -1)).filter((i) => i >= 0)
    const noSharedWork = (a, b) => {
      const set = new Set(workIdx(a))
      return workIdx(b).every((i) => !set.has(i))
    }

    // Saqlangan o'rinlar: crew 0 — o'rin egasiga ergashadi.
    const slotMap = new Map(store.slots.map((s) => [s.worker_position_id, s]))
    const resolveSlot = (wp) => {
      let s = slotMap.get(wp)
      for (let i = 0; s && !s.crew && s.owner_worker_position_id && i < 5; i++) {
        s = slotMap.get(s.owner_worker_position_id)
      }
      return s?.crew ? s : null
    }
    const crews = new Map()
    const crewOf = (c, fam) => {
      if (!crews.has(c)) crews.set(c, { fam, navs: Array.from({ length: crewSize }, () => []) })
      return crews.get(c)
    }
    // Ishchisi shu oyda yo'q o'rinlar ham ekipajni ushlab turadi (bo'sh o'rin bo'lib qoladi).
    for (const s of store.slots) {
      if (s.crew && s.navbat) crewOf(s.crew, famOf(fromAnchored(s.navbat, monthStart, phaseCount)))
    }
    // Generatsiyadagi o'rinlar — xodim biriktirilmagan brigadalar ham bo'sh o'rin bo'lib ko'rinadi.
    const planned = Math.ceil((store.params.slots || 0) / crewSize)
    // Faqat hali o'rin saqlanmagan (yangi, bo'sh) guruhda — keyin bo'shagan brigada o'chiriladi.
    if (!store.slots.length && !store.maxCrew) for (let c = 1; c <= planned; c++) crewOf(c, 0)
    const unslotted = []
    const unknown = []
    for (const w of ws) {
      const s = resolveSlot(w.workerPositionId)
      // Saqlangan o'rin navbati ustun — o'tkazilgan xodimning eski kunlari uni boshqa o'ringa tortmaydi.
      const k = s?.navbat ? fromAnchored(s.navbat, monthStart, phaseCount) : w.navbat
      const crew = s && k ? crewOf(s.crew, famOf(k)) : null
      if (crew && crew.fam === famOf(k)) crew.navs[navOf(k)].push(w)
      else if (k) unslotted.push({ w, k })
      else unknown.push(w)
    }

    // Navbati aniqlanmagan (1–2 kunlik) xodim — naqshi mos va kunlari bo'sh o'ringa.
    const daySig = (d) => (d.isWorkDay ? `W${(d.startTime || '').slice(0, 5)}` : '-')
    for (const w of [...unknown]) {
      const idx = filledIdx(w)
      if (!idx.length) continue
      const cands = []
      for (let v = 0; v < phaseCount; v++) {
        if (!idx.every((j) => cyc[(v + j) % phaseCount] === daySig(w.days[j]))) continue
        for (const crew of crews.values()) {
          const slot = crew.fam === v % step ? crew.navs[Math.floor(v / step)] : null
          if (slot?.length) cands.push({ slot, free: slot.some((x) => disjoint(x, w)) })
        }
      }
      const pick = cands.find((c) => c.free) ?? (cands.length === 1 ? cands[0] : null)
      if (!pick) continue
      pick.slot.push(w)
      unknown.splice(unknown.indexOf(w), 1)
    }

    // O'rni saqlanmagan xodimlar — yaratilish tartibida: har navbatning j-chisi j-guruhga (o'tkazilgan — egasi yonida).
    const fresh = []
    const followers = []
    for (const u of unslotted) {
      const owner = slotMap.get(u.w.workerPositionId)?.owner_worker_position_id
      if (owner && unslotted.some((x) => x.w.workerPositionId === owner && x.k === u.k))
        followers.push({ ...u, owner })
      else fresh.push(u)
    }
    const byCreation = (a, b) =>
      (a.firstId || 0) - (b.firstId || 0) || a.workerPositionId - b.workerPositionId
    const chainsOf = (list) => {
      const chains = []
      for (const w of [...list].sort(byCreation)) {
        // Kunlari umuman kesishmaydigan (biri ketib, ikkinchisi kelgan) — bitta o'rin.
        const free = chains.find((c) => c.every((x) => disjoint(x, w)))
        if (free) free.push(w)
        else chains.push([w])
      }
      for (const f of followers)
        chains.find((c) => c.some((x) => x.workerPositionId === f.owner))?.push(f.w)
      return chains
    }
    const newSlots = []
    let nextCrew = Math.max(store.maxCrew || 0, ...crews.keys())
    const byFam = new Map()
    for (const u of fresh) {
      if (!byFam.has(famOf(u.k)))
        byFam.set(
          famOf(u.k),
          Array.from({ length: crewSize }, () => [])
        )
      byFam.get(famOf(u.k))[navOf(u.k)].push(u)
    }
    // Avval mavjud ekipajlarning hech kim band qilmagan o'rinlari (raqam tartibida), keyin yangi ekipaj.
    const reserved = new Set(
      store.slots
        .filter((s) => s.crew)
        .map((s) => `${s.crew}:${fromAnchored(s.navbat, monthStart, phaseCount)}`)
    )
    for (const fam of [...byFam.keys()].sort((a, b) => a - b)) {
      const byNav = byFam.get(fam).map((list) => chainsOf(list.map((u) => u.w)))
      byNav.forEach((chains, nav) => {
        const k = fam + nav * step + 1
        for (const chain of chains) {
          let c = [...crews.keys()]
            .sort((a, b) => a - b)
            .find(
              (c) =>
                crews.get(c).fam === fam &&
                !crews.get(c).navs[nav].length &&
                !reserved.has(`${c}:${k}`)
            )
          if (c == null) c = ++nextCrew
          crewOf(c, fam).navs[nav].push(...chain)
          for (const w of chain) {
            if (followers.some((f) => f.w === w)) continue
            newSlots.push({
              worker_position_id: w.workerPositionId,
              crew: c,
              navbat: toAnchored(k, monthStart, phaseCount),
              owner_worker_position_id: null
            })
          }
        }
      })
    }
    pendingSlots = newSlots

    // Bir kunlik o'rinbosar alohida qator emas — o'rin egasining katagida ko'rinadi.
    const SUB_MAX_DAYS = 3
    const foldSubs = (chain) => {
      if (chain.length < 2) return chain
      const host = chain.reduce((a, b) => (filledIdx(b).length > filledIdx(a).length ? b : a))
      const hi = filledIdx(host)
      const subs = chain.filter(
        (w) =>
          w !== host &&
          filledIdx(w).length <= SUB_MAX_DAYS &&
          filledIdx(w).every((i) => i >= hi[0] && i <= hi[hi.length - 1])
      )
      if (!subs.length) return chain
      const days = host.days.map((d, i) => {
        const sub = subs.find((x) => !x.days[i].isEmpty)
        return sub
          ? { ...sub.days[i], sub: { name: sub.fullName, initials: initialsOf(sub.fullName) } }
          : d
      })
      return chain.filter((w) => !subs.includes(w)).map((w) => (w === host ? { ...host, days } : w))
    }
    const out = []
    // Sahifada faqat shu sahifadagi brigadalar; xodimsiz brigadalar — oxirgi sahifada (o'chirish mumkin).
    const monthSet = new Set(store.monthWps)
    const membersOf = (c) => store.slots.filter((x) => resolveSlot(x.worker_position_id)?.crew === c)
    const lastPage = store.params.page >= (store.paging.last_page || 1)
    const crewKeys = [...crews.keys()].sort((a, b) => a - b)
    const emptyCrew = (c) => !membersOf(c).some((x) => monthSet.has(x.worker_position_id))
    for (const c of crewKeys) {
      const { fam, navs } = crews.get(c)
      const deletable = emptyCrew(c) && navs.every((l) => !l.length)
      if (!navs.some((l) => l.length) && !(deletable && lastPage)) continue
      // Ichki tartib qat'iy navbat bo'yicha — oy almashganda ham o'zgarmaydi.
      const order = navs
        .map((_, i) => i)
        .sort(
          (a, b) =>
            toAnchored(fam + a * step + 1, monthStart, phaseCount) -
            toAnchored(fam + b * step + 1, monthStart, phaseCount)
        )
      const workers = order.flatMap((i, pos) =>
        (navs[i].length
          ? sharedSlot(foldSubs([...navs[i]].sort((a, b) => firstDay(a) - firstDay(b))), i + 1)
          : [
              {
                empty: true,
                phase: i + 1,
                fam,
                workerPositionId: `e-${c}-${i}`,
                days: slotDays(fam, i + 1),
                number: ++num
              }
            ]
        ).map((w) => ({ ...w, crew: c, pos: pos + 1 }))
      )
      const depts = [...new Set(workers.filter((w) => !w.empty).map((w) => w.department || '—'))]
      out.push({
        key: `crew-${c}`,
        // Raqam butun guruh bo'yicha — sahifa almashsa ham bir xil.
        title: t('shiftType.groupView.groupN', { n: crewKeys.indexOf(c) + 1 }),
        department: depts.join(' · '),
        workers,
        missing: workers.filter((w) => w.empty).length,
        crew: c,
        deletable
      })
    }
    // Navbati aniqlanmagan xodim — o'z guruhi, sheriklar o'rni bo'sh (navbat noma'lum: qo'shib bo'lmaydi).
    for (const w of [...unknown].sort(byPositionName)) {
      const workers = [
        numbered(w, null),
        ...Array.from({ length: crewSize - 1 }, (_, i) => ({
          empty: true,
          phase: null,
          workerPositionId: `u-${w.workerPositionId}-${i}`,
          number: ++num
        }))
      ]
      out.push({
        key: `unknown-${w.workerPositionId}`,
        title: t('shiftType.groupView.groupN', { n: out.length + 1 }),
        department: w.department || '',
        workers,
        missing: crewSize - 1
      })
    }
    return out
  })

  // Aylanmada har doim ekipaj sarlavhasi; boshqa turlarda — bir nechta blok bo'lsa.
  const showSections = computed(
    () => sections.value[0]?.key !== 'all' && (rotating.value || sections.value.length > 1)
  )

  // Guruh tarkibi store'ga — almashtirish oynasi kesishmani shu bo'yicha tekshiradi.
  watchEffect(() => {
    const map = {}
    if (showSections.value) {
      for (const sec of sections.value) {
        for (const w of sec.workers) {
          if (!w.empty)
            map[w.workerPositionId] = { key: sec.key, title: sec.title, name: w.fullName }
        }
      }
    }
    store.crewMap = map
  })
  // Yangi o'rinlar jimgina saqlanadi (overwrite=false — mavjudlari o'zgarmaydi).
  watch(sections, () => {
    // Qidiruvda ro'yxat to'liq emas — o'rinlar faqat butun guruh ko'rinishidan saqlanadi.
    if (store.params.search?.trim()) return
    if (!rotating.value || !accStore.checkPermission(accStore.pn.turnstileSheetsGroupsWrite)) return
    const key = (s) => `${store.params.group}:${s.worker_position_id}`
    const todo = pendingSlots.filter((s) => !sentSlots.has(key(s)))
    if (!todo.length) return
    todo.forEach((s) => sentSlots.add(key(s)))
    store._saveSlots(todo)
  })
  // Bo'lim/bo'sh o'rin qatori fonini kunlar + «Ish soati» ustunlari kengligiga cho'zish.
  const fillerWidth = computed(() => `${store.dayOfMonth.length * 59 + 80}px`)

  const calculateWorkTime = (worker) => {
    // O'rinbosar kunlari o'rin egasining soatiga kirmaydi.
    const totalMinute = worker.days.reduce((sum, item) => sum + (item.sub ? 0 : item.workTime), 0)
    return Math.floor(totalMinute / 60)
  }

  // Guruhli ko'rinishda — guruhdagi o'rin raqami, aks holda tartib raqami.
  const rowNo = (w, wi) => (showSections.value ? (w.pos ?? w.phase ?? wi + 1) : w.number)

  const onChangePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Aylanma smenada bo'sh o'ringa har doim xodim qo'shish mumkin.
  const canAddToSlot = computed(
    () =>
      rotating.value &&
      !store.isPastMonth &&
      accStore.checkPermission(accStore.pn.turnstileSheetsGroupsWrite)
  )
  // O'tgan oyda almashtirish yopiq.
  const canReplace = computed(
    () => !store.isPastMonth && accStore.checkPermission(accStore.pn.turnstileSheetsGroupsWrite)
  )

  const onAddToSlot = (slot) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store.addSlot.phase = slot.phase
    store.addSlot.fam = slot.fam ?? 0
    store.addSlot.crew = slot.crew ?? null
    store.addSlot.pos = slot.pos ?? slot.phase
    store.addSlot.visible = true
  }

  // Bo'shagan o'ringa (egasi ketgan kundan) xodim — shu navbat bilan, birinchi bo'sh kundan.
  const onFillVacant = (w) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    const { pattern, crewSize } = cycleOf(store.shiftType)
    const step = pattern.length / crewSize
    store.addSlot.fam = (w.navbat - 1) % step
    store.addSlot.phase = Math.floor((w.navbat - 1) / step) + 1
    store.addSlot.from = vacantFrom(w)
    store.addSlot.crew = w.crew ?? null
    store.addSlot.pos = w.pos ?? null
    store.addSlot.visible = true
  }

  // Burchak belgisini bosish — o'zgargan kun ma'lumoti (reja, hozirgi, kim bilan almashgan).
  const sigOfDay = (d) => (d?.isWorkDay ? `W${(d.startTime || '').slice(0, 5)}` : '-')
  const sigOfPlan = (p) => (p?.work_status ? `W${(p.start_time || '').slice(0, 5)}` : '-')
  const openChangeInfo = (worker, day, i) => {
    const cd = cycleDays(store.shiftType)
    const n = cd.length
    const planOf = (r) => (r.navbat && n ? cd[(r.navbat - 1 + i) % n] : null)
    // Har kunlik turda reja hafta kuniga qarab (1 = dushanba … 7 = yakshanba).
    const dailyPlan = () => {
      if (store.shiftType?.type?.id !== DAILY_TYPE || !Array.isArray(store.shiftType?.days))
        return null
      const wd = new Date(`${day.date}T00:00:00`).getDay() || 7
      return store.shiftType.days.find((x) => Number(x.day) === wd) ?? { work_status: false }
    }
    const exp = planOf(worker) ?? dailyPlan()
    const rest = t('shiftType.groupView.rest')
    const fmtPlan = (p) => (!p ? '—' : p.work_status ? `${p.start_time}–${p.end_time}` : rest)
    // Sherik: shu kuni u ham o'zgargan va ikkalasining vaqti o'zaro almashgan.
    let partner = null
    if (!day.sub && exp) {
      partner = currentScheduleList.value.find((r) => {
        const d = r.days[i]
        const rp = planOf(r)
        return (
          r.workerPositionId !== worker.workerPositionId &&
          d?.changed &&
          rp &&
          sigOfDay(d) === sigOfPlan(exp) &&
          sigOfPlan(rp) === sigOfDay(day)
        )
      })
    }
    store.changeInfo = {
      visible: true,
      substitution: day.substitution ?? null,
      date: day.date,
      worker: worker.fullName,
      position: worker.position,
      crew: store.crewMap[worker.workerPositionId]?.title,
      planned: fmtPlan(exp),
      actual: day.isWorkDay ? `${day.startTime}–${day.endTime}` : rest,
      actualLunch: day.isWorkDay && day.breakStart && day.breakEnd ? `${day.breakStart}–${day.breakEnd}` : null,
      sub: day.sub?.name ?? null,
      partner: partner
        ? { name: partner.fullName, crew: store.crewMap[partner.workerPositionId]?.title }
        : null
    }
  }

  // Katakni bosish — shu kun uchun almashtirish oynasi.
  const onCellClick = (worker, day) => {
    if (!canReplace.value || !day.inPeriod || day.other) return
    onReplace(worker)
    store.replacePayload.date = new Date(`${day.date}T00:00:00`).getTime()
    // Katakdan — kunni o'zgartirish (almashtirish «…» menyusida alohida).
    store.replaceMode = 'edit'
  }

  // Xodim qatoridagi «…» menyusi: almashtirish, qayta generatsiya, kunni o'zgartirish.
  // O'rin egasi oy o'rtasida ketgan bo'lsa — davr ichidagi oxirgi bo'sh kunlarning birinchisi (shu kundan o'rin bo'sh).
  const vacantFrom = (w) => {
    if (!rotating.value || !w?.navbat) return null
    let last = -1
    w.days.forEach((d, i) => {
      if (!d.isEmpty) last = i
    })
    const next = w.days.slice(last + 1).find((d) => d.inPeriod && d.isEmpty)
    return last >= 0 && next ? next.date : null
  }
  const rowMenuOf = (w) => [
    ...(vacantFrom(w) && canAddToSlot.value
      ? [
          {
            label: t('shiftType.groupView.menuFillVacant'),
            key: 'fill',
            icon: UIHelper.renderIcon(PersonAdd20Regular)
          }
        ]
      : []),
    {
      label: t('shiftType.groupView.menuSwap'),
      key: 'swap',
      icon: UIHelper.renderIcon(PeopleSwap20Regular)
    },
    ...(rotating.value
      ? [
          {
            label: t('shiftType.groupView.menuRegen'),
            key: 'regen',
            icon: UIHelper.renderIcon(ArrowSync20Regular)
          }
        ]
      : []),
    {
      label: t('shiftType.groupView.menuEditDay'),
      key: 'edit',
      icon: UIHelper.renderIcon(CalendarEdit16Regular)
    },
    { type: 'divider', key: 'd-remove' },
    {
      label: t('shiftType.groupView.menuRemove'),
      key: 'remove',
      icon: UIHelper.renderIcon(Delete16Regular),
      props: { style: 'color: var(--color-error, #e5484d)' }
    }
  ]
  const onRowMenu = (key, worker) => {
    if (key === 'fill') return onFillVacant(worker)
    if (key === 'regen') return onRegen(worker)
    if (key === 'remove') {
      if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
      store.remove.worker = worker
      store.remove.visible = true
      return
    }
    onReplace(worker)
    if (key === 'edit') {
      store.replacePayload.date = new Date(`${store.defaultDate}T00:00:00`).getTime()
      store.replaceMode = 'edit'
    }
  }

  // Aylanma smenada xodim grafigini navbati bo'yicha qayta yaratish.
  const onRegen = (v) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store.regen.worker = v
    store.regen.visible = true
  }

  const onReplace = (v) => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    store.selectedWorker = v
    store.replaceMode = 'swap'
    store.transferMode = false
    store.dayEdit = { choice: null, start: null, end: null, breakStart: null, breakEnd: null, hasBreak: false }
    store.workerParams.search = null
    store.replacePayload.positonId = null
    store.replacePayload.period = false
    store.replacePayload.range = null
    // O'rinbosarlik — standart kundan boshlab xodimning birinchi ish kuni.
    const free = v.days.find(
      (d) => d.date >= store.defaultDate && d.isWorkDay && !d.substitution && !d.isEmpty
    )
    store.replacePayload.date = new Date(`${free?.date ?? store.defaultDate}T00:00:00`).getTime()
    store.replaceVisible = true
  }
</script>

<template>
  <n-spin :show="store.dayOfMonthLoading || store.loading" class="h-full">
    <div class="h-full flex flex-col gap-4">
      <div
        class="w-full flex-1 overflow-auto relative rounded-lg max-h-[calc(100vh-190px)] min-h-[300px]"
        :style="{ '--lw': showSections ? '80px' : '0px', '--sw': showSections ? '40px' : '60px' }"
      >
        <!-- Qattiq fon shart: dark mode'da `--schedule-*-bg` yarim shaffof (alpha .24),
             fonsiz sticky sarlavha ostidan skroll qilinayotgan qatorlar ko'rinib qoladi. -->
        <div class="schedule-header-row flex z-[10] w-fit min-w-full sticky top-0 bg-surface-section">
          <template v-if="showSections">
            <div
              class="rounded-tl-lg border-t border-l border-b border-surface-line p-2 w-[44px] min-w-[44px] h-[50px] sticky left-0 top-0 z-[20] bg-surface-section flex-shrink-0"
            >
              N0
            </div>
            <div
              class="border-t border-l border-b border-surface-line w-[36px] min-w-[36px] h-[50px] sticky left-[44px] top-0 z-[20] bg-surface-section flex-shrink-0"
            ></div>
          </template>
          <div
            class="border-r border-t border-l border-b border-surface-line w-[var(--sw)] min-w-[var(--sw)] h-[50px] sticky left-[var(--lw)] top-0 z-[20] bg-surface-section flex-shrink-0 flex items-center justify-center"
            :class="showSections ? 'text-xs text-secondary' : 'p-2'"
          >
            {{ showSections ? '' : 'N0' }}
          </div>
          <div
            class="border-r border-t border-l-[0] border-b border-surface-line flex text-secondary font-medium justify-center items-center w-[320px] min-w-[340px] h-[50px] sticky left-[calc(var(--lw)+var(--sw))] top-0 z-[20] bg-surface-section flex-shrink-0"
          >
            <SearchElement :disable="true" />
          </div>
          <template v-for="(item, hIndex) in store.dayOfMonth" :key="`header-${item}`">
            <div
              :class="{ 'opacity-40': headerInPeriod[hIndex] === false }"
              :title="
                headerInPeriod[hIndex] === false ? $t('shiftType.groupView.outOfPeriod') : null
              "
              :style="{
                background: [6, 0].includes(item.weekDay)
                  ? 'var(--schedule-weekend-bg)'
                  : 'var(--schedule-weekday-bg)'
              }"
              class="border-r border-t border-l border-b -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] text-xs text-secondary flex-shrink-0"
            >
              <div class="text-center p-1 font-bold">{{ item?.day }}</div>
              <div class="text-center p-1">{{ store.shortNameOfWeek[item.weekDay] || '-' }}</div>
            </div>
          </template>
          <div
            class="rounded-tr-lg border-r border-t border-l border-b -ml-[1px] text-xs text-secondary flex justify-center items-center p-2 border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 top-0 bg-surface-section flex-shrink-0 z-[20]"
          >
            {{ $t('schedule.form.workTime') }}
          </div>
        </div>
        <template v-if="sections.length > 0">
          <div v-for="sec in sections" :key="sec.key" class="flex w-fit min-w-full">
            <!-- Tartib raqami — guruh ustunidan oldin. -->
            <div
              v-if="showSections"
              class="sticky left-0 z-[6] flex flex-col w-[44px] min-w-[44px] flex-shrink-0"
            >
              <template v-for="(w, ni) in sec.workers" :key="`n-${w.workerPositionId}`">
                <div
                  v-if="w.span !== 0"
                  class="border-l border-b border-surface-line bg-surface-section flex items-center justify-center text-secondary font-medium"
                  :style="{ height: `${50 * (w.span || 1)}px` }"
                  :class="{ 'brigade-cell': ni + (w.span || 1) - 1 === sec.workers.length - 1 }"
                >
                  {{ w.number }}
                </div>
              </template>
            </div>
            <!-- Guruh: guruh qatorlari uchun bitta vertikal katak. -->
            <div
              v-if="showSections"
              class="brigade-cell sticky left-[44px] z-[6] w-[36px] min-w-[36px] border-l border-b border-surface-line bg-surface-section flex flex-col items-center justify-center flex-shrink-0"
              :title="sec.department || null"
            >
              <span class="brigade-label text-xs text-secondary whitespace-nowrap">
                {{ sec.title }}
              </span>
              <n-popconfirm v-if="sec.deletable && canReplace" @positive-click="store._deleteCrew(sec.crew, sec.workers.length)">
                <template #trigger>
                  <button
                    type="button"
                    class="mt-2 w-6 h-6 rounded-md flex items-center justify-center text-fig-text-red hover:bg-fig-red-50"
                    :title="$t('shiftType.groupView.deleteCrew')"
                  >
                    <n-icon size="14"><Delete16Regular /></n-icon>
                  </button>
                </template>
                {{ $t('shiftType.groupView.deleteCrewConfirm', { name: sec.title }) }}
              </n-popconfirm>
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <template v-for="(worker, wi) in sec.workers" :key="worker.workerPositionId">
                <div
                  v-if="worker.empty"
                  class="flex w-fit min-w-full"
                  :class="{ 'grp-end': showSections && wi === sec.workers.length - 1 }"
                >
                  <div
                    class="sticky left-[var(--lw)] z-[5] w-[var(--sw)] min-w-[var(--sw)] h-[50px] border-l border-r border-b border-surface-line bg-surface-section flex items-center justify-center"
                  >
                    <span class="leading-[1.2] text-secondary font-medium">{{
                      rowNo(worker, wi)
                    }}</span>
                  </div>
                  <div
                    class="sticky left-[calc(var(--lw)+var(--sw))] z-[5] flex items-center gap-2 px-3 w-[340px] min-w-[340px] h-[50px] border-r border-b border-surface-line bg-surface-section"
                  >
                    <!-- O'tgan oyda tugma ko'rinadi, lekin nofaol (oy yopiq). -->
                    <span :title="store.isPastMonth ? $t('shiftType.groupView.pastMonth') : null">
                      <n-button
                        size="tiny"
                        dashed
                        :disabled="!canAddToSlot"
                        @click="onAddToSlot(worker)"
                      >
                        + {{ $t('shiftType.groupView.addWorker') }}
                      </n-button>
                    </span>
                  </div>
                  <template v-if="worker.days">
                    <div
                      v-for="(day, dayIndex) in worker.days"
                      :key="dayIndex"
                      class="border-r text-center border-l border-b border-t-0 -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] border text-xs text-secondary p-2 pb-0 flex-shrink-0 relative bg-surface-section"
                      :class="{ 'out-of-period': !day.inPeriod }"
                      :title="day.inPeriod ? null : $t('shiftType.groupView.outOfPeriod')"
                    >
                      <template v-if="!day.inPeriod"></template>
                      <template v-else-if="day.isWorkDay">
                        <div class="leading-[1.2] pt-3">{{ day.startTime }}</div>
                        <div class="leading-[1.2]">{{ day.endTime }}</div>
                        <div
                          class="absolute top-[0] left-[0] min-w-[16px] h-[16px] px-0.5 bg-secondary/80 text-white text-xs rounded"
                          :title="
                            $t('shiftType.groupView.hours', { n: Math.floor(day.workTime / 60) })
                          "
                        >
                          {{ Math.floor(day.workTime / 60) }}
                        </div>
                      </template>
                      <div
                        v-else
                        class="h-full flex items-center justify-center pb-2 text-success/80 font-medium"
                      >
                        {{ $t('shiftType.groupView.rest') }}
                      </div>
                    </div>
                    <div
                      class="border-r border-l border-b -ml-[1px] border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center"
                    >
                      {{ planHours(worker.days) }}
                    </div>
                  </template>
                  <div
                    v-else
                    class="flex-1 h-[50px] border-b border-r border-dashed border-surface-line bg-surface-ground"
                    :style="{ minWidth: fillerWidth }"
                  ></div>
                </div>
                <div
                  v-else
                  class="schedule-header-body-row flex w-fit min-w-full bg-surface-section"
                  :class="{ 'grp-end': showSections && wi === sec.workers.length - 1 }"
                >
                  <!-- Worker Name - Sticky Left -->
                  <div
                    class="border-r border-l border-b border-t-0 border-surface-line text-center p-2 w-[var(--sw)] min-w-[var(--sw)] h-[50px] border sticky left-[var(--lw)] bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center"
                    :class="{
                      '!border-b-0': worker.span > 1 || (worker.span === 0 && !worker.chainEnd),
                      '!z-[6]': worker.span > 1
                    }"
                  >
                    <!-- Birlashgan o'rinda navbat raqami barcha qatorlar o'rtasida. -->
                    <span
                      v-if="worker.span !== 0"
                      class="leading-[1.2] text-secondary font-medium"
                      :class="{
                        'absolute inset-x-0 top-0 flex items-center justify-center': worker.span > 1
                      }"
                      :style="worker.span > 1 ? { height: `${50 * worker.span}px` } : null"
                    >
                      {{ rowNo(worker, wi) }}
                    </span>
                  </div>
                  <div
                    class="border-r border-l-[0] border-b border-t-0 border-surface-line p-2 w-[340px] min-w-[320px] h-[50px] border sticky left-[calc(var(--lw)+var(--sw))] bg-surface-section flex-shrink-0 z-[5] flex items-center"
                  >
                    <div class="w-[calc(100%-28px)]">
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="line-clamp-1 leading-[1.2] font-medium">{{
                          worker.fullName
                        }}</span>
                      </div>
                      <div class="text-xs line-clamp-1 leading-[1.2] text-secondary">
                        {{ worker.position }}
                      </div>
                    </div>

                    <n-dropdown
                      v-if="canReplace"
                      size="small"
                      trigger="click"
                      :options="rowMenuOf(worker)"
                      @select="(key) => onRowMenu(key, worker)"
                    >
                      <div
                        class="w-[28px] h-[28px] border border-surface-line rounded-lg flex justify-center items-center text-secondary cursor-pointer hover:border-primary hover:text-primary"
                      >
                        <n-icon size="20">
                          <MoreHorizontal32Filled />
                        </n-icon>
                      </div>
                    </n-dropdown>
                  </div>

                  <!-- Day Cells -->
                  <div
                    v-for="(day, dayIndex) in worker.days"
                    :key="dayIndex"
                    class="border-r text-center border-l border-b border-t-0 -ml-[1px] border-surface-line w-[60px] min-w-[60px] h-[50px] border text-xs text-secondary p-2 pb-0 flex-shrink-0 cursor-pointer relative"
                    :class="{
                      'out-of-period': !day.inPeriod && day.isEmpty,
                      'changed-cell': day.sub || day.substitution
                    }"
                    :title="
                      day.substitution
                        ? $t(
                            day.substitution.role === 'absent'
                              ? 'shiftType.groupView.subAbsentTitle'
                              : 'shiftType.groupView.subWorksTitle',
                            { name: day.substitution.name }
                          )
                        : day.sub
                          ? $t('shiftType.groupView.subWorks', {
                              name: day.sub.name,
                              host: worker.fullName
                            })
                          : !day.inPeriod && day.isEmpty
                            ? $t('shiftType.groupView.outOfPeriod')
                            : null
                    "
                    @click="onCellClick(worker, day)"
                  >
                    <div
                      v-if="day.substitution"
                      class="absolute top-0 right-0 z-[1] w-[18px] h-[16px] flex items-center justify-center rounded-bl bg-warning text-white cursor-pointer hover:brightness-110"
                      @click.stop="openChangeInfo(worker, day, dayIndex)"
                    >
                      <n-icon size="12"><PeopleSwap20Regular /></n-icon>
                    </div>
                    <div
                      v-else-if="day.sub"
                      class="absolute top-0 right-0 z-[1] px-1 h-[16px] leading-[16px] text-[10px] font-semibold rounded-bl bg-primary text-white cursor-pointer hover:brightness-110"
                      @click.stop="openChangeInfo(worker, day, dayIndex)"
                    >
                      {{ day.sub.initials }}
                    </div>
                    <div
                      v-if="day.isEmpty && day.other"
                      class="other-shift absolute inset-[3px] rounded flex flex-col items-center justify-center text-[10px] leading-[1.15]"
                      :title="$t('shiftType.groupView.otherShiftDay', { name: day.other.name })"
                    >
                      <template v-if="day.other.work_status">
                        <span>{{ day.other.start_time }}</span>
                        <span>{{ day.other.end_time }}</span>
                      </template>
                      <span v-else>{{ $t('shiftType.groupView.rest') }}</span>
                    </div>
                    <template v-else-if="day.isEmpty"></template>
                    <template v-else-if="day.isWorkDay">
                      <div class="leading-[1.2] pt-3">{{ day.startTime }}</div>
                      <div class="leading-[1.2]">{{ day.endTime }}</div>
                      <div
                        class="absolute top-[0] left-[0] min-w-[16px] h-[16px] px-0.5 bg-secondary/80 text-white text-xs rounded"
                        :title="
                          $t('shiftType.groupView.hours', { n: Math.floor(day.workTime / 60) })
                        "
                      >
                        {{ Math.floor(day.workTime / 60) }}
                      </div>
                    </template>
                    <template v-else>
                      <div
                        class="h-full flex items-center justify-center pb-2 text-success/80 font-medium"
                      >
                        {{ $t('shiftType.groupView.rest') }}
                      </div>
                    </template>
                  </div>

                  <!-- Total - Sticky Right -->
                  <div
                    class="border-r border-l border-b -ml-[1px] border-surface-line w-[80px] min-w-[80px] h-[50px] sticky right-0 bg-surface-section flex-shrink-0 z-[5] flex items-center justify-center"
                  >
                    {{ calculateWorkTime(worker) }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            class="w-full text-center h-[300px] sticky left-0 flex justify-center items-center text-secondary"
          >
            {{ $t('content.no-data') }}
          </div>
        </template>
      </div>

      <!-- Sahifa brigada chegarasida — sahifalar soni backenddan. -->
      <div class="flex flex-wrap justify-center lg:justify-between items-center gap-4 py-4 w-full">
        <span class="font-normal text-textColor2">
          <span class="font-bold text-primary">{{ store.totalItems }}</span> {{ $t('content.fromTa') }}
          <span class="font-bold text-primary">{{ store.paging.from }}-{{ store.paging.to }}</span>
          {{ $t('content.untilShow') }}
        </span>
        <n-pagination
          :page="store.params.page"
          :page-count="store.paging.last_page || 1"
          @update:page="(p) => onChangePage({ page: p, per_page: store.params.per_page })"
        />
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  .grp-end > div {
    box-shadow: inset 0 -2px 0 var(--color-surface-line);
  }
  .brigade-cell {
    box-shadow: inset 0 -2px 0 var(--color-surface-line);
  }
  .brigade-label {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }
  /* Boshqa smenadagi kun — xira, chiziqli chegara */
  .other-shift {
    color: var(--fig-text-tertiary);
    border: 1px dashed var(--surface-line);
    background: color-mix(in srgb, var(--surface-ground) 60%, transparent);
    cursor: default;
  }
  .changed-cell {
    box-shadow: inset 0 0 0 1.5px var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  }
  .out-of-period {
    background: repeating-linear-gradient(
      -45deg,
      transparent 0 6px,
      var(--schedule-weekend-bg) 6px 8px
    );
    opacity: 0.55;
  }
</style>
