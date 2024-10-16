<script setup>
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import ImageUploader from "@/components/ImageUploader/ImageUploader.vue";
import validationRules from "@/utils/validationRules.js";
const store = useCategoriesStore()


const formRef = ref(null)
const images = ref([])
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

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      const files = images.value.map((v)=>v.file)
      console.log(files)
      $ApiService.generalService._uploadImage({files}).then((res)=>{
        store.payload.image = res.data[0].image
        store.createItem(store.payload)
      })
    }
  })
}

watchEffect(()=>{
  store.payload.image = images.value.length>0? images.value[0].id : null
})
</script>

<template>
<n-form
    ref="formRef"
    :rules="validationRules.category"
    :model="store.payload"
>

  <n-form-item class="mt-5" :label="$t(`categoryPage.form.photo`)" path="image">
    <ImageUploader
        v-model="images"
    />
    <n-input
        class="!hidden"
        type="text"
        :placeholder="$t(`categoryPage.form.name`)"
        v-model:value="store.payload.image"
    />
  </n-form-item>

  <n-form-item :label="$t(`categoryPage.form.name`)" path="name">
    <n-input
        type="text"
        :placeholder="$t(`categoryPage.form.name`)"
        v-model:value="store.payload.name"
    />
  </n-form-item>
  <n-form-item :label="$t(`categoryPage.form.category`)" path="category">
    <n-select
        v-model:value="store.payload.parent_id"
        filterable
        :placeholder="$t(`categoryPage.form.category`)"
        :options="options"
        label-field="name"
        value-field="id"
    />
  </n-form-item>
  <n-form-item :label="$t(`categoryPage.form.description`)" path="description">
    <n-input
        type="textarea"
        :placeholder="$t(`categoryPage.form.description`)"
        v-model:value="store.payload.description"
    />
  </n-form-item>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{$t('content.cancel')}}
    </n-button>
    <n-button
        @click="onSubmit"
        :loading="store.saveLoading"
        type="primary">
      {{$t('content.save')}}
    </n-button>
  </div>

</n-form>

</template>

<style scoped>

</style>