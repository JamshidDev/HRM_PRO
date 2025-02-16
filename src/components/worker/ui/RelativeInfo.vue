<script setup>

</script>

<template>
  <div class="w-full grid grid-cols-12">
    <div class="col-span-12">
      <h3 class="text-xl text-surface-800 font-semibold mb-3">{{$t('relativePage.title')}}</h3>
      <table class="w-full ui__worker-table">
        <thead>
        <tr>
          <th style="min-width:100px; width:160px">{{$t('relativePage.form.relative')}}</th>
          <th style="min-width:100px; width: 160px">{{$t('content.fullName')}}</th>
          <th style="min-width:100px">{{$t('relativePage.form.post_name')}}</th>
          <th style="min-width:100px; width:200px">{{$t('relativePage.form.birthdayPlace')}}</th>
          <th style="min-width:100px; width:200px">{{$t('createWorkerPage.form.address')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in 10" :key="item">
          <td class="p-2 font-semibold">Turmu qurgan</td>
          <td class="p-2 text-blue-900">Raximov jamshid Shuxrat o'g'li</td>
          <td class="p-2 text-blue-900">Samarqand viloyati, Pastdarg'om tumani, O'zbekiston mahallasi, Olmazor ko'chasi, 28-uy</td>
          <td class="p-2 text-blue-900">Samarqand viloyati, Pastdarg'om tumani, O'zbekiston mahallasi, Olmazor ko'chasi, 28-uy</td>
          <td class="p-2 text-blue-900">Samarqand viloyati, Pastdarg'om tumani, O'zbekiston mahallasi, Olmazor ko'chasi, 28-uy
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>

</style>