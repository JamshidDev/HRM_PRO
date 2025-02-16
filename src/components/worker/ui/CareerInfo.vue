<script setup>

</script>

<template>
  <div class="w-full grid grid-cols-12">
    <div class="col-span-12">
      <h3 class="text-xl text-surface-800 font-semibold mb-3">{{$t('oldCareerPage.title')}}</h3>
      <table class="w-full ui__worker-table">
        <thead>
        <tr>
          <th style="min-width: 200px">{{$t('oldCareerPage.form.post_name')}}</th>
          <th style="min-width:100px; width: 160px">{{$t('oldCareerPage.form.from_date')}}</th>
          <th style="min-width:100px; width: 160px">{{$t('oldCareerPage.form.to_date')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in 10" :key="item">
          <td class="p-2 font-semibold">«O'zbekiston temir yo'llari» aktsiyadorlik jamiyati «O'zbekiston» lokomotiv deposi 3-darajali elektrovoz mashinisti	</td>
          <td class="p-2 text-blue-900">12.03.2028</td>
          <td class="p-2 text-blue-900">12.03.2028</td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>

</style>