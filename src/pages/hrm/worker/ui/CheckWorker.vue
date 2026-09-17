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
  import {
    useAccountStore,
    useComponentStore,
    useContractStore,
    useWorkerStore
  } from '@/store/modules/index.js'
  import { UIModal, UIUser } from '@/components/index.js'
  import { useDebounceFn } from '@vueuse/core'
  import { useRouter } from 'vue-router'
  import { AppPaths, Utils } from '@/utils/index.js'
  import i18n from "@/i18n"

  const router = useRouter()
  const store = useComponentStore()
  const workerStore = useWorkerStore()
  const contractStore = useContractStore()
  const accStore = useAccountStore()
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
    if (!accStore.checkAction(accStore.pn.hrWorkersWrite)) return
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
  <!-- Umumiy modal qolipi (`UIModal`): sarlavha + yopish tugmasi, ajratuvchi chiziq
       va bir xil ichki chetlar. Ilgari bu yerda xom `n-modal`+`n-card` ishlatilgani
       uchun oyna qolgan modallardan farq qilardi (yopish tugmasi ham yo'q edi). -->
  <UIModal
    :title="$t('workerPage.checkWorker.title')"
    :width="600"
    v-model:visible="store.checkUserVisible"
  >
    <template #default>
      <div class="check-worker">
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
            <!-- PIN maskasi (`####-####-####-##`) ~180px oladi — telefonda
                 tugma faqat ikonka bo'lib, o'sha joyni maydonga qaytaradi. -->
            <span class="hidden sm:inline">{{ $t('content.search') }}</span>
          </n-button>
        </n-input-group>

        <!-- Balandlik qotirilgan: qidiruv natijasi almashganda oyna sakramasin. -->
        <div class="check-worker__result">
          <n-spin :show="store.pinLoading" class="flex justify-center items-center w-full">
            <template v-if="!Boolean(store.pin)">
              <span class="text-sm text-textColor3 text-center">
                {{ $t('workerPage.checkWorker.defaultText') }}
              </span>
            </template>

            <template v-if="store.worker && Boolean(store.pin)">
              <div class="w-full max-w-[400px] flex flex-col gap-4">
                <UIUser :hide-tooltip="true" :short="false" :data="store.worker" />

                <div
                  v-if="store.worker?.positions && store.worker?.positions.length > 0"
                  class="w-full flex flex-col gap-4 border border-warning/60 bg-surface-section rounded-lg p-3"
                >
                  <h3 class="font-semibold text-center uppercase">
                    {{ $t('workerPage.checkWorker.existPosition') }}
                  </h3>

                  <div
                    v-for="item in store.worker.positions"
                    :key="item.id"
                    class="flex flex-col items-start gap-2"
                  >
                    <div
                      class="flex gap-2 items-center text-xs font-semibold leading-[1.2] text-secondary"
                    >
                      <n-icon size="16">
                        <Building20Filled />
                      </n-icon>
                      {{ item.organization }}
                    </div>
                    <div class="flex gap-2 items-center text-xs leading-[1.2] text-secondary">
                      <n-icon size="16">
                        <Handshake24Filled />
                      </n-icon>
                      {{ item.position }}
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
                      class="!w-[min(360px,calc(100vw-32px))] border border-surface-line"
                    >
                      <template #trigger>
                        <n-button @click="onShowHrContacts(item)" size="tiny" dashed type="info">
                          <template #icon>
                            <Call20Filled />
                          </template>
                          {{ $t('workerPage.checkWorker.hrContacts') }}
                        </n-button>
                      </template>
                      <div class="flex flex-col gap-2">
                        <template v-for="hr in hrContacts" :key="hr.id">
                          <UIUser
                            :short="false"
                            :hide-tooltip="true"
                            :data="{
                              firstName: hr.worker.first_name,
                              lastName: hr.worker.last_name,
                              middleName: hr.worker.middle_name,
                              photo: hr.worker.photo,
                              position: ' '
                            }"
                          >
                            <template #position>
                              <div
                                @click="onCopyToClipboard(`+998${hr.phone}`)"
                                class="flex gap-2 items-center text-xs font-medium bg-surface-ground border border-surface-line rounded-lg w-fit px-2 py-0.5 cursor-pointer"
                              >
                                +998{{ hr.phone }}
                                <n-icon size="16"><Copy20Regular /></n-icon>
                              </div>
                            </template>
                          </UIUser>
                        </template>
                      </div>
                    </n-popover>
                  </div>

                  <div class="border border-danger/30 rounded-lg bg-surface-section">
                    <div class="p-2 leading-[1.2] text-danger bg-danger/5 text-center rounded-lg">
                      {{ $t('workerPage.checkWorker.alertCommandType') }}
                    </div>
                  </div>
                </div>

                <n-button @click="onContinue()" type="primary" icon-placement="right">
                  {{ $t('content.continue') }}
                  <template #icon>
                    <ArrowCircleRight20Regular />
                  </template>
                </n-button>
              </div>
            </template>

            <template v-if="!Boolean(store.worker) && Boolean(store.pin) && !store.pinLoading">
              <div
                class="w-full max-w-[400px] flex flex-col gap-2 bg-surface-section border border-surface-line rounded-lg p-4"
              >
                <n-icon size="46" class="text-warning mx-auto">
                  <Warning24Filled />
                </n-icon>
                <span class="text-lg font-medium uppercase text-center">
                  {{ $t('workerPage.checkWorker.no-worker') }}
                </span>
                <span class="text-xs text-textColor3 leading-[1.2] text-center">
                  {{ $t('workerPage.checkWorker.add-worker') }}
                </span>
                <n-button
                  v-if="accStore.checkPermission(accStore.pn.hrWorkersWrite)"
                  class="!mt-2"
                  @click="onAddCandidate()"
                  type="primary"
                  icon-placement="right"
                >
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
    </template>
  </UIModal>
</template>

<style scoped>
  .check-worker {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Maketdagi xira naqsh — kontent ostida qoladi. */
  .check-worker::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/search-user-icon.png') no-repeat center / contain;
    opacity: 0.05;
    pointer-events: none;
  }

  .check-worker > * {
    position: relative;
  }

  .check-worker__result {
    display: flex;
    min-height: 260px;
  }

  @media (min-width: 640px) {
    .check-worker__result {
      min-height: 380px;
    }
  }
</style>
