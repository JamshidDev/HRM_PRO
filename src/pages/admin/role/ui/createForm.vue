<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { computed, ref, watch } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import {
    PERMISSION_GROUPS,
    ACTION_LABELS,
    MEANINGFUL,
    ENFORCED,
  } from '@/utils/permissionGroups.js'
  // Modul tab iconlari — sidebardagi (navigations.js) bilan bir xil SVG'lar.
  import { Apps24Filled, Search24Regular } from '@vicons/fluent'
  import HrModIcon from '@assets/icons/HrManagement.svg'
  import DocFlowModIcon from '@assets/icons/DocumentFlow.svg'
  import AttestationModIcon from '@assets/icons/Attestation.svg'
  import TurnstileModIcon from '@assets/icons/TurnstileMenu.svg'
  import GeneralModIcon from '@assets/icons/General.svg'
  import LmsModIcon from '@assets/icons/LmsManagement.svg'
  import EconomistModIcon from '@assets/icons/Economist.svg'
  import HospitalModIcon from '@assets/icons/Hospital.svg'
  import ChatModIcon from '@assets/icons/Chat.svg'
  import ExtraModIcon from '@assets/icons/Extra.svg'
  import AdminModIcon from '@assets/icons/Admin.svg'

  // PERMISSION_GROUPS.module → sidebar iconi.
  const MODULE_ICONS = {
    hr: HrModIcon,
    confirmation: DocFlowModIcon,
    exam: AttestationModIcon,
    turnstile: TurnstileModIcon,
    useful: GeneralModIcon,
    lms: LmsModIcon,
    economist: EconomistModIcon,
    hospital: HospitalModIcon,
    chat: ChatModIcon,
    extra: ExtraModIcon,
    admin: AdminModIcon,
  }
  const moduleIcon = (mod) => MODULE_ICONS[mod.module] || Apps24Filled

  const formRef = ref(null)
  const store = useUserRoleStore()
  const t = i18n.global.t

  // Har modulning modul-kirish guruhi shu label bilan belgilangan.
  const MODULE_ACCESS_LABEL = 'userRole.form.moduleAccess'

  // name -> {id, name}
  const permByName = computed(() => {
    const m = new Map()
    for (const p of store.originAllPermissionList || []) m.set(p.name, p)
    return m
  })
  const selectedSet = computed(() => new Set(store.payload.permissions))

  const idOf = (name) => permByName.value.get(name)?.id ?? null
  const has = (name) => permByName.value.has(name)
  const isOn = (name) => {
    const id = idOf(name)
    return id != null && selectedSet.value.has(id)
  }
  const setOn = (name, val) => {
    const id = idOf(name)
    if (id == null) return
    const arr = store.payload.permissions
    const i = arr.indexOf(id)
    if (val && i === -1) arr.push(id)
    else if (!val && i !== -1) arr.splice(i, 1)
  }

  // Integration guard uchun MEANINGFUL/ENFORCED filtri QO'LLANMAYDI: bu ro'yxatlar
  // sanctum (frontend) sluglaridan yig'ilgan, shuning uchun 34 ta integration
  // guruhidan 33 tasi filtrdan o'tmay, tab amalda bo'sh qolardi. API allaqachon
  // faqat shu guard'ning sluglarini qaytaradi — `has()` ning o'zi yetarli.
  const isIntegrationGuard = computed(() => store.payload.guard_name === 'integration')
  const grantable = (name) =>
    isIntegrationGuard.value || MEANINGFUL.has(name) || ENFORCED.has(name)
  const mutable = (name) => (isIntegrationGuard.value ? true : ENFORCED.has(name))

  /**
   * Bitta "Ko'rish" switch'i ortida turgan BARCHA nomlar.
   *
   * Tarixan ko'rish ruxsati ikki xil yozilgan: bare `hr-workers` (menyu ko'rinishi) va
   * `hr-workers-read`. Ilgari switch faqat BITTASINI boshqarardi — `-read` mavjud bo'lsa
   * bare slug UI'da umuman ko'rinmasdi (u `mappedNames` ichida bo'lgani uchun "Boshqa"
   * tabiga ham tushmasdi). Natijada eski rolda qolgan bare slug KO'RINMAS va
   * O'CHIRIB BO'LMAYDIGAN grantga aylanardi: admin "Ko'rish"ni o'chirsa ham menyu
   * bandi joyida qolaverardi. Endi switch ikkalasini birga yoqadi/o'chiradi.
   */
  // Ko'rish uchun BITTA permission yetadi: `<prefix>-read` mavjud bo'lsa faqat SHU
  // ishlatiladi (bare `<prefix>` — eski, ortiqcha; menyu/route ham endi `-read` tekshiradi).
  // `-read` bo'lmasa (masalan modul-kirish slug'i `hr`) bare qoladi.
  const readNames = (prefix) => {
    const read = `${prefix}-read`
    if (has(read) && grantable(read)) return [read]
    return [prefix].filter((n) => has(n) && grantable(n))
  }

  // Guruh sarlavhasi ostida ko'rsatiladigan slug — menyu/page KO'RINISHI shu READ
  // permission orqali (sidebarda menu bo'lib chiqadi). `-read` bo'lmasa bare (modul-kirish).
  const groupReadSlug = (g) => (has(`${g.prefix}-read`) ? `${g.prefix}-read` : g.prefix)

  /**
   * Guruh switchlari. Har switch — `{ key, names: string[], label }`.
   * write/delete FAQAT backend enforce qilsa chiqadi (o'lik switch bo'lmasin).
   */
  const groupSwitches = (g) => {
    // Custom per-option guruh (Dashboard, Foydalanuvchilar): har amal alohida switch.
    if (g.actions) {
      const out = []
      for (const a of g.actions) {
        if (!has(a.slug) || !grantable(a.slug)) continue
        const label = a.labelKey ? t(a.labelKey) : a.label
        // `<prefix>-read` amali bare slugni ham o'ziga oladi (yuqoridagi izohga qarang).
        const names = a.slug === `${g.prefix}-read` ? readNames(g.prefix) : [a.slug]
        out.push({ key: a.slug, names, label })
      }
      // Bare slug'ni alohida "Ko'rish" switch qilib faqat `-read` YO'Q bo'lganda
      // chiqaramiz (aks holda bare ortiqcha — `-read` yetadi).
      const covered = new Set(out.flatMap((s) => s.names))
      if (
        has(g.prefix) &&
        grantable(g.prefix) &&
        !has(`${g.prefix}-read`) &&
        !covered.has(g.prefix)
      ) {
        out.unshift({ key: g.prefix, names: [g.prefix], label: ACTION_LABELS.read })
      }
      return out
    }

    const out = []
    const rn = readNames(g.prefix)
    if (rn.length) out.push({ key: `${g.prefix}-read`, names: rn, label: ACTION_LABELS.read })
    for (const a of ['write', 'delete']) {
      const name = `${g.prefix}-${a}`
      if (has(name) && mutable(name))
        out.push({ key: name, names: [name], label: ACTION_LABELS[a] })
    }
    return out
  }

  // Switch yoqilgan hisoblanadi, agar nomlaridan BIRORTASI tanlangan bo'lsa;
  // o'chirilganda esa BARCHASI olib tashlanadi (grant-all / revoke-all).
  const switchOn = (sw) => sw.names.some((n) => isOn(n))
  const setSwitch = (sw, val) => {
    sw.names.forEach((n) => setOn(n, val))
    if (val) ensureModuleAccess(sw.names[0])
  }

  /**
   * Modul-kirish slug'ini avtomatik yoqadi.
   *
   * Router endi `meta.permission`ni ota route'dan meros qildiradi, ya'ni `/hrm/*`
   * ostidagi hamma narsa modul slug'i (`hr`) bo'lmasa ochilmaydi. Shu sababli
   * "xodimlarni ko'rishni berdim, lekin foydalanuvchi hech narsa ko'rmayapti"
   * degan eng ko'p uchraydigan xatoni oldini olamiz.
   */
  const ensureModuleAccess = (name) => {
    const mod = visibleModules.value.find((m) =>
      m.groups.some((g) => groupSwitches(g).some((sw) => sw.names.includes(name)))
    )
    if (!mod) return
    const moduleSlug = mod.groups.find((g) => g.label === MODULE_ACCESS_LABEL)?.prefix
    if (!moduleSlug || moduleSlug === name) return
    if (has(moduleSlug) && !isOn(moduleSlug)) setOn(moduleSlug, true)
  }

  // DIQQAT: agregatlar SWITCH darajasida sanaladi, nom darajasida emas. Aks holda
  // `-read` bor, bare yo'q rollarda (ya'ni to'g'ri sozlangan deyarli barcha rollarda)
  // master switch OFF ko'rinardi va badge ikki barobar shishardi.
  const groupAllOn = (g) => {
    const sw = groupSwitches(g)
    return sw.length > 0 && sw.every(switchOn)
  }
  const toggleGroup = (g, val) => groupSwitches(g).forEach((sw) => setSwitch(sw, val))

  // modulda yoqilgan switchlar soni — tab badge
  const moduleCount = (mod) => {
    // `sw.key` bo'yicha unique: bitta slug ikki kartada ko'rsatilsa (masalan
    // `hr-contracts-write` — «Xodimlar» va «Shartnomalar») badge ikki marta sanamasin.
    const on = new Set()
    for (const g of mod.groups)
      for (const sw of groupSwitches(g)) if (switchOn(sw)) on.add(sw.key)
    return on.size
  }

  // qidiruv bo'yicha ko'rinadigan sub-guruhlar (label bo'yicha) + mavjud slug bo'lganlar
  const visibleGroups = (mod) => {
    const q = (store.query || '').trim().toLowerCase()
    return mod.groups.filter(
      (g) =>
        groupSwitches(g).length > 0 &&
        (!q || t(g.label).toLowerCase().includes(q))
    )
  }

  // faqat rol guard'iga mos + mavjud slug'ga ega guruhi bor modullar.
  // Modul guard'i default 'sanctum'; Integration moduli guard='integration'.
  const visibleModules = computed(() =>
    PERMISSION_GROUPS.filter(
      (m) =>
        (m.guard ?? 'sanctum') === (store.payload.guard_name || 'sanctum') &&
        m.groups.some((g) => groupSwitches(g).length > 0)
    )
  )

  // Faol tab (icon-only tab'lar uchun label o'ng tomonda ko'rsatiladi).
  const activeTab = ref(null)
  const activeTabLabel = computed(() => {
    if (activeTab.value === '__other') return 'Boshqa'
    const m = visibleModules.value.find((x) => x.label === activeTab.value)
    return m ? t(m.label) : ''
  })
  // Guard almashsa yoki forma ochilsa — faol tabni birinchi modulga tiklaymiz.
  watch(
    visibleModules,
    (mods) => {
      const stillThere = mods.some((m) => m.label === activeTab.value)
      if (!stillThere && activeTab.value !== '__other') {
        activeTab.value = mods[0]?.label ?? null
      }
    },
    { immediate: true }
  )

  /**
   * HAQIQATAN chizilgan switch nomlari.
   *
   * Ilgari bu yerda `mappedNames` bor edi — u xaritada NAZARIY mavjud har bir nomni
   * qo'shardi, hatto o'sha switch ekranda chizilmasa ham. Natijada chizilmagan, lekin
   * "xaritalangan" slug "Boshqa" tabiga ham tushmay, butunlay ko'rinmas bo'lib qolardi.
   *
   * Endi faqat chizilgani hisobga olinadi — invariant: BERILGAN HAR BIR RUXSAT
   * UI'da biror joyda ko'rinishi va o'chirilishi mumkin bo'lsin.
   */
  const renderedNames = computed(() => {
    const s = new Set()
    for (const mod of visibleModules.value)
      for (const g of mod.groups)
        for (const sw of groupSwitches(g)) for (const n of sw.names) s.add(n)
    return s
  })

  // Rol turi (guard) o'zgarganда: mos permission ro'yxatini qayta yuklab,
  // tanlangan permissionlarni tozalaymiz (boshqa guard permissioni yaramaydi).
  // `query` ham tozalanadi — aks holda eski qidiruv yangi guard tablarini bo'sh
  // ko'rsatib qo'yadi.
  const otherPerms = computed(() => {
    const q = (store.query || '').trim().toLowerCase()
    return (store.originAllPermissionList || []).filter(
      (p) =>
        !renderedNames.value.has(p.name) &&
        // TANLANGAN grant hech qachon yashirilmaydi, hatto MEANINGFUL bo'lmasa ham —
        // aks holda uni o'chirishning iloji qolmaydi.
        (MEANINGFUL.has(p.name) || selectedSet.value.has(p.id)) &&
        (!q || p.name.toLowerCase().includes(q))
    )
  })

  /**
   * `payload.permissions` ichida bor, lekin API ro'yxatida YO'Q ID'lar soni.
   * Bunday grant hech bir switchda ko'rinmaydi va o'chirib bo'lmaydi, lekin
   * saqlashda jimgina qolib ketadi — shuning uchun ochiq ogohlantiramiz.
   */
  const orphanCount = computed(() => {
    const known = new Set((store.originAllPermissionList || []).map((p) => p.id))
    return store.payload.permissions.filter((id) => !known.has(id)).length
  })
  const otherCount = computed(
    () => otherPerms.value.filter((p) => selectedSet.value.has(p.id)).length
  )

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) store._create()
        else store._update()
      }
    })
  }

  // Saqlash/Bekor qilish tugmalari modal header'ida (RolePage.vue) turadi.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.userRole" :model="store.payload">
    <div>
      <!-- Role nomi / Guard / Scope endi modal HEADER'ida (RolePage.vue) -->
      <n-form-item :show-label="false" path="permissions">
        <div class="w-full">
          <!-- Ro'yxatga tushmagan ("ko'rinmas") grantlar haqida ochiq ogohlantirish -->
          <n-alert v-if="orphanCount" type="warning" class="mb-3" :bordered="false">
            {{ $t('userRole.form.orphanWarning', { n: orphanCount }) }}
          </n-alert>
          <n-tabs
            v-model:value="activeTab"
            type="line"
            animated
            class="perm-tabs ui-pill-tabs"
          >
            <!-- Tanlangan modul nomi tab qatorining o'ng tomonida -->
            <template #suffix>
              <span class="perm-active-label">{{ activeTabLabel }}</span>
            </template>
            <n-tab-pane
              v-for="mod in visibleModules"
              :key="mod.label"
              :name="mod.label"
            >
              <template #tab>
                <span
                  class="perm-tab-ico"
                  :class="{ 'has-perms': moduleCount(mod) > 0 }"
                  :title="$t(mod.label)"
                >
                  <n-icon :component="moduleIcon(mod)" :size="26" />
                  <span v-if="moduleCount(mod) > 0" class="perm-count">{{
                    moduleCount(mod)
                  }}</span>
                </span>
              </template>

              <div
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pt-1 pr-1"
              >
                <div
                  v-for="g in visibleGroups(mod)"
                  :key="g.prefix"
                  class="border border-surface-line rounded-lg p-2"
                >
                  <div class="flex items-center justify-between mb-1.5 pb-1.5 border-b border-surface-line">
                    <div class="flex flex-col min-w-0">
                      <span class="font-semibold text-sm">{{ $t(g.label) }}</span>
                      <span class="perm-slug">{{ groupReadSlug(g) }}</span>
                    </div>
                    <n-switch
                      size="small"
                      :value="groupAllOn(g)"
                      @update:value="(v) => toggleGroup(g, v)"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <div
                      v-for="sw in groupSwitches(g)"
                      :key="sw.key"
                      class="flex items-center justify-between gap-2"
                    >
                      <div class="flex flex-col min-w-0">
                        <span class="text-sm text-secondary">{{ sw.label }}</span>
                        <span class="perm-slug">{{ sw.names.join(', ') }}</span>
                      </div>
                      <n-switch
                        size="small"
                        :value="switchOn(sw)"
                        @update:value="(v) => setSwitch(sw, v)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane v-if="otherPerms.length" name="__other">
              <template #tab>
                <span
                  class="perm-tab-ico"
                  :class="{ 'has-perms': otherCount > 0 }"
                  title="Boshqa"
                >
                  <n-icon :component="Apps24Filled" :size="26" />
                  <span v-if="otherCount > 0" class="perm-count">{{ otherCount }}</span>
                </span>
              </template>
              <div class="pt-2 pr-1">
                <n-checkbox-group v-model:value="store.payload.permissions">
                  <div class="grid grid-cols-2 gap-2">
                    <n-checkbox
                      class="border border-surface-line p-1 rounded-lg"
                      v-for="p in otherPerms"
                      :key="p.id"
                      :value="p.id"
                    >
                      <span class="leading-[1.2] text-secondary text-sm">{{ p.name }}</span>
                    </n-checkbox>
                  </div>
                </n-checkbox-group>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </n-form-item>
    </div>
  </n-form>

  <!-- Qidiruv — modalga (card-class="relative") nisbatan absolute: scroll'dan tashqarida,
       doim pastki-markazda, kontent kam bo'lsa ham surilmaydi. -->
  <div class="perm-search-fixed">
    <div class="perm-search-box">
      <n-input v-model:value="store.query" clearable round :placeholder="$t('content.search')">
        <template #prefix>
          <n-icon :component="Search24Regular" />
        </template>
      </n-input>
    </div>
  </div>
</template>

<style scoped>
  /* Pill tab uslubi umumiy `.ui-pill-tabs` klassida (assets/scss/component.scss).
     Bu yerda faqat shu sahifaga xos badge uslubi qoladi. */
  .perm-count {
    display: inline-block;
    min-width: 18px;
    padding: 0 5px;
    margin-left: 6px;
    font-size: 11px;
    line-height: 18px;
    text-align: center;
    border-radius: 9px;
    background: var(--surface-line);
    color: var(--textColor1);
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
  }
  /* Modul tablari modal scroll'ida yopishib turadi — pastda uzun switch ro'yxatini
     ko'rib turib ham boshqa modulga o'tish mumkin bo'lsin. */
  .perm-tabs {
    /* Rail ustidagi bo'sh joy — pastdagi `::before` bandi shu joyni egallaydi,
       shunda band tinch holatda hech qanday kontentni bosmaydi. */
    margin-top: 20px;
  }
  .perm-tabs :deep(> .n-tabs-nav) {
    position: sticky;
    top: 0;
    z-index: 10;
    width: 100%;
    background: var(--surface-ground);
    padding: 8px 10px;
    border-radius: 12px;
  }
  /* Rail'ning usti va osti (uning `margin-bottom: 12px`i) modal foni bilan
     to'ldiriladi: aks holda yopishgan rail atrofidagi tirqishdan ostidan
     o'tayotgan kontent ko'rinib qoladi. Bandlar konteyner chegarasidan
     TASHQARIGA chiqmaydi — chiqsa modalda gorizontal scroll paydo bo'ladi. */
  .perm-tabs :deep(> .n-tabs-nav::before),
  .perm-tabs :deep(> .n-tabs-nav::after) {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    background: var(--surface-section);
    z-index: -1;
  }
  .perm-tabs :deep(> .n-tabs-nav::before) {
    top: -20px;
    height: 20px;
  }
  .perm-tabs :deep(> .n-tabs-nav::after) {
    bottom: -12px;
    height: 12px;
  }
  .perm-tabs :deep(.n-tabs-tab--active .perm-count) {
    background: var(--primary-color, #2080f0);
    color: #fff;
  }
  /* Icon-only tab: icon + son badge. */
  .perm-tab-ico {
    display: inline-flex;
    align-items: center;
    color: var(--textColor1);
  }
  .perm-tabs :deep(.n-tabs-tab--active) .perm-tab-ico {
    color: var(--primary-color, #2080f0);
  }
  /* Tanlangan modul nomi — tab qatorining eng o'ng chekkasida. */
  .perm-tabs :deep(.n-tabs-nav__suffix) {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  /* Tanlangan modul nomi — DOIMIY (statik) kenglik, kontent o'zgarsa ham surilmaydi. */
  .perm-active-label {
    display: inline-block;
    width: 170px;
    text-align: right;
    font-size: 14px;
    font-weight: 600;
    color: var(--textColor0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 4px;
  }
  /* Har tab — alohida OQ border-box (icon large); kulrang strip'da ajralib turadi. */
  .perm-tabs :deep(.n-tabs-tab) {
    border: 1px solid var(--surface-line);
    border-radius: 12px;
    padding: 8px 14px;
    margin-right: 8px;
    background: var(--surface-section);
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.08);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }
  /* Ruxsatli tab ichidagi son-badge ko'k (box foni o'zgarmaydi — oq qoladi). */
  .perm-tabs :deep(.n-tabs-tab:has(.has-perms) .perm-count) {
    background: color-mix(in srgb, var(--primary-color, #2080f0) 22%, transparent);
    color: var(--primary-color, #2080f0);
  }
  .perm-tabs :deep(.n-tabs-tab--active) {
    border-color: var(--primary-color, #2080f0);
    box-shadow: 0 0 0 1px var(--primary-color, #2080f0);
  }
  /* Border-box uslubida ostki chiziq (bar) kerak emas. */
  .perm-tabs :deep(.n-tabs-bar) {
    display: none;
  }
  /* Label ostidagi permission slug (key) — kichik, mono, xira. */
  .perm-slug {
    font-size: 10px;
    line-height: 1.25;
    color: var(--textColor1);
    opacity: 0.55;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    word-break: break-all;
  }
  /* Qidiruv — modalga (card-class="relative") nisbatan absolute, pastki-markazda fixed.
     Scroll'dan tashqarida turadi, kontent kam bo'lsa ham surilmaydi. */
  .perm-search-fixed {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
  }
  .perm-search-box {
    width: 360px;
    max-width: 90%;
    border-radius: 999px;
    background: var(--surface-section);
    border: 2px solid var(--primary-color, #2080f0);
    box-shadow: 0 8px 24px rgba(32, 128, 240, 0.3);
  }
  /* Ichki n-input chegarasini o'chiramiz — faqat ko'k wrapper border ko'rinsin. */
  .perm-search-box :deep(.n-input) {
    background: transparent;
    --n-border: none;
    --n-border-hover: none;
    --n-border-focus: none;
    --n-box-shadow-focus: none;
  }
</style>
