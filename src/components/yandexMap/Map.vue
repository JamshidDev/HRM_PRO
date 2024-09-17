<template>
  <yandex-map
      v-model="map"
      :settings="{
        location: {
          center: [69.240562,41.311081],
          zoom: 16,
        },
      }"
      width="100%"
      height="500px"
  >
    <yandex-map-default-scheme-layer/>
    <yandex-map-default-features-layer/>
    <yandex-map-default-marker
        v-model="defaultMarker"
        :settings="{
            coordinates:[69.240562,41.311081],
            title: `Долгота: 23`,
            draggable: true,
            onDragMove,
        }"
    />
    <yandex-map-controls :settings="{ position: 'bottom right' }">
      <yandex-map-geolocation-control/>
    </yandex-map-controls>
    <yandex-map-listener
        :settings="{
             onClick: createEvent('dom', 'click'),
        }"
    />
  </yandex-map>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';
import { YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultFeaturesLayer,
  YandexMapGeolocationControl,
  YandexMapControls,YandexMapListener
} from 'vue-yandex-maps';
import type { BehaviorMapEventHandler, BehaviorType, DomEvent } from '@yandex/ymaps3-types';
//Можно использовать для различных преобразований
const map = shallowRef(null);
const defaultMarker = shallowRef(null);
const onDragMove = () => {
  console.log(defaultMarker.value)
  triggerRef(defaultMarker);
};
function debounce<T extends Function>(func: T, delay: number): (...args: any[]) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

return function _(this: any, ...args: any[]): void {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    func.apply(this, args);
  }, delay);
};
}
const events = reactive({
  map: {
    update: false,
    resize: false,
  },
  dom: {
    click: false,
    fastClick: false,
    dblClick: false,
    contextMenu: false,
    rightDblClick: false,
    mouseMove: false,
    mouseEnter: false,
    mouseLeave: false,
    mouseUp: false,
    mouseDown: false,
  },
  behavior: {
    scrollZoom: false,
    drag: false,
    mouseRotate: false,
    mouseTilt: false,
  },
});
const createEvent = <T extends keyof typeof events, E = keyof typeof events[T]>(category: T, type: E | boolean): any => {
  const eventState = events[category] as any;

  if (typeof type !== 'boolean') {
    const endEvent = debounce(() => {
      eventState[type] = false;
    }, 250);

    return (object: Record<string, any>, event?: DomEvent) => {
      console.log(`${ type } Object: `, object, `\n`, `${ type } Event: `, event);

      eventState[type] = true;
      endEvent();
    };
  }
  return (object: Parameters<BehaviorMapEventHandler>[0]) => {
    console.log(`${ type ? 'actionStart' : 'actionEnd' } Object:`, object);
    if (!(object.type in events.behavior)) return;

    eventState[object.type] = type;
  };
};

</script>