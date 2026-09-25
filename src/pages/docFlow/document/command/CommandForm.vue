<script setup>
  import { DocumentBulletList20Filled, Save16Regular, DismissCircle32Filled } from '@vicons/fluent'
  import { useCommandStore } from '@/store/modules/index.js'
  import { UIModal } from '@/components/index.js'
  import CommandFormBody from './CommandFormBody.vue'

  const store = useCommandStore()
  const bodyRef = ref(null)

  // Forma sahifa ochilganda bir marta tozalanadi (modal yopilib-ochilganda qiymatlar saqlanadi).
  onMounted(() => store.resetForm())

  // status=true — PDF ko'rish, aks holda yaratish (forma holati «Ma'lumotlar» tabi uchun saqlanadi).
  const onSubmit = async (status) => {
    const res = await bodyRef.value?.submit()
    if (!res?.isValid) return
    if (status) {
      store._viewCommand(res.data)
    } else {
      store._create({ ...res.data, form_state: store.snapshotFormState() })
    }
  }
</script>

<template>
  <UIModal :width="1200" v-model:visible="store.visible">
    <template #header>
      <div class="flex justify-between pb-2 px-4">
        <h3 class="text-lg font-medium">
          {{ $t('documentPage.command.createTitle') }}
        </h3>
        <div class="flex gap-4">
          <div
            class="group w-[40px] hover:w-[120px] transition-[width] duration-500 ease-in-out overflow-hidden"
          >
            <n-button
              class="!w-full no-scale n-icon-mx-0"
              @click="onSubmit(true)"
              :loading="store.viewLoading"
              ghost
            >
              <template #icon>
                <DocumentBulletList20Filled />
              </template>
              <span
                class="text-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-150 ml-2"
              >
                {{ $t('content.view') }}
              </span>
            </n-button>
          </div>
          <div
            class="group w-[40px] hover:w-[160px] transition-[width] duration-500 ease-in-out overflow-hidden"
          >
            <n-button
              @click="onSubmit(false)"
              :loading="store.saveLoading"
              type="primary"
              class="!w-full no-scale n-icon-mx-0"
            >
              <template #icon>
                <Save16Regular />
              </template>
              <span
                class="text-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-150 ml-2"
              >
                {{ $t('content.save') }}
              </span>
            </n-button>
          </div>
          <div
            class="group w-[40px] hover:w-[160px] transition-[width] duration-500 ease-in-out overflow-hidden"
          >
            <n-button
              class="!w-full no-scale n-icon-mx-0"
              @click="store.openVisible(false)"
              type="error"
              secondary
            >
              <template #icon>
                <DismissCircle32Filled />
              </template>
              <span
                class="text-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-150 ml-2"
              >
                {{ $t('content.cancel') }}
              </span>
            </n-button>
          </div>
        </div>
      </div>
    </template>
    <div style="height: calc(100vh - 100px)" class="overflow-y-auto overflow-x-hidden px-1">
      <CommandFormBody ref="bodyRef" mode="create" />
    </div>
  </UIModal>
</template>
