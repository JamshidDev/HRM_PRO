<script setup>
  import { Add24Regular } from '@vicons/fluent'
  import FormDrawer from './FormDrawer.vue'
  import { useNewsCategoryStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const props = defineProps({
    maxTagCount: {
      type: Number,
      default: 3
    },
    placeholder: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const selectedTags = defineModel({ type: Array, default: () => [] })

  const store = useNewsCategoryStore()

  const effectivePlaceholder = computed(() => props.placeholder || t('newsPage.tagPlaceholder'))

  const availableTags = computed(() =>
    store.list.map((item) => ({
      label: item.name?.uz ?? item.name,
      value: item.id
    }))
  )

  onMounted(() => store._index())

  // n-select show control
  const selectShow = ref(false)

  const onUpdateShow = (val) => {
    if (!store.visible) selectShow.value = val
  }

  const openDrawer = () => {
    store.resetForm()
    store.visibleType = true
    store.visible = true
    selectShow.value = true
  }

  const onDrawerSave = (res) => {
    const created = res?.data?.data
    if (created?.id && !selectedTags.value.includes(created.id)) {
      selectedTags.value = [...selectedTags.value, created.id]
    }
    selectShow.value = false
  }

  // When drawer closes, allow n-select to behave normally again
  watch(
    () => store.visible,
    (val) => {
      if (!val) selectShow.value = false
    }
  )
</script>

<template>
  <n-select
    v-model:value="selectedTags"
    :show="selectShow"
    :options="availableTags"
    :placeholder="effectivePlaceholder"
    :disabled="disabled"
    :loading="store.loading"
    :max-tag-count="maxTagCount"
    multiple
    filterable
    clearable
    @update:show="onUpdateShow"
    :menu-props="{
      class: 'tag-select-menu'
    }"
  >
    <template #action>
      <div
        @click="openDrawer"
        class="p-2 cursor-pointer flex items-center gap-2 text-primary font-medium rounded transition-all duration-150 hover:bg-primary/10 active:scale-95"
      >
        <n-icon size="18"><Add24Regular /></n-icon>
        <span>{{ $t('newsCategoryPage.createTag') }}</span>
      </div>
    </template>
  </n-select>

  <FormDrawer @save="onDrawerSave" />
</template>
<style>
.tag-select-menu .n-base-select-menu__action{
  padding: 0 !important;
}
</style>