<script setup>
  import { CodeCircle20Regular, Globe20Regular, Copy20Regular } from '@vicons/fluent'
  import { UIBadge, UIModal, UITable } from '@/components/index.js'
  import { useIntegrationClientsStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { useMessage } from 'naive-ui'

  const { t } = i18n.global
  const store = useIntegrationClientsStore()
  const showModal = ref(false)
  const selectedItem = ref(null)
  const message = useMessage()

  const methodType = (method) => {
    if (method === 'GET') return Utils.colorTypes.info
    if (method === 'POST') return Utils.colorTypes.success
    if (method === 'PUT') return Utils.colorTypes.warning
    if (method === 'DELETE') return Utils.colorTypes.error
    if (method === 'PATCH') return Utils.colorTypes.warning
    return Utils.colorTypes.secondary
  }

  const statusType = (status) => {
    if (status === 200) return Utils.colorTypes.success
    return Utils.colorTypes.error
  }

  const apiTypeColor = (apiType) => {
    const type = apiType?.toLowerCase()
    if (type === 'sanctum') return Utils.colorTypes.info
    if (type === 'bearer') return Utils.colorTypes.success
    if (type === 'basic') return Utils.colorTypes.warning
    if (type === 'api_key') return Utils.colorTypes.dark
    return Utils.colorTypes.secondary
  }

  const durationColor = (ms) => {
    if (ms < 200) return Utils.colorTypes.success
    if (ms >= 200 && ms <= 500) return Utils.colorTypes.warning
    return Utils.colorTypes.error
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const openDetail = (item) => {
    selectedItem.value = item
    showModal.value = true
  }

  const formatJson = (data) => {
    try {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data), null, 2)
      }
      return JSON.stringify(data, null, 2)
    } catch {
      return data
    }
  }

  const copyToClipboard = async (data) => {
    try {
      const text = formatJson(data)
      await navigator.clipboard.writeText(text)
      message.success('Nusxalandi!')
    } catch {
      message.error('Nusxalashda xatolik')
    }
  }

  const columns = computed(() => [
    {
      key: 'secret',
      title: t('integrationLog.table.secret'),
      width: 300
    },
    {
      key: 'api_type',
      title: t('integrationLog.table.apiType'),
      width: 200
    },
    {
      key: 'method',
      title: t('integrationLog.table.method'),
      width: 200
    },
    {
      key: 'endpoint',
      title: t('integrationLog.table.endpoint'),
      minWidth: 250
    },
    {
      key: 'response_status',
      title: t('integrationLog.table.status'),
      width: 80
    },
    {
      key: 'duration_ms',
      title: t('integrationLog.table.duration'),
      width: 80
    },
    {
      key: 'detail',
      title: t('integrationLog.table.detail'),
      width: 100,
      align: 'center'
    },
    {
      key: 'created_at',
      title: t('content.date'),
      width: 120,
      align: 'center'
    }
  ])
</script>

<template>
  <UITable
    :columns="columns"
    :data="store.list"
    :loading="store.loading"
    :page="store.params.page"
    :per-page="store.params.per_page"
    :total="store.totalItems"
    @change-page="changePage"
  >
    <template #cell-secret="{ row }">
      <span class="text-xs font-mono font-bold">{{ row.secret }}</span>
    </template>

    <template #cell-api_type="{ row }">
      <UIBadge
        :label="row.api_type"
        :type="apiTypeColor(row.api_type)"
        :show-icon="false"
        class="!w-auto"
      />
    </template>

    <template #cell-method="{ row }">
      <UIBadge
        :label="row.method"
        :type="methodType(row.method)"
        :show-icon="false"
        class="!w-auto"
      />
    </template>

    <template #cell-endpoint="{ row }">
      <span
        class="text-xs font-mono break-all cursor-pointer hover:text-primary hover:underline transition-colors"
        @click="openDetail(row)"
      >
        {{ row.endpoint }}
      </span>
    </template>

    <template #cell-response_status="{ row }">
      <UIBadge
        :label="String(row.response_status)"
        :type="statusType(row.response_status)"
        :show-icon="false"
        class="!w-auto"
      />
    </template>

    <template #cell-duration_ms="{ row }">
      <UIBadge
        :label="`${row.duration_ms} ms`"
        :type="durationColor(row.duration_ms)"
        :show-icon="false"
        class="!w-auto"
      />
    </template>

    <template #cell-detail="{ row }">
      <n-button size="small" type="primary" quaternary @click="openDetail(row)">
        <template #icon>
          <n-icon><CodeCircle20Regular /></n-icon>
        </template>
        {{ $t('content.view') }}
      </n-button>
    </template>

    <template #cell-created_at="{ row }">
      {{ Utils.timeWithMonth(row?.created_at) }}
    </template>
  </UITable>

  <!-- Detail Modal -->
  <UIModal v-model:visible="showModal" :title="$t('integrationLog.table.detail')" width="800">
    <template #header-title>
      <div v-if="selectedItem" class="flex items-center gap-1.5 flex-wrap">
        <UIBadge
          :label="selectedItem.method"
          :type="methodType(selectedItem.method)"
          :show-icon="false"
          class="!w-auto badge-sm"
        />
        <UIBadge
          :label="String(selectedItem.response_status)"
          :type="statusType(selectedItem.response_status)"
          :show-icon="false"
          class="!w-auto badge-sm"
        />
        <UIBadge
          :label="selectedItem.api_type"
          :type="apiTypeColor(selectedItem.api_type)"
          :show-icon="false"
          class="!w-auto badge-sm"
        />
        <UIBadge
          :label="`${selectedItem.duration_ms} ms`"
          :type="Utils.colorTypes.error"
          :show-icon="false"
          class="!w-auto badge-sm"
        />
      </div>
      <span v-else>{{ $t('integrationLog.table.detail') }}</span>
    </template>
    <div v-if="selectedItem" class="flex flex-col gap-2">
      <!-- Info Card -->
      <div class="section-card">
        <div class="section-header section-header--default">
          <n-icon size="12" class="section-icon"><Globe20Regular /></n-icon>
          {{ $t('integrationLog.table.detail') }}
        </div>
        <div class="kv-list">
          <div class="kv-row">
            <span class="kv-label">Secret</span>
            <span class="kv-val font-mono">{{ selectedItem.secret }}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">Endpoint</span>
            <span class="kv-val font-mono text-[10px] break-all">{{ selectedItem.endpoint }}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">{{ $t('content.date') }}</span>
            <span class="kv-val">{{ Utils.timeWithMonth(selectedItem.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Request Headers -->
      <div class="section-card">
        <div class="section-header section-header--warning">
          Request Headers
          <n-button
            size="small"
            text
            class="copy-btn"
            @click="copyToClipboard(selectedItem.request_headers)"
          >
            <template #icon>
              <n-icon size="14"><Copy20Regular /></n-icon>
            </template>
            {{ $t('content.copy') }}
          </n-button>
        </div>
        <pre class="code-block">{{ formatJson(selectedItem.request_headers) }}</pre>
      </div>

      <!-- Request Body -->
      <div class="section-card">
        <div class="section-header section-header--info">
          Request Body
          <n-button
            size="small"
            text
            class="copy-btn"
            @click="copyToClipboard(selectedItem.request_body)"
          >
            <template #icon>
              <n-icon size="14"><Copy20Regular /></n-icon>
            </template>
            {{ $t('content.copy') }}
          </n-button>
        </div>
        <pre class="code-block">{{ formatJson(selectedItem.request_body) }}</pre>
      </div>

      <!-- Error -->
      <div v-if="selectedItem.error" class="section-card section-card--error">
        <div class="section-header section-header--error">
          Error
          <n-button size="small" text class="copy-btn" @click="copyToClipboard(selectedItem.error)">
            <template #icon>
              <n-icon size="14"><Copy20Regular /></n-icon>
            </template>
            {{ $t('content.copy') }}
          </n-button>
        </div>
        <pre class="code-block code-block--error">{{ selectedItem.error }}</pre>
      </div>
    </div>
  </UIModal>
</template>

<style scoped>
  .badge-sm :deep(.flex.gap-1) {
    padding: 2px 8px;
    font-size: 11px;
  }
  .section-card {
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 8px;
    overflow: hidden;
    background: var(--surface-section);
  }
  .section-card--error {
    border: 1px solid color-mix(in srgb, var(--error-color) 30%, var(--surface-line));
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--surface-ground);
    border-bottom: 1px solid var(--surface-line, #e5e7eb);
    font-size: 13px;
    font-weight: 600;
    color: var(--textColor1);
  }
  .section-header--default {
    background: color-mix(in srgb, var(--primary-color) 1%, var(--surface-section));
  }
  .section-header--warning {
    background: color-mix(in srgb, var(--warning-color) 1%, var(--surface-section));
  }
  .section-header--info {
    background: color-mix(in srgb, var(--info-color) 1%, var(--surface-section));
  }
  .section-header--success {
    background: color-mix(in srgb, var(--success-color) 1%, var(--surface-section));
  }
  .section-header--error {
    background: color-mix(in srgb, var(--error-color) 1%, var(--surface-section));
  }

  .section-icon {
    flex-shrink: 0;
    color: var(--textColor1);
  }

  .copy-btn {
    margin-left: auto;
    font-weight: 400;
  }

  .kv-list {
    display: flex;
    flex-direction: column;
    background: var(--surface-section);
  }
  .kv-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--surface-line, #e5e7eb);
  }
  .kv-row:last-child {
    border-bottom: none;
  }
  .kv-label {
    flex-shrink: 0;
    width: 80px;
    font-size: 12px;
    color: var(--textColor3);
  }
  .kv-val {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor0);
  }
  .code-block {
    margin: 0;
    padding: 12px;
    font-size: 14px;
    line-height: 1.5;
    font-family: monospace;
    background: var(--surface-section);
    color: var(--textColor1);
    overflow: auto;
    height: 150px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .code-block--error {
    background: color-mix(in srgb, var(--error-color) 5%, var(--surface-section));
    color: var(--error-color);
  }
</style>
