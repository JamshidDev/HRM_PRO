<script setup>
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import ImageUploader from "@/components/ImageUploader/ImageUploader.vue";
const store = useCategoriesStore()

const options = [
  {
    name:"Category 1",
    id:1,
  },
  {
    name:"Category 2",
    id:3,
  },
  {
    name:"Category 3",
    id:4,
  },
]

</script>

<template>
<n-form>

  <n-form-item class="!bg-yellow-50" :label="$t(`categoryPage.form.photo`)" path="name">
    <ImageUploader
        :max-count="1"
        :model-value="store.payload.image"
    />
    <n-input
        class="!hidden"
        type="text"
        :placeholder="$t(`categoryPage.form.name`)"
        v-model:value="store.payload.name"
    />
  </n-form-item>

  <n-form-item :label="$t(`categoryPage.form.name`)" path="name">
    <n-input
        type="text"
        :placeholder="$t(`categoryPage.form.name`)"
        v-model:value="store.payload.name"
    />
  </n-form-item>
  <n-form-item :label="$t(`categoryPage.form.category`)" path="name">
    <n-select
        v-model:value="store.payload.parent_id"
        filterable
        :placeholder="$t(`categoryPage.form.category`)"
        :options="options"
        label-field="name"
        value-field="id"
    />
  </n-form-item>
</n-form>
</template>

<style scoped>

</style>