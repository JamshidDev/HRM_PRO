<script setup>
import {CloudCheckmark24Regular, DismissCircle48Regular, ChevronCircleLeft24Regular} from "@vicons/fluent"
import {useCategoryQuestionStore, useCategoryStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
const t = i18n.global.t

const store = useCategoryQuestionStore()
const categoryStore = useCategoryStore()
const inputFileRef = ref(null)
const onUpload = async (v)=>{
  let file = v.target.files[0]
  store.selectedFile = file
  const formData = new FormData()
  formData.append('file', file)
  store._excelPreview(formData)

}
const clickEv = (v)=>{
  inputFileRef.value.click()
}

const selectedCols = computed(()=>{
  return store.headerRow.filter(v=>v.value)
})


const columnClass = (index, rowIndex)=>{
  let existIndex = selectedCols.value.findIndex(v=>v.index===index)
  if(existIndex === -1 || rowIndex+1<=store.selectedRow ) return 'no-select'
  return  selectedCols.value[existIndex].value
}

const onChange = (v)=>{
  store.selectedCol = store.selectedCol=== v? null : v
}

const onBack = ()=>{
  store.selectedFile = null
}

const onSave = ()=>{
  const options = store.headerRow.filter(v=>v.value==='option')
  const question = store.headerRow.filter(v=>v.value==='ques')
  const correctOption = store.headerRow.filter(v=>v.key===store.selectedCol)
  console.log(correctOption)
  const isValid = question.length===1 && correctOption.length===1 && options.length>=3 && options.length<=5
  if(!isValid){
    $Toast.warning(t('categoryPage.warning'))
    return
  }
  let mapping = {}
  const formData = new FormData()
  mapping[question[0].key] = question[0].value
  for(const [index, option] of options.entries()){
    mapping[option.key]=`option_${index+1}`
  }
  mapping[correctOption[0].key] = 'option_6_correct'
  formData.append('startRow', store.selectedRow+1)
  formData.append('file', store.selectedFile)
  formData.append('mapping', JSON.stringify(mapping))
  store._importExcel(formData,categoryStore._index)
}


</script>

<template>
<div class="grid grid-cols-12">
  <template v-if="store.selectedFile && !store.excelPreviewLoading">

    <div class="col-span-12 overflow-x-auto">
      <n-radio-group v-model:value="store.selectedRow" name="radiogroup">
        <n-table
            class="mt-3 w-full"
            :single-line="false"
            size="small"
        >

          <thead>
          <tr>
            <th class="min-w-[30px]"></th>
            <template v-for="(_, idx) in store.headerRow" :key="idx">
              <th class="text-center! min-w-[200px] ">
                <div class="flex items-center gap-2">
                  <n-checkbox @click="onChange(store.headerRow[idx].key)" :checked="store.selectedCol === store.headerRow[idx].key">
                  </n-checkbox>
                  <n-select
                      v-model:value="store.headerRow[idx].value"
                      clearable
                      :options="store.options"
                      label-field="name"
                      value-field="id"

                  />
                </div>

              </th>
            </template>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(item,idx) in store.excelPreviewList"
              :key="idx"
          >
            <td>
              <n-radio
                  :value="idx"
              />
            </td>
            <td
                v-for="(subItem, index) in item"
                :key="index"
                :class="[columnClass(index, idx)]"
            >
              <p class="line-clamp-2">{{subItem}}</p>
            </td>
          </tr>
          </tbody>
        </n-table>
      </n-radio-group>
    </div>

    <div class="col-span-12 flex justify-between mt-4">
      <div @click="onBack" class="flex cursor-pointer gap-2 rounded-2xl items-center border border-surface-line px-2 py-1">
        <img class="w-[40px]" src="/excel.svg" alt="excel logo">
        <p class="line-clamp-1">{{store.selectedFile?.name}}</p>
        <n-icon size="24" class="text-danger">
          <DismissCircle48Regular/>
        </n-icon>
      </div>
      <div class="flex gap-4 items-center">
        <n-button @click="onBack"  type="error" secondary>{{$t('content.back')}} <template #icon><ChevronCircleLeft24Regular/></template></n-button>
        <n-button :loading="store.importLoading" @click="onSave" type="primary">{{$t('content.save')}}</n-button>
      </div>
    </div>
  </template>
  <div class="col-span-12" v-else>
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
  background-color: rgba(253, 199, 0, 0.05) !important;
}
.correct{
  background-color: rgba(20, 219, 113, 0.05) !important;
}
.ques{
  background-color: rgba(207, 15, 98, 0.1) !important;
}
</style>
