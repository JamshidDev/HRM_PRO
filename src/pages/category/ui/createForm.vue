<script setup>
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";
import ImageUploader from "@/components/ImageUploader/ImageUploader.vue";
import validationRules from "@/utils/validationRules.js";
const store = useCategoriesStore()


const formRef = ref(null)
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

      if(store.visibleType){
        // create data
        const files = store.payload.image.map((v)=>v.file)
        $ApiService.generalService._uploadImage({files}).then((res)=>{
          let data = {...store.payload, image:res.data[0].image}
          store.createItem(data)
        })
      }else{
      //   edit data
        store.saveLoading = true
        if(store.payload.image[0].url){
          let data = {...store.payload, image:store.payload.image[0].url}
          store.updateItem(data)
        }else{
          const files = store.payload.image.map((v)=>v.file)
          $ApiService.generalService._uploadImage({files}).then((res)=>{
            let data = {...store.payload, image:res.data[0].image}
            store.updateItem(data)
          })
        }
      }

    }
  })
}
</script>

<template>
<n-form
    ref="formRef"
    :rules="validationRules.category"
    :model="store.payload"
>

  <n-form-item class="mt-5" :label="$t(`categoryPage.form.photo`)" path="image">
    <ImageUploader
        v-model="store.payload.image"
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