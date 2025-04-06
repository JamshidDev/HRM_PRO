<script setup>
import {ArrowSyncCheckmark24Filled, Clock32Filled, Eye12Filled, PlayCircle28Regular} from "@vicons/fluent";
import Utils from "@/utils/Utils.js";
import {useExamAttemptStore} from "@/store/modules";
import {UIStatus, UIBadge} from "@/components/index.js";

const examStore = useExamAttemptStore()

defineEmits(["continue", "start", 'view'])


defineProps({
  exam: {
    type: Object,
    required: true
  }
})
const show = ref(false)
</script>
<template>
  <div class="rounded-md overflow-hidden" >
    <div
        :class="{'bg-surface-ground': show}"
        class="cursor-pointer transition-all hover:bg-surface-ground flex justify-between items-center  py-3 px-2"
        @click="show=!!exam.results?.length && !show"

    >
      <div
          class="flex gap-2 items-center w-full"
      >
        <n-button size="large" tertiary type="primary">
          {{ $t('examPage.nMinute', {n: exam.minute}) }}
          <template #icon>
            <n-icon :component="Clock32Filled"/>
          </template>
        </n-button>
        <div>
          <p class="font-bold text-lg">{{ exam.name }}</p>
          <div class="  flex gap-2 text-xs">
            <p>{{$t('examPage.question_count')}}: <span class="font-bold">{{exam.questions_count}}</span></p>
            <p>{{$t('solveExamPage.variant')}}: <span class="font-bold">{{exam.variant}}</span></p>
            <p>{{$t('solveExamPage.deadline')}}: <span class="font-bold">{{Utils.timeWithMonth(exam.deadline)}}</span></p>
            <p>{{$t('examPage.attempts')}}: <span class="font-bold">{{exam.chances}}</span></p>
          </div>
        </div>
      </div>
      <n-tooltip >
        {{$t('examPage.start')}}
        <template #trigger>
          <n-button
              tertiary
              type="success"
              :loading="examStore.loading && examStore.elementId===exam.id"
              :disabled="(exam.results.findIndex(i=>typeof i.result!='number')!==-1 && !examStore.exam_storage?.[exam.id]) || exam.results.length>=exam.chances"
              @click="$emit('start')"
          >
            <template #icon>
              <n-icon :component="PlayCircle28Regular"/>
            </template>
          </n-button>
        </template>
      </n-tooltip>
    </div>
    <n-collapse-transition :show="show">
      <div class="px-3">
        <p class="text-lg my-2 font-medium">{{ $t('examPage.history') }}</p>
        <div class="flex flex-col gap-5">
          <div v-for="(item, idx) in exam.results" :key="idx"
               class="flex items-center justify-between p-2 bg-surface-ground rounded-md" style="box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;">
            <div class="flex gap-2 items-center">
              <n-button size="small" type="warning" secondary class="!rounded-xl"><span class="min-w-[30px]">{{ item?.result || 0 }}</span></n-button>
              <div>
                <p class="font-bold">
                  {{ Utils.timeWithMonth(item.created) }} - {{ item.ended ? Utils.timeWithMonth(item.ended) : '...' }}
                </p>
                <div class="inline-block">
                  <UIBadge :show-icon="false" :label="item?.ended ? $t('examPage.finished') : $t('examPage.inProgress')" :type="item?.ended ? Utils.colorTypes.dark : Utils.colorTypes.warning" />
                </div>
              </div>
            </div>
            <div>
              <n-button v-if="item?.ended" size="small" tertiary type="info" @click="$emit('view', item)">
                {{ $t('content.view') }}
                <template #icon>
                  <n-icon :component="Eye12Filled"/>
                </template>
              </n-button>
              <n-button
                  v-else
                  :disabled="!examStore.exam_storage?.[item.id]"
                  size="small"
                  tertiary
                  type="warning"
                  @click="$emit('continue', item)"
              >
                {{ $t('content.continue') }}
                <template #icon>
                  <n-icon :component="ArrowSyncCheckmark24Filled"/>
                </template>
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-collapse-transition>
  </div>
</template>
<style lang="scss">
.exam-collapse {
  .n-collapse-item__header {
    margin: 0 !important;
    padding: 0 !important;
  }
}

.exam {
  &__card {
    border: 1px solid var(--secondary-color);
    border-radius: 8px;
    padding: 12px;
  }
}
</style>