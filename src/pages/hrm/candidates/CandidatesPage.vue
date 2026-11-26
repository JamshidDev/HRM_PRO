<script setup>
  // «Hisobotlar → Nomzodlar» — lavozimga hali qabul qilinmagan, korxonadan kiritilgan xodimlar.
  import { UIPageContent, UIPageFilter, UITable, UIUser, UIPhoneNumber } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { AppPaths, useDebounce } from '@/utils/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useRouter } from 'vue-router'
  import PenSquareIcon from '@/assets/icons/penSquareAlt.svg'
  import CopyIcon from '@/assets/icons/copyIcon.svg'
  import EditModal from './ui/EditModal.vue'

  const { t } = i18n.global
  const router = useRouter()
  const accStore = useAccountStore()

  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  const params = reactive({ page: 1, per_page: 15, search: null })

  const load = () => {
    loading.value = true
    $ApiService.workerService
      ._candidates({ params: { ...params, search: params.search || undefined } })
      .then((res) => {
        list.value = res.data.data.data
        total.value = res.data.data.total
      })
      .finally(() => (loading.value = false))
  }
  const searchDebounced = useDebounce(() => {
    params.page = 1
    load()
  }, 600)
  const onClear = () => {
    params.search = null
    params.page = 1
    load()
  }
  const changePage = (v) => {
    params.page = v.page
    params.per_page = v.per_page
    load()
  }

  // Ismni bosish — avvalgidek xodim profiliga o'tadi.
  const openProfile = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    router.push({ path: `${AppPaths.Hrm}${AppPaths.WorkerProfile}`, query: { id: row.uuid } })
  }

  // «Tahrirlash» — kichik oyna: faqat JSHSHIR va telefon.
  const editVisible = ref(false)
  const editRow = ref(null)
  const onEdit = (row) => {
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
    editRow.value = row
    editVisible.value = true
  }
  const onSaved = () => load()

  // Tartib: kim (ism + telefon) → JSHSHIR → tug'ilgan sana → kim kiritgan (ism + telefon) → qachon.
  // Hamma ustun qat'iy (`width`): ortiqcha joy mutanosib bo'linadi, ism kesilib qolmaydi.
  const columns = computed(() => [
    { key: 'worker', title: t('workerPage.candidates.fullName'), width: 300, minWidth: 220, maxWidth: 520 },
    { key: 'pin', title: t('workerPage.candidates.pin'), width: 170 },
    { key: 'birthday', title: t('workerPage.candidates.birthday'), width: 130 },
    { key: 'created_by', title: t('workerPage.candidates.createdBy'), width: 300, minWidth: 220, maxWidth: 520 },
    { key: 'created_at', title: t('content.date'), width: 130 }
  ])
  const actions = computed(() => [
    { label: t('workerPage.candidates.edit'), key: Utils.ActionTypes.edit, icon: UIHelper.renderIcon(PenSquareIcon), action: onEdit }
  ])

  // Loyihadagi umumiy nusxalash (koordinatalar bilan bir xil): `Utils.copyToClipboard` + toast.
  const copyText = (text) => Utils.copyToClipboard(String(text), () => $Toast.success(t('content.copied')))

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.hrWorkersRead)) return
    load()
  })
</script>

<template>
  <UIPageContent>
  <UIPageFilter
    :search-loading="loading"
    v-model:search="params.search"
    @onSearch="searchDebounced"
    @onClear="onClear"
    :show-add-button="false"
    :show-filter-button="false"
  />
  <UITable
    permission-prefix="hr-workers"
    :columns="columns"
    :actions="actions"
    :data="list"
    :loading="loading"
    :page="params.page"
    :per-page="params.per_page"
    :total="total"
    storage-key="hrm-worker-candidates-v3"
    @change-page="changePage"
  >
    <template #cell-worker="{ row }">
      <UIUser
        @onClickFullName="openProfile(row)"
        :short="false"
        :data="{ photo: row.photo, firstName: row.first_name, middleName: row.middle_name, lastName: row.last_name }"
      >
        <!-- Ism ostida telefon + nusxalash -->
        <template #position>
          <div v-if="row.phone" class="flex items-center gap-1 text-xs text-textColor3">
            <UIPhoneNumber :phone="row.phone" fallback="" class="whitespace-nowrap" />
            <n-icon
              size="14"
              class="cursor-pointer text-primary shrink-0"
              :title="$t('content.copy')"
              @click.stop="copyText(row.phone)"
            >
              <CopyIcon />
            </n-icon>
          </div>
          <span v-else></span>
        </template>
      </UIUser>
    </template>
    <template #cell-pin="{ row }">
      <div v-if="row.pin" class="flex items-center gap-1">
        <span class="whitespace-nowrap">{{ row.pin }}</span>
        <n-icon
          size="14"
          class="cursor-pointer text-primary shrink-0"
          :title="$t('content.copy')"
          @click.stop="copyText(row.pin)"
        >
          <CopyIcon />
        </n-icon>
      </div>
    </template>
    <template #cell-birthday="{ row }">{{ Utils.timeOnlyDate(row.birthday) }}</template>
    <!-- Kim kiritgan: rasm + to'liq ism, ostida telefon + nusxalash. Bo'sh bo'lsa — katak bo'sh. -->
    <template #cell-created_by="{ row }">
      <UIUser
        v-if="row.created_by"
        :short="false"
        :data="{
          photo: row.created_by.photo,
          lastName: row.created_by.last_name,
          firstName: row.created_by.first_name,
          middleName: row.created_by.middle_name
        }"
      >
        <template #position>
          <div v-if="row.created_by.phone" class="flex items-center gap-1 text-xs text-textColor3">
            <UIPhoneNumber :phone="row.created_by.phone" fallback="" class="whitespace-nowrap" />
            <n-icon
              size="14"
              class="cursor-pointer text-primary shrink-0"
              :title="$t('content.copy')"
              @click.stop="copyText(row.created_by.phone)"
            >
              <CopyIcon />
            </n-icon>
          </div>
          <span v-else></span>
        </template>
      </UIUser>
    </template>
    <template #cell-created_at="{ row }">{{ Utils.timeOnlyDate(row.created_at) }}</template>
  </UITable>
  <EditModal v-model:visible="editVisible" :row="editRow" @saved="onSaved" />
  </UIPageContent>
</template>
