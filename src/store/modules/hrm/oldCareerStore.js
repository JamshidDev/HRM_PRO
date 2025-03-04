import {defineStore} from "pinia";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
export const useOldCareerStore = defineStore('oldCareerStore', {
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
            sort:null,
            from_date:null,
            to_date:null,
            post_name:null,
        },
        params:{
            page:1,
            per_page:10,
            search:null,
        },
        uuid:null,
    }),
    actions:{
        _index(){
            this.loading= true
            $ApiService.olCareerService._index({params:{uuid:this.uuid}}).then((res)=>{
                this.list = res.data.data.data
            }).finally(()=>{
                this.loading= false
            })
        },
        _create(){
            this.saveLoading = true
            let data = {
                ...this.payload,
                uuid:this.uuid,
                from_date:Utils.timeToZone(this.payload.from_date),
                to_date:Utils.timeToZone(this.payload.to_date),
                sort:1,
            }
            $ApiService.olCareerService._create({data}).then((res)=>{
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
                from_date:Utils.timeToZone(this.payload.from_date),
                to_date:Utils.timeToZone(this.payload.to_date),
                sort:1,
            }
            $ApiService.olCareerService._update({data, id:this.elementId}).then((res)=>{
                this.visible = false
                this._index()
               
            }).finally(()=>{
                this.saveLoading = false
            })
        },
        _delete(){
            this.deleteLoading = true
            $ApiService.olCareerService._delete({id:this.elementId}).then((res)=>{
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
            this.payload.sort = null
            this.payload.from_date = null
            this.payload.to_date = null
            this.payload.post_name = null
        }

    }

})