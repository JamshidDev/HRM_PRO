<script setup>
  import { ref, computed, watch } from 'vue'
  import { UIModal } from '@/components/index.js'
  import {
    Search24Regular,
    ArrowSync24Filled,
    ErrorCircle24Filled,
    DismissCircle16Filled
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import { useTurnstileHikCentralWorkerStore } from '@/store/modules/index.js'
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

  const filteredAccessLevels = computed(() => {
    if (!searchQuery.value) return store.moreAccessLevels

    return store.moreAccessLevels.filter((level) => {
      return level.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    })
  })

  const onRefresh = (level) => {
    emit('refresh', level)
  }

  const onOpenErrorEv = (v) => {
    store.elementId = v.id
    const params = {
      access_level_id: v.id
    }
    store._getErrors(params)
  }

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        searchQuery.value = ''
      }
    }
  )
</script>

<template>
  <UIModal
    :visible="visible"
    @update:visible="(v) => emit('update:visible', v)"
    :title="`${workerName} - ${$t('accessLevel.title')}`"
    :width="600"
  >
    <template #default>
      <n-spin :show="store.moreAccessLevelsLoading">
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
            <div
              v-if="filteredAccessLevels.length === 0 && !store.moreAccessLevelsLoading"
              class="text-center py-8 text-gray-500"
            >
              {{
                searchQuery ? $t('accessLevel.noSearchResults') : $t('accessLevel.noAccessLevels')
              }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="level in filteredAccessLevels"
                :key="level.id"
                class="border border-surface-line rounded-lg bg-surface-ground px-4 hover:bg-surface-ground transition-colors"
              >
                <div class="flex items-center justify-between py-2">
                  <span class="font-semibold text-textColor flex items-center gap-2">
                    <n-icon
                      size="20"
                      class="text-danger cursor-pointer"
                      v-if="level.type === 'error'"
                    >
                      <DismissCircle16Filled
                        @click.stop="store.elementId = null"
                        v-if="store.elementId === level.id"
                      />
                      <ErrorCircle24Filled @click.stop="onOpenErrorEv(level)" v-else />
                    </n-icon>
                    {{ level.name }}</span
                  >
                  <n-button
                    @click="onRefresh(level)"
                    size="tiny"
                    ghost
                    round
                    :loading="store.loading"
                    :disabled="store.loading"
                    :type="level.type || 'default'"
                  >
                    <template #icon>
                      <n-icon size="16" v-if="!store.loading">
                        <ArrowSync24Filled />
                      </n-icon>
                    </template>
                    {{ $t('accessLevel.refresh') }}
                  </n-button>
                </div>
                <n-collapse-transition :show="level.id === store.elementId">
                  <n-spin :show="store.errorLoading">
                    <div class="w-full min-h-[100px]">
                      <template v-for="item in store.errorList" :key="item.id">
                        <div class="bg-surface-section/60 p-2 rounded-lg mt-2">
                          <div class="flex justify-between">
                            <n-button size="tiny" type="primary" secondary>{{
                              item.name
                            }}</n-button>
                            <n-button text size="tiny">{{ item.time }}</n-button>
                          </div>

                          <div class="text-danger block mt-1">
                            {{ item.code }}
                          </div>
                        </div>
                      </template>
                    </div>
                  </n-spin>
                </n-collapse-transition>
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
      </n-spin>
    </template>
  </UIModal>
</template>
