import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
export const useDocumentStore = defineStore('documentStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        params:{
            document_id:null,
            model:null,
        },
        tabList:[
            {
                name:'documentPage.tabs.contract',
                key:1,
            },
            {
                name:'documentPage.tabs.confirmation',
                key:2,
            },
        ],
        activeTab:1,
    }),
    actions:{
        _openDocument(){
            $ApiService.documentService._openDocument({params:this.params}).then((res)=>{
                this.totalItems = res.data.data.total
            }).finally(()=>{
                this.loading= false
            })
        },





    }

})