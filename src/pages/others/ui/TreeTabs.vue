<script setup>
import {UIHierarchy, UIPanZoomArea, TreeData} from "@/components/index.js";
import {TextBulletListTree16Filled, Organization12Filled} from '@vicons/fluent'

const rootNode = {
  id: 1,
  name: "CEO",
  children: [
    {
      id: 2,
      name: "VP Operations",
      children: [
        {
          id: 3,
          name: "Manager Operations 1",
          children: [
            {
              id: 4,
              name: "Supervisor A",
              children: [
                {id: 5, name: "Employee A1"},
                {id: 6, name: "Employee A2"},
                {id: 7, name: "Employee A3"}
              ]
            },
            {
              id: 8,
              name: "Supervisor B",
              children: [
                {id: 9, name: "Employee B1"},
                {id: 10, name: "Employee B2"}
              ]
            }
          ]
        },
        {
          id: 11,
          name: "Manager Operations 2",
          children: [
            {
              id: 12,
              name: "Supervisor C",
              children: [
                {id: 13, name: "Employee C1"},
                {id: 14, name: "Employee C2"}
              ]
            }
          ]
        }
      ]
    },
    {
      id: 15,
      name: "VP Marketing",
      children: [
        {
          id: 16,
          name: "Manager Marketing 1",
          children: [
            {
              id: 17,
              name: "Team Lead D",
              children: [
                {id: 18, name: "Employee D1"},
                {id: 19, name: "Employee D2"},
                {id: 20, name: "Employee D3"}
              ]
            },
            {
              id: 21,
              name: "Team Lead E",
              children: [
                {id: 22, name: "Employee E1"}
              ]
            }
          ]
        },
        {
          id: 23,
          name: "Manager Marketing 2",
          children: [
            {
              id: 24,
              name: "Team Lead F",
              children: [
                {id: 25, name: "Employee F1"},
                {id: 26, name: "Employee F2"}
              ]
            },
            {
              id: 27,
              name: "Team Lead G",
              children: [
                {id: 28, name: "Employee G1"},
                {id: 29, name: "Employee G2"},
                {id: 30, name: "Employee G3"}
              ]
            }
          ]
        }
      ]
    },
    {
      id: 31,
      name: "VP Engineering",
      children: [
        {
          id: 32,
          name: "Manager Engineering 1",
          children: [
            {
              id: 33,
              name: "Tech Lead H",
              children: [
                {id: 34, name: "Engineer H1"},
                {id: 35, name: "Engineer H2"},
                {id: 36, name: "Engineer H3"}
              ]
            }
          ]
        },
        {
          id: 37,
          name: "Manager Engineering 2",
          children: [
            {
              id: 38,
              name: "Tech Lead I",
              children: [
                {id: 39, name: "Engineer I1"},
                {id: 40, name: "Engineer I2"}
              ]
            },
            {
              id: 41,
              name: "Tech Lead J",
              children: [
                {id: 42, name: "Engineer J1"}
              ]
            }
          ]
        }
      ]
    }
  ]
};

const tab = ref(0);
const buttons = [
  {
    icon: Organization12Filled,
  },
  {
    icon: TextBulletListTree16Filled,
  }
]

const structureCheck = ref([])
const structureModel = ref([])

</script>
<template>
  <div>
    <div class="absolute top-2 right-2">
      <n-button-group>
        <n-button v-for="(item, idx) in buttons" :key="idx" @click="tab=idx" :type="tab === idx ? 'primary' : 'default'">
          <template #icon>
            <n-icon :component="item.icon"/>
          </template>
        </n-button>
      </n-button-group>

    </div>
    <n-tabs animated style="height: calc(100vh - 150px);" v-model:value="tab" class="h-full" :tab-style="{display: 'none'}" :pane-wrapper-style="{height: '100%'}">
      <n-tab-pane  :name="0" class="h-full">

        <UIPanZoomArea>
          <UIHierarchy :tree="rootNode"></UIHierarchy>
        </UIPanZoomArea>
      </n-tab-pane>
      <n-tab-pane :name="1" class="h-full overflow-auto">

        <!-- Data List -->
        <TreeData
            :multiple="false"
            :opened="true"
            :options="[rootNode]"
            :modelV="structureModel"
            :checkedVal="structureCheck"
            @updateModel="(v)=>structureModel=v"
            @updateCheck="(v)=>structureCheck=v"
        >
          <template v-slot:title="{data}">{{ data.name }}</template>
        </TreeData>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>