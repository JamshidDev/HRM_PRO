<script setup>
import { ref, computed, watch } from 'vue'
import { UIModal } from '@/components/index.js'
import { Search24Regular, ArrowSync24Filled } from '@vicons/fluent'
import i18n from '@/i18n/index.js'
import {useTurnstileHikCentralWorkerStore} from "@/store/modules/index.js"
const store = useTurnstileHikCentralWorkerStore()

const { t } = i18n.global

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  accessLevels: {
    type: Array,
    default: () => []
  },
  workerName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'refresh'])

const searchQuery = ref('')
const refreshLoading = ref(false)

const filteredAccessLevels = computed(() => {
  if (!searchQuery.value) return props.accessLevels
  
  return props.accessLevels.filter(level => 
    level.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})


const onRefresh = (level) => {
  emit('refresh', level)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
  }
})
</script>

<template>
  <UIModal
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    :title="`${workerName} - ${$t('accessLevel.title')}`"
    :width="600"
  >
    <template #default>
      <div class="space-y-4">
        <!-- Search Input -->
        <div class="relative">
          <n-input
            v-model:value="searchQuery"
            :placeholder="$t('content.search')"
            clearable
            class="w-full"
          >
            <template #prefix>
              <n-icon size="20">
                <Search24Regular />
              </n-icon>
            </template>
          </n-input>
        </div>

        <!-- Access Levels List -->
        <div class="h-96 overflow-y-auto px-2">
          <div v-if="filteredAccessLevels.length === 0" class="text-center py-8 text-gray-500">
            {{ searchQuery ? $t('accessLevel.noSearchResults') : $t('accessLevel.noAccessLevels') }}
          </div>
          
          <div v-else class="space-y-3">
            <div
              v-for="level in filteredAccessLevels"
              :key="level.id"
              class="border border-surface-line rounded-lg bg-surface-ground px-4 hover:bg-surface-ground transition-colors"
            >
              <div class="flex items-center justify-between py-2">
                <span class="font-semibold text-textColor">{{ level.name }}</span>
                <n-button
                    @click="onRefresh(level)"
                    size="tiny"
                    ghost
                    round
                    :loading="store.loading"
                    :disabled="store.loading"
                  >
                    <template #icon>
                      <n-icon size="16" v-if="!store.loading">
                        <ArrowSync24Filled />
                      </n-icon>
                    </template>
                    {{ $t('accessLevel.refresh') }}
                  </n-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="border-t border-surface-line pt-4">
          <div class="flex items-center justify-between text-sm mt-1">
            <span class="text-secondary">{{ $t('accessLevel.showing') }}:</span>
            <span class="font-semibold">{{ filteredAccessLevels.length }}</span>
          </div>
        </div>
      </div>
    </template>
  </UIModal>
</template>
