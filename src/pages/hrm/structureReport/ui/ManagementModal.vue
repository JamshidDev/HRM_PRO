<script setup>
  import { UIModal, UIPagination, NoDataPicture, UISelect, UIYearMonth } from '@/components/index.js'
  import { useStructureReportStore, useComponentStore } from '@/store/modules/index.js'
  import { Delete20Regular, Building20Regular, Add20Regular } from '@vicons/fluent'
  const store = useStructureReportStore()
  const componentStore = useComponentStore()
  const deletingId = ref(null)

  const changePage = (v) => {
    store.reportsPerMonthPage = v.page
    store.reportsPerMonthPerPage = v.per_page
    store._fetchReportsPerMonth()
  }

  let searchTimer = null
  const onSearch = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      store.reportsPerMonthPage = 1
      store._fetchReportsPerMonth()
    }, 400)
  }

  const onDelete = (item) => {
    deletingId.value = item.id
    store._deleteReportsPerMonth(item.id).finally(() => {
      deletingId.value = null
    })
  }

  watch(() => store.managementModalVisible, (v) => {
    if (v) {
      if (!componentStore.structureList.length) componentStore._structures()
    } else {
      store.reportsPerMonthPage = 1
    }
  })
</script>

<template>
  <UIModal
    v-model:visible="store.managementModalVisible"
    :width="780"
    height="90vh"
    :title="$t('structureReport.management')"
  >
    <template #header-title>
      <div class="flex items-center gap-3">
        <span>{{ $t('structureReport.management') }}</span>
        <div class="max-w-[160px]">
          <UIYearMonth
            v-model:year="store.managementYear"
            v-model:month="store.managementMonth"
            :clearable="false"
            @change="() => { store.reportsPerMonthPage = 1; store._fetchReportsPerMonth() }"
          />
        </div>
      </div>
    </template>

    <!-- h-full + overflow-hidden: UIModal default slot scrollini o'chirib, ichida boshqaramiz -->
    <div class="flex flex-col h-full overflow-hidden">

      <!-- Qo'shish card — qimirlamaydi -->
      <div class="flex-shrink-0 rounded-xl p-3 mb-2 border border-surface-line bg-surface-ground">
        <p class="text-xs text-blue-500 mb-2.5 leading-snug">
          {{ $t('structureReport.managementAddHint') }}
        </p>
        <div class="flex items-start gap-2">
          <div class="flex-1">
            <UISelect
              :options="componentStore.structureList"
              :model-v="store.addOrganizations"
              :checked-val="store.addOrganizationsCheck"
              :loading="componentStore.structureLoading"
              v-model:search="componentStore.structureParams.search"
              @updateModel="(v) => (store.addOrganizations = v)"
              @updateCheck="(v) => (store.addOrganizationsCheck = v)"
              @onSearch="componentStore._structures"
              @onSubmit="store._saveReportsPerMonth()"
            />
          </div>
          <n-button
            type="primary"
            :loading="store.addLoading"
            :disabled="!store.addOrganizations.length"
            @click="store._saveReportsPerMonth()"
          >
            <template #icon>
              <n-icon><Add20Regular /></n-icon>
            </template>
            {{ $t('content.add') }}
          </n-button>
        </div>
      </div>

      <n-divider class="!my-1 flex-shrink-0" />

      <!-- Search -->
      <div class="flex-shrink-0 mb-2">
        <n-input
          v-model:value="store.reportsPerMonthSearch"
          :placeholder="$t('content.search')"
          clearable
          @input="onSearch"
          @clear="onSearch"
        />
      </div>

      <!-- List — faqat shu qism scroll bo'ladi -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <n-spin :show="store.reportsPerMonthLoading" content-class="min-h-[100px]">
          <div v-if="store.reportsPerMonth.length" class="flex flex-col gap-1">
            <div
              v-for="(item, idx) in store.reportsPerMonth"
              :key="item.id"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-surface-line bg-surface-bg hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-150 group"
            >
              <span class="text-xs text-gray-400 w-5 text-center flex-shrink-0">
                {{ (store.reportsPerMonthPage - 1) * store.reportsPerMonthPerPage + idx + 1 }}
              </span>

              <n-icon size="15" class="text-blue-400 flex-shrink-0">
                <Building20Regular />
              </n-icon>

              <div class="flex-1 min-w-0 flex items-center gap-2">
                <span class="text-[13px] text-textColor0 truncate">{{ item.organization?.name }}</span>
                <n-tag v-if="item.organization?.group" type="info" size="tiny" round>
                  {{ $t('structureReport.managementGroup') }}
                </n-tag>
              </div>

              <n-popconfirm @positive-click="onDelete(item)" placement="left">
                <template #trigger>
                  <n-button
                    type="error"
                    size="tiny"
                    quaternary
                    :loading="deletingId === item.id"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <template #icon>
                      <n-icon><Delete20Regular /></n-icon>
                    </template>
                    {{ $t('content.delete') }}
                  </n-button>
                </template>
                {{ $t('content.confirmDelete') }}
              </n-popconfirm>
            </div>
          </div>

          <NoDataPicture v-if="!store.reportsPerMonth.length && !store.reportsPerMonthLoading" />
        </n-spin>
      </div>
    </div>

    <template #footer>
      <UIPagination
        v-if="store.reportsPerMonth.length"
        :page="store.reportsPerMonthPage"
        :per_page="store.reportsPerMonthPerPage"
        :total="store.reportsPerMonthTotal"
        @change-page="changePage"
      />
    </template>
  </UIModal>
</template>
