import {NIcon} from "naive-ui"


const scheduleLabel = (option)=>{
    return [
        h(
            'div',
            {
                class:'w-full mb-2',
            },[
                h('div',{ class:'flex flex-col w-full'}, [
                    h('div',{ class:'text-xs font-medium text-gray-500'},`${option.name}`),
                    ...option.work_days.map((day)=>h('div',{ class:'text-xs text-gray-400 w-full'},`(${day.day_of_week}) ${day.start_time} - ${day.end_time}`)),

                ])
            ]
        ),
    ];
}

const scheduleValue = ({option})=>{
    return h('div', {
            class:'flex',
        }, [
            h('div', {class:'text-sm font-medium'},option.name)
        ]
    )
}

const renderIcon =(icon)=> {
    return () => {
        return h(NIcon, null, {
            default: () => h(icon),
        })
    }
}

export default {
    scheduleRender:{
        label:scheduleLabel,
        value:scheduleValue,
    },
    renderIcon,
}