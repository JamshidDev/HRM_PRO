<script setup>
  import { UIModal, UIPageContent, UISelect } from '@/components/index.js'
  import { useComponentStore, useReport2Store } from '@/store/modules/index.js'
  import { ArrowDownload20Filled } from '@vicons/fluent'
  import { onMounted } from 'vue'
  import { useSpecialReportStore } from '@/store/modules/hrm/specialReportStore'
  import CreateForm from './ui/CreateForm.vue'
  import i18n from '@/i18n/index.js'

  const t = i18n.global.t
  const componentStore = useComponentStore()

  onMounted(() => {
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })

  const store = useSpecialReportStore()

  const openEv = (item) => {
    if (!item.is_active) {
      $Toast.warning(t('content.developmentProcess'))
      return
    }

    store.payload.type = item.type
    store.visible = true
  }

  watch(
    () => store.visible,
    (v) => {
      if (!v) return
      store.payload.organizations = []
    }
  )

  onMounted(() => {
    store._getList()
  })
  const showImage = (image) => {
    $MediaViewer.showMediaViewer(image, 'jpg')
  }
</script>

<template>
  <UIPageContent>
    <UIModal
      persistent
      :width="500"
      v-model:visible="store.visible"
      :title="$t('specialReport.create')"
    >
      <CreateForm />
    </UIModal>
    <n-spin :show="store.loading">
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          v-for="item in store.list"
          :key="item.id"
          class="border rounded-xl group hover:ring hover:ring-info border-surface-line cursor-pointer bg-surface-section"
        >
          <div class="p-2">
            <div class="overflow-hidden rounded-lg relative">
              <img
                @click="() => showImage(item.photo)"
                :src="item.photo"
                class="w-full aspect-[2/1.3] object-cover group-hover:scale-110 transition-all brightness-75 duration-300 ease-out"
              />
              <div
                class="absolute z-10 bg-surface-section size-10 bottom-0 right-0 rounded-tl-lg flex items-center justify-center"
                @click="openEv(item)"
              >
                <div
                  class="absolute size-8 group-hover:bg-info/15 hover:bg-info/20 rounded-full transition-all outline outline-transparent group-hover:outline-dashed group-hover:outline-primary group-hover:rotate-180 duration-200"
                ></div>
                <n-icon size="18" class="text-textColor3 group-hover:text-primary">
                  <ArrowDownload20Filled />
                </n-icon>
              </div>
            </div>
          </div>

          <div class="p-2">
            <div class="relative">
              <p class="font-semibold text-textColor0">
                {{ item.name }}
              </p>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <p class="text-textColor1 text-sm line-clamp-2">
                    {{ item.description }}
                  </p>
                </template>
                <span>{{ item.description }}</span>
              </n-tooltip>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="512"
                height="512"
                viewBox="0 0 512 512"
                class="size-10 absolute right-0 bottom-0 text-textColor3/20 -z-0"
              >
                <path
                  fill="currentColor"
                  d="M453.547 273.449H372.12v-40.714h81.427zm0 23.264H372.12v40.714h81.427zm0-191.934H372.12v40.713h81.427zm0 63.978H372.12v40.713h81.427zm0 191.934H372.12v40.714h81.427zm56.242 80.264c-2.326 12.098-16.867 12.388-26.58 12.796H302.326v52.345h-36.119L0 459.566V52.492L267.778 5.904h34.548v46.355h174.66c9.83.407 20.648-.291 29.197 5.583c5.991 8.608 5.41 19.543 5.817 29.43l-.233 302.791c-.29 16.925 1.57 34.2-1.978 50.892m-296.51-91.256c-16.052-32.57-32.395-64.909-48.39-97.48c15.82-31.698 31.408-63.512 46.937-95.327c-13.203.64-26.406 1.454-39.55 2.385c-9.83 23.904-21.288 47.169-28.965 71.888c-7.154-23.323-16.634-45.774-25.3-68.515c-12.796.698-25.592 1.454-38.387 2.21c13.493 29.78 27.86 59.15 40.946 89.104c-15.413 29.081-29.837 58.57-44.785 87.825c12.737.523 25.475 1.047 38.212 1.221c9.074-23.148 20.357-45.424 28.267-69.038c7.096 25.359 19.135 48.798 29.023 73.051c14.017.99 27.976 1.862 41.993 2.676M484.26 79.882H302.326v24.897h46.53v40.713h-46.53v23.265h46.53v40.713h-46.53v23.265h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v23.264h46.53v40.714h-46.53v26.897H484.26z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </n-spin>
  </UIPageContent>
</template>
