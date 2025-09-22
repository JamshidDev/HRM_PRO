<script setup>
import {UIDrawer, UIModal, UIPageContent, UIPageFilter} from "@/components/index.js"
import Table from "./ui/Table.vue"
import Filter from "./ui/Filter.vue"
import workerList from "./ui/workerList.vue"
import LessonExamForm from "@/pages/lms/Lesson/ui/LessonExamForm.vue"
import {useAccountStore, useEduPlanStore} from "@/store/modules/index.js"
import createFrom from "./ui/createForm.vue"
import groupForm from "../Group/ui/createForm.vue"
const store = useEduPlanStore()
const accStore = useAccountStore()

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.lmsEduPlanRead)) return
  store._index()
})

const onCallback = ()=>{
  store.examVisible=false
  store._index()
}
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIDrawer
        :visible="store.visible"
        @update:visible="(v)=>store.visible = v"
        :title="store.visibleType? $t('eduPlanPage.createTitle') : $t('eduPlanPage.updateTitle')"
    >
      <template #content>
        <createFrom/>
      </template>
    </UIDrawer>
    <UIModal
        :visible="store.groupVisible"
        @update:visible="(v)=>store.groupVisible = v"
        :title="$t('eduPlanPage.attachmentGroup')"
    >
      <template #default>
        <groupForm/>
      </template>
    </UIModal>
    <UIModal
        :width="1200"
        :visible="store.workerVisible"
        @update:visible="(v)=>store.workerVisible = v"
        :title="$t('eduPlanPage.workers')"
    >
      <template #default>
        <workerList/>
      </template>
    </UIModal>
    <UIModal
        :width="600"
        :visible="store.examVisible"
        @update:visible="(v)=>store.examVisible = v"
        :title="$t('eduPlanPage.attachmentExam')"
    >
      <template #default>
        <LessonExamForm
            :edu-plan-id="store.elementId"
            @onCallback="onCallback"
        />
      </template>
    </UIModal>
  </UIPageContent>
</template>
