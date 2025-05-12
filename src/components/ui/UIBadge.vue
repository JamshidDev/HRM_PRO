<script setup>
import {PeopleCheckmark20Filled, DataSunburst20Filled, CheckmarkCircle12Filled, Circle48Filled} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
const props = defineProps({
  label:{
    types:String,
    default:"",
  },
  type:{
    types:String,
    default:Utils.colorTypes.info,
  },
  showIcon:{
    type:Boolean,
    default:true
  },

})


const types = [
  {
    id:Utils.colorTypes.info,
    type:'ui--badge-info',
    icon:Circle48Filled,
  },
  {
    id:Utils.colorTypes.warning,
    type:'ui--badge-warning',
    icon:PeopleCheckmark20Filled,
  },
  {
    id:Utils.colorTypes.error,
    type:'ui--badge-error',
    icon:DataSunburst20Filled,
  },
  {
    id:Utils.colorTypes.success,
    type:'ui--badge-success',
    icon:CheckmarkCircle12Filled,
  },
  {
    id:Utils.colorTypes.dark,
    type:'ui--badge-dark',
    icon:Circle48Filled,
  },
  {
    id:Utils.colorTypes.secondary,
    type:'ui--badge-secondary',
    icon:Circle48Filled,
  },

]


const badgeType = computed(()=>{
  return types.filter(v=>v.id === props.type)[0].type
})
const badgeIcon = computed(()=>{
  return types.filter(v=>v.id === props.type)[0].icon
})


</script>

<template>
    <div class="w-full flex justify-center items-center">
      <div
          :class="[badgeType]"
          class="flex border items-center px-3 rounded-2xl cursor-pointer">
        <div v-if="showIcon" class="w-[20px] flex justify-center">
            <slot name="icon">
              <n-icon size="12" class="ui--badge-icon">
                <component :is="badgeIcon"/>
              </n-icon>

            </slot>
        </div>
        <div class="ui--badge-label truncate" v-bind:style="{width:`calc(100% - ${showIcon? 20:0}px)`}">
          {{label}}
        </div>
      </div>

    </div>
</template>

<style scoped>

  .ui--badge-info{
    border-color:  #1a84ff17;
    background-color:#1a84ff17;
    .ui--badge-label{
      color: var(--info-color);
    }
    .ui--badge-icon{
      color: var(--info-color) !important;
    }
  }
  .ui--badge-warning{
    border-color: rgba(255, 149, 1, 0.04);
    background-color: rgba(255, 149, 1, 0.04);
    .ui--badge-label{
      color: var(--warning-color);
    }
    .ui--badge-icon{
      color: var(--warning-color) !important;
    }
  }
  .ui--badge-error{
    border-color:  rgba(255, 108, 108, 0.04);
    background-color: rgba(255, 108, 108, 0.04);
    .ui--badge-label{
      color: var(--danger-color);
    }
    .ui--badge-icon{
      color: var(--danger-color) !important;
    }
  }
  .ui--badge-success{
    border-color: rgba(45, 203, 115, 0.04);
    background-color: rgba(45, 203, 115, 0.04);
    .ui--badge-label{
      color: var(--success-color);
    }
    .ui--badge-icon{
      color: var(--success-color) !important;
    }
  }
  .ui--badge-dark{
    border-color: rgba(15, 17, 20, 0.04);
    background-color: rgba(15, 17, 20, 0.04);
    .ui--badge-label{
      color: var(--textColor2);
    }
    .ui--badge-icon{
      color: var(--textColor2) !important;
    }
  }
  .ui--badge-secondary{
    border-color: rgba(116, 120, 141, 0.04);
    background-color: rgba(116, 120, 141, 0.04);
    .ui--badge-label{
      color: var(--secondary-color);
    }
    .ui--badge-icon{
      color: var(--secondary-color) !important;
    }
  }


</style>