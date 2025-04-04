<script setup>
import {useTopicExamStore} from "@/store/modules/index.js"
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js";
import Utils from "@/utils/Utils.js"
import {BookQuestionMark20Filled, ClockAlarm32Filled, AppsList20Filled} from "@vicons/fluent";

const store = useTopicExamStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'delete'){
    store.elementId = v.data.id
    store._delete()
  }else if(v.key==='edit'){
    store.elementId = v.data.id
    store._show()
    store.visibleType = false
    store.visible= true
  }else if(v.key==='attach_question'){
    store.elementId = v.data.id
    store.attachQuestionVisible = true
    store.attachQuestionVisibleType = true
  }
}

</script>

<template>
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <table
          class="overflow-x-auto w-full"
      >
        <thead class="bg-primary border-spacing-0">
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="!text-center min-w-[150px] w-[200px]">{{$t('content.name')}}</th>
          <th>{{$t('topicDetailsPage.exams.toWhom')}}</th>
          <th>{{$t('topicDetailsPage.exams.tests_count')}}</th>
          <th>{{$t('topicDetailsPage.exams.variants')}}</th>
          <th>{{$t('topicDetailsPage.exams.minute')}}</th>
          <th>{{$t('topicDetailsPage.exams.deadline')}}</th>
          <th>{{$t('topicDetailsPage.exams.isActive')}}</th>
          <th>{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody class="bg-surface-section">
        <template v-for="(item, idx) in store.list" :key="idx">
          <tr />
          <tr >
            <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
            <td>{{item.name}}</td>
            <td>{{item.whom.name}}</td>
            <td>
              <n-button size="small" round type="success" ghost >
                {{item.tests_count}}
                <template #icon>
                  <n-icon  :component="AppsList20Filled"/>
                </template>
              </n-button>
            </td>
            <td>
              <n-button type="tertiary" ghost circle>
                {{item.variant}}
              </n-button>
            </td>
            <td>
              <n-button size="small" type="info" dashed round>
                {{item.minute}}
                <template #icon>
                  <n-icon :component="ClockAlarm32Filled" />
                </template>
              </n-button>
            </td>
            <td><n-tag type="warning" round>{{Utils.timeWithMonth(item.deadline)}}</n-tag></td>
            <td><n-switch :value="!!item.active" disabled /></td>
            <td>
              <UIMenuButton
                  :show-edit="true"
                  :show-delete="true"
                  :data="item"
                  @select-ev="onSelect"
                  :extra-options="[
                      {
                        label: $t('topicDetailsPage.questions.name'),
                        key: 'attach_question',
                        icon: BookQuestionMark20Filled,
                        visible:true,
                      },
                  ]"
              />
            </td>
          </tr>
        </template>
        </tbody>
      </table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
</template>
<style scoped lang="scss">
table{
  border-collapse: separate;
  border-spacing: 0;
}
thead{
  background: var(--surface-ground);
}
td, th{
  padding: 5px;
  border: 1px solid var(--surface-line);
  border-left: none;
  font-size: 14px;
  text-wrap: nowrap;
  text-align: center;
}
tr{
  height: 30px;
  td:first-child, th:first-child{
    border-left: 1px solid var(--surface-line);
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }
  td:last-child, th:last-child{
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
}
tbody tr:nth-child(2n+1){
  height: 10px;
}
</style>