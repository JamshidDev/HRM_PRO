import {AppPaths} from "@/utils/index.js";
import {PersonTag28Regular} from '@vicons/fluent'

export default [
    {
        label:'Dashboard',
        icon:'bx bx-folder',
        path:'/dashboard',
        visible:true,
        isNew:false,
        flag:'New',
        children:[
            {
                label:'Products',
                icon:'bx bx-folder',
                path:'/dashboard-1',
                visible:true,
                isNew:false,
                flag:'New',
            },
            {
                label:'Analytics',
                icon:'bx bx-folder',
                path:'/dashboard-2',
                visible:true,
                isNew:false,
                flag:'New',
            },
            {
                label:'Orders',
                icon:'bx bx-folder',
                path:'/dashboard-3',
                visible:true,
                isNew:false,
                flag:'New',
            },
            {
                label:'Payment',
                icon:'bx bx-folder',
                path:'/dashboard-4',
                visible:true,
                isNew:false,
                flag:'New',
            },
        ]
    },
    {
        label:'Overview',
        icon:'bx bx-folder',
        path:'/profile-1',
        visible:true,
        isNew:false,
        flag:'New',
    },
    {
        label:'navigation.client',
        icon:'bx bx-folder',
        path:`${AppPaths.Admin}${AppPaths.Client}`,
        visible:true,
        isNew:false,
        flag:'New',
    },
    {
        label:'navigation.product',
        icon:'bx bx-folder',
        path:`${AppPaths.Admin}${AppPaths.Product}`,
        visible:true,
        isNew:false,
        flag:'New',
    },
    {
        label:'navigation.category',
        icon:'bx bx-folder',
        path:`${AppPaths.Admin}${AppPaths.Category}`,
        visible:true,
        isNew:false,
        flag:'New',
    },
]