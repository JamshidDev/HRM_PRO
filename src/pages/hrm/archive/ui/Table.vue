<script setup>
  import { UITable, UIUser } from '@/components/index.js'
  import { useAccountStore, useArchiveStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import icons from '@/assets/icons'
  import { useTurnstileDownload } from '@/composables/useTurnstileDownload.js'
  import { ArrowDownload20Regular } from '@vicons/fluent'

  const { t } = i18n.global
  const store = useArchiveStore()
  const accStore = useAccountStore()
  const { open: openTurnstileDownload } = useTurnstileDownload()

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Ustunlar va kengliklar maketdan (node 3332:65666): Xodim 200, JSHSHIR 140,
  // "Bo'shagan sana" 112 — qolganlari bo'sh joyni bo'lishib oladi.
  const columns = computed(() => [
    { key: 'worker', title: t('confirmationPage.table.worker'), minWidth: 200 },
    { key: 'pin', title: t('pensioner.form.pin'), width: 140 },
    { key: 'organization', title: t('archive.table.currentOrg'), minWidth: 200 },
    // Shartnoma: turi ustida, tuzilgan sanasi ostida; bo'shash: sana va buyruq.
    { key: 'contract_type', title: t('archive.table.contractType'), minWidth: 240 },
    { key: 'dismissed_at', title: t('archive.table.dismissedAt'), width: 170 }
  ])

  const emits = defineEmits(['openCommand'])

  // Buyruq raqami bosilsa — buyruq PDF'i ochiladi (buyruqlar sahifasidagi kabi).
  const onOpenCommand = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    emits('openCommand', row.dismissal_command)
  }

  /**
   * Maketdagi ism ko'rinishi: familiya + ism/otasining ismi bosh harflari
   * ("Boboqulov J.X"). `UIUser` ning o'z qisqartmasi bo'sh maydonlarda
   * "undefined" chiqaradi, shu sababli matn shu yerda yig'iladi.
   */
  const shortName = (worker) => {
    const initials = [worker?.first_name, worker?.middle_name]
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .join('.')

    return [worker?.last_name, initials].filter(Boolean).join(' ') || '—'
  }

  // Turniket eksporti — backend `turnstile-hik-central-events-read` talab qiladi.
  const onTurnstileDownload = (row) => {
    if (!accStore.checkAction(accStore.pn.turnstileHikCentralEventsRead)) return
    // Arxivdagi xodim bo'shagan — backend lavozim statusini shunga qarab kengaytiradi.
    openTurnstileDownload(row?.worker, { archive: true })
  }

  // Har bir amal o'z ruxsatiga bog'liq — biri yo'q bo'lsa ikkinchisi baribir ko'rinadi.
  const actions = computed(() => [
    {
      label: t('archive.table.resume'),
      key: Utils.ActionTypes.download,
      // Maketdagi ikonka (node 3332:65719) — `file-arrow-down`
      icon: UIHelper.renderIcon(icons.figFileArrowDown),
      visible: () => accStore.checkPermission(accStore.pn.hrArchiveResume),
      action: (row) => store._resume(row)
    },
    {
      label: t('turnstileDownload.title'),
      key: 'turnstileDownload',
      icon: UIHelper.renderIcon(ArrowDownload20Regular),
      visible: (row) =>
        !!row?.worker?.id && accStore.checkPermission(accStore.pn.turnstileHikCentralEventsRead),
      action: onTurnstileDownload
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-archive"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-archive"
    @change-page="changePage"
  >
    <!-- Maketda (node 3332:66214) faqat qisqartirilgan ism ko'rinadi: telefon
         raqami uchun ustun yo'q, JSHSHIR esa alohida ustunda. To'liq ism
         `UIUser` ning tooltipida qoladi. -->
    <template #cell-worker="{ row }">
      <UIUser :data="{ photo: row?.worker?.photo }">
        <template #name>
          <n-tooltip trigger="hover">
            <template #trigger>
              <span class="w-full truncate text-sm leading-[1.2] text-textColor2">
                {{ shortName(row?.worker) }}
              </span>
            </template>
            <span>{{ Utils.combineFullName(row?.worker) }}</span>
          </n-tooltip>
        </template>
        <!-- Maketda ism ostida ikkinchi qator yo'q -->
        <template #position><span></span></template>
      </UIUser>
    </template>

    <template #cell-pin="{ row }">{{ row?.worker?.pin || '—' }}</template>

    <!--
      Maketda (node 3332:66247) bu ustun "pill" ko'rinishida: xodim tarmoqdagi
      boshqa korxonada ishlayotgan bo'lsa — brend rangli chipda korxona nomi,
      aks holda kulrang "Tarmoqda emas".
    -->
    <template #cell-organization="{ row }">
      <span
        class="inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-[12px] leading-4 font-semibold"
        :class="
          row?.organization
            ? 'bg-fig-bg-brand-surface text-fig-text-brand'
            : 'border border-fig-br-secondary bg-fig-bg-disable text-fig-text-tertiary'
        "
      >
        <span class="truncate">
          {{ row?.organization?.name || $t('archive.table.notEmployed') }}
        </span>
      </span>
    </template>

    <template #cell-contract_type="{ row }">
      <div class="flex min-w-0 flex-col gap-0.5 leading-tight">
        <n-tooltip trigger="hover" :disabled="!row?.contract_type?.name">
          <template #trigger>
            <span class="truncate text-sm text-textColor2">{{ row?.contract_type?.name || '—' }}</span>
          </template>
          {{ row?.contract_type?.name }}
        </n-tooltip>
        <span class="text-xs text-secondary">
          {{ $t('archive.table.startDate') }}: {{ Utils.timeOnlyDate(row?.start_date) || '—' }}
        </span>
      </div>
    </template>

    <!-- Bo'shagan sana va bo'shatish buyrug'i (bosilsa buyruq PDF'i ochiladi). -->
    <template #cell-dismissed_at="{ row }">
      <div class="flex flex-col gap-0.5 leading-tight">
        <span class="text-sm text-textColor2">{{ Utils.timeOnlyDate(row?.dismissed_at) || '—' }}</span>
        <n-button
          v-if="row?.dismissal_command"
          text
          size="tiny"
          type="primary"
          class="!justify-start"
          @click="onOpenCommand(row)"
        >
          {{ $t('archive.table.dismissalCommand') }} №{{ row.dismissal_command.command_number || row.dismissal_command.id }}
        </n-button>
      </div>
    </template>
  </UITable>
</template>
