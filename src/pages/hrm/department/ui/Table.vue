<script setup>
  import { UITable } from '@/components/index.js'
import i18n from '@/i18n/index.js'
import { useAccountStore, useComponentStore, useDepartmentStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import Utils from '@/utils/Utils.js'
import { Delete20Regular, Edit32Regular, Eye16Regular, OpenFolder24Filled } from '@vicons/fluent'
import FolderIcon from '@/assets/icons/figFolder.svg'
import ChevronIcon from '@/assets/icons/figChevronDown.svg'
import FileIcon from '@/assets/icons/figFile.svg'

  const { t } = i18n.global

  const store = useDepartmentStore()
  const accStore = useAccountStore()
  const componentStore = useComponentStore()

  const headerOption = [
    { name: t('content.nameUz'), id: 'uz' },
    { name: t('content.nameRu'), id: 'ru' },
    { name: t('content.nameEn'), id: 'en' }
  ]

  const onLoad = (row) => store._loadChildren(row)

  // Fayl menejeri uslubi: [› strelka] [📁 papka] Nomi. Strelka — oddiy span (n-icon emas),
  // shuning uchun Naive uni o'zi burmaydi; burilishni CSS qiladi (`data-open`). Kalit doim
  // bir xil — Naive ikonka almashuvi animatsiyasi ishga tushmaydi, faqat silliq buriladi.
  // Ichki bo'limi yo'q bo'linma — papka emas, fayl ikonkasi. Qoida Naive (treemate) bilan bir xil:
  // `isLeaf`, bo'lmasa `children` yo'qligi — ya'ni strelkasi yo'q qatorlar.
  const isLeafRow = (row) => row.isLeaf ?? !row.children

  const renderExpandIcon = ({ expanded }) =>
    h(
      'span',
      { key: 'chevron', class: 'department-tree__chevron', 'data-open': expanded || undefined },
      [h(ChevronIcon)]
    )

  // Bo'linma ichidagi XODIMLAR ro'yxati — shuning uchun bo'linma emas, xodim
  // ko'rish ruxsati talab qilinadi. Ilgari bu amal umuman qo'riqlanmagan edi.
  const onPreview = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    store.previewVisible = true
    store.elementId = row.id
    store.previewParams.page = 1
    store.previewList = []
    store.previewTotal = 0
    store._preview()
  }

  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return
    // `parentElement` ni faqat Filter.vue ("Yangi qo'shish") tozalardi. Bir marta
    // "Biriktirish" bosilgach u store'da qolib ketardi va keyingi HAR QANDAY
    // tahrirlash oynasida ota-bo'lim bloki yashirinib (createForm.vue
    // `v-if="!Boolean(store.parentElement)"`), tepada eski bo'lim nomi bannerda
    // osilib turardi — foydalanuvchi ota-bo'limni na ko'rardi, na o'zgartirardi.
    store.parentElement = null
    store.elementId = row.id
    componentStore._departments()
    componentStore._regions()
    store._level()
    store.payload.name = row.name
    store.payload.name_ru = row.name_ru
    store.payload.name_en = row.name_en
    store.payload.comment = row.comment
    store.payload.level = row.level.id
    // Daraxtdan ochilgan ichki bo'limda `parent` yo'q — ota daraxt tugunidan olinadi.
    const parent = row.parent ?? (row.__parent ? { id: row.__parent.id, name: row.__parent.name } : null)
    store.showParent = Boolean(parent?.id)
    store.payload.parent_id = parent?.id ?? null
    store.payload.region_id = row.region?.id ?? row.region_id ?? null
    store.payload.city_id = row.city?.id ?? row.city_id ?? null
    if (store.payload.region_id) {
      store._districts(store.payload.region_id)
    }
    componentStore.departmentList = parent ? [parent] : []
    store.refreshTarget = row.__parent
    store.visibleType = false
    store.visible = true
  }

  const onAddChild = (row) => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return
    componentStore._departments()
    componentStore._structures()
    componentStore._regions()
    store._level()
    store.resetForm()
    store.elementId = row.id
    store.parentElement = { name: row.name, id: row.id }
    store.payload.parent_id = row.id
    // `_create` `parent_id` ni faqat `showParent` yoqilganda yuboradi. Ilgari bu yerda
    // yoqilmagani uchun «Biriktirish» bilan qo'shilgan bo'lim ota-bo'limsiz (ildiz) saqlanardi.
    store.showParent = true
    // Backend: «Yuqori bo'lim shu tashkilotga tegishli bo'lishi kerak» — tashkilot otasidan olinadi
    // (formada «Tashkilot» maydoni bu holatda yashirin).
    store.payload.organization_id = row.organization?.id ?? null
    store.refreshTarget = row
    store.visibleType = true
    store.visible = true
  }

  const onDelete = (row) => {
    if (!accStore.checkAction(accStore.pn.hrDepartmentsWrite)) return
    store._delete(row)
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  // Ierarxik tartib raqami: ildiz qatorlar — sahifa bo'yicha (1, 2, 3…), ichkilari —
  // ota raqami + o'z o'rni (1.1, 1.2, 1.2.1…). Ilgari ichki qatorlarda № bo'sh edi.
  const rowNumber = (row) => {
    if (!row.__parent) {
      return (store.params.page - 1) * store.params.per_page + store.list.indexOf(row) + 1
    }
    return `${rowNumber(row.__parent)}.${row.__parent.children.indexOf(row) + 1}`
  }

  const columns = computed(() => [
    // Daraxt nom ustunida: Naive har daraja uchun 20px (`indent`) suradi — bolaning
    // strelkasi otasining papkasi tagidan boshlanadi.
    {
      key: 'name',
      minWidth: 280,
      tree: true,
      className: 'department-tree__cell'
    },
    {
      key: 'organization.name',
      title: t('content.organization'),
      minWidth: 200
    },
    {
      key: 'level.name',
      title: t('departmentPage.form.level'),
      width: 160
    },
    {
      key: 'worker_rate',
      title: t('departmentPositionPage.table.fact'),
      // «F» — hover'da to'liq nomi (DAS-11666).
      fullTitle: t('departmentPositionPage.form.fact'),
      width: 100,
      align: 'center'
    },
    {
      key: 'comment',
      title: t('content.comment'),
      width: 200
    }
  ])

  const actions = computed(() => [
    {
      label: t('content.attachment'),
      key: Utils.ActionTypes.attachment,
      icon: UIHelper.renderIcon(OpenFolder24Filled),
      action: onAddChild,
      // Pastki bo'lim qo'shish — bo'lim yozish ruxsati bo'lmasa (masalan HR yordamchisi) o'chiq.
      disabled: !accStore.checkPermission(accStore.pn.hrDepartmentsWrite)
    },
    {
      label: t('content.edit'),
      key: Utils.ActionTypes.edit,
      icon: UIHelper.renderIcon(Edit32Regular),
      action: onEdit
    },
    {
      label: t('content.delete'),
      key: Utils.ActionTypes.delete,
      icon: UIHelper.renderIcon(Delete20Regular),
      action: onDelete
    },
    {
      label: t('content.worker'),
      key: Utils.ActionTypes.view,
      icon: UIHelper.renderIcon(Eye16Regular),
      action: onPreview,
      // `permission-prefix` faqat edit/delete'ni avtomatik qo'riqlaydi; `view`
      // nostandart bo'lgani uchun o'z slug'i qo'lda bog'lanadi.
      disabled: !accStore.checkPermission(accStore.pn.hrWorkersRead)
    }
  ])
</script>

<template>
  <UITable
    permission-prefix="hr-departments"
    :columns="columns"
    :actions="actions"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    :on-load="onLoad"
    :render-expand-icon="renderExpandIcon"
    :indent="20"
    storage-key="hrm-department"
    @change-page="changePage"
  >
    <template #cell-__index="{ row }">
      <span :class="row.__parent ? 'text-[11px] text-textColor3' : ''">{{ rowNumber(row) }}</span>
    </template>

    <template #header-name>
      <n-select
        v-model:value="store.headerLang"
        :options="headerOption"
        value-field="id"
        label-field="name"
        class="min-w-32"
      />
    </template>

    <template #cell-name="{ row }">
      <span class="department-tree__folder">
        <FileIcon v-if="isLeafRow(row)" />
        <FolderIcon v-else />
      </span>
      <span class="department-tree__name" :class="row.__parent ? 'text-textColor1' : 'font-medium'">
        {{ row[store.headerLang] }}
      </span>
    </template>

    <template #cell-worker_rate="{ row }">
      <n-button secondary v-if="row.worker_rate" size="small" circle>{{ row.worker_rate }}</n-button>
    </template>

    <template #cell-comment="{ row }">
      <div class="text-xs line-clamp-3">{{ row.comment }}</div>
    </template>
  </UITable>
</template>

<style>
  /* Fayl menejeri uslubi. Katak ichida: 8px chekka, har daraja 20px (`indent`),
     strelka 16px + 4px, papka 18px + 6px, keyin nom. Naive katakka `--indent-offset`
     (daraja, 0 — ildiz) beradi. */

  /* Ierarxiya chiziqlari: har bir ajdod strelkasining markazidan (8 + 20k + 8 px)
     butun qator balandligi bo'ylab tik chiziq — qatorlar ulanib, uzluksiz bo'ladi. */
  td.department-tree__cell {
    background-image: repeating-linear-gradient(
      to right,
      transparent 0 7.5px,
      var(--table-border) 7.5px 8.5px,
      transparent 8.5px 20px
    );
    background-size: calc(var(--indent-offset, 0) * 20px) 100%;
    background-position: 8px 0;
    background-repeat: no-repeat;
  }

  /* Strelka va bo'sh joy (ichki bo'limi yo'q qator) — bir xil 16 + 4px, papkalar bir ustunda */
  .department-tree__cell .n-data-table-expand-trigger,
  .department-tree__cell .n-data-table-expand-placeholder {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    vertical-align: -0.2em;
  }

  /* Ochiq ota: strelka tagidan pastga chiziq — birinchi bolaning chizig'iga ulanadi.
     Keyingi qatorning to'liq foni ortiqchasini yopadi, shuning uchun uzunligi zaxira bilan. */
  .department-tree__cell .n-data-table-expand-trigger--expanded::after {
    content: '';
    position: absolute;
    left: 7.5px;
    top: calc(100% + 3px);
    width: 1px;
    height: 48px;
    background: var(--table-border);
    pointer-events: none;
  }

  .department-tree__chevron {
    position: absolute;
    inset: 0;
    display: flex;
    color: var(--fig-text-tertiary);
    transform: rotate(-90deg);
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }

  .department-tree__chevron[data-open] {
    transform: rotate(0deg);
  }

  .department-tree__chevron svg {
    width: 16px;
    height: 16px;
  }

  .department-tree__cell .n-data-table-expand-trigger:hover .department-tree__chevron {
    color: var(--fig-icon-brand);
  }

  .department-tree__folder {
    display: inline-flex;
    width: 18px;
    height: 18px;
    margin-right: 6px;
    vertical-align: -0.25em;
    color: var(--fig-text-tertiary);
  }

  .department-tree__folder svg {
    width: 18px;
    height: 18px;
  }

  /* Uzun nom papka ostiga emas, o'z ustunida o'raladi (daraja + strelka 20 + papka 24px) */
  .department-tree__name {
    display: inline-block;
    max-width: calc(100% - var(--indent-offset, 0) * 20px - 44px);
    vertical-align: top;
  }
</style>
