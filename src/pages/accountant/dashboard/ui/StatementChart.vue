<script setup>
import {useAccDashboardStore} from "@/store/modules/index.js"
import VChart from "vue-echarts"
import {use} from "echarts/core"
import {CanvasRenderer} from "echarts/renderers"
import {BarChart, PieChart, LineChart} from "echarts/charts"
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent, ToolboxComponent} from "echarts/components"
import numeral from 'numeral';

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  LineChart,
  ToolboxComponent,
]);

const store = useAccDashboardStore()

const props = defineProps({
  chartType:{
    type:String, // card_one  card_two card_three
    default:'card_one'
  }
})

const style =computed(()=>{

  let colorCode = '18,121,240'

  if(props.chartType === 'card_two'){
    colorCode = '241,11,11'
  }

  if(props.chartType === 'card_three'){
    colorCode ='45,203,115'

  }


  return {
    color:`rgba(${colorCode},1)`,
    shadow:`rgba(${colorCode},0.26)`,
    start:`rgba(${colorCode},0.62)`,
    end:`rgba(${colorCode},0.07)`,
  }

})

const option = computed(()=>{
  const defaultOption = {
    grid: {
    top: '10%',
    left: '2%',
    right: '2%',
    bottom: '2%',
    containLabel: true,
  },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#aaa'
        }
      }
    },
    xAxis: {
      type: 'category',
      data: [],
      axisPointer: {
        type: 'shadow'
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '',
      axisLabel: {
        formatter: function (value) {
          return '{value|' + (value / 1000000).toFixed(0) + ' }{unit|}';
        },
        rich: {
          value: {
            color: '#0f0f0f',
            fontWeight: 'bold' // Faqat raqam qalin
          },
          unit: {
            color: 'rgba(41,41,41,0.43)',
            fontWeight: 'normal' // Birlik oddiy font
          }
        },
      },
      splitLine: { show: true }
    },
    series: [
      {
        name: 'Aniq miqdori',
        type: 'line',
        smooth: true,
        data: [],
        label: {
          show: true,
          position: 'top',
          formatter:function (params) {
            return '{value|' + (params.value / 1000000).toFixed(0) + ' }{unit|}';
          },
          rich: {
            value: {
              color: style.value.color,
              fontWeight: 'bold'
            },
            unit: {
              color: 'rgba(41,41,41,0.43)',
              fontWeight: 'normal'
            }
          },
        },
        tooltip: {
          valueFormatter: function (value) {
            return  numeral(value).format('0,0.0') + ' so‘m';
          }
        },
        itemStyle: {
          color: style.value.color
        },
        lineStyle: {
          width: 3,
          shadowColor: style.value.shadow, // Soya rangi
          shadowBlur: 10, // Soya xiraligi
          shadowOffsetY: 5 // Soya vertikal siljishi
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: style.value.start }, // Chiziq ostidagi soya rangi (yuqorida)
              { offset: 1, color: style.value.end } // Pastga tushganda shaffof
            ]
          }
        },
        symbolSize: 10
      }
    ]
  }

  if(!store.dashboardData) return defaultOption
  const v = store.dashboardData
  defaultOption.xAxis.data = v.statements.map(x=>x.label)

  if(props.chartType === 'card_one'){
    defaultOption.series[0].data = v.statements.map(x=>x.amount?.total_one || 0)
  }else if(props.chartType === 'card_two'){
    defaultOption.series[0].data = v.statements.map(x=>x.amount?.total_two || 0)
  }
  else if(props.chartType === 'card_three'){
    defaultOption.series[0].data = v.statements.map(x=>x.amount?.total_three || 0)
  }
  return defaultOption
})
</script>

<template>
  <v-chart autoresize :option="option" />
</template>
