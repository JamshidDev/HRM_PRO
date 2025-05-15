<script setup>
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, PieChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
} from 'echarts/components';
import i18n from "@/i18n/index.js"
const { t } = i18n.global

import { useAccountStore, useDashboardStore } from "@/store/modules/index.js"


const store = useDashboardStore()
const accStore = useAccountStore()

use([
    CanvasRenderer,
    BarChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    PieChart,
]);

const pieOption = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        top: '5%',
        left: 'center',
        show: false,
    },
    series: [
        {
            name: t('dashboardPage.rewardCard.reward.title'),
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '70%'],
            startAngle: 180,
            endAngle: 360,
            itemStyle: {
                borderRadius: 6,
            },
            data: [
                { value: 1048, name: t('dashboardPage.rewardCard.reward.shortTypeOne'), itemStyle: { color: '#1A84FF' } },
                { value: 735, name: t('dashboardPage.rewardCard.reward.shortTypeTwo'), itemStyle: { color: '#2dcb73' } },
            ]
        }
    ]
}


const pieOption2 = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        top: '5%',
        left: 'center',
        show: false,
    },
    series: [
        {
            name: t('dashboardPage.rewardCard.punishment.title'),
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '70%'],
            startAngle: 180,
            endAngle: 360,
            itemStyle: {
                borderRadius: 6,
            },

            data: [
                { value: 1048, name: t('dashboardPage.rewardCard.punishment.shortTypeOne'), itemStyle: { color: '#1A84FF' } },
                { value: 735, name: t('dashboardPage.rewardCard.punishment.shortTypeOne'), itemStyle: { color: '#E53835' } },
            ]
        }
    ]
}

</script>

<template>
    <div class="w-full h-full border border-surface-line p-4 rounded-lg bg-surface-section relative hover-effect-card">
        <span
            class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/effect-card-1.svg)]"></span>
        <div class="flex h-auto">
            <div class="text-textColor2" style="width: calc(100% - 280px)">
                <p class="font-semibold text-textColor2">{{ $t('dashboardPage.rewardCard.reward.title') }}</p>
                <p class="mt-2 text-xs">{{ $t('dashboardPage.rewardCard.reward.typeOne') }}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>

                <p class="mt-2 text-xs">{{ $t('dashboardPage.rewardCard.reward.typeTwo') }}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>

            </div>
            <div class="w-[280px] h-[120px] relative z-2">
                <v-chart :option="pieOption" />
            </div>
        </div>
        <hr class="w-full h-[1px] text-surface-line mt-2">
        <div class="flex h-auto mt-2">
            <div class="text-textColor2" style="width: calc(100% - 280px)">
                <p class="font-semibold text-textColor2">{{ $t('dashboardPage.rewardCard.punishment.title') }}
                </p>

                <p class="mt-2 text-xs">{{ $t('dashboardPage.rewardCard.punishment.typeOne') }}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>

                <p class="mt-2 text-xs">{{ $t('dashboardPage.rewardCard.punishment.typeTwo') }}</p>
                <h3 class="font-semibold leading-[1.2]">0</h3>
            </div>
            <div class="w-[280px] h-[120px] relative z-2">
                <v-chart :option="pieOption2" />
            </div>
        </div>
    </div>
</template>