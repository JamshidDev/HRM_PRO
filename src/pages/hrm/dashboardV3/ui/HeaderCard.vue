<script setup>

defineProps({
    card: {
        type: Object,
        required: true
    }
})

</script>
<template>
    <div class="w-full border border-surface-line p-4 rounded-lg bg-surface-section relative cursor-pointer">
        <span
            class="z-1 opacity-30 absolute top-0 right-0 w-[160px] h-full bg-no-repeat bg-[url(/effect/primary-card.svg)]"></span>
        <p class="font-medium text-textColor2">{{ $t(card?.total.title) }}</p>
        <h3 class="text-2xl font-semibold mt-2 text-textColor0">{{ card?.total?.count }}</h3>
        <div class="w-full flex justify-between mt-4">
            <span class="text-xs text-textColor0">{{ $t(card?.data1.title) }} - <span class="text-sm font-semibold">{{
                card?.data1?.count }}</span></span>
            <span class="text-xs text-textColor2">{{ $t(card?.data2.title) }} - <span class="text-sm font-semibold">{{
                card?.data2?.count }}</span></span>
        </div>
    </div>
</template>