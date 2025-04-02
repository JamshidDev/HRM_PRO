<script setup>
import {ArrowSyncCheckmark24Filled, ChevronLeft12Regular, Eye12Filled} from "@vicons/fluent";
import Utils from "@/utils/Utils.js";
import {useExamAttemptStore} from "@/store/modules/index.js";

const examStore = useExamAttemptStore()

defineEmits(["continue", "start", 'view'])

defineProps({
  exam: {
    type: Object,
    required: true
  },
  rowNum: Number
})

const showHistory = ref(false)
const historyData = ref(null)

</script>
<template>
  <tr>
    <td class="!w-3">
      {{rowNum}}
    </td>
    <td>{{exam.name}}</td>
    <td>{{ exam.variant }}</td>
    <td>{{ exam.minute }}</td>
    <td>{{ Utils.timeWithMonth(exam.deadline) }}</td>
    <td>{{ exam.chances - exam.results.length }}</td>
    <td>{{ exam.questions_count }}</td>
    <td class="!text-center" @click="console.log(exam)">
<!--      <n-button-->
<!--          v-if="!!(exam.results.find(i=>i.result==null))"-->
<!--          type="warning"-->
<!--          :loading="examStore.loading && examStore.elementId===exam.id"-->
<!--          :disabled="(()=>{-->
<!--                          const con = exam.results.find(i=>i.result==null)-->
<!--                          if(!con) return false-->
<!--                          else{-->
<!--                            return !examStore.exam_storage?.[con.id]-->
<!--                          }-->
<!--                        })()"-->
<!--          @click="$emit('continue', exam.results.find(i=>i.result==null))"-->
<!--      >-->
<!--        <template #icon>-->
<!--          <n-icon :component="ArrowSyncCheckmark24Filled" />-->
<!--        </template>-->
<!--        {{$t('content.continue')}}-->
<!--      </n-button>-->
      <n-button
          type="primary"
          :loading="examStore.loading && examStore.elementId===exam.id"
          @click="$emit('start')"
          :disabled="!!(exam.results.find(i=>i.result==null))"
      >
        {{$t('examPage.start')}}
      </n-button>
    </td>
  </tr>
  <tr v-if="exam.results.length">
    <td class="!py-[2px] !px-0" colspan="8" >
      <div class="flex items-center justify-end gap-2">
        <p class="text-xs">{{$t('examPage.attempts')}}</p>
        <n-button size="tiny" @click="showHistory=!showHistory" circle quaternary>
          <template #icon>
            <div class="transition-all" :style="{'transform': !showHistory ? 'rotate(0)' : 'rotate(-90deg)'}">
              <n-icon :size="10" :component="ChevronLeft12Regular" />
            </div>
          </template>
        </n-button>
      </div>
      <n-collapse-transition :show="showHistory">
        <n-table
            striped
            class="mt-2 !rounded-none"
            size="small"
            :bordered="false"
            :bottom-bordered="true"

        >
          <thead>
          <tr>
            <th class="!w-4">{{$t('content.number')}}</th>
            <th>{{$t('examPage.ip')}}</th>
            <th>{{$t('examPage.startTime')}}</th>
            <th>{{$t('examPage.endTime')}}</th>
            <th>{{$t('examPage.result')}}</th>
            <th class="max-w-[150px] !text-center w-[150px]">{{$t('content.action')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in exam.results" :key="idx">
            <td>{{idx+1}}</td>
            <td>{{item.ip_address}}</td>
            <td>{{Utils.timeWithMonth(item.created)}}</td>
            <td>{{item.ended && Utils.timeWithMonth(item.ended)}}</td>
            <td>{{item?.result && item?.result}}</td>
            <td class="!text-center">
              <n-button
                  size="tiny"
                  tertiary
                  type="info"
                  v-if="item.result!=null"
                  @click="$emit('view', item)"
              >
                {{$t('content.view')}}
                <template #icon>
                  <n-icon :component="Eye12Filled" />
                </template>
              </n-button>
              <n-button
                  size="tiny"
                  tertiary
                  type="warning"
                  v-else
                  :disabled="!examStore.exam_storage?.[item.id]"
                  @click="$emit('continue', item)"
              >
                {{$t('content.continue')}}
                <template #icon>
                  <n-icon :component="ArrowSyncCheckmark24Filled" />
                </template>
              </n-button>
            </td>
          </tr>
          </tbody>
        </n-table>
      </n-collapse-transition>
    </td>
<!--    <td colspan="7" ref="historyData">-->
<!--      <div class="!h-0 overflow-hidden">-->
<!--        <div class="h-20"></div>-->
<!--      </div>-->
<!--    </td>-->
  </tr>
</template>