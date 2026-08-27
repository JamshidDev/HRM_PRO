<script setup>
  import { UIStatus, UITable, UIUser, UIUserGroup } from '@/components/index.js'
  import { useAccountStore, useCommandStore, useComponentStore } from '@/store/modules/index.js'
  import {
    CheckmarkCircle32Regular,
    Delete20Regular,
    Edit32Regular,
    Eye16Regular,
    DocumentEdit20Regular
  } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useCommandStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['openOffice', 'openEditorV2'])

  const onOpenFile = (v) => {
    emits('openOffice', v)
  }

  // Tahrirlash v2 — docx-editor.dev muharriri. Tasdiqlangan (SUCCESS) hujjat
  // tahrirlanmaydi; backend ham imzo qo'yilgan bo'lsa rad etadi.
  const isApproved = (row) => row?.confirmation?.id === 3

  const onEditV2 = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    emits('openEditorV2', row.id)
  }

  const onView = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsRead)) return
    onOpenFile(row.id)
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    store.elementId = row.id
    store._delete()
  }

  const onConfirm = (row) => {
    if (!accStore.checkAction(accStore.pn.hrCommandsWrite)) return
    store.elementId = row.id
    componentStore.files = []
    componentStore.fileVisible = true
  }

  /**
   * Maketdagi ism ko'rinishi: familiya + ism/otasining ismi bosh harflari
   * ("Boboqulov J.X"). To'liq ism tooltipda qoladi.
   */
  const shortName = (worker) => {
    const initials = [worker?.first_name, worker?.middle_name]
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .join('.')

    return [worker?.last_name, initials].filter(Boolean).join(' ') || '—'
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  /**
   * Ustunlar tartibi va kengliklari maketdan (node 2511:18100): № 40,
   * Turi / Xodim / Korxona / Holati / Hujjat — qolgan joyni teng bo'lishadi
   * (~163px), Raqami 90, Sana 100, amallar 50. "Xodim" maketda "Raqami" dan
   * OLDIN turadi.
   */
  const columns = computed(() => [
    {
      key: 'type',
      title: t('content.type'),
      minWidth: 160
    },
    {
      key: 'workers',
      title: t('content.worker'),
      minWidth: 160
    },
    {
      key: 'command_number',
      title: t('confirmation.contract.form.number'),
      width: 90
    },
    {
      key: 'organization.name',
      title: t('confirmation.contract.form.organization'),
      minWidth: 160
    },
    {
      key: 'confirmation',
      title: t('content.status'),
      minWidth: 160
    },
    {
      key: 'generate',
      title: t('content.document'),
      minWidth: 160
    },
    {
      key: 'command_date',
      title: t('content.date'),
      width: 100
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.view'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onView
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular)
    },
    {
      label: t('docxEditor.title'),
      key: Utils.ActionTypes.editV2,
      icon: UIHelper.renderIcon(DocumentEdit20Regular),
      disabled: (row) => isApproved(row) || !accStore.checkPermission(accStore.pn.hrCommandsWrite),
      action: onEditV2
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.confirm'),
      key: Utils.ActionTypes.confirm,
      icon: UIHelper.renderIcon(CheckmarkCircle32Regular),
      action: onConfirm
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-commands"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    storage-key="hrm-command-v2"
    @change-page="changePage"
  >
    <!-- Maketda (node 2511:18119) bu katak — bitta qatorli oddiy matn: yaratilgan
         vaqti uchun ikkinchi qator YO'Q. Hujjatni ochish uchun bosilishi saqlanadi,
         ammo chizig'i faqat hover'da chiqadi — tinch holatda maketdek ko'rinadi. -->
    <template #cell-type="{ row }">
      <span
        class="line-clamp-2 cursor-pointer text-sm leading-5 text-fig-text-secondary hover:text-primary hover:underline"
        @click="onOpenFile(row.id)"
      >
        {{ row?.type?.name }}
      </span>
    </template>

    <!-- Maketda raqam chip'siz, oddiy matn ko'rinishida va chapga tekislangan. -->
    <template #cell-command_number="{ row }">
      <span class="text-sm leading-5 text-fig-text-secondary">
        {{ row?.command_number || '—' }}
      </span>
    </template>

    <template #cell-workers="{ row }">
      <!-- Maketda ism qisqartmasi "Boboqulov J.X" ko'rinishida va ism ostida
           ikkinchi qator yo'q. `UIUser` ning o'z qisqartmasi bo'sh maydonlarda
           "undefined" chiqargani uchun matn `shortName()` da yig'iladi. -->
      <UIUser v-if="row.workers.length === 1" :data="{ photo: row.workers[0].worker?.photo }">
        <template #name>
          <n-tooltip trigger="hover">
            <template #trigger>
              <span class="w-full truncate text-sm leading-5 text-fig-text-primary">
                {{ shortName(row.workers[0].worker) }}
              </span>
            </template>
            <span>{{ Utils.combineFullName(row.workers[0].worker) }}</span>
          </n-tooltip>
        </template>
        <template #position><span></span></template>
      </UIUser>
      <UIUserGroup
        v-else
        class="relative"
        :has-more="row.workers.length > 4 ? row.workers.length - 4 : 0"
        :data="
          row.workers.map((v) => ({
            photo: v?.worker?.photo,
            fullName: v?.worker?.last_name + ' ' + v?.worker?.first_name
          }))
        "
      />
    </template>

    <template #cell-confirmation="{ row }">
      <UIStatus :status="row?.confirmation" fig />
    </template>

    <!-- Maketda tayyor hujjat BREND (ko'k) chipda, semantik yashilda emas —
         "Hujjat" ustuni holat emas, hujjat mavjudligini bildiradi. Qolgan
         holatlar (jarayonda / xato / yaratilmagan) semantik rangda qoladi. -->
    <template #cell-generate="{ row }">
      <UIStatus
        :status="Utils.documentStatus[row?.generate]"
        :tone="row?.generate === 3 ? 'brand' : null"
        fig
      />
    </template>

    <template #cell-command_date="{ row }">
      <span class="text-sm leading-5 text-fig-text-secondary">
        {{ Utils.timeOnlyDate(row?.command_date) }}
      </span>
    </template>
  </UITable>
</template>
