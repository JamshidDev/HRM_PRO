<script setup>
  import {
    Search24Regular,
    GlobePerson24Regular,
    Warning24Filled,
    ArrowCircleRight20Regular,
    PersonAdd20Regular,
    Building20Filled,
    Handshake24Filled,
    CheckmarkCircle20Filled,
    Call20Filled,
    Copy20Regular,
  } from '@vicons/fluent'
  import { useComponentStore, useContractStore, useWorkerStore } from '@/store/modules/index.js'
  import { UIUser } from '@/components/index.js'
  import { useDebounceFn } from '@vueuse/core'
  import { useRouter } from 'vue-router'
  import { AppPaths, Utils } from '@/utils/index.js'
  import i18n from "@/i18n"

  const router = useRouter()
  const store = useComponentStore()
  const workerStore = useWorkerStore()
  const contractStore = useContractStore()
  const hrContacts = ref([])
  const t = i18n.global.t

  const searchEvent = useDebounceFn(() => {
    store.submitted = false
    if (store.pin.length === 17) {
      store.worker = null
      let pin = store.pin.split('-').join('')
      store._checkWorker(pin)
    }
  }, 300)

  const onAddCandidate = () => {
    store.checkUserVisible = false
    router.push({ name: `${AppPaths.Worker.substring(1)}-${AppPaths.Create.substring(1)}` })
  }

  const onContinue = () => {
    store.checkUserVisible = false
    store.isSelectedWorker = true
    setTimeout(() => {
      contractStore.resetForm()
      contractStore.stepNumber = 1
      contractStore.activeTab = 1
      workerStore.visible = true
    }, 200)
  }

  const onShowHrContacts = (v) => {
    hrContacts.value = v.hrs
  }

  const onCopyToClipboard = (text) => {
    Utils.copyToClipboard(text, ()=>{
      $Toast.info(t('content.successCopied'))
    })
  }

  onMounted(() => {
    store.worker = null
  })
  onBeforeUnmount(() => {
    store.worker = null
  })
</script>

<template>
  <n-modal v-model:show="store.checkUserVisible">
    <n-card
      style="width: 600px"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="grid grid-cols-1 card-p-none"
    >
      <div
        class="pb-6 relative before:content-[' '] before:bg-[url('/search-user-icon.png')] before:w-full before:h-full before:absolute before:top-0 before:left-0 before:bg-no-repeat before:bg-center before:bg-contain before:opacity-[0.05]"
      >
        <div class="w-full p-4">
          <h3 class="text-xl w-full font-semibold text-center uppercase">
            {{ $t('workerPage.checkWorker.title') }}
          </h3>
        </div>
        <div class="px-4 mt-6">
          <n-input-group>
            <n-input
              v-model:value="store.pin"
              :loading="store.pinLoading"
              :on-keyup="searchEvent"
              @paste="searchEvent"
              clearable
              v-mask="`####-####-####-##`"
              type="text"
              :placeholder="$t('content.pin')"
            >
              <template #prefix>
                <n-icon :component="GlobePerson24Regular" />
              </template>
            </n-input>
            <n-button type="primary" @click="searchEvent">
              <template #icon>
                <n-icon :component="Search24Regular" />
              </template>
              {{ $t('content.search') }}
            </n-button>
          </n-input-group>
        </div>
        <div class="flex min-h-[380px] py-4">
          <n-spin :show="store.pinLoading" class="flex justify-center items-center w-full">
            <template v-if="!Boolean(store.pin)">
              <n-gradient-text
                :gradient="{
                  from: 'rgb(85, 85, 85)',
                  to: 'rgb(170, 170, 170)'
                }"
              >
                {{ $t('workerPage.checkWorker.defaultText') }}
              </n-gradient-text>
            </template>

            <template v-if="store.worker && Boolean(store.pin)">
              <div class="w-[400px] cursor-pointer flex flex-col gap-y-4">
                <UIUser :hide-tooltip="true" :short="false" :data="store.worker" />

                <div
                  v-if="store.worker?.positions && store.worker?.positions.length > 0"
                  class="w-full border border-warning/60 bg-surface-section rounded-xl py-2 px-3"
                >
                  <h3 class="font-semibold text-center mb-4 uppercase">
                    {{ $t('workerPage.checkWorker.existPosition') }}
                  </h3>
                  <template v-for="item in store.worker.positions" :key="item.id">
                    <div
                      class="flex gap-2 items-center text-xs font-semibold leading-[1.2] mb-1 text-secondary"
                    >
                      <n-icon size="16">
                        <Building20Filled />
                      </n-icon>
                      {{ item.organization }}
                    </div>
                    <div class="flex gap-2 items-center text-xs leading-[1.2] mb-1 text-secondary">
                      <n-icon size="16">
                        <Handshake24Filled />
                      </n-icon>{{ item.position }}
                    </div>
                    <n-button v-if="item.type" size="tiny" type="warning" secondary>
                      <template #icon>
                        <n-icon><CheckmarkCircle20Filled /></n-icon>
                      </template>
                      {{ item.type }}
                    </n-button>

                    <n-popover
                      placement="bottom"
                      trigger="click"
                      class="!w-[360px] border border-surface-line"
                    >
                      <template #trigger>
                        <n-button @click="onShowHrContacts(item)" class="!mb-6 !mt-1" size="tiny" dashed type="info">
                          <template #icon>
                            <Call20Filled />
                          </template>
                          {{ $t('workerPage.checkWorker.hrContacts') }}
                        </n-button>
                      </template>
                      <div>
                        <template v-for="hr in hrContacts" :key="hr.id">
                          <UIUser
                            :short="false"
                            :hide-tooltip="true"
                            :data="{
                              firstName: hr.worker.first_name,
                              lastName: hr.worker.last_name,
                              middleName: hr.worker.middle_name,
                              photo: hr.worker.photo,
                              position: ' ',
                            }"
                          >
                            <template #position>
                              <div @click="onCopyToClipboard(`+998${hr.phone}`)" class="flex gap-2 items-center text-xs font-medium bg-surface-ground border border-surface-line rounded-lg w-fit px-1 "> +998{{hr.phone}} <n-icon size="16"><Copy20Regular/></n-icon></div>
                            </template>
                          </UIUser>
                        </template>
                      </div>
                    </n-popover>
                  </template>

                  <div class="border border-danger/30 rounded-lg bg-surface-section">
                    <div class="p-2 leading-[1.2] text-danger bg-danger/3 text-center">
                      {{ $t('workerPage.checkWorker.alertCommandType') }}
                    </div>
                  </div>
                </div>



                <n-button class="!mt-10" @click="onContinue()" type="primary" icon-placement="right">
                  {{ $t('content.continue') }}
                  <template #icon>
                    <ArrowCircleRight20Regular />
                  </template>
                </n-button>
              </div>
            </template>
            <template v-if="!Boolean(store.worker) && Boolean(store.pin) && !store.pinLoading">
              <div
                class="w-[400px] flex flex-col bg-surface-section border py-2 px-4 rounded-xl border-surface-line"
              >
                <n-icon size="46" class="text-warning mx-auto">
                  <Warning24Filled />
                </n-icon>
                <span class="text-lg font-medium uppercase text-center">{{
                  $t('workerPage.checkWorker.no-worker')
                }}</span>
                <span class="text-xs text-gray-400 leading-3 py-2 text-center mb-6">{{
                  $t('workerPage.checkWorker.add-worker')
                }}</span>
                <n-button @click="onAddCandidate()" type="primary" icon-placement="right">
                  {{ $t('workerPage.checkWorker.addCandidate') }}
                  <template #icon>
                    <PersonAdd20Regular />
                  </template>
                </n-button>
              </div>
            </template>
          </n-spin>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>
