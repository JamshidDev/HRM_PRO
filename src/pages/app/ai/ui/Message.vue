<script setup>
const props = defineProps({
  data:{
    type:Object,
    required:true,
  }
})

const isBot = computed(()=>props.data?.bot)
</script>

<template>
<div
    class="flex w-full mb-6"
    :class="[isBot? 'justify-start' : 'justify-end']"
>
  <div class="flex items-end">
    <div
        v-if="isBot"
        class="flex items-end mx-2">
      <n-avatar
          round
          size="large"
          src="empty.png"
          :fallback-src="data?.photo"
      />
    </div>


    <div
        :class="[isBot? 'bg-[#E9EEF5]' : 'bg-primary text-white']"
        class="max-w-[500px] w-auto inline-block py-2 px-4  border border-gray-200 rounded-2xl">
        <pre
            class="text-wrap w-full"
            v-html="data?.text"
        ></pre>
    </div>


    <div
        v-if="!isBot"
        class="flex items-end mx-2">
      <n-avatar
          round
          size="large"
          src="empty.png"
          :fallback-src="data?.photo"
      />
    </div>
  </div>

</div>
</template>

<style scoped>

</style>