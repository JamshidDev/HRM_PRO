<script setup>
import Table from './ui/Table.vue'
import {UIPageFilter, UIDrawer} from "@/components/index.js";
import {useTopicFileStore} from "@/store/modules/index.js";
import Form from './ui/Form.vue'
import {useRoute} from "vue-router";
import Cards from './ui/Cards.vue'

const store = useTopicFileStore()
const route = useRoute()


onMounted(()=>{
  store.topicId = route.params.id
  store._index()
})

</script>
<template>
  <div>
    <Cards />
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType ?  $t('topicFiles.addFile') : $t('topicFiles.editFile')"
    >
      <template #content>
        <Form />
      </template>
    </UIDrawer>
  </div>
</template>