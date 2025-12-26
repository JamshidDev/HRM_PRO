<script setup>
  import { useAccountStore, useSalaryReportStore } from '@/store/modules/index.js'
  import 'vue3-virtual-scroller/dist/vue3-virtual-scroller.css'
  import Utils from '@/utils/Utils.js'
  import { AppPaths } from '@/utils/index.js'
  const store = useSalaryReportStore()
  const accStore = useAccountStore()
  const router = useRouter()

  const totalCol = computed(() => Number(Object.keys(store.organizationList).length) + 4)
  const organizationCount = computed(() => Number(Object.keys(store.organizationList).length))

  const goPush = (v, month) => {
    router.push({
      path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
      query: {
        month: store.params.month,
        year: store.params.year,
        code: v.type_code
      }
    })
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistStatementsCode)) return
    if (store.organizationData.length === 0) {
      store._indexOrg()
    }
  })
</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full pb-4 mt-4 overflow-y-auto h-[calc(100vh-210px)]">
      <n-table
        class="sticky-table-header sticky-table-body-element table-hover-row"
        :single-line="false"
        size="small"
      >
        <thead>
          <tr>
            <th :colspan="totalCol">{{ $t('salaryReport.form.title') }}</th>
          </tr>
          <tr>
            <th rowspan="2" class="min-w-[40px] w-[40px] !text-center">#</th>
            <th rowspan="2" class="min-w-[400px] !text-center">
              {{ $t('salaryReport.form.name') }}
            </th>
            <th rowspan="2" class="min-w-[60px] w-[60px] !text-center">
              {{ $t('salaryReport.form.code') }}
            </th>
            <th :colspan="organizationCount" v-if="organizationCount" class="min-w-[60px] w-[60px]">
              {{ $t('content.organization') }}
            </th>
            <th
              rowspan="3"
              class="min-w-[150px] w-[150px] !text-center sticky-element !right-0 !border"
            >
              {{ $t('salaryReport.form.total') }}
            </th>
          </tr>
          <tr>
            <template v-for="item in store.organizationList" :key="item.key">
              <th class="min-w-[150px] w-[150px] !text-center !border-r">{{ item }}</th>
            </template>
          </tr>
          <tr>
            <th class="!border-r" :colspan="totalCol - 1">
              {{ $t('salaryReport.form.salaryType') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, idx) in store.organizationData" :key="idx">
            <tr
              class="!text-right"
              :class="[!Boolean(item.type_code.toString().trim()) && '!font-semibold selectedRow']"
            >
              <td class="!text-center">{{ idx + 1 }}</td>
              <td class="sticky-element !left-0 text-left">{{ item.type_name }}</td>
              <td @click="goPush(item)" class="!font-semibold sticky-element !left-[400px]">
                <span class="hover:text-primary">{{ item.type_code }}</span>
              </td>
              <template v-for="(value, key) in item" :key="key">
                <td v-if="!['type_name', 'type_code', 'total_year', 'id'].includes(key)">
                  {{ value }}
                </td>
              </template>
              <td class="sticky-element !right-0 !border-l">{{ item.total_year }}</td>
            </tr>
          </template>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>
