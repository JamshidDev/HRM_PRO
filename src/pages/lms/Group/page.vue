<script setup>
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore, useLmsGroupStore } from '@/store/modules/index.js'
  import { ArrowLeft16Filled, ArrowSync20Filled } from '@vicons/fluent'

  import Table from './ui/Table.vue'
  import PreviewList from './ui/PreviewList.vue'
  import CertificateCertificateUpdateModal from '@/pages/lms/Certificate/ui/CreateForm.vue'
  import Utils from '@/utils/Utils.js'
  import { AppPaths } from '@/utils/index.js'

  const router = useRouter()
  const route = useRoute()
  const store = useLmsGroupStore()
  const accStore = useAccountStore()

  onMounted(() => {
    store.params.edu_plan_id = route.params.id
    if (!accStore.checkAction(accStore.pn.lmsGroupsRead)) return
    store._index()
  })
</script>

<template>
  <UIPageContent>
    <div class="flex justify-between">
      <n-button
        @click="router.push(Utils.routeLmsPathMaker(AppPaths.EduPlan))"
        secondary
        round
        size="small"
        type="error"
      >
        {{ $t('content.back') }}
        <template #icon>
          <ArrowLeft16Filled />
        </template>
      </n-button>
      <n-button :loading="store.loading" @click="store._index()" size="small" type="primary">
        {{ $t('content.refresh') }}
        <template #icon>
          <ArrowSync20Filled />
        </template>
      </n-button>
    </div>
    <Table />
    <UIModal
      :width="800"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="$t('groupPage.createTitle')"
    >
      <template #default>
        <PreviewList />
      </template>
    </UIModal>
    <CertificateCertificateUpdateModal/>
  </UIPageContent>
</template>
