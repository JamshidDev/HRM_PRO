<script setup>
  import { NoDataPicture } from '@/components/index.js'
  import { useStructureReportStore } from '@/store/modules/index.js'

  const props = defineProps({
    organizationId: {
      type: [Number, String],
      required: true
    }
  })

  const store = useStructureReportStore()

  const orgData = computed(() => {
    return store.reportData.find((v) => String(v.organization_id) === String(props.organizationId))
  })

  const getMenKey = (item) => item.man_woman?.[0]

  const getWomenKey = (item) => item.man_woman?.[1]
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-auto max-h-[calc(85vh-280px)]" v-if="store.reportLabels && store.reportLabels.length > 0 && orgData">
      <n-table :single-line="false" size="small" style="overflow: visible">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[60px] th-sticky">{{ $t('content.number') }}</th>
            <th class="min-w-[300px] th-sticky">{{ $t('content.name') }}</th>
            <th class="min-w-[100px] w-[120px] text-center! th-sticky">{{ $t('enum.man') }}</th>
            <th class="min-w-[100px] w-[120px] text-center! th-sticky">{{ $t('enum.woman') }}</th>
            <th class="min-w-[100px] w-[120px] text-center! th-sticky">{{ $t('content.count') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.reportLabels" :key="item.key">
            <td class="text-center">{{ idx + 1 }}</td>
            <td :colspan="item.man_woman && item.man_woman.length > 0 ? 1 : 3">{{ item.name }}</td>
            <td v-if="item.man_woman && item.man_woman.length > 0" class="text-center font-medium">
              <n-input-number
                v-if="item.change === true"
                :value="store.getStatValue(orgData, getMenKey(item))"
                @update:value="(v) => store.setStatValue(orgData, getMenKey(item), v)"
                size="small"
                :show-button="false"
                :min="0"
                class="input-editable"
              />
              <span v-else>{{ store.getStatValue(orgData, getMenKey(item)) !== 0 ? store.getStatValue(orgData, getMenKey(item)) : '' }}</span>
            </td>
            <td v-if="item.man_woman && item.man_woman.length > 0" class="text-center font-medium">
              <n-input-number
                v-if="item.change === true"
                :value="store.getStatValue(orgData, getWomenKey(item))"
                @update:value="(v) => store.setStatValue(orgData, getWomenKey(item), v)"
                size="small"
                :show-button="false"
                :min="0"
                class="input-editable"
              />
              <span v-else>{{ store.getStatValue(orgData, getWomenKey(item)) !== 0 ? store.getStatValue(orgData, getWomenKey(item)) : '' }}</span>
            </td>
            <td class="text-center font-medium">
              <n-input-number
                v-if="item.change === true"
                :value="store.getStatValue(orgData, item.key)"
                @update:value="(v) => store.setStatValue(orgData, item.key, v)"
                size="small"
                :show-button="false"
                :min="0"
                class="input-editable"
              />
              <span v-else>{{ store.getStatValue(orgData, item.key) !== 0 ? store.getStatValue(orgData, item.key) : '' }}</span>
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
    <NoDataPicture v-if="(!store.reportLabels || store.reportLabels.length === 0) && !store.loading" />
  </n-spin>
</template>

<style scoped>
  .th-sticky {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white !important;
    border-color: transparent !important;
    box-shadow: inset 0 1px 0 #efeff5, inset 0 -1px 0 #efeff5, inset 1px 0 0 #efeff5, inset -1px 0 0 #efeff5;
  }

  .input-editable :deep(.n-input) {
    --n-border: 1px solid #f0a020 !important;
    --n-border-hover: 1px solid #f0a020 !important;
    --n-border-focus: 1px solid #f0a020 !important;
    --n-box-shadow-focus: 0 0 0 2px rgba(240, 160, 32, 0.2) !important;
  }
</style>
