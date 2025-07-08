<script setup>
import {useUploadReportStore} from "@/store/modules/index.js"
import {
  CheckmarkCircle12Regular,
  ChevronRight12Regular,
  DocumentBulletList24Filled, Folder20Filled,
  FolderOpen24Filled
} from "@vicons/fluent"
import {TreeData} from "@/components/index.js"
import {computed} from "vue"
const store = useUploadReportStore()


const flattenData = computed(()=>{

  function flattenTreeWithLevel(tree, level = 0) {
    const result = [];

    function traverse(nodes, currentLevel) {
      for (const node of nodes) {
        const { children, ...rest } = node;
        result.push({ ...rest, level:currentLevel, isHasChildren: !!children.length })
        const isExpanded = store.expandSet.has(node.id)
        if (isExpanded && children && children.length > 0) {
          traverse(children, currentLevel + 1);
        }
      }
    }

    traverse(tree, level);
    return result;
  }
  return  flattenTreeWithLevel(store.structuresList, 0)
})

const toggleExpand =(id)=> {
  if (store.expandSet.has(id)) {
    store.expandSet.delete(id)
  } else {
    store.expandSet.add(id)
  }
}



onMounted(()=>{
  store._structures()
})

</script>

<template>
  <n-spin class="min-h-[400px]" :show="store.structuresLoading">
    <div class="w-full bg-surface-section rounded-lg overflow-y-auto overflow-x-hidden h-[calc(100vh-180px)]">
<!--      <TreeData-->
<!--          :multiple="false"-->
<!--          :opened="true"-->
<!--          :options="store.structuresList"-->
<!--          :modelV="store.params.organization_id"-->
<!--          :checkedVal="store.structureCache"-->
<!--          @updateModel="store.onChangeStructure"-->
<!--          @updateCheck="(v)=>store.structureCache=v"-->
<!--          :show-check="true"-->
<!--      >-->
<!--        <template #title="{data}">-->
<!--          <div class="flex justify-between items-center hover:bg-surface/5">-->
<!--            <span class="text-textColor2">{{data.name}}</span>-->
<!--            <div class="px-2 font-medium flex items-center text-shadow-textColor2">-->
<!--              <template v-if="data.uploadStats?.confirmed === data.uploadStats?.total_types">-->
<!--                <n-icon size="18" class="text-success">-->
<!--                  <CheckmarkCircle12Regular/>-->
<!--                </n-icon>-->
<!--              </template>-->
<!--              <template v-else>-->
<!--                <span class="text-warning">{{data.uploadStats?.uploaded}}</span>/<span class="text-success">{{data.uploadStats?.confirmed}}</span>/<span class="text-primary">{{data.uploadStats?.total_types}}</span>-->
<!--              </template>-->


<!--            </div>-->
<!--          </div>-->
<!--        </template>-->
<!--      </TreeData>-->

      <n-table
          class="w-full"
          style="border-collapse: collapse"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="min-w-[400px] w-[400px] !text-center">{{$t('content.organization')}}</th>
          <th class="min-w-[100px] !text-center "></th>
          <th class="min-w-[100px] w-[100px] !text-center"></th>
          <th class="min-w-[100px] w-[100px] !text-center"></th>
          <th class="min-w-[100px] w-[100px] !text-center"></th>
        </tr>
        </thead>
        <tbody>
        <template v-for="(item, idx) in flattenData" :key="idx">
          <tr class="!text-center">
            <td class="!text-left">
              <div :style="{paddingLeft:(item.level*15+'px')}" class="flex items-start">
                <div class="flex justify-end w-[40px]">
                  <n-icon
                      v-if="item.isHasChildren"
                      @click="toggleExpand(item.id)"
                      :class="[store.expandSet.has(item.id)? 'rotate-90' : 'rotate-0' ]"
                      class="transition-all " size="18">
                    <ChevronRight12Regular/>
                  </n-icon>
                  <n-icon size="20">
                    <template v-if="item.isHasChildren">
                      <FolderOpen24Filled
                          v-if="store.expandSet.has(item.id)"
                          class="text-[#a312df]"
                      />
                      <Folder20Filled
                          v-else
                          class="text-[#a312df]"
                      />
                    </template>
                    <DocumentBulletList24Filled v-else class="text-primary"/>
                  </n-icon>
                </div>
                <span class="ml-2 leading-[1.2] inline-block !text-wrap text-sm w-[calc(100%-40px)]">{{' '+ item.name}}</span>
              </div>
            </td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
          </tr>
        </template>

        </tbody>
      </n-table>
    </div>
  </n-spin>



</template>
