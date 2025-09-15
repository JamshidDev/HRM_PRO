<script setup>
import {Delete48Filled} from "@vicons/fluent"
import {useAccountStore, useLmsLessonStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"

const store = useLmsLessonStore()
const accStore = useAccountStore()

const onDelete = ()=>{
  if(!accStore.checkAction(accStore.pn.lmsLessonsWrite)) return
  store.elementId = store.selectedLesson?.id
  store._delete()
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
                    position:$t('lessonPage.detail.teacher'),
                }"
        />
      </div>
      <div class="col-span-12 flex justify-end">
          <n-button
              @click="onDelete"
              :loading="store.deleteLoading"
              size="small"
              type="error">
            <template #icon>
              <Delete48Filled/>
            </template>
            {{$t('lessonPage.detail.cancelLesson')}}</n-button>
      </div>
    </div>
</template>
