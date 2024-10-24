import {AppPaths} from "@/utils/index.js";
import OrganizationLayout from "@/layouts/LayoutV2/OrganizationLayout.vue";

export default  [
    {
        path:AppPaths.OrganizationLayout,
        name:AppPaths.OrganizationLayout.substring(1),
        component:OrganizationLayout,
        children:[],
    },
]