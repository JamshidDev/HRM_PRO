<script setup>

</script>

<template>
    <div class="w-full flex flex-col bg-surface-section p-4 rounded-2xl border border-surface-line h-full">
      <div class="grid grid-cols-12">
        <p class="col-span-6 flex items-center gap-2 text-textColor3"> <span class="w-[16px] h-[16px] bg-success inline-block rounded-full"></span> - Biriktirilgan</p>
        <p class="col-span-6 flex items-center gap-2 text-textColor3"> <span class="w-[16px] h-[16px] bg-danger inline-block rounded-full"></span> - Biriktirilmagan</p>
      </div>

      <div class="flex justify-center border border-dashed border-surface-line mt-6 py-4 rounded-2xl">
        <span class="text-6xl font-bold text-success">648</span>
        <span class="text-6xl font-bold text-secondary">/</span>
        <span class="text-6xl font-bold text-danger">876</span>
      </div>
    </div>
</template>
