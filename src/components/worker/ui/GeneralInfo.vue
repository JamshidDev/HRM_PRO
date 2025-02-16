<script setup>
import {useWorkerProfileStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"

const store = useWorkerProfileStore()
</script>

<template>
  <div v-if="store.workerPreview" class="w-full grid grid-cols-12">
    <div class="col-span-12 mt-6">
      <div class="text-sm uppercase mb-2 font-medium">{{$t('workerView.general.name')}}</div>
      <div class="grid grid-cols-12 border border-dashed rounded-md border-surface-line p-2">
        <div class="col-span-6">
          <span class="block p-1 leading-4">{{$t('workerView.general.fullName')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.last_name+ ' '+store.workerPreview?.worker.first_name+' '+store.workerPreview?.worker.middle_name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.birthday')}}: <span class="font-semibold pl-2">{{Utils.timeOnlyDate(store.workerPreview?.worker?.birthday)}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.maritalStatus')}}: <span class="font-semibold pl-2"></span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.address')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.address}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.birthdayRegion')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.region.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.birthdayCity')}}: <span class="font-semibold pl-2"> {{store.workerPreview?.worker.city.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.liveRegion')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.current_region.name}}</span></span>

        </div>
        <div class="col-span-6">
          <span class="block p-1 leading-4">{{$t('workerView.general.liveCity')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.current_city.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.academicTitle')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.academic_title.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.academicDegree')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.academic_degree.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.part')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.party.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.inn')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.inn}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.nationality')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.nationality.name.name}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.country')}}: <span class="font-semibold pl-2">{{store.workerPreview?.worker.country.name}}</span></span>
        </div>
      </div>
    </div>

    <div class="col-span-12 mt-6">
      <div class="text-sm uppercase mb-2 font-medium">{{$t('workerView.general.passportName')}}</div>
      <div v-for="(item, idx) in store.workerPreview?.worker.passports" :key="idx" class="grid grid-cols-12 border border-dashed rounded-md border-surface-line p-2">
        <div class="col-span-6">
          <span class="block p-1 leading-4">{{$t('workerView.general.passportNumber')}}: <span class="font-semibold pl-2">{{item.serial_number}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.who')}}: <span class="font-semibold pl-2">{{item.address}}</span></span>

        </div>
        <div class="col-span-6">
          <span class="block p-1 leading-4">{{$t('workerView.general.fromDate')}}: <span class="font-semibold pl-2">{{Utils.timeOnlyDate(item.from_date)}}</span></span>
          <span class="block p-1 leading-4">{{$t('workerView.general.toDate')}}: <span class="font-semibold pl-2">{{Utils.timeOnlyDate(item.to_date)}}</span></span>
        </div>
      </div>
    </div>





    <div class="col-span-12">
<!--      <h3 class="text-xl text-surface-800 font-semibold mb-3">{{$t('workerView.general.name')}}</h3>-->
<!--      <table class="w-full ui__worker-table">-->
<!--        <tbody>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.fullName')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%">Raximov Jamshid Shuxrat o'g'li</td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.birthday')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.passportNumber')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.passportJSHSHIR')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.fromDate')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.toDate')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.who')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.phone')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->

<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.nationality')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.maritalStatus')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.birthdayRegion')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.birthdayCity')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.liveRegion')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.liveCity')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.academicTitle')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.academicDegree')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.part')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.inn')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        <tr>-->
<!--          <td class="p-2 font-semibold" style="width:50%">{{$t('workerView.general.country')}}</td>-->
<!--          <td class="p-2 text-blue-900" style="width:50%"></td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </table>-->
    </div>

  </div>
</template>
