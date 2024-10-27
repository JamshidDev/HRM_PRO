<template>
  <yandex-map
      v-model="map"
      :settings="{
        location: {
          center:defaultCenter,
          zoom:zoom
        },
      }"
      width="100%"
      :height="height"
  >
    <yandex-map-default-scheme-layer/>
    <yandex-map-default-features-layer/>
    <template v-for="(marker, idx) in markerList" :key="idx">
      <yandex-map-default-marker
          :settings="{
            coordinates:marker.coords,
            title: marker.name,
            draggable: true,
            onDragMove,
        }"
      />
    </template>
    <yandex-map-controls :settings="{ position: 'bottom right' }">
      <yandex-map-geolocation-control/>
    </yandex-map-controls>
    <yandex-map-listener
        :settings="{
             onClick: createEvent('dom', 'click'),
             onUpdate: createEvent('map', 'update'),
        }"
    />
  </yandex-map>
</template>

<script setup>
import { shallowRef, ref } from 'vue';
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultFeaturesLayer,
  YandexMapGeolocationControl,
  YandexMapControls, YandexMapListener, YandexMapMarker
} from 'vue-yandex-maps';


const props = defineProps({
  defaultMarkers:{
    type:Array,
   required:true,
  },
  defaultCenter:{
    type:Array,
    required:true,
  },
  zoom:{
    type:Number,
    default:12,
  },
  height:{
    type:String,
    default:'500px'
  }
})

const emits = defineEmits(['onChange'])

const map = shallowRef(null);
const markerList = ref([])
const markerName =ref(null)


const onDragMove = (e) => {
  onChange(e)
}


const createEvent =(category,type)=> {
  return (object,event) => {
    if(object && event === undefined){
      onChange(object.location.center)
      addMarker(object.location.center)
    }

  };

};

const addMarker=(coords)=>{
  markerList.value =[]
  markerList.value.push({
    name:markerName.value,
    coords:coords
  })
}

const onChange = (coords)=>{
  emits('onChange', coords)
}


onMounted(()=>{
  props.defaultMarkers.forEach((v)=>{
    markerName.value = v.name
    addMarker(v.coords)
  })
  onChange(props.defaultMarkers[0].coords)

})

</script>