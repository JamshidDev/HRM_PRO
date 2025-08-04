<script setup>
import {CloudCheckmark24Regular} from "@vicons/fluent"
import {useCategoryQuestionStore} from "@/store/modules/index.js"
import {UIMenuButton} from "@/components/index.js"

const store = useCategoryQuestionStore()
const inputFileRef = ref(null)
const onUpload = async (v)=>{
  let file = v.target.files[0]
  const formData = new FormData()
  formData.append('file', file)
  store._excelPreview(formData)

}
const clickEv = (v)=>{
  inputFileRef.value.click()
}

const selectedCols = computed(()=>{
  let cols = store.headerRow.filter(v=>v.value)
  console.log(cols)
  return cols
})


const columnClass = (index)=>{
  let existIndex = selectedCols.value.findIndex(v=>v.index===index)
  if(existIndex === -1) return 'no-select'
  return  selectedCols.value[existIndex].value
}


</script>

<template>
<div class="grid grid-cols-12">
  <div class="col-span-12" v-if="store.headerRow.length===0">
    <n-spin :show="store.excelPreviewLoading">
      <div @click="clickEv" class="w-full bg-patter h-[120px] border border-surface-line border-dashed rounded-2xl mb-4 flex justify-center items-center cursor-pointer hover:scale-[0.96] scale-[1] transition-all duration-300">
        <span class="font-semibold text-success flex gap-2 text-xl items-center"><n-icon size="42"><CloudCheckmark24Regular/></n-icon> {{$t('categoryPage.pressUpload')}}</span>
        <input @change="onUpload" v-show="false"  type="file" ref="inputFileRef"/>
      </div>
      <template #description>
        {{$t('categoryPage.checkingFile')}}
      </template>
    </n-spin>
  </div>
  <div class="col-span-12 overflow-x-auto">

    <n-table
        class="mt-3 w-full"
        :single-line="false"
        size="small"
    >
      <thead>
      <tr>
        <template v-for="(_, idx) in store.headerRow" :key="idx">
          <th class="text-center! min-w-[200px]">
            <n-select
                v-model:value="store.headerRow[idx].value"
                clearable
                :options="store.options"
                label-field="name"
                value-field="id"

            />
          </th>
        </template>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, idx) in store.excelPreviewList" :key="idx">
        <td
            v-for="(subItem, index) in item"
            :key="index"
            :class="[columnClass(index)]"
        >
          <p class="line-clamp-2">{{subItem}}</p>
        </td>
      </tr>
      </tbody>
    </n-table>
    <pre>
      {{selectedCols}}
    </pre>
  </div>
</div>
</template>



<style scoped>
.bg-patter {
  background-color: #ffffff;
  opacity: 0.8;
  background: radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent) 25px 25px, linear-gradient(#ecedf4 2px, transparent 2px) 0 -1px, linear-gradient(90deg, #ecedf4 2px, #ffffff 2px) -1px 0;
  background-size: 50px 50px, 50px 50px, 25px 25px, 25px 25px;
}

.option{
  background-color: var(--warning-color) !important;
}
</style>
