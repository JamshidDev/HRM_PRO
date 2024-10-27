import {AppPaths} from "@/utils/index.js";
import LayoutV2 from "@/layouts/LayoutV2/LayoutV2.vue";

export default  [
    {
        path:AppPaths.OrganizationLayout,
        name:AppPaths.OrganizationLayout.substring(1),
        component:LayoutV2,
        children:[],
    },
]