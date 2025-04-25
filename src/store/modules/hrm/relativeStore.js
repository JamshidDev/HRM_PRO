import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useRelativeStore = defineStore('relativeStore', {
    state:()=>({
        list:[],
        loading:false,
        saveLoading:false,
        deleteLoading:false,
        visible:false,
        visibleType:true,
        elementId:null,
        totalItems:0,
        allRegionList:[],
        allLoading:false,
        payload:{
            uuid:null,
            relative:null,
            pin:null,
            sort:null,
            birthday:null,
            last_name:null,
            first_name:null,
            middle_name:null,
            birth_place:null,
            post_name:null,
            address:null,
            worker_id:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        uuid:null,
        tabList:[
            {
                name:'relativePage.tab.notWorker',
                id:1,
            },
            {
                name:'relativePage.tab.worker',
                id:2,
            },
        ],
        activeTab:1,

    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.relativeService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                uuid:this.uuid,
                birthday:Utils.timeToZone(this.payload.birthday),
                sort:1,
            }
            $ApiService.relativeService._create({data}).then((res)=>{
                this.visible = false
                this._index()
            }).finally(()=>{
                this.saveLoading = false
            })

        },
        _update(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                uuid:this.uuid,
                birthday:Utils.timeToZone(this.payload.birthday),
            }
            $ApiService.relativeService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.relativeService._delete({id:this.elementId}).then((res)=>{
                this._index()
               
            }).finally(()=>{
                this.deleteLoading = false
            })
        },
        openVisible(data){
            this.visible = data
        },
        resetForm(){
            this.elementId = null
            this.payload.relative = null
            this.payload.pin = null
            this.payload.sort = null
            this.payload.birthday = null
            this.payload.last_name = null
            this.payload.first_name = null
            this.payload.middle_name = null
            this.payload.birth_place = null
            this.payload.post_name = null
            this.payload.address = null
            this.payload.marital_status = null
        }

    }

})