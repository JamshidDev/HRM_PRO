<script setup>
import {UIPanZoomArea, UIHierarchy, UIPageContent} from "@/components";



const rootNode = {
  name: "CEO",
  children: [
    {
      name: "VP Operations",
      children: [
        {
          name: "Manager Operations 1",
          children: [
            {
              name: "Supervisor A",
              children: [
                { name: "Employee A1" },
                { name: "Employee A2" },
                { name: "Employee A3" }
              ]
            },
            {
              name: "Supervisor B",
              children: [
                { name: "Employee B1" },
                { name: "Employee B2" }
              ]
            }
          ]
        },
        {
          name: "Manager Operations 2",
          children: [
            {
              name: "Supervisor C",
              children: [
                { name: "Employee C1" },
                { name: "Employee C2" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "VP Marketing",
      children: [
        {
          name: "Manager Marketing 1",
          children: [
            {
              name: "Team Lead D",
              children: [
                { name: "Employee D1" },
                { name: "Employee D2" },
                { name: "Employee D3" }
              ]
            },
            {
              name: "Team Lead E",
              children: [
                { name: "Employee E1" }
              ]
            }
          ]
        },
        {
          name: "Manager Marketing 2",
          children: [
            {
              name: "Team Lead F",
              children: [
                { name: "Employee F1" },
                { name: "Employee F2" }
              ]
            },
            {
              name: "Team Lead G",
              children: [
                { name: "Employee G1" },
                { name: "Employee G2" },
                { name: "Employee G3" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "VP Engineering",
      children: [
        {
          name: "Manager Engineering 1",
          children: [
            {
              name: "Tech Lead H",
              children: [
                { name: "Engineer H1" },
                { name: "Engineer H2" },
                { name: "Engineer H3" }
              ]
            }
          ]
        },
        {
          name: "Manager Engineering 2",
          children: [
            {
              name: "Tech Lead I",
              children: [
                { name: "Engineer I1" },
                { name: "Engineer I2" }
              ]
            },
            {
              name: "Tech Lead J",
              children: [
                { name: "Engineer J1" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
</script>

<template>
  <div style="height: calc(100vh - 150px);">
    <UIPanZoomArea>
      <UIHierarchy :tree="rootNode"></UIHierarchy>
    </UIPanZoomArea>

  </div>


</template>
<style scoped>

</style>
