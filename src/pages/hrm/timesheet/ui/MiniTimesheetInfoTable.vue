<script setup>
defineProps({
    halfDays: Number,
    halfHours: Number,
    allDays: Number,
    allHours: Number
})
</script>
<template>
    <table class="w-full h-full border-collapse text-center">
        <thead class="h-[50%] border-b border-surface-line">
            <tr>
                <th class="text-xs border-r border-surface-line pl-[20px]" colspan="2">
                    {{ $t('timesheetPage.halfMonth') }}
                </th>
                <th class="text-xs" colspan="2">
                    {{ $t('timesheetPage.total') }}
                </th>
            </tr>
        </thead>
        <tbody class="h-[50%]">
            <tr>
                <td class="text-xs border-r border-surface-line pl-[20px]">{{ $t('timesheet.nDays', {n:halfDays})  }}</td>
                <td class="text-xs border-r border-surface-line">{{ $t('timesheet.nHours', {n:halfHours}) }}</td>
                <td class="text-xs border-r border-surface-line">{{ $t('timesheet.nDays', {n:allDays})  }}</td>
                <td class="text-xs ">{{ $t('timesheet.nHours', {n:allHours}) }}</td>
            </tr>
        </tbody>
    </table>
</template>
<style scoped></style>