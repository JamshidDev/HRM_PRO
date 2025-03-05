<script setup>
import List from "./ui/List.vue"
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js";
import {Warning20Filled} from "@vicons/fluent";
import {UIModal, UIPageContent} from "@/components/index.js";

const store = useWorkerExamStore()
const examStore = useExamAttemptStore()

const onSearch = ()=>{
  store.params.page = 1
  store._index()
}

onMounted(()=>{
  examStore._config_localstorage()
  store.params.page = 1
  store.params.search = null
  store._index()
})

</script>

<template>
  <div class="mx-2 mt-4 mb-4 rounded">
<!--    <UIPageFilter-->
<!--        :show-search-input="false"-->
<!--        v-model:search="store.params.search"-->
<!--        @onSearch="onSearch"-->
<!--        @onAdd="onAdd"-->
<!--    />-->
    <List/>
<!--    <UIModal-->
<!--        :width="500"-->
<!--        v-model:visible="examStore.continueVisible"-->
<!--        :title="$t('content.warning')"-->
<!--    >-->
<!--      <n-alert type="warning">-->
<!--        {{$t('solveExamPage.alreadyStarted')}}-->
<!--      </n-alert>-->
<!--      <div class="flex items-center gap-3 justify-end mt-3">-->
<!--        <n-button type="primary">{{$t('content.yes')}}</n-button>-->
<!--        <n-button type="warning">-->
<!--          {{$t('content.restart')}}-->
<!--          <template #icon>-->
<!--            <n-icon :component="Warning20Filled" />-->
<!--          </template>-->
<!--        </n-button>-->
<!--      </div>-->
<!--    </UIModal>-->
  </div>
</template>
