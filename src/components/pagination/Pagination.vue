<template>
  <div class="flex flex-wrap justify-center lg:justify-between items-center   gap-4 py-4 w-full">
    <div class="flex xl:justify-start lg:justify-start md:justify-start justify-center text-textColor2">
      <template v-if="!short">
        <span class="font-normal"><span class="font-bold text-primary">{{total }}</span> {{$t('content.fromTa')}} <span class="font-bold text-primary">{{(page -1)*pageSize}}-{{page*pageSize}} </span> {{$t('content.untilShow')}}</span>
      </template>

    </div>
    <div class="flex xl:justify-end lg:justify-end md:justify-end justify-center">
      <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="page_count"
          show-size-picker
          :page-sizes="pageSizes"
          @update:page-size="changePageSize"
          @update:page="changePage"
      />
    </div>

  </div>

</template>

<script setup>
import i18n from "@/i18n/index.js"
const {t} = i18n.global
import {ref, onMounted, watch } from "vue";
const props = defineProps({
  total:{
    type:Number,
    default:0,
  },
  page:{
    type:Number,
    default:1,
  },
  per_page:{
    type:Number,
    default:10,
  },
  short:{
    type:Boolean,
    default:false,
  }

})

const emits = defineEmits(['changePage'])

const page = ref(1)
const pageSize = ref(10)
const pageSizes = [
  {
    label: t('content.paginationSize',{n:10}),
    value: 10
  },
  {
    label:  t('content.paginationSize',{n:20}),
    value: 20
  },
  {
    label:  t('content.paginationSize',{n:30}),
    value: 30
  },
  {
    label:  t('content.paginationSize',{n:50}),
    value: 50
  },
  {
    label:  t('content.paginationSize',{n:100}),
    value: 100
  }
];
const page_count = ref(0)

watch(()=>props.page, (new_val, old_val)=>{
  page.value = new_val;
})

watch(()=>props.total, (new_val, old_val)=>{
  page_count.value  = Math.ceil(Math.ceil(new_val / pageSize.value));
})
const changePageSize = (per_page)=>{
  page.value = 1;
  page_count.value  = Math.ceil(Math.ceil(props.total / per_page))
  emits('changePage', {
    page:page.value,
    per_page:per_page
  })
}

const changePage = (current_page)=>{
  emits('changePage', {
    page:current_page,
    per_page:pageSize.value
  })
}

onMounted(()=>{
  page.value = props.page;
  pageSize.value = props.per_page;
  pageSizes.value = props.total
  page_count.value  = Math.ceil(Math.ceil(props.total / pageSize.value));
})


</script>

<style lang="scss">


@media only screen and (max-width: 650px) {
  .n-pagination{
    flex-wrap: wrap !important;
    justify-content: center !important;
    row-gap: 10px !important;
    .n-select{
      display: block !important;
    }
  }
}
</style>