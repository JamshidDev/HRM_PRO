<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { useComponentStore, useTurnstileHikCentralWorkerStore } from '@/store/modules/index.js'
  import { NoDataIllustration, UITransferSelect } from '@/components/index.js'
  import { Checkmark16Filled, AddCircle16Filled, LockClosed16Filled } from '@vicons/fluent'
  import { UICropper } from '@/components/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import Utils from '@/utils/Utils'
  import { NIcon, NTag } from 'naive-ui'
  import i18n from '@/i18n/index.js'

  const formRef = ref(null)
  const { t } = i18n.global
  const store = useTurnstileHikCentralWorkerStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.editPayload.photo = store.payload.photo
        store.editPayload.blob = store.payload.blob
        store.editPayload.photo_id = store.payload.photo_id
        store.editPayload.access_level_ids = store.payload.access_level_ids
        // Sana MAJBURIY (forma tekshiradi) — `null` yuborilmaydi, aks holda
        // HCP o'zi muddat qo'yib, baza bilan ajralib ketardi.
        store.editPayload.to = Utils.timeToZone(store.payload.end_time)

        store._updateFace()
      }
    })
  }

  // Boshqa korxona guruhlari select'da qulf bilan turadi, olib tashlanmaydi; yuboriladigani faqat o'zimiznikilar.
  const lockedIds = computed(() => store.lockedAccessLevels.map((l) => l.access_level_id))

  const accessLevelOptions = computed(() => [
    ...store.lockedAccessLevels.map((l) => ({
      id: l.access_level_id,
      name: l.name,
      disabled: true,
      locked: true,
      hint: t('turnstile.hcWorkersPage.locked_access_level_hint', {
        orgs: l.owner_orgs?.join(', ') || '—'
      })
    })),
    ...store.accessLevels.filter((o) => !lockedIds.value.includes(o.id))
  ])

  const accessLevelValue = computed({
    get: () => [...lockedIds.value, ...store.payload.access_level_ids],
    set: (v) => {
      store.payload.access_level_ids = (v || []).filter((id) => !lockedIds.value.includes(id))
    }
  })

  // Inputda faqat o'z guruhlari teg bo'ladi; qulflilar faqat ro'yxatning tanlanganlar panelida.
  const renderAccessLevelTag = ({ option }) => {
    if (option?.locked) return h('span', { class: 'locked-access-tag' })
    return h(NTag, { size: 'small', type: 'info', bordered: false }, () => option?.name)
  }

  const toggleImage = (v) => {
    if (store.payload.photo_index === v) {
      store.payload.photo_id = null
      store.payload.photo = null
      store.payload.photo_index = null
    } else {
      if (store.photos[v]?.id) {
        store.payload.photo_id = store.photos[v]?.id
        store.payload.photo = null
        store.payload.blob = null
      } else {
        store.payload.photo = store.photos[v].photo
        store.payload.blob = store.photos[v].blob
        store.payload.photo_id = null
      }
      store.payload.photo_index = v
    }
  }

  const cropperRef = ref(null)

  const openCropper = () => {
    cropperRef.value.openFile()
  }

  const onResult = (v) => {
    store.photos.push({
      photo: v.imgUrl,
      blob: v.blob
    })
  }
</script>

<template>
  <n-spin :show="false">
    <div class="overflow-y-auto">
      <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
        class="flex flex-col"
      >
        <n-alert
          v-if="store.lockedAccessLevels.length"
          type="warning"
          :show-icon="false"
          class="mb-4"
        >
          <div class="flex items-center gap-2 text-xs font-medium">
            <n-icon :size="16" :component="LockClosed16Filled" class="shrink-0" />
            <span>
              {{
                $t('turnstile.hcWorkersPage.locked_access_levels_alert', {
                  count: store.lockedAccessLevels.length
                })
              }}
            </span>
          </div>
        </n-alert>

        <!-- Qulflangan guruhlar bo'lsa, o'z guruhini tanlash majburiy emas. -->
        <n-form-item
          :label="$t(`turnstile.hcWorkersPage.access_levels`)"
          path="access_level_ids"
          :rule-path="store.lockedAccessLevels.length ? undefined : 'requiredMultiSelectField'"
        >
          <UITransferSelect
            multiple
            :loading="store.accessLevelsLoading || store.moreAccessLevelsLoading"
            v-model:value="accessLevelValue"
            :options="accessLevelOptions"
            :render-tag="renderAccessLevelTag"
            max-tag-count="responsive"
            value-field="id"
          />
        </n-form-item>

        <n-form-item
          :label="$t(`content.photo`)"
          path="photo_index"
          rule-path="requiredSelectImageField"
        >
          <div
            class="h-[260px] max-h-[400px] p-2 border border-surface-line w-full rounded-md relative"
          >
            <n-spin class="h-full w-full overflow-y-auto pr-1" :show="store.photosLoading">
              <NoDataIllustration v-if="!store.photos.length" class="w-full h-full" />
              <div
                v-else
                class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(120px,1fr))] gap-[10px]"
              >
                <div
                  v-for="(photo, idx) in store.photos"
                  :key="idx"
                  class="rounded-md overflow-hidden relative"
                  @click="toggleImage(idx)"
                  style="box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px"
                >
                  <img
                    class="w-full h-full object-cover transition-all hover:scale-[1.1] cursor-pointer"
                    alt="worker-photo"
                    :src="photo.photo || Utils.noAvailableImage"
                    @error="Utils.onImgError"
                  />
                  <n-icon-wrapper
                    class="absolute top-1 right-1"
                    v-if="store.payload.photo_index === idx"
                    :size="24"
                    :border-radius="10"
                  >
                    <n-icon :size="18" :component="Checkmark16Filled" />
                  </n-icon-wrapper>
                </div>
              </div>
            </n-spin>
            <div class="absolute bottom-[10px] right-[10px]">
              <n-button @click="openCropper" type="primary" size="tiny">
                {{ $t('content.upload') }}
                <template #icon>
                  <AddCircle16Filled />
                </template>
              </n-button>
            </div>
            <UICropper ref="cropperRef" @on-result="onResult" />
          </div>
        </n-form-item>

        <!-- Muddat MAJBURIY: bo'sh yuborilsa HCP o'zi «bugun+2 yil» qo'yadi va
             bizning baza bilan jimgina ajralib ketadi. Default ham shu. -->
        <n-form-item
          :label="$t(`content.deadline`)"
          :feedback="$t('turnstile.terminalUser.deadline_feedback')"
          :rule="validationRules.common.requiredDateTimeField"
          path="end_time"
        >
          <n-date-picker
            class="w-full"
            v-model:value="store.payload.end_time"
            type="date"
            update-value-on-close
            :actions="null"
            :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
      </n-form>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-4">
      <n-button @click="store.editVisible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
        :loading="store.editLoading || store.photosLoading"
        type="primary"
        @click="onSubmit"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-spin>
</template>

<style lang="scss">
  .n-base-selection-tag-wrapper:has(> .locked-access-tag) {
    display: none;
  }
</style>
