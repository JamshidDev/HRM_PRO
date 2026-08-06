<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { computed, ref } from 'vue'
  import i18n from '@/i18n/index.js'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import {
    PERMISSION_GROUPS,
    ACTION_LABELS,
    MEANINGFUL,
    ENFORCED,
  } from '@/utils/permissionGroups.js'

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
  const readNames = (prefix) =>
    [prefix, `${prefix}-read`].filter((n) => has(n) && grantable(n))

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
      // Guruhda alohida `-read` amali bo'lmasa, lekin bare slug mavjud bo'lsa —
      // uni yo'qotib qo'ymaslik uchun alohida "Ko'rish" switch'i sifatida chiqaramiz.
      const covered = new Set(out.flatMap((s) => s.names))
      if (has(g.prefix) && grantable(g.prefix) && !covered.has(g.prefix)) {
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
    let c = 0
    for (const g of mod.groups) for (const sw of groupSwitches(g)) if (switchOn(sw)) c++
    return c
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
  const onGuardChange = () => {
    store.payload.permissions = []
    store.query = null
    store._getAllPermission()
  }

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
      <n-form-item :label="$t(`userRole.form.name`)" path="name">
        <n-input
          type="text"
          v-model:value="store.payload.name"
          style="width: 320px; flex: none"
        />
      </n-form-item>

      <!-- Rol turi (guard) — faqat yaratishda tanlanadi, keyin o'zgarmaydi -->
      <n-form-item :label="$t('userRole.form.type')">
        <n-radio-group
          v-model:value="store.payload.guard_name"
          :disabled="!store.visibleType"
          @update:value="onGuardChange"
        >
          <n-radio value="sanctum">{{ $t('userRole.form.typeSanctum') }}</n-radio>
          <n-radio value="integration">{{ $t('userRole.form.typeIntegration') }}</n-radio>
        </n-radio-group>
      </n-form-item>

      <n-form-item :label="$t(`userRole.form.permissions`)" path="permissions">
        <div class="w-full">
          <!-- Ro'yxatga tushmagan ("ko'rinmas") grantlar haqida ochiq ogohlantirish -->
          <n-alert v-if="orphanCount" type="warning" class="mb-3" :bordered="false">
            {{ $t('userRole.form.orphanWarning', { n: orphanCount }) }}
          </n-alert>
          <n-tabs type="line" animated class="perm-tabs ui-pill-tabs">
            <n-tab-pane
              v-for="mod in visibleModules"
              :key="mod.label"
              :name="mod.label"
            >
              <template #tab>
                <span>{{ $t(mod.label) }}</span>
                <span class="perm-count">{{ moduleCount(mod) }}</span>
              </template>

              <div
                class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2 pr-1"
              >
                <div
                  v-for="g in visibleGroups(mod)"
                  :key="g.prefix"
                  class="border border-surface-line rounded-xl p-3"
                >
                  <div class="flex items-center justify-between mb-2 pb-2 border-b border-surface-line">
                    <span class="font-semibold text-sm">{{ $t(g.label) }}</span>
                    <n-switch
                      size="small"
                      :value="groupAllOn(g)"
                      @update:value="(v) => toggleGroup(g, v)"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <div
                      v-for="sw in groupSwitches(g)"
                      :key="sw.key"
                      class="flex items-center justify-between"
                    >
                      <span class="text-sm text-secondary">{{ sw.label }}</span>
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
                <span>Boshqa</span>
                <span class="perm-count">{{ otherCount }}</span>
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
  .perm-tabs :deep(.n-tabs-tab--active .perm-count) {
    background: var(--primary-color, #2080f0);
    color: #fff;
  }
</style>
