import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import TopicDetailPage from "@/pages/lms/topicDetail/TopicDetailPage.vue"
import {TopicPage, TopicCategoryPage} from "@/pages/lms";

export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:()=>TopicPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Category),
        name:AppPaths.Category.substring(1),
        component:()=>TopicCategoryPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic+'/:id'),
        component:TopicDetailPage,
        children:[],
    },
]