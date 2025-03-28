<script setup>
import {NoDataPicture, UIPagination} from "@/components/index.js"
import {useExamAttemptStore, useWorkerExamStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {
  Book24Filled,
  Bookmark32Filled,
  DocumentOnePage24Filled,
  HatGraduation12Filled,
  Image48Filled,
  MusicNote224Filled,
  VideoClip24Filled
} from "@vicons/fluent";

const store = useWorkerExamStore()



const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}


let colors = ref(["primary", "success", "warning", "info"])
const randomColors = ref(['', '', ''])
onMounted(() => {

  for (let i = 0; i < 3; i++) {
    let rand = Math.floor(Math.random() * colors.value.length)
    randomColors.value[i] = colors.value[rand]
    colors.value = colors.value.filter((i, idx) => idx !== rand);
  }
})

</script>

<template>
  <n-spin :show="store.loading" class="mt-3 h-full">
    <div class="h-full flex flex-col">
      <div v-if="store.list.length>0" class="overflow-y-auto grow basis-auto">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          <template v-for="(lesson, idx) in store.list" :key="idx">
            <div
                class="rounded-md drop-shadow-md hover:drop-shadow-lg transition-all cursor-pointer bg-surface-section p-2 h-[120px] flex flex-col"
                @click="store.elementId = lesson.id"
            >
              <div class="flex items-center gap-3 justify-between border-b border-surface-line">
                <n-button :type="randomColors[0]" size="large" text>
                  <template #icon>
                    <n-icon :component="DocumentOnePage24Filled"/>
                  </template>
                  <span>{{ lesson.name }}</span>
                </n-button>
                <n-button :type="randomColors[1]" dashed size="tiny">
                  {{ lesson.type.name }}
                </n-button>
              </div>
              <div class="flex gap-2 justify-end  items-end grow">
                <n-button :type="randomColors[2]" text>
                  <template #icon>
                    <n-icon :component="HatGraduation12Filled"/>
                  </template>

                  <p>{{ $t('examPage.nExams', {n: lesson.exams?.length}) }}</p>
                </n-button>
                <n-button :type="randomColors[2]" text>
                  <p>{{ $t('examPage.nFiles', {n: lesson.files?.length}) }}</p>
                  <template #icon>
                    <n-icon :component="Bookmark32Filled"/>
                  </template>
                </n-button>
              </div>
            </div>
          </template>
          <!--      <template v-for="(lesson, idx) in store.list" :key="idx">-->
          <!--        <div class="flex flex-col gap-2 rounded-lg bg-surface-section shrink-0 p-2">-->
          <!--          <n-tabs animated type="line">-->
          <!--            <n-tab-pane name="exams" :tab="$t('examPage.exams')">-->
          <!--              <n-table-->
          <!--                  v-if="!!lesson.exams.length"-->
          <!--                  :single-line="false"-->
          <!--              >-->
          <!--                <thead>-->
          <!--                <tr>-->
          <!--                  <th></th>-->
          <!--                  <th>{{$t('examPage.exam')}}</th>-->
          <!--                  <th>{{ $t('solveExamPage.variant') }}</th>-->
          <!--                  <th>{{ $t('solveExamPage.totalTime') }}</th>-->
          <!--                  <th>{{ $t('solveExamPage.deadline') }}</th>-->
          <!--                  <th>{{ $t('solveExamPage.leftAttempts') }}</th>-->
          <!--                  <th>{{ $t('solveExamPage.questions') }}</th>-->
          <!--                  <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>-->
          <!--                </tr>-->
          <!--                </thead>-->
          <!--                <tbody>-->
          <!--                  <exam-row-->
          <!--                    v-for="(exam,idx) in lesson.exams"-->
          <!--                    :exam="exam"-->
          <!--                    :key="idx"-->
          <!--                    @continue="goPush"-->
          <!--                    @view="viewExam"-->
          <!--                    @start="startAttempt(exam)"-->
          <!--                    :row-num="idx+1"-->
          <!--                  />-->
          <!--                </tbody>-->
          <!--              </n-table>-->
          <!--              <NoDataPicture class="!my-0" v-else />-->
          <!--            </n-tab-pane>-->
          <!--            <n-tab-pane name="files" :tab="$t('examPage.resources')">-->
          <!--                  <div class="grid gap-4 flex-wrap grid-cols-[repeat(auto-fill,minmax(100px,1fr))]" v-if="!!lesson.files.length">-->
          <!--                    <div-->
          <!--                        v-for="(file, idx) in lesson.files"-->
          <!--                        :key="idx"-->
          <!--                        class="flex flex-col grow gap-3 items-center w-24 text-center border rounded-md p-3 border-gray-300 justify-center"-->
          <!--                    >-->
          <!--                      <n-button-->
          <!--                          circle-->
          <!--                          size="large"-->
          <!--                          @click="showFile(file)"-->
          <!--                      >-->
          <!--                        <template #icon>-->
          <!--                          <n-icon-->
          <!--                              :component="getMediaProperty(file.type.id).icon"-->
          <!--                          ></n-icon>-->
          <!--                        </template>-->
          <!--                      </n-button>-->
          <!--                      <div class="truncate max-w-full">-->
          <!--                        <p class="text-sm truncate ">{{ file.file_name }}</p>-->
          <!--                      </div>-->
          <!--                    </div>-->
          <!--                  </div>-->
          <!--              <NoDataPicture class="!my-0" v-else />-->

          <!--            </n-tab-pane>-->
          <!--          </n-tabs>-->
          <!--        </div>-->
          <!--      </template>-->

        </div>
      </div>
      <UIPagination
          class="mt-auto shrink-0"
          v-if="store.totalItems>0 && !store.loading"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
      <NoDataPicture v-if="store.list.length===0 && !store.loading"/>
    </div>
  </n-spin>
</template>
