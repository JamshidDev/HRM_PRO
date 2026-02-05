<script setup>
  import { useAccountStore, useSalaryReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { AppPaths, getOneMonthAgoYearMonth } from '@/utils/index.js'
  const router = useRouter()
  const store = useSalaryReportStore()
  const accStore = useAccountStore()

  const goPush = (v, month) => {
    router.push({
      path: Utils.routeAccountantPathMaker(AppPaths.MonthReport),
      query: {
        month,
        year: store.params.year,
        code: v.type_code
      }
    })
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.economistStatementsCode)) return
    if (store.list.length === 0) {
      const oneMonthAgo = getOneMonthAgoYearMonth()
      store.params.year = oneMonthAgo.year
      store.params.month = oneMonthAgo.month
      store._index()
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
            <th colspan="16" class="!text-center">{{ $t('salaryReport.form.title') }}</th>
          </tr>
          <tr>
            <th rowspan="2" class="min-w-[40px] w-[40px] !text-center">#</th>
            <th rowspan="2" class="min-w-[400px] w-[400px] !text-center">
              {{ $t('salaryReport.form.name') }}
            </th>
            <th rowspan="2" class="!text-center">{{ $t('salaryReport.form.type') }}</th>
            <th colspan="12" class="!text-center">2025</th>
            <th
              rowspan="2"
              class="min-w-[160px] w-[160px] !text-center sticky-element !right-0 !border-l"
            >
              {{ $t('salaryReport.form.fromYear') }}
            </th>
          </tr>
          <tr>
            <template v-for="item in Utils.monthList" :key="item.id">
              <th class="min-w-[150px] w-[150px] !text-center">{{ item.name }}</th>
            </template>
          </tr>
          <tr>
            <th colspan="16">{{ $t('salaryReport.form.salaryType') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, idx) in store.list" :key="idx">
            <tr
              class="!text-right"
              :class="[!Boolean(item.type_code.toString().trim()) && '!font-semibold selectedRow']"
            >
              <td class="!text-center">{{ idx + 1 }}</td>
              <td class="sticky-element text-left !left-0">{{ item.type_name }}</td>
              <td class="!text-center !font-semibold sticky-element !left-[400px]">
                {{ item.type_code }}
              </td>
              <template v-for="index in 12" :key="index">
                <td>
                  <span @click="goPush(item, index)" class="hover:text-primary cursor-pointer">{{
                    item?.[index]
                  }}</span>
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
