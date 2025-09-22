<script setup>
import {Delete48Filled, Clock28Filled, Delete20Filled} from "@vicons/fluent"
import {useAccountStore, useLmsLessonStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"
import LessonExamForm from "@/pages/lms/Lesson/ui/LessonExamForm.vue"

const store = useLmsLessonStore()
const accStore = useAccountStore()

const onDelete = ()=>{
  if(!accStore.checkAction(accStore.pn.lmsLessonsWrite)) return
  store.elementId = store.selectedLesson?.id
  store._delete()
}

const onCallback = ()=>{
  store.previewVisible =false
  store._index()
}

</script>

<template>
    <div class="grid grid-cols-12 gap-x-4 gap-y-2 w-full">
      <div class="col-span-6 border border-surface-line rounded-lg p-2 bg-surface-ground/30">
        <p class="font-semibold leading-[1.2]">{{store.selectedLesson?.subject}}</p>
        <p class="text-xs text-secondary">{{$t('lessonPage.detail.subject')}}</p>
      </div>
      <div class="col-span-6 border border-surface-line rounded-lg p-2 bg-surface-ground/30">
        <p class="font-semibold leading-[1.2]">{{store.selectedLesson?.start_time}} -:- {{store.selectedLesson?.end_time}}</p>
        <p class="text-xs text-secondary">{{$t('lessonPage.detail.time')}}</p>
      </div>
        <div class="col-span-6 border border-surface-line rounded-lg p-2 bg-surface-ground/30">
            <p class="font-semibold leading-[1.2]">{{store.selectedLesson?.name}}</p>
            <p class="text-xs text-secondary">{{$t('lessonPage.detail.name')}}</p>
        </div>
      <div class="col-span-6 border border-surface-line rounded-lg p-2 bg-surface-ground/30">
        <p class="font-semibold leading-[1.2]">{{store.selectedLesson?.group}}</p>
        <p class="text-xs text-secondary">{{$t('lessonPage.detail.group')}}</p>
      </div>
      <div class="col-span-12 border border-surface-line rounded-lg p-2 bg-surface-ground/30">
        <UIUser
            :short="false"
            :hide-tooltip="true"
            :data="{
                    photo:store.selectedLesson?.teacher?.worker?.photo,
                    lastName:store.selectedLesson?.teacher?.worker?.last_name,
                    firstName:store.selectedLesson?.teacher?.worker?.first_name,
                    middleName:store.selectedLesson?.teacher?.worker?.middle_name,
                    position:$t('lessonPage.detail.teacher')
                }"
        />
      </div>
      <div class="col-span-12 flex justify-center">
          <n-button
              secondary
              @click="onDelete"
              :loading="store.deleteLoading"
              size="small"
              type="error">
            <template #icon>
              <Delete48Filled/>
            </template>
            {{$t('lessonPage.detail.cancelLesson')}}</n-button>
      </div>
      <div class="col-span-12 border bg-surface-ground/20 border-surface-line rounded-lg border-dashed p-4 mt-10">
          <div class="grid grid-cols-12 gap-2">
            <div class="col-span-12">
              <p class="text-secondary text-center">{{$t(store.selectedLesson?.exam? 'lessonPage.detail.attachedLesson' : 'lessonPage.detail.attachmentLesson')}}</p>
            </div>
            <div class="col-span-12" v-if="store.selectedLesson?.exam">
              <div class="w-full px-2 py-2 text-center border border-surface-line rounded-lg text-primary flex gap-2 items-center justify-between">
                <span class="flex items-center gap-2"><n-icon class="text-primary" size="20">
                  <Clock28Filled/>
                </n-icon>
                {{store.selectedLesson?.exam.exam?.name}}</span>
                <n-icon @click="store._detachExam(store.selectedLesson?.exam?.id)" class="text-danger cursor-pointer" size="18">
                  <n-spin :show="store.deleteLoading">
                    <Delete20Filled/>
                  </n-spin>

                </n-icon>
              </div>
            </div>
              <div class="col-span-12" v-else>
               <LessonExamForm :lesson-id="store.selectedLesson?.id" @onCallback="onCallback" />
              </div>

          </div>
      </div>
    </div>
</template>
