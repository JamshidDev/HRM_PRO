<script setup>
  import { UIUser, UIStatus, UIDConfirm } from '@/components/index.js'
  import { usePdfViewerStore } from '@/store/modules/index.js'
  import { Copy20Regular, Link28Filled, Chat20Filled, ArrowLeft20Filled } from '@vicons/fluent'
  import i18 from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import { useRoute } from 'vue-router'
  import { AppPaths } from '@/utils/index.js'
  import SectionHeader from '@/components/worker/ui/shared/SectionHeader.vue'
  import ChatCotent from '../chat/ChatCotent.vue'
  const { t } = i18.global

  const store = usePdfViewerStore()
  const route = useRoute()

  const chatWith = ref(null)

  const generateLink = (v) => {
    if (v.type === 'w') {
      let data = {
        confirmation_id: v.id,
        model: store.model
      }
      store._generateLink(data)
    }
  }

  const copyLink = () => {
    Utils.copyToClipboard(store.link, () => {
      $Toast.info(t('signature.copied'))
    })
  }

  const isDocFlow = computed(() => {
    return !route.fullPath.includes(AppPaths.DocFlow)
  })

  const onOpenChat = (item) => {
    chatWith.value = item
  }

  const onCloseChat = () => {
    chatWith.value = null
    store.payload.recipient_id = null
  }
</script>

<template>
  <SectionHeader full-height tight-body plain>
    <template #header>
      <div v-if="chatWith" class="flex items-center gap-2 min-w-0">
        <n-button quaternary circle size="small" @click="onCloseChat">
          <template #icon>
            <n-icon size="18">
              <ArrowLeft20Filled />
            </n-icon>
          </template>
        </n-button>
        <span class="font-semibold text-textColor0 truncate">
          {{ chatWith.worker.last_name }} {{ chatWith.worker.first_name }}
        </span>
      </div>
      <div v-else class="flex items-center gap-2 min-w-0">
        <span class="font-semibold text-textColor0 truncate">{{ $t('documentPage.signature.viewer') }}</span>
      </div>
    </template>

    <ChatCotent v-if="chatWith" :forced-recipient-worker-id="chatWith.worker.id" />

    <template v-else>
      <template v-for="(item, idx) in store.confirmations" :key="idx">
        <div
          class="w-full rounded-xl cursor-pointer bg-surface-section mb-2 shadow p-3 border border-surface-line"
        >
          <div class="min-w-0">
            <UIUser
              :short="false"
              :data="{
                photo: item.worker?.photo,
                lastName: item.worker.last_name,
                firstName: item.worker.first_name,
                middleName: item.worker.middle_name,
                position: ''
              }"
            >
              <template #position>
                <div class="w-full text-wrap leading-[1.1] text-secondary text-xs">
                  {{ item.type === 'w' ? $t('content.worker') : item.position }}
                </div>
              </template>
            </UIUser>
            <div class="my-2 border-t border-dashed border-surface-line"></div>
            <div class="w-full flex flex-wrap items-center gap-2">
              <UIStatus pill size="tiny" :status="item.status" />
              <n-button
                :loading="store.linkLoading"
                round
                secondary
                v-if="item.type === 'w' && isDocFlow && item.status.id !== 3 && !store.viewerLoading"
                @click="generateLink(item)"
                type="info"
                size="tiny"
              >
                {{ $t('documentPage.signature.link') }}
                <template #icon>
                  <Link28Filled />
                </template>
              </n-button>
              <div
                @click="onOpenChat(item)"
                class="w-8 h-8 rounded-full bg-surface-ground flex items-center justify-center shrink-0 cursor-pointer hover:bg-primary/10 ml-auto"
              >
                <n-icon size="16" class="text-textColor1">
                  <Chat20Filled />
                </n-icon>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <UIDConfirm v-model:visible="store.linkVisible" type="warning">
      <template #icon> <span></span></template>
      <n-spin :show="store.linkLoading">
        <div class="mt-4">
          <span
            class="block text-lg select-none text-center uppercase font-semibold text-primary mb-6"
          >{{ $t('signature.linkText') }}</span>
          <span
            class="block text-sm border border-surface-line bg-surface-ground text-textColor2 border-dashed p-3 mt-4 rounded-md"
          >{{ store.link }}</span>
        </div>
      </n-spin>
      <template #action>
        <div class="grid grid-cols-2 gap-2 select-none">
          <n-button
            :loading="store.linkLoading"
            @click="store.linkVisible = false"
            secondary
            type="error"
          >
            {{ $t('content.close') }}
          </n-button>
          <n-button :loading="store.linkLoading" @click="copyLink" secondary type="primary">
            <template #icon>
              <Copy20Regular />
            </template>
            {{ $t('signature.copyLink') }}
          </n-button>
        </div>
      </template>
    </UIDConfirm>
  </SectionHeader>
</template>

<style scoped></style>
