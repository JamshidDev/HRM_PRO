import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import TopicPage from "@/pages/lms/topic/TopicPage.vue"
import TopicDetailPage from "@/pages/lms/topicDetail/TopicDetailPage.vue"

export default [
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic),
        name:AppPaths.Topic.substring(1),
        component:TopicPage,
        children:[],
    },
    {
        path:Utils.routeLmsPathMaker(AppPaths.Topic+'/:id'),
        component:TopicDetailPage,
        children:[],
    },
]